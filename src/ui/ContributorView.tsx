import { useState } from 'react';
import type { Envelope } from '../domain/envelope';
import type { CryptoService } from '../ports/cryptoService';
import type { ElicitationSpec } from '../domain/workflow';
import type { PromptSpec } from '../domain/strategies/types';
import { elicitationFor } from '../domain/strategies/registry';
import { encodeEnvelope } from '../adapters/envelopeCodec';
import { AsyncButton } from './AsyncButton';
import { utf8Decode, utf8Encode } from '../shared/utf8';

// Sam's whole journey: enter the out-of-band password, read the decrypted
// prompt, answer, and get an encrypted response envelope to send back.
export function ContributorView({
  crypto,
  envelope,
}: {
  crypto: CryptoService;
  envelope: Envelope;
}) {
  const [password, setPassword] = useState('');
  const [prompt, setPrompt] = useState<PromptSpec>();
  const [answerText, setAnswerText] = useState('');
  const [scoreValues, setScoreValues] = useState<Readonly<Record<string, string>>>({});
  const [order, setOrder] = useState<readonly string[]>([]);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  async function unlock() {
    setError('');
    const opened = await crypto.open(envelope, password);
    if (!opened.ok) {
      setError(opened.error);
      return;
    }
    try {
      const spec = JSON.parse(utf8Decode(opened.value)) as PromptSpec;
      setPrompt(spec);
      if (spec.expects === 'Rank') setOrder(spec.items ?? []);
    } catch {
      setError('This invitation is damaged. Ask your coordinator for a fresh one.');
    }
  }

  function moveUp(index: number) {
    if (index <= 0) return;
    const next = [...order];
    const item = next[index];
    const above = next[index - 1];
    if (item === undefined || above === undefined) return;
    next[index - 1] = item;
    next[index] = above;
    setOrder(next);
  }

  async function encryptResponse(spec: PromptSpec) {
    setError('');
    if (spec.expects !== 'ItemList' && spec.expects !== 'Score' && spec.expects !== 'Rank') {
      setError('This invitation uses a question type this app version does not support.');
      return;
    }
    let raw: unknown;
    switch (spec.expects) {
      case 'ItemList':
        raw = {
          items: answerText
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== ''),
        };
        break;
      case 'Score':
        raw = {
          scores: Object.fromEntries(
            (spec.items ?? []).map((item) => {
              const typed = scoreValues[item];
              return [item, typed === undefined || typed.trim() === '' ? NaN : Number(typed)];
            }),
          ),
        };
        break;
      case 'Rank':
        raw = { ranking: order };
        break;
    }
    const valid = elicitationFor(elicitationSpecOf(spec)).validate(raw);
    if (!valid.ok) {
      setError(valid.error);
      return;
    }
    const plaintext =
      valid.value.kind === 'ItemList'
        ? { items: valid.value.items }
        : valid.value.kind === 'Score'
          ? { scores: valid.value.scores }
          : { ranking: valid.value.ranking };
    const sealed = await crypto.seal({
      plaintext: utf8Encode(JSON.stringify(plaintext)),
      password,
      route: envelope.header,
    });
    setResponse(encodeEnvelope(sealed));
  }

  return (
    <main className="page">
      <header className="app-header">
        <h1>Synergon</h1>
      </header>
      <div className="note">
        <p>
          Your answer is anonymous to other participants — responses are pooled with identities
          removed before anyone sees them.
        </p>
        <p>The coordinator who invited you knows who received this link.</p>
      </div>

      {prompt === undefined ? (
        <section className="card">
          <p>Enter the password your coordinator sent you separately from this link.</p>
          <label htmlFor="contributor-password">Password</label>
          <input
            id="contributor-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AsyncButton className="primary" busyLabel="Unlocking…" onPress={unlock}>
            Unlock
          </AsyncButton>
        </section>
      ) : (
        <section className="card">
          <h2>{prompt.instruction}</h2>

          {prompt.expects === 'ItemList' && (
            <>
              {prompt.maxItems !== undefined && <p>Up to {prompt.maxItems} items.</p>}
              <label htmlFor="contributor-answer">Your answer (one item per line)</label>
              <textarea
                id="contributor-answer"
                rows={6}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
            </>
          )}

          {prompt.expects === 'Score' && prompt.scale !== undefined && (
            <>
              <p>
                Score each item from {prompt.scale.min} to {prompt.scale.max}.
              </p>
              {(prompt.items ?? []).map((item) => (
                <div key={item}>
                  <label htmlFor={`score-${item}`}>{item}</label>
                  <input
                    id={`score-${item}`}
                    type="number"
                    min={prompt.scale?.min}
                    max={prompt.scale?.max}
                    value={scoreValues[item] ?? ''}
                    onChange={(e) => setScoreValues({ ...scoreValues, [item]: e.target.value })}
                  />
                </div>
              ))}
            </>
          )}

          {prompt.expects === 'Rank' && (
            <>
              <p>Order the items, most important first.</p>
              <ol>
                {order.map((item, index) => (
                  <li key={item}>
                    {item}{' '}
                    <button
                      type="button"
                      disabled={index === 0}
                      aria-label={`Move ${item} up`}
                      onClick={() => moveUp(index)}
                    >
                      ↑
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}

          <AsyncButton
            className="primary"
            busyLabel="Encrypting…"
            onPress={() => encryptResponse(prompt)}
          >
            Encrypt response
          </AsyncButton>
        </section>
      )}

      {error !== '' && <p role="alert">{error}</p>}

      {response !== '' && (
        <section className="card">
          <label htmlFor="contributor-response">Your encrypted response</label>
          <textarea id="contributor-response" rows={6} readOnly value={response} />
          <p>Send this text back to your coordinator the same way the link reached you.</p>
        </section>
      )}
    </main>
  );
}

function elicitationSpecOf(prompt: PromptSpec): ElicitationSpec {
  switch (prompt.expects) {
    case 'ItemList':
      return {
        kind: 'ItemList',
        prompt: prompt.instruction,
        ...(prompt.maxItems === undefined ? {} : { maxItems: prompt.maxItems }),
      };
    case 'Score':
      return {
        kind: 'Score',
        prompt: prompt.instruction,
        items: prompt.items ?? [],
        scale: prompt.scale ?? { min: 0, max: 0 },
      };
    case 'Rank':
      return { kind: 'Rank', prompt: prompt.instruction, items: prompt.items ?? [] };
  }
}

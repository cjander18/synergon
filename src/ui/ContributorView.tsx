import { useState } from 'react';
import type { Envelope } from '../domain/envelope';
import type { CryptoService } from '../ports/cryptoService';
import { elicitationFor } from '../domain/strategies/registry';
import { encodeEnvelope } from '../adapters/envelopeCodec';
import { utf8Decode, utf8Encode } from '../shared/utf8';

interface PromptSpec {
  instruction: string;
  expects: string;
  maxItems?: number;
}

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
      setPrompt(JSON.parse(utf8Decode(opened.value)) as PromptSpec);
    } catch {
      setError('This invitation is damaged. Ask your coordinator for a fresh one.');
    }
  }

  async function encryptResponse(spec: PromptSpec) {
    setError('');
    const items = answerText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
    const valid = elicitationFor({
      kind: 'ItemList',
      prompt: spec.instruction,
      ...(spec.maxItems === undefined ? {} : { maxItems: spec.maxItems }),
    }).validate({ items });
    if (!valid.ok) {
      setError(valid.error);
      return;
    }
    const sealed = await crypto.seal({
      plaintext: utf8Encode(JSON.stringify({ items: valid.value.items })),
      password,
      route: envelope.header,
    });
    setResponse(encodeEnvelope(sealed));
  }

  return (
    <main className="page">
      <h1>Synergon</h1>
      <p>
        Your answer is anonymous to other participants — responses are pooled with identities
        removed before anyone sees them.
      </p>
      <p>The coordinator who invited you knows who received this link.</p>

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
          <button onClick={() => void unlock()}>Unlock</button>
        </section>
      ) : (
        <section className="card">
          <h2>{prompt.instruction}</h2>
          {prompt.maxItems !== undefined && <p>Up to {prompt.maxItems} items.</p>}
          <label htmlFor="contributor-answer">Your answer (one item per line)</label>
          <textarea
            id="contributor-answer"
            rows={6}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />
          <button onClick={() => void encryptResponse(prompt)}>Encrypt response</button>
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

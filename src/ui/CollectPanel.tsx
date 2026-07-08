import { useState } from 'react';
import type { Round, Workflow } from '../domain/workflow';
import { decodeEnvelope } from '../adapters/envelopeCodec';
import { importResponse } from '../application/importResponse';
import { runConsolidation } from '../application/runConsolidation';
import { audienceIds } from '../domain/workflow';
import type { AppDeps } from './types';

export function CollectPanel({
  deps,
  workflow,
  round,
  onChange,
  onConsolidated,
}: {
  deps: AppDeps;
  workflow: Workflow;
  round: Round;
  onChange: (workflow: Workflow) => void;
  onConsolidated: () => void;
}) {
  const [pasted, setPasted] = useState('');
  const [passwords, setPasswords] = useState<Readonly<Record<string, string>>>({});
  const [error, setError] = useState('');

  const labelOf = (id: string) => workflow.participants.find((p) => p.id === id)?.label ?? id;
  const expected = audienceIds(workflow, round.audience).length;

  async function importOne() {
    setError('');
    const decoded = decodeEnvelope(pasted);
    if (!decoded.ok) {
      setError(decoded.error);
      return;
    }
    const result = await importResponse(deps, { workflowId: workflow.id, envelope: decoded.value });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPasted('');
    onChange(result.value);
  }

  async function consolidate() {
    setError('');
    const result = await runConsolidation(deps, {
      workflowId: workflow.id,
      roundId: round.id,
      passwords: new Map(Object.entries(passwords)),
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onConsolidated();
    onChange(result.value);
  }

  return (
    <section className="card">
      <h4>Collect responses</h4>
      <p className="count">
        <strong>{round.responses.length} of {expected} responses</strong> received
      </p>
      <label htmlFor="collect-paste">Paste a response envelope</label>
      <textarea
        id="collect-paste"
        rows={4}
        value={pasted}
        onChange={(e) => setPasted(e.target.value)}
      />
      <button onClick={() => void importOne()}>Import response</button>

      {round.responses.length > 0 && (
        <>
          <h4>Consolidate</h4>
          <p>Re-enter each respondent's password to decrypt their response for pooling.</p>
          {round.responses.map((response) => (
            <div key={response.participantId}>
              <label htmlFor={`consolidate-${response.participantId}`}>
                Password for {labelOf(response.participantId)}
              </label>
              <input
                id={`consolidate-${response.participantId}`}
                type="password"
                value={passwords[response.participantId] ?? ''}
                onChange={(e) =>
                  setPasswords({ ...passwords, [response.participantId]: e.target.value })
                }
              />
            </div>
          ))}
          <button className="primary" onClick={() => void consolidate()}>
            Run consolidation
          </button>
        </>
      )}

      {error !== '' && <p role="alert">{error}</p>}
    </section>
  );
}

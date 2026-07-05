import { useState } from 'react';
import type { AggregationSpec, Workflow } from '../domain/workflow';
import { advanceRound } from '../application/advanceRound';
import type { AppDeps } from './types';

export function DraftRoundForm({
  deps,
  workflow,
  onChange,
}: {
  deps: AppDeps;
  workflow: Workflow;
  onChange: (workflow: Workflow) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [maxItems, setMaxItems] = useState('');
  const [aggregation, setAggregation] = useState<AggregationSpec['kind']>('Deduplicate');
  const [checked, setChecked] = useState<ReadonlySet<string>>(
    new Set(workflow.participants.map((p) => p.id)),
  );
  const [error, setError] = useState('');

  function toggle(id: string) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  }

  async function draft() {
    setError('');
    const everyone = checked.size === workflow.participants.length;
    const max = maxItems.trim() === '' ? undefined : Number(maxItems);
    const result = await advanceRound(deps, {
      workflowId: workflow.id,
      audience: everyone ? { kind: 'All' } : { kind: 'Subset', participantIds: [...checked] },
      elicitation: { kind: 'ItemList', prompt, ...(max === undefined ? {} : { maxItems: max }) },
      aggregation: { kind: aggregation },
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChange(result.value);
  }

  return (
    <section className="card">
      <h3>Draft round {workflow.rounds.length + 1}</h3>
      <label htmlFor="draft-prompt">Prompt</label>
      <input id="draft-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <label htmlFor="draft-max-items">Max items (optional)</label>
      <input
        id="draft-max-items"
        type="number"
        min={1}
        value={maxItems}
        onChange={(e) => setMaxItems(e.target.value)}
      />
      <label htmlFor="draft-aggregation">Aggregation</label>
      <select
        id="draft-aggregation"
        value={aggregation}
        onChange={(e) => setAggregation(e.target.value as AggregationSpec['kind'])}
      >
        <option value="Deduplicate">Deduplicate</option>
        <option value="Consolidate">Consolidate</option>
      </select>
      <fieldset>
        <legend>Audience</legend>
        {workflow.participants.map((p) => (
          <label key={p.id} className="checkbox">
            <input type="checkbox" checked={checked.has(p.id)} onChange={() => toggle(p.id)} />
            {p.label}
          </label>
        ))}
      </fieldset>
      <button onClick={() => void draft()}>Draft round</button>
      {error !== '' && <p role="alert">{error}</p>}
    </section>
  );
}

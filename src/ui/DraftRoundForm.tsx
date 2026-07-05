import { useState } from 'react';
import type { AggregationSpec, ElicitationSpec, Workflow } from '../domain/workflow';
import { advanceRound } from '../application/advanceRound';
import type { AppDeps } from './types';

type QuestionKind = ElicitationSpec['kind'];

const DEFAULT_AGGREGATION: Record<QuestionKind, string> = {
  ItemList: 'Deduplicate',
  Score: 'mean',
  Rank: 'rankSum',
};

export function DraftRoundForm({
  deps,
  workflow,
  previousItems,
  onChange,
}: {
  deps: AppDeps;
  workflow: Workflow;
  previousItems: readonly string[];
  onChange: (workflow: Workflow) => void;
}) {
  const [kind, setKind] = useState<QuestionKind>('ItemList');
  const [prompt, setPrompt] = useState('');
  const [maxItems, setMaxItems] = useState('');
  const [itemsText, setItemsText] = useState(previousItems.join('\n'));
  const [scaleMin, setScaleMin] = useState('1');
  const [scaleMax, setScaleMax] = useState('5');
  const [thresholdMin, setThresholdMin] = useState('2');
  const [aggregation, setAggregation] = useState('Deduplicate');
  const [checked, setChecked] = useState<ReadonlySet<string>>(
    new Set(workflow.participants.map((p) => p.id)),
  );
  const [error, setError] = useState('');

  function changeKind(next: QuestionKind) {
    setKind(next);
    setAggregation(DEFAULT_AGGREGATION[next]);
  }

  function toggle(id: string) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  }

  function buildElicitation(): ElicitationSpec {
    const items = itemsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
    switch (kind) {
      case 'ItemList': {
        const max = maxItems.trim() === '' ? undefined : Number(maxItems);
        return { kind, prompt, ...(max === undefined ? {} : { maxItems: max }) };
      }
      case 'Score':
        return { kind, prompt, items, scale: { min: Number(scaleMin), max: Number(scaleMax) } };
      case 'Rank':
        return { kind, prompt, items };
    }
  }

  function buildAggregation(): AggregationSpec {
    switch (kind) {
      case 'ItemList':
        return aggregation === 'Threshold'
          ? { kind: 'Threshold', min: Number(thresholdMin) }
          : { kind: aggregation as 'Deduplicate' | 'Consolidate' };
      case 'Score':
        return { kind: 'Aggregate', stat: aggregation as 'mean' | 'median' };
      case 'Rank':
        return { kind: 'Aggregate', stat: 'rankSum' };
    }
  }

  async function draft() {
    setError('');
    const everyone = checked.size === workflow.participants.length;
    const result = await advanceRound(deps, {
      workflowId: workflow.id,
      audience: everyone ? { kind: 'All' } : { kind: 'Subset', participantIds: [...checked] },
      elicitation: buildElicitation(),
      aggregation: buildAggregation(),
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

      <label htmlFor="draft-kind">Question type</label>
      <select
        id="draft-kind"
        value={kind}
        onChange={(e) => changeKind(e.target.value as QuestionKind)}
      >
        <option value="ItemList">List items</option>
        <option value="Score">Score items</option>
        <option value="Rank">Rank items</option>
      </select>

      <label htmlFor="draft-prompt">Prompt</label>
      <input id="draft-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />

      {kind === 'ItemList' && (
        <>
          <label htmlFor="draft-max-items">Max items (optional)</label>
          <input
            id="draft-max-items"
            type="number"
            min={1}
            value={maxItems}
            onChange={(e) => setMaxItems(e.target.value)}
          />
        </>
      )}

      {(kind === 'Score' || kind === 'Rank') && (
        <>
          <label htmlFor="draft-items">Items (one per line)</label>
          <textarea
            id="draft-items"
            rows={4}
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
          />
        </>
      )}

      {kind === 'Score' && (
        <>
          <label htmlFor="draft-scale-min">Scale min</label>
          <input
            id="draft-scale-min"
            type="number"
            value={scaleMin}
            onChange={(e) => setScaleMin(e.target.value)}
          />
          <label htmlFor="draft-scale-max">Scale max</label>
          <input
            id="draft-scale-max"
            type="number"
            value={scaleMax}
            onChange={(e) => setScaleMax(e.target.value)}
          />
        </>
      )}

      <label htmlFor="draft-aggregation">Aggregation</label>
      <select
        id="draft-aggregation"
        value={aggregation}
        onChange={(e) => setAggregation(e.target.value)}
      >
        {kind === 'ItemList' && (
          <>
            <option value="Deduplicate">Deduplicate</option>
            <option value="Consolidate">Consolidate</option>
            <option value="Threshold">Threshold</option>
          </>
        )}
        {kind === 'Score' && (
          <>
            <option value="mean">Mean score</option>
            <option value="median">Median score</option>
          </>
        )}
        {kind === 'Rank' && <option value="rankSum">Rank sum</option>}
      </select>

      {kind === 'ItemList' && aggregation === 'Threshold' && (
        <>
          <label htmlFor="draft-threshold">Support threshold</label>
          <input
            id="draft-threshold"
            type="number"
            min={1}
            value={thresholdMin}
            onChange={(e) => setThresholdMin(e.target.value)}
          />
        </>
      )}

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

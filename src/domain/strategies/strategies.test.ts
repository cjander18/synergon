import { describe, it, expect } from 'vitest';
import { elicitationFor, aggregationFor } from './registry';
import { expectErr, unwrap } from '../fixtures';
import type { DeidentifiedResponse } from '../responses';

function itemPool(...lists: string[][]): DeidentifiedResponse[] {
  return lists.map((items) => ({ value: { kind: 'ItemList', items } }));
}

describe('ItemList elicitation', () => {
  const strategy = elicitationFor({ kind: 'ItemList', prompt: 'List the top risks', maxItems: 3 });

  it('describes the prompt and expected response shape', () => {
    const spec = strategy.describe();
    expect(spec.instruction).toBe('List the top risks');
    expect(spec.expects).toBe('ItemList');
    expect(spec.maxItems).toBe(3);
  });

  it('accepts a valid item list and trims items', () => {
    const response = unwrap(strategy.validate({ items: ['  vendor lock-in ', 'burnout'] }));
    expect(response).toEqual({ kind: 'ItemList', items: ['vendor lock-in', 'burnout'] });
  });

  it('rejects a non-object payload', () => {
    expect(expectErr(strategy.validate('nope'))).toMatch(/object/i);
  });

  it('rejects a missing or non-array items field', () => {
    expect(expectErr(strategy.validate({ items: 'a' }))).toMatch(/array/i);
  });

  it('rejects non-string items', () => {
    expect(expectErr(strategy.validate({ items: [42] }))).toMatch(/string/i);
  });

  it('rejects blank items', () => {
    expect(expectErr(strategy.validate({ items: ['ok', '   '] }))).toMatch(/blank/i);
  });

  it('rejects an empty list', () => {
    expect(expectErr(strategy.validate({ items: [] }))).toMatch(/at least one/i);
  });

  it('enforces maxItems', () => {
    expect(expectErr(strategy.validate({ items: ['a', 'b', 'c', 'd'] }))).toMatch(/at most 3/i);
  });
});

describe('Deduplicate aggregation', () => {
  const strategy = aggregationFor({ kind: 'Deduplicate' });

  it('removes duplicates ignoring case and extra whitespace, keeping first spelling', () => {
    const output = strategy.aggregate(
      itemPool(['Vendor lock-in', 'burnout'], ['vendor  LOCK-IN', 'scope creep']),
    );
    expect(output).toEqual({
      kind: 'ItemPool',
      items: ['Vendor lock-in', 'burnout', 'scope creep'],
    });
  });

  it('preserves first-seen order across the pool', () => {
    const output = strategy.aggregate(itemPool(['b', 'a'], ['c', 'b']));
    expect(output).toEqual({ kind: 'ItemPool', items: ['b', 'a', 'c'] });
  });

  it('returns an empty pool for no responses', () => {
    expect(strategy.aggregate([])).toEqual({ kind: 'ItemPool', items: [] });
  });
});

describe('Consolidate aggregation', () => {
  const strategy = aggregationFor({ kind: 'Consolidate' });

  it('counts support once per response and sorts by support descending', () => {
    const output = strategy.aggregate(
      itemPool(['alpha', 'beta'], ['ALPHA', 'alpha ', 'gamma'], ['beta', 'alpha']),
    );
    expect(output).toEqual({
      kind: 'ConsolidatedItems',
      items: [
        { text: 'alpha', support: 3 },
        { text: 'beta', support: 2 },
        { text: 'gamma', support: 1 },
      ],
    });
  });

  it('breaks support ties by first appearance', () => {
    const output = strategy.aggregate(itemPool(['zeta'], ['eta']));
    expect(output).toEqual({
      kind: 'ConsolidatedItems',
      items: [
        { text: 'zeta', support: 1 },
        { text: 'eta', support: 1 },
      ],
    });
  });
});

import { describe, it, expect } from 'vitest';
import { elicitationFor, aggregationFor } from './registry';
import { expectErr, unwrap } from '../fixtures';
import type { DeidentifiedResponse } from '../responses';

function itemPool(...lists: string[][]): DeidentifiedResponse[] {
  return lists.map((items) => ({ value: { kind: 'ItemList', items } }));
}

function scorePool(...maps: Record<string, number>[]): DeidentifiedResponse[] {
  return maps.map((scores) => ({ value: { kind: 'Score', scores } }));
}

function rankPool(...rankings: string[][]): DeidentifiedResponse[] {
  return rankings.map((ranking) => ({ value: { kind: 'Rank', ranking } }));
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

describe('Score elicitation', () => {
  const strategy = elicitationFor({
    kind: 'Score',
    prompt: 'Score these risks',
    items: ['burnout', 'lock-in'],
    scale: { min: 1, max: 5 },
  });

  it('describes the items and scale', () => {
    expect(strategy.describe()).toEqual({
      instruction: 'Score these risks',
      expects: 'Score',
      items: ['burnout', 'lock-in'],
      scale: { min: 1, max: 5 },
    });
  });

  it('accepts a complete in-scale scoring', () => {
    const response = unwrap(strategy.validate({ scores: { burnout: 4, 'lock-in': 2 } }));
    expect(response).toEqual({ kind: 'Score', scores: { burnout: 4, 'lock-in': 2 } });
  });

  it('rejects a missing item', () => {
    expect(expectErr(strategy.validate({ scores: { burnout: 4 } }))).toMatch(/lock-in/);
  });

  it('rejects an unexpected item', () => {
    expect(
      expectErr(strategy.validate({ scores: { burnout: 4, 'lock-in': 2, ghost: 1 } })),
    ).toMatch(/unexpected/i);
  });

  it('rejects out-of-scale and non-numeric scores', () => {
    expect(expectErr(strategy.validate({ scores: { burnout: 9, 'lock-in': 2 } }))).toMatch(
      /between 1 and 5/i,
    );
    expect(expectErr(strategy.validate({ scores: { burnout: 'high', 'lock-in': 2 } }))).toMatch(
      /numeric/i,
    );
  });
});

describe('Rank elicitation', () => {
  const strategy = elicitationFor({
    kind: 'Rank',
    prompt: 'Rank these risks',
    items: ['a', 'b', 'c'],
  });

  it('describes the items to rank', () => {
    expect(strategy.describe()).toEqual({
      instruction: 'Rank these risks',
      expects: 'Rank',
      items: ['a', 'b', 'c'],
    });
  });

  it('accepts a permutation of the items', () => {
    expect(unwrap(strategy.validate({ ranking: ['c', 'a', 'b'] }))).toEqual({
      kind: 'Rank',
      ranking: ['c', 'a', 'b'],
    });
  });

  it('rejects duplicates, unknowns, and incomplete rankings', () => {
    expect(expectErr(strategy.validate({ ranking: ['a', 'a', 'b'] }))).toMatch(/exactly once/i);
    expect(expectErr(strategy.validate({ ranking: ['a', 'b', 'ghost'] }))).toMatch(/exactly once/i);
    expect(expectErr(strategy.validate({ ranking: ['a', 'b'] }))).toMatch(/exactly once/i);
  });
});

describe('Aggregate(mean) and Aggregate(median)', () => {
  it('mean averages per item and sorts descending', () => {
    const output = aggregationFor({ kind: 'Aggregate', stat: 'mean' }).aggregate(
      scorePool({ a: 5, b: 1 }, { a: 3, b: 3 }),
    );
    expect(output).toEqual({
      kind: 'ScoredItems',
      items: [
        { text: 'a', score: 4 },
        { text: 'b', score: 2 },
      ],
    });
  });

  it('mean breaks ties alphabetically', () => {
    const output = aggregationFor({ kind: 'Aggregate', stat: 'mean' }).aggregate(
      scorePool({ b: 2, a: 2 }),
    );
    expect(output).toEqual({
      kind: 'ScoredItems',
      items: [
        { text: 'a', score: 2 },
        { text: 'b', score: 2 },
      ],
    });
  });

  it('median takes the middle (or the mean of the two middles)', () => {
    const odd = aggregationFor({ kind: 'Aggregate', stat: 'median' }).aggregate(
      scorePool({ a: 1 }, { a: 5 }, { a: 2 }),
    );
    expect(odd).toEqual({ kind: 'ScoredItems', items: [{ text: 'a', score: 2 }] });
    const even = aggregationFor({ kind: 'Aggregate', stat: 'median' }).aggregate(
      scorePool({ a: 1 }, { a: 4 }),
    );
    expect(even).toEqual({ kind: 'ScoredItems', items: [{ text: 'a', score: 2.5 }] });
  });
});

describe('Aggregate(rankSum)', () => {
  it('sums positions and sorts ascending (lower is better)', () => {
    const output = aggregationFor({ kind: 'Aggregate', stat: 'rankSum' }).aggregate(
      rankPool(['a', 'b', 'c'], ['b', 'a', 'c'], ['a', 'c', 'b']),
    );
    expect(output).toEqual({
      kind: 'RankedItems',
      items: [
        { text: 'a', rankSum: 4 },
        { text: 'b', rankSum: 6 },
        { text: 'c', rankSum: 8 },
      ],
    });
  });

  it('breaks ties alphabetically', () => {
    const output = aggregationFor({ kind: 'Aggregate', stat: 'rankSum' }).aggregate(
      rankPool(['b', 'a'], ['a', 'b']),
    );
    expect(output).toEqual({
      kind: 'RankedItems',
      items: [
        { text: 'a', rankSum: 3 },
        { text: 'b', rankSum: 3 },
      ],
    });
  });
});

describe('Threshold aggregation', () => {
  it('keeps only items with enough independent support', () => {
    const output = aggregationFor({ kind: 'Threshold', min: 2 }).aggregate(
      itemPool(['a', 'b'], ['A', 'c']),
    );
    expect(output).toEqual({
      kind: 'ConsolidatedItems',
      items: [{ text: 'a', support: 2 }],
    });
  });
});

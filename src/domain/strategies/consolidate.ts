import type { AggregationStrategy } from './types';
import { normalizeItem } from './normalize';

// Merges near-identical items and counts support: how many responses mentioned
// each item (at most once per response). Sorted by support, ties by first
// appearance — sort() is stable, so insertion order breaks ties.
export function consolidateAggregation(): AggregationStrategy {
  return {
    aggregate(pool) {
      const firstSpelling = new Map<string, string>();
      const support = new Map<string, number>();
      for (const response of pool) {
        const mentioned = new Set(response.value.items.map(normalizeItem));
        for (const item of response.value.items) {
          const key = normalizeItem(item);
          if (!firstSpelling.has(key)) firstSpelling.set(key, item);
        }
        for (const key of mentioned) {
          support.set(key, (support.get(key) ?? 0) + 1);
        }
      }
      const items = [...firstSpelling.entries()]
        .map(([key, text]) => ({ text, support: support.get(key) ?? 0 }))
        .sort((a, b) => b.support - a.support);
      return { kind: 'ConsolidatedItems', items };
    },
  };
}

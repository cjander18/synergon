import type { AggregationStrategy } from './types';
import { normalizeItem } from './normalize';

export function deduplicateAggregation(): AggregationStrategy {
  return {
    aggregate(pool) {
      const firstSpelling = new Map<string, string>();
      for (const response of pool) {
        for (const item of response.value.items) {
          const key = normalizeItem(item);
          if (!firstSpelling.has(key)) firstSpelling.set(key, item);
        }
      }
      return { kind: 'ItemPool', items: [...firstSpelling.values()] };
    },
  };
}

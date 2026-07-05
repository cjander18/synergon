import type { AggregationStrategy } from './types';
import { consolidateAggregation } from './consolidate';

// Consolidate, then keep only items with enough independent support — a
// coarse filter for narrowing a long pool before an evaluation round.
export function thresholdAggregation(min: number): AggregationStrategy {
  return {
    aggregate(pool) {
      const consolidated = consolidateAggregation().aggregate(pool);
      const items =
        consolidated.kind === 'ConsolidatedItems'
          ? consolidated.items.filter((item) => item.support >= min)
          : [];
      return { kind: 'ConsolidatedItems', items };
    },
  };
}

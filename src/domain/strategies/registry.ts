import type { AggregationSpec, ElicitationSpec } from '../workflow';
import type { AggregationStrategy, ElicitationStrategy } from './types';
import { consolidateAggregation } from './consolidate';
import { deduplicateAggregation } from './deduplicate';
import { itemListElicitation } from './itemList';
import { rankElicitation } from './rank';
import { rankSumAggregation, scoreAggregation } from './aggregate';
import { scoreElicitation } from './score';
import { thresholdAggregation } from './threshold';

// The two extension points of the generic workflow
// (docs/architecture/generic-workflow.md): new deliberation techniques register
// here; the engine never switches on round kinds.
export function elicitationFor(spec: ElicitationSpec): ElicitationStrategy {
  switch (spec.kind) {
    case 'ItemList':
      return itemListElicitation(spec);
    case 'Score':
      return scoreElicitation(spec);
    case 'Rank':
      return rankElicitation(spec);
  }
}

export function aggregationFor(spec: AggregationSpec): AggregationStrategy {
  switch (spec.kind) {
    case 'Deduplicate':
      return deduplicateAggregation();
    case 'Consolidate':
      return consolidateAggregation();
    case 'Aggregate':
      return spec.stat === 'rankSum' ? rankSumAggregation() : scoreAggregation(spec.stat);
    case 'Threshold':
      return thresholdAggregation(spec.min);
  }
}

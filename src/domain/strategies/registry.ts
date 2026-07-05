import type { AggregationSpec, ElicitationSpec } from '../workflow';
import type { AggregationStrategy, ElicitationStrategy } from './types';
import { consolidateAggregation } from './consolidate';
import { deduplicateAggregation } from './deduplicate';
import { itemListElicitation } from './itemList';

// The two extension points of the generic workflow
// (docs/architecture/generic-workflow.md): new deliberation techniques register
// here; the engine never switches on round kinds.
export function elicitationFor(spec: ElicitationSpec): ElicitationStrategy {
  switch (spec.kind) {
    case 'ItemList':
      return itemListElicitation(spec);
  }
}

export function aggregationFor(spec: AggregationSpec): AggregationStrategy {
  switch (spec.kind) {
    case 'Deduplicate':
      return deduplicateAggregation();
    case 'Consolidate':
      return consolidateAggregation();
  }
}

import type { Envelope } from './envelope';
import type { Id } from './ids';
import type { StoredResponse } from './responses';
import type { Result } from './result';
import { err, ok } from './result';

export interface Participant {
  readonly id: Id;
  readonly label: string;
}

export type Audience =
  | { readonly kind: 'All' }
  | { readonly kind: 'Subset'; readonly participantIds: readonly Id[] };

export type ElicitationSpec = {
  readonly kind: 'ItemList';
  readonly prompt: string;
  readonly maxItems?: number;
};

export type AggregationSpec = { readonly kind: 'Deduplicate' } | { readonly kind: 'Consolidate' };

export type AggregationOutput =
  | { readonly kind: 'ItemPool'; readonly items: readonly string[] }
  | {
      readonly kind: 'ConsolidatedItems';
      readonly items: readonly { readonly text: string; readonly support: number }[];
    };

export type RoundStatus = 'Draft' | 'Issued' | 'Collecting' | 'Consolidating' | 'Closed';

export interface Invitation {
  readonly roundId: Id;
  readonly participantId: Id;
  readonly envelope: Envelope;
}

export interface Round {
  readonly id: Id;
  readonly index: number;
  readonly audience: Audience;
  readonly elicitation: ElicitationSpec;
  readonly aggregation: AggregationSpec;
  readonly status: RoundStatus;
  readonly invitations: readonly Invitation[];
  readonly responses: readonly StoredResponse[];
  readonly output?: AggregationOutput;
}

export interface Workflow {
  readonly id: Id;
  readonly title: string;
  readonly participants: readonly Participant[];
  readonly rounds: readonly Round[];
  readonly status: 'Active' | 'Closed';
}

export function createWorkflow(params: {
  id: Id;
  title: string;
  participants: readonly Participant[];
}): Result<Workflow> {
  if (params.title.trim() === '') return err('workflow title must not be blank');
  if (params.participants.length === 0) return err('a workflow needs at least one participant');
  const ids = new Set(params.participants.map((p) => p.id));
  if (ids.size !== params.participants.length) return err('duplicate participant ids');
  return ok({
    id: params.id,
    title: params.title,
    participants: params.participants,
    rounds: [],
    status: 'Active',
  });
}

export function audienceIds(workflow: Workflow, audience: Audience): readonly Id[] {
  return audience.kind === 'All'
    ? workflow.participants.map((p) => p.id)
    : audience.participantIds;
}

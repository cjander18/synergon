import type { Id } from './ids';
import type { DeidentifiedResponse, StoredResponse } from './responses';
import type {
  AggregationSpec,
  Audience,
  ElicitationSpec,
  Invitation,
  Participant,
} from './workflow';

export type Command =
  | { readonly kind: 'AddParticipants'; readonly participants: readonly Participant[] }
  | {
      readonly kind: 'DraftRound';
      readonly round: {
        readonly id: Id;
        readonly audience: Audience;
        readonly elicitation: ElicitationSpec;
        readonly aggregation: AggregationSpec;
      };
    }
  | {
      readonly kind: 'IssueRound';
      readonly roundId: Id;
      readonly invitations: readonly Invitation[];
    }
  | {
      readonly kind: 'ReissueInvitations';
      readonly roundId: Id;
      readonly invitations: readonly Invitation[];
    }
  | { readonly kind: 'CancelRound'; readonly roundId: Id }
  | { readonly kind: 'ImportResponse'; readonly response: StoredResponse }
  | { readonly kind: 'CloseIntake'; readonly roundId: Id }
  | {
      readonly kind: 'RunAggregation';
      readonly roundId: Id;
      readonly pool: readonly DeidentifiedResponse[];
    }
  | { readonly kind: 'CloseWorkflow' };

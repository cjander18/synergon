import type { Command } from '../domain/commands';
import type { Envelope } from '../domain/envelope';
import type { Id } from '../domain/ids';
import type { ValidResponse } from '../domain/responses';
import type { AggregationSpec, ElicitationSpec, Workflow } from '../domain/workflow';
import { createWorkflow } from '../domain/workflow';
import { deidentify } from '../domain/responses';
import { reduce } from '../domain/reducer';

// A finished three-round deliberation so a first-time coordinator sees the
// whole loop — elicit, consolidate, rank — before recruiting anyone. Built
// through the real reducer; envelopes are placeholders (never decrypted, the
// pools below are supplied directly, exactly as runConsolidation would).
export function buildDemoWorkflow(): Workflow {
  let workflow = must(
    createWorkflow({
      id: 'demo-workflow',
      title: 'Demo — Q3 delivery risks',
      participants: [
        { id: 'demo-p1', label: 'Avery' },
        { id: 'demo-p2', label: 'Blake' },
        { id: 'demo-p3', label: 'Casey' },
      ],
    }),
  );

  const items = (...list: string[]): ValidResponse => ({ kind: 'ItemList', items: list });
  const ranking = (...list: string[]): ValidResponse => ({ kind: 'Rank', ranking: list });

  workflow = runRound(workflow, {
    id: 'demo-r1',
    elicitation: { kind: 'ItemList', prompt: 'What are our biggest delivery risks?' },
    aggregation: { kind: 'Deduplicate' },
    answers: [
      { participantId: 'demo-p1', value: items('Vendor lock-in', 'Team burnout') },
      { participantId: 'demo-p2', value: items('vendor  lock-in', 'Scope creep in the Q3 plan') },
      { participantId: 'demo-p3', value: items('Team Burnout', 'Single point of failure on infra') },
    ],
  });

  workflow = runRound(workflow, {
    id: 'demo-r2',
    elicitation: { kind: 'ItemList', prompt: 'Which of these deserve action this quarter?' },
    aggregation: { kind: 'Consolidate' },
    answers: [
      { participantId: 'demo-p1', value: items('Team burnout', 'Vendor lock-in') },
      { participantId: 'demo-p2', value: items('Team burnout', 'Scope creep in the Q3 plan') },
      { participantId: 'demo-p3', value: items('Team burnout', 'Single point of failure on infra') },
    ],
  });

  workflow = runRound(workflow, {
    id: 'demo-r3',
    elicitation: {
      kind: 'Rank',
      prompt: 'Rank the shortlist, most urgent first',
      items: ['Team burnout', 'Vendor lock-in', 'Scope creep in the Q3 plan'],
    },
    aggregation: { kind: 'Aggregate', stat: 'rankSum' },
    answers: [
      {
        participantId: 'demo-p1',
        value: ranking('Team burnout', 'Vendor lock-in', 'Scope creep in the Q3 plan'),
      },
      {
        participantId: 'demo-p2',
        value: ranking('Team burnout', 'Scope creep in the Q3 plan', 'Vendor lock-in'),
      },
      {
        participantId: 'demo-p3',
        value: ranking('Vendor lock-in', 'Team burnout', 'Scope creep in the Q3 plan'),
      },
    ],
  });

  return workflow;
}

function runRound(
  workflow: Workflow,
  round: {
    id: Id;
    elicitation: ElicitationSpec;
    aggregation: AggregationSpec;
    answers: readonly { participantId: Id; value: ValidResponse }[];
  },
): Workflow {
  let state = apply(workflow, {
    kind: 'DraftRound',
    round: {
      id: round.id,
      audience: { kind: 'All' },
      elicitation: round.elicitation,
      aggregation: round.aggregation,
    },
  });
  state = apply(state, {
    kind: 'IssueRound',
    roundId: round.id,
    invitations: state.participants.map((p) => ({
      roundId: round.id,
      participantId: p.id,
      envelope: placeholderEnvelope(state.id, round.id, p.id),
    })),
  });
  state = apply(
    state,
    ...round.answers.map(
      (answer): Command => ({
        kind: 'ImportResponse',
        response: {
          roundId: round.id,
          participantId: answer.participantId,
          envelope: placeholderEnvelope(state.id, round.id, answer.participantId),
        },
      }),
    ),
    { kind: 'CloseIntake', roundId: round.id },
    { kind: 'RunAggregation', roundId: round.id, pool: deidentify(round.answers) },
  );
  return state;
}

function apply(workflow: Workflow, ...commands: Command[]): Workflow {
  return commands.reduce((state, command) => must(reduce(state, command)), workflow);
}

function must<T>(result: { ok: true; value: T } | { ok: false; error: string }): T {
  if (!result.ok) throw new Error(`demo workflow construction failed: ${result.error}`);
  return result.value;
}

function placeholderEnvelope(workflowId: Id, roundId: Id, participantId: Id): Envelope {
  return {
    header: {
      v: 1,
      workflowId,
      roundId,
      participantId,
      salt: new Uint8Array(0),
      iv: new Uint8Array(0),
    },
    ciphertext: new Uint8Array(0),
  };
}

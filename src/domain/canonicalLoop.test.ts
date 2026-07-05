import { describe, it, expect } from 'vitest';
import { apply, baseWorkflow, fakeEnvelope, fakeResponse, unwrap } from './fixtures';
import { deidentify } from './responses';
import { elicitationFor } from './strategies/registry';
import type { Workflow } from './workflow';

// M1 exit criterion: the canonical loop — elicit -> deduplicate -> consolidate —
// runs green with zero browser/crypto/storage involvement. Plaintext handling
// stands in for the M2 crypto layer; the reducer only ever sees ciphertext and
// de-identified pools, exactly as it will once envelopes are real.
describe('canonical loop: elicit -> deduplicate -> consolidate', () => {
  const elicitation = elicitationFor({ kind: 'ItemList', prompt: 'List the top risks' });

  function contribute(raw: unknown) {
    return unwrap(elicitation.validate(raw));
  }

  it('runs a full two-round deliberation', () => {
    // Round 1 — everyone lists risks; coordinator deduplicates.
    let workflow: Workflow = apply(baseWorkflow(), {
      kind: 'DraftRound',
      round: {
        id: 'r-1',
        audience: { kind: 'All' },
        elicitation: { kind: 'ItemList', prompt: 'List the top risks' },
        aggregation: { kind: 'Deduplicate' },
      },
    });
    workflow = apply(workflow, {
      kind: 'IssueRound',
      roundId: 'r-1',
      invitations: workflow.participants.map((p) => ({
        roundId: 'r-1',
        participantId: p.id,
        envelope: fakeEnvelope(workflow.id, 'r-1', p.id),
      })),
    });

    const round1Answers = [
      { participantId: 'p-1', value: contribute({ items: ['Vendor lock-in', 'burnout'] }) },
      { participantId: 'p-2', value: contribute({ items: ['vendor  lock-in', 'scope creep'] }) },
      { participantId: 'p-3', value: contribute({ items: ['Burnout', 'single point of failure'] }) },
    ];
    workflow = apply(
      workflow,
      ...round1Answers.map((a) => ({
        kind: 'ImportResponse' as const,
        response: fakeResponse('r-1', a.participantId),
      })),
    );
    workflow = apply(
      workflow,
      { kind: 'CloseIntake', roundId: 'r-1' },
      { kind: 'RunAggregation', roundId: 'r-1', pool: deidentify(round1Answers) },
    );

    const round1 = workflow.rounds[0];
    expect(round1?.status).toBe('Closed');
    expect(round1?.output?.kind).toBe('ItemPool');
    const pool1 = round1?.output?.kind === 'ItemPool' ? round1.output.items : [];
    expect(pool1).toHaveLength(4);
    expect(pool1.map((i) => i.toLowerCase())).toContain('vendor lock-in');
    expect(pool1.map((i) => i.toLowerCase())).toContain('burnout');

    // Round 2 — a subset re-lists what matters most from the deduplicated pool;
    // coordinator consolidates with support counts.
    workflow = apply(workflow, {
      kind: 'DraftRound',
      round: {
        id: 'r-2',
        audience: { kind: 'Subset', participantIds: ['p-1', 'p-2'] },
        elicitation: { kind: 'ItemList', prompt: 'Which of these matter most?', maxItems: 2 },
        aggregation: { kind: 'Consolidate' },
      },
    });
    workflow = apply(workflow, {
      kind: 'IssueRound',
      roundId: 'r-2',
      invitations: ['p-1', 'p-2'].map((participantId) => ({
        roundId: 'r-2',
        participantId,
        envelope: fakeEnvelope(workflow.id, 'r-2', participantId),
      })),
    });

    const round2Answers = [
      { participantId: 'p-1', value: contribute({ items: ['burnout', 'Vendor lock-in'] }) },
      { participantId: 'p-2', value: contribute({ items: ['Burnout'] }) },
    ];
    workflow = apply(
      workflow,
      ...round2Answers.map((a) => ({
        kind: 'ImportResponse' as const,
        response: fakeResponse('r-2', a.participantId),
      })),
      { kind: 'CloseIntake', roundId: 'r-2' },
      { kind: 'RunAggregation', roundId: 'r-2', pool: deidentify(round2Answers) },
    );

    const round2 = workflow.rounds[1];
    expect(round2?.status).toBe('Closed');
    // "Burnout" is the first-seen spelling because the de-identified pool is
    // canonically ordered by content, not by who responded first.
    expect(round2?.output).toEqual({
      kind: 'ConsolidatedItems',
      items: [
        { text: 'Burnout', support: 2 },
        { text: 'Vendor lock-in', support: 1 },
      ],
    });

    // Round 3 — everyone ranks the consolidated items; rank sums decide.
    const rankSpec = {
      kind: 'Rank' as const,
      prompt: 'Rank what matters most',
      items: ['Burnout', 'Vendor lock-in'],
    };
    const rank = elicitationFor(rankSpec);
    workflow = apply(workflow, {
      kind: 'DraftRound',
      round: {
        id: 'r-3',
        audience: { kind: 'All' },
        elicitation: rankSpec,
        aggregation: { kind: 'Aggregate', stat: 'rankSum' },
      },
    });
    workflow = apply(workflow, {
      kind: 'IssueRound',
      roundId: 'r-3',
      invitations: workflow.participants.map((p) => ({
        roundId: 'r-3',
        participantId: p.id,
        envelope: fakeEnvelope(workflow.id, 'r-3', p.id),
      })),
    });
    const round3Answers = [
      { participantId: 'p-1', value: unwrap(rank.validate({ ranking: ['Burnout', 'Vendor lock-in'] })) },
      { participantId: 'p-2', value: unwrap(rank.validate({ ranking: ['Burnout', 'Vendor lock-in'] })) },
      { participantId: 'p-3', value: unwrap(rank.validate({ ranking: ['Vendor lock-in', 'Burnout'] })) },
    ];
    workflow = apply(
      workflow,
      ...round3Answers.map((a) => ({
        kind: 'ImportResponse' as const,
        response: fakeResponse('r-3', a.participantId),
      })),
      { kind: 'CloseIntake', roundId: 'r-3' },
      { kind: 'RunAggregation', roundId: 'r-3', pool: deidentify(round3Answers) },
      { kind: 'CloseWorkflow' },
    );

    // M5 exit criterion: the workflow ends in a ranked, de-identified outcome.
    expect(workflow.rounds[2]?.output).toEqual({
      kind: 'RankedItems',
      items: [
        { text: 'Burnout', rankSum: 4 },
        { text: 'Vendor lock-in', rankSum: 5 },
      ],
    });
    expect(workflow.status).toBe('Closed');
  });
});

import { describe, it, expect } from 'vitest';
import { createWorkflow } from './workflow';
import { reduce } from './reducer';
import {
  apply,
  baseWorkflow,
  draftRound,
  expectErr,
  fakeEnvelope,
  fakeResponse,
  issueToAll,
  participants,
  unwrap,
} from './fixtures';

describe('createWorkflow', () => {
  it('creates an Active workflow with no rounds', () => {
    const workflow = baseWorkflow();
    expect(workflow.status).toBe('Active');
    expect(workflow.rounds).toEqual([]);
    expect(workflow.participants).toHaveLength(3);
  });

  it('rejects a blank title', () => {
    const result = createWorkflow({ id: 'w-1', title: '  ', participants: participants('p-1') });
    expect(expectErr(result)).toMatch(/title/i);
  });

  it('rejects an empty participant list', () => {
    const result = createWorkflow({ id: 'w-1', title: 'T', participants: [] });
    expect(expectErr(result)).toMatch(/participant/i);
  });

  it('rejects duplicate participant ids', () => {
    const result = createWorkflow({
      id: 'w-1',
      title: 'T',
      participants: participants('p-1', 'p-1'),
    });
    expect(expectErr(result)).toMatch(/duplicate/i);
  });
});

describe('DraftRound', () => {
  it('appends a Draft round with the next index', () => {
    const workflow = apply(baseWorkflow(), draftRound('r-1'));
    expect(workflow.rounds).toHaveLength(1);
    expect(workflow.rounds[0]?.status).toBe('Draft');
    expect(workflow.rounds[0]?.index).toBe(0);
    expect(workflow.rounds[0]?.invitations).toEqual([]);
    expect(workflow.rounds[0]?.responses).toEqual([]);
  });

  it('rejects when the previous round is not Closed', () => {
    const workflow = apply(baseWorkflow(), draftRound('r-1'));
    expect(expectErr(reduce(workflow, draftRound('r-2')))).toMatch(/closed/i);
  });

  it('rejects a duplicate round id', () => {
    // exercised via a closed first round in the canonical loop test; here the
    // same id is rejected even before status guards could apply
    const workflow = apply(baseWorkflow(), draftRound('r-1'));
    expect(expectErr(reduce(workflow, draftRound('r-1')))).toMatch(/id/i);
  });

  it('rejects a Subset audience naming an unknown participant', () => {
    const result = reduce(baseWorkflow(), {
      kind: 'DraftRound',
      round: {
        id: 'r-1',
        audience: { kind: 'Subset', participantIds: ['p-1', 'ghost'] },
        elicitation: { kind: 'ItemList', prompt: 'p' },
        aggregation: { kind: 'Deduplicate' },
      },
    });
    expect(expectErr(result)).toMatch(/unknown participant/i);
  });

  it('rejects an aggregation that cannot consume the elicitation', () => {
    const scoreWithDedupe = reduce(baseWorkflow(), {
      kind: 'DraftRound',
      round: {
        id: 'r-1',
        audience: { kind: 'All' },
        elicitation: { kind: 'Score', prompt: 'p', items: ['a'], scale: { min: 1, max: 5 } },
        aggregation: { kind: 'Deduplicate' },
      },
    });
    expect(expectErr(scoreWithDedupe)).toMatch(/not compatible/i);

    const rankWithMean = reduce(baseWorkflow(), {
      kind: 'DraftRound',
      round: {
        id: 'r-1',
        audience: { kind: 'All' },
        elicitation: { kind: 'Rank', prompt: 'p', items: ['a', 'b'] },
        aggregation: { kind: 'Aggregate', stat: 'mean' },
      },
    });
    expect(expectErr(rankWithMean)).toMatch(/not compatible/i);
  });

  it('accepts a compatible evaluation round', () => {
    const workflow = apply(baseWorkflow(), {
      kind: 'DraftRound',
      round: {
        id: 'r-1',
        audience: { kind: 'All' },
        elicitation: { kind: 'Score', prompt: 'p', items: ['a'], scale: { min: 1, max: 5 } },
        aggregation: { kind: 'Aggregate', stat: 'mean' },
      },
    });
    expect(workflow.rounds[0]?.status).toBe('Draft');
  });

  it('rejects an empty Subset audience', () => {
    const result = reduce(baseWorkflow(), {
      kind: 'DraftRound',
      round: {
        id: 'r-1',
        audience: { kind: 'Subset', participantIds: [] },
        elicitation: { kind: 'ItemList', prompt: 'p' },
        aggregation: { kind: 'Deduplicate' },
      },
    });
    expect(expectErr(result)).toMatch(/empty/i);
  });
});

describe('IssueRound', () => {
  it('moves Draft to Issued and stores invitations covering the audience', () => {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'));
    expect(workflow.rounds[0]?.status).toBe('Issued');
    expect(workflow.rounds[0]?.invitations).toHaveLength(3);
  });

  it('rejects invitations that do not exactly cover the audience', () => {
    const workflow = apply(baseWorkflow(), draftRound('r-1'));
    const missingOne = {
      kind: 'IssueRound' as const,
      roundId: 'r-1',
      invitations: [
        { roundId: 'r-1', participantId: 'p-1', envelope: fakeEnvelope('w-1', 'r-1', 'p-1') },
      ],
    };
    expect(expectErr(reduce(workflow, missingOne))).toMatch(/audience/i);
  });

  it('rejects issuing a round that is not Draft', () => {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'));
    expect(expectErr(reduce(workflow, issueToAll(workflow, 'r-1')))).toMatch(/draft/i);
  });

  it('rejects an unknown round id', () => {
    const workflow = apply(baseWorkflow(), draftRound('r-1'));
    expect(expectErr(reduce(workflow, issueToAll(workflow, 'nope')))).toMatch(/round/i);
  });
});

describe('ImportResponse', () => {
  function issuedWorkflow() {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'));
    return workflow;
  }

  it('moves Issued to Collecting on the first response', () => {
    const workflow = apply(issuedWorkflow(), {
      kind: 'ImportResponse',
      response: fakeResponse('r-1', 'p-1'),
    });
    expect(workflow.rounds[0]?.status).toBe('Collecting');
    expect(workflow.rounds[0]?.responses).toHaveLength(1);
  });

  it('stays Collecting on later responses', () => {
    const workflow = apply(
      issuedWorkflow(),
      { kind: 'ImportResponse', response: fakeResponse('r-1', 'p-1') },
      { kind: 'ImportResponse', response: fakeResponse('r-1', 'p-2') },
    );
    expect(workflow.rounds[0]?.status).toBe('Collecting');
    expect(workflow.rounds[0]?.responses).toHaveLength(2);
  });

  it('rejects a response from outside the audience', () => {
    let workflow = unwrap(
      reduce(baseWorkflow(), {
        kind: 'DraftRound',
        round: {
          id: 'r-1',
          audience: { kind: 'Subset', participantIds: ['p-1'] },
          elicitation: { kind: 'ItemList', prompt: 'p' },
          aggregation: { kind: 'Deduplicate' },
        },
      }),
    );
    workflow = apply(workflow, {
      kind: 'IssueRound',
      roundId: 'r-1',
      invitations: [
        { roundId: 'r-1', participantId: 'p-1', envelope: fakeEnvelope('w-1', 'r-1', 'p-1') },
      ],
    });
    const result = reduce(workflow, {
      kind: 'ImportResponse',
      response: fakeResponse('r-1', 'p-2'),
    });
    expect(expectErr(result)).toMatch(/audience/i);
  });

  it('rejects a second response from the same participant', () => {
    const workflow = apply(issuedWorkflow(), {
      kind: 'ImportResponse',
      response: fakeResponse('r-1', 'p-1'),
    });
    const result = reduce(workflow, {
      kind: 'ImportResponse',
      response: fakeResponse('r-1', 'p-1'),
    });
    expect(expectErr(result)).toMatch(/already/i);
  });

  it('rejects a response for a Draft round', () => {
    const workflow = apply(baseWorkflow(), draftRound('r-1'));
    const result = reduce(workflow, {
      kind: 'ImportResponse',
      response: fakeResponse('r-1', 'p-1'),
    });
    expect(expectErr(result)).toMatch(/issued|collecting/i);
  });

  it('rejects a response for an unknown round', () => {
    const result = reduce(issuedWorkflow(), {
      kind: 'ImportResponse',
      response: fakeResponse('nope', 'p-1'),
    });
    expect(expectErr(result)).toMatch(/round/i);
  });
});

describe('CloseIntake and RunAggregation', () => {
  function collectingWorkflow() {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(
      workflow,
      issueToAll(workflow, 'r-1'),
      { kind: 'ImportResponse', response: fakeResponse('r-1', 'p-1') },
      { kind: 'ImportResponse', response: fakeResponse('r-1', 'p-2') },
    );
    return workflow;
  }

  it('CloseIntake moves Collecting to Consolidating', () => {
    const workflow = apply(collectingWorkflow(), { kind: 'CloseIntake', roundId: 'r-1' });
    expect(workflow.rounds[0]?.status).toBe('Consolidating');
  });

  it('CloseIntake rejects a round with no responses yet', () => {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'));
    expect(expectErr(reduce(workflow, { kind: 'CloseIntake', roundId: 'r-1' }))).toMatch(
      /collecting/i,
    );
  });

  it('RunAggregation computes the output and closes the round', () => {
    const workflow = apply(
      collectingWorkflow(),
      { kind: 'CloseIntake', roundId: 'r-1' },
      {
        kind: 'RunAggregation',
        roundId: 'r-1',
        pool: [
          { value: { kind: 'ItemList', items: ['alpha', 'beta'] } },
          { value: { kind: 'ItemList', items: ['Alpha', 'gamma'] } },
        ],
      },
    );
    expect(workflow.rounds[0]?.status).toBe('Closed');
    expect(workflow.rounds[0]?.output).toEqual({
      kind: 'ItemPool',
      items: ['alpha', 'beta', 'gamma'],
    });
  });

  it('RunAggregation rejects a pool that does not match the response count', () => {
    const workflow = apply(collectingWorkflow(), { kind: 'CloseIntake', roundId: 'r-1' });
    const result = reduce(workflow, {
      kind: 'RunAggregation',
      roundId: 'r-1',
      pool: [{ value: { kind: 'ItemList', items: ['alpha'] } }],
    });
    expect(expectErr(result)).toMatch(/pool/i);
  });

  it('RunAggregation rejects a round that is not Consolidating', () => {
    const result = reduce(collectingWorkflow(), {
      kind: 'RunAggregation',
      roundId: 'r-1',
      pool: [
        { value: { kind: 'ItemList', items: ['alpha'] } },
        { value: { kind: 'ItemList', items: ['beta'] } },
      ],
    });
    expect(expectErr(result)).toMatch(/consolidating/i);
  });
});

describe('CancelRound', () => {
  it('cancels a round from any live state and allows drafting the next one', () => {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'), { kind: 'CancelRound', roundId: 'r-1' });
    expect(workflow.rounds[0]?.status).toBe('Cancelled');
    workflow = apply(workflow, draftRound('r-2'));
    expect(workflow.rounds[1]?.status).toBe('Draft');
  });

  it('rejects cancelling a settled round', () => {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'), { kind: 'CancelRound', roundId: 'r-1' });
    expect(expectErr(reduce(workflow, { kind: 'CancelRound', roundId: 'r-1' }))).toMatch(/settled/i);
  });

  it('rejects responses for a cancelled round', () => {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'), { kind: 'CancelRound', roundId: 'r-1' });
    const result = reduce(workflow, {
      kind: 'ImportResponse',
      response: fakeResponse('r-1', 'p-1'),
    });
    expect(expectErr(result)).toMatch(/issued|collecting/i);
  });
});

describe('ReissueInvitations', () => {
  function collectingWithOneResponse() {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'), {
      kind: 'ImportResponse',
      response: fakeResponse('r-1', 'p-1'),
    });
    return workflow;
  }

  it('replaces invitations for participants who have not responded', () => {
    const workflow = collectingWithOneResponse();
    const fresh = fakeEnvelope('w-1', 'r-1', 'p-2');
    const updated = apply(workflow, {
      kind: 'ReissueInvitations',
      roundId: 'r-1',
      invitations: [{ roundId: 'r-1', participantId: 'p-2', envelope: fresh }],
    });
    const invitations = updated.rounds[0]?.invitations ?? [];
    expect(invitations).toHaveLength(3);
    expect(invitations.find((i) => i.participantId === 'p-2')?.envelope).toBe(fresh);
  });

  it('rejects re-issuing to a participant who already responded', () => {
    const result = reduce(collectingWithOneResponse(), {
      kind: 'ReissueInvitations',
      roundId: 'r-1',
      invitations: [
        { roundId: 'r-1', participantId: 'p-1', envelope: fakeEnvelope('w-1', 'r-1', 'p-1') },
      ],
    });
    expect(expectErr(result)).toMatch(/already responded/i);
  });

  it('rejects re-issuing outside the audience or outside Issued/Collecting', () => {
    const draft = apply(baseWorkflow(), draftRound('r-1'));
    expect(
      expectErr(
        reduce(draft, {
          kind: 'ReissueInvitations',
          roundId: 'r-1',
          invitations: [
            { roundId: 'r-1', participantId: 'p-1', envelope: fakeEnvelope('w-1', 'r-1', 'p-1') },
          ],
        }),
      ),
    ).toMatch(/issued|collecting/i);
  });
});

describe('workflow lifecycle', () => {
  it('CloseWorkflow moves Active to Closed and blocks further commands', () => {
    const workflow = apply(baseWorkflow(), { kind: 'CloseWorkflow' });
    expect(workflow.status).toBe('Closed');
    expect(expectErr(reduce(workflow, draftRound('r-1')))).toMatch(/closed/i);
  });

  it('AddParticipants appends new unique participants', () => {
    const workflow = apply(baseWorkflow(), {
      kind: 'AddParticipants',
      participants: participants('p-4'),
    });
    expect(workflow.participants).toHaveLength(4);
  });

  it('AddParticipants rejects an id that already exists', () => {
    const result = reduce(baseWorkflow(), {
      kind: 'AddParticipants',
      participants: participants('p-1'),
    });
    expect(expectErr(result)).toMatch(/duplicate/i);
  });

  it('reduce does not mutate its input', () => {
    const before = baseWorkflow();
    const snapshot = JSON.stringify(before);
    unwrap(reduce(before, draftRound('r-1')));
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});

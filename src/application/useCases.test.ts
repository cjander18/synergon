import { describe, it, expect } from 'vitest';
import { InMemoryWorkflowRepository } from '../adapters/inMemoryWorkflowRepository';
import { WebCryptoService } from '../adapters/webCryptoService';
import { CopyPasteChannel } from '../adapters/copyPasteChannel';
import { createWorkflow } from './createWorkflow';
import { advanceRound } from './advanceRound';
import { issueRound } from './issueRound';
import { importResponse } from './importResponse';
import { runConsolidation } from './runConsolidation';
import { reissueInvitations } from './reissueInvitations';
import { cancelRound } from './cancelRound';
import { expectErr, unwrap } from '../domain/fixtures';
import { utf8Decode, utf8Encode } from '../shared/utf8';
import type { Envelope } from '../domain/envelope';
import type { EnvelopeHandle } from '../ports/envelopeChannel';
import type { Workflow } from '../domain/workflow';

const cryptoService = new WebCryptoService({ iterations: 1_000 });
const baseUrl = 'https://synergon.local/app';

function seqIdGen(prefix: string) {
  let n = 0;
  return { next: () => `${prefix}-${++n}` };
}

function seqPasswordGen() {
  let n = 0;
  return { next: () => `secret-pw-${++n}` };
}

function testDeps() {
  return {
    repo: new InMemoryWorkflowRepository(),
    crypto: cryptoService,
    channel: new CopyPasteChannel(baseUrl),
    idGen: seqIdGen('id'),
    passwordGen: seqPasswordGen(),
  };
}

async function setupIssuedRound(deps: ReturnType<typeof testDeps>) {
  const workflow = unwrap(
    await createWorkflow(deps, { title: 'Risks', participantLabels: ['Ana', 'Ben', 'Cyn'] }),
  );
  const drafted = unwrap(
    await advanceRound(deps, {
      workflowId: workflow.id,
      audience: { kind: 'All' },
      elicitation: { kind: 'ItemList', prompt: 'List the top risks' },
      aggregation: { kind: 'Deduplicate' },
    }),
  );
  const roundId = drafted.rounds[0]?.id ?? '';
  const issued = unwrap(await issueRound(deps, { workflowId: workflow.id, roundId }));
  return { workflow: issued.workflow, roundId, invitations: issued.invitations };
}

function envelopeFrom(handle: EnvelopeHandle): Envelope {
  const channel = new CopyPasteChannel(baseUrl);
  return unwrap(channel.accept(handle.kind === 'url' ? handle.url : handle.contents));
}

// A contributor answering: decrypt the prompt, seal the response on the same route.
async function respond(handle: EnvelopeHandle, password: string, items: string[]) {
  const invitation = envelopeFrom(handle);
  const prompt = JSON.parse(utf8Decode(unwrap(await cryptoService.open(invitation, password)))) as {
    instruction: string;
  };
  expect(prompt.instruction).toBe('List the top risks');
  return cryptoService.seal({
    plaintext: utf8Encode(JSON.stringify({ items })),
    password,
    route: invitation.header,
  });
}

describe('createWorkflow', () => {
  it('creates and persists a workflow with generated ids', async () => {
    const deps = testDeps();
    const workflow = unwrap(
      await createWorkflow(deps, { title: 'Risks', participantLabels: ['Ana', 'Ben'] }),
    );
    expect(workflow.participants.map((p) => p.label)).toEqual(['Ana', 'Ben']);
    expect(new Set([workflow.id, ...workflow.participants.map((p) => p.id)]).size).toBe(3);
    expect(await deps.repo.load(workflow.id)).toEqual(workflow);
  });

  it('propagates domain validation errors and saves nothing', async () => {
    const deps = testDeps();
    expect(expectErr(await createWorkflow(deps, { title: ' ', participantLabels: ['Ana'] }))).toMatch(
      /title/i,
    );
    expect(await deps.repo.list()).toEqual([]);
  });
});

describe('advanceRound', () => {
  it('drafts the next round with a generated id and persists it', async () => {
    const deps = testDeps();
    const workflow = unwrap(
      await createWorkflow(deps, { title: 'Risks', participantLabels: ['Ana'] }),
    );
    const advanced = unwrap(
      await advanceRound(deps, {
        workflowId: workflow.id,
        audience: { kind: 'All' },
        elicitation: { kind: 'ItemList', prompt: 'p' },
        aggregation: { kind: 'Deduplicate' },
      }),
    );
    expect(advanced.rounds[0]?.status).toBe('Draft');
    expect(await deps.repo.load(workflow.id)).toEqual(advanced);
  });

  it('rejects an unknown workflow', async () => {
    expect(
      expectErr(
        await advanceRound(testDeps(), {
          workflowId: 'ghost',
          audience: { kind: 'All' },
          elicitation: { kind: 'ItemList', prompt: 'p' },
          aggregation: { kind: 'Deduplicate' },
        }),
      ),
    ).toMatch(/workflow/i);
  });
});

describe('issueRound', () => {
  it('issues one invitation per audience member, each decryptable with its password', async () => {
    const deps = testDeps();
    const { workflow, invitations } = await setupIssuedRound(deps);
    expect(workflow.rounds[0]?.status).toBe('Issued');
    expect(invitations).toHaveLength(3);
    expect(new Set(invitations.map((i) => i.password)).size).toBe(3);

    const first = invitations[0];
    expect(first).toBeDefined();
    if (!first) return;
    const envelope = envelopeFrom(first.handle);
    const prompt = JSON.parse(
      utf8Decode(unwrap(await cryptoService.open(envelope, first.password))),
    ) as { instruction: string; expects: string };
    expect(prompt).toEqual({ instruction: 'List the top risks', expects: 'ItemList' });
  });

  it('never persists passwords', async () => {
    const deps = testDeps();
    const { workflow } = await setupIssuedRound(deps);
    const persisted = JSON.stringify(await deps.repo.load(workflow.id));
    expect(persisted).not.toContain('secret-pw');
  });

  it('rejects an unknown round', async () => {
    const deps = testDeps();
    const workflow = unwrap(
      await createWorkflow(deps, { title: 'Risks', participantLabels: ['Ana'] }),
    );
    expect(
      expectErr(await issueRound(deps, { workflowId: workflow.id, roundId: 'ghost' })),
    ).toMatch(/round/i);
  });
});

describe('importResponse', () => {
  it('imports a contributor response and persists the Collecting round', async () => {
    const deps = testDeps();
    const { workflow, invitations } = await setupIssuedRound(deps);
    const inv = invitations[0];
    if (!inv) throw new Error('missing invitation');
    const response = await respond(inv.handle, inv.password, ['vendor lock-in']);
    const updated = unwrap(await importResponse(deps, { workflowId: workflow.id, envelope: response }));
    expect(updated.rounds[0]?.status).toBe('Collecting');
    expect(updated.rounds[0]?.responses[0]?.participantId).toBe(inv.participantId);
    expect(await deps.repo.load(workflow.id)).toEqual(updated);
  });

  it('rejects an envelope addressed to a different workflow', async () => {
    const deps = testDeps();
    const { workflow, roundId, invitations } = await setupIssuedRound(deps);
    const inv = invitations[0];
    if (!inv) throw new Error('missing invitation');
    const foreign = await cryptoService.seal({
      plaintext: utf8Encode('{}'),
      password: inv.password,
      route: { workflowId: 'other-workflow', roundId, participantId: inv.participantId },
    });
    expect(
      expectErr(await importResponse(deps, { workflowId: workflow.id, envelope: foreign })),
    ).toMatch(/workflow/i);
  });

  it('rejects a duplicate response from the same participant', async () => {
    const deps = testDeps();
    const { workflow, invitations } = await setupIssuedRound(deps);
    const inv = invitations[0];
    if (!inv) throw new Error('missing invitation');
    const response = await respond(inv.handle, inv.password, ['a']);
    unwrap(await importResponse(deps, { workflowId: workflow.id, envelope: response }));
    expect(
      expectErr(await importResponse(deps, { workflowId: workflow.id, envelope: response })),
    ).toMatch(/already/i);
  });
});

describe('reissueInvitations', () => {
  it('issues fresh passwords and envelopes only to non-respondents, and persists', async () => {
    const deps = testDeps();
    const { workflow, invitations } = await setupIssuedRound(deps);
    const first = invitations[0];
    if (!first) throw new Error('missing invitation');
    const response = await respond(first.handle, first.password, ['a']);
    unwrap(await importResponse(deps, { workflowId: workflow.id, envelope: response }));

    const roundId = workflow.rounds[0]?.id ?? '';
    const reissued = unwrap(
      await reissueInvitations(deps, { workflowId: workflow.id, roundId }),
    );
    expect(reissued.invitations).toHaveLength(2);
    expect(reissued.invitations.map((i) => i.participantId)).not.toContain(first.participantId);
    const oldPasswords = new Set(invitations.map((i) => i.password));
    for (const inv of reissued.invitations) {
      expect(oldPasswords.has(inv.password)).toBe(false);
      const envelope = envelopeFrom(inv.handle);
      const prompt = JSON.parse(
        utf8Decode(unwrap(await cryptoService.open(envelope, inv.password))),
      ) as { instruction: string };
      expect(prompt.instruction).toBe('List the top risks');
    }
    expect(await deps.repo.load(workflow.id)).toEqual(reissued.workflow);
  });

  it('errors when everyone has already responded', async () => {
    const deps = testDeps();
    const { workflow, invitations } = await setupIssuedRound(deps);
    for (const inv of invitations) {
      const response = await respond(inv.handle, inv.password, ['x']);
      unwrap(await importResponse(deps, { workflowId: workflow.id, envelope: response }));
    }
    const roundId = workflow.rounds[0]?.id ?? '';
    expect(
      expectErr(await reissueInvitations(deps, { workflowId: workflow.id, roundId })),
    ).toMatch(/responded/i);
  });
});

describe('cancelRound', () => {
  it('cancels the round and persists', async () => {
    const deps = testDeps();
    const { workflow } = await setupIssuedRound(deps);
    const roundId = workflow.rounds[0]?.id ?? '';
    const updated = unwrap(await cancelRound(deps, { workflowId: workflow.id, roundId }));
    expect(updated.rounds[0]?.status).toBe('Cancelled');
    expect(await deps.repo.load(workflow.id)).toEqual(updated);
  });
});

describe('runConsolidation', () => {
  async function collectAll(deps: ReturnType<typeof testDeps>) {
    const issued = await setupIssuedRound(deps);
    const answers: Record<string, string[]> = {
      [issued.invitations[0]?.participantId ?? '']: ['Vendor lock-in', 'burnout'],
      [issued.invitations[1]?.participantId ?? '']: ['vendor  lock-in', 'scope creep'],
      [issued.invitations[2]?.participantId ?? '']: ['Burnout'],
    };
    let workflow: Workflow = issued.workflow;
    for (const inv of issued.invitations) {
      const response = await respond(inv.handle, inv.password, answers[inv.participantId] ?? []);
      workflow = unwrap(await importResponse(deps, { workflowId: workflow.id, envelope: response }));
    }
    const passwords = new Map(issued.invitations.map((i) => [i.participantId, i.password]));
    return { workflow, roundId: issued.roundId, passwords };
  }

  it('decrypts, validates, de-identifies, aggregates, and persists', async () => {
    const deps = testDeps();
    const { workflow, roundId, passwords } = await collectAll(deps);
    const done = unwrap(await runConsolidation(deps, { workflowId: workflow.id, roundId, passwords }));
    const round = done.rounds[0];
    expect(round?.status).toBe('Closed');
    expect(round?.output?.kind).toBe('ItemPool');
    const items = round?.output?.kind === 'ItemPool' ? round.output.items : [];
    expect(items.map((i) => i.toLowerCase()).sort()).toEqual([
      'burnout',
      'scope creep',
      'vendor lock-in',
    ]);
    expect(await deps.repo.load(workflow.id)).toEqual(done);
  });

  it('fails without saving when a password is missing', async () => {
    const deps = testDeps();
    const { workflow, roundId, passwords } = await collectAll(deps);
    const partial = new Map(passwords);
    partial.delete([...partial.keys()][0] ?? '');
    expect(
      expectErr(await runConsolidation(deps, { workflowId: workflow.id, roundId, passwords: partial })),
    ).toMatch(/password/i);
    expect((await deps.repo.load(workflow.id))?.rounds[0]?.status).toBe('Collecting');
  });

  it('fails without saving when a password is wrong', async () => {
    const deps = testDeps();
    const { workflow, roundId, passwords } = await collectAll(deps);
    const wrong = new Map(passwords);
    wrong.set([...wrong.keys()][0] ?? '', 'nope');
    expect(
      expectErr(await runConsolidation(deps, { workflowId: workflow.id, roundId, passwords: wrong })),
    ).toMatch(/decrypt/i);
    expect((await deps.repo.load(workflow.id))?.rounds[0]?.status).toBe('Collecting');
  });
});

import type { CryptoService } from '../ports/cryptoService';
import type { EnvelopeChannel } from '../ports/envelopeChannel';
import type { PasswordGen } from '../ports/passwordGen';
import type { WorkflowRepository } from '../ports/workflowRepository';
import type { Id } from '../domain/ids';
import type { Result } from '../domain/result';
import type { Workflow } from '../domain/workflow';
import { audienceIds } from '../domain/workflow';
import { reduce } from '../domain/reducer';
import { err, ok } from '../domain/result';
import type { IssuedInvitation } from './issueRound';
import { sealInvitations } from './issueRound';

// Recovery path for lost passwords or lost links: everyone who has NOT yet
// responded gets a fresh envelope and a fresh password. Existing responses are
// untouched — their envelopes were sealed under the old passwords and remain
// decryptable with them at consolidation time.
export async function reissueInvitations(
  deps: {
    repo: WorkflowRepository;
    crypto: CryptoService;
    channel: EnvelopeChannel;
    passwordGen: PasswordGen;
  },
  input: { workflowId: Id; roundId: Id },
): Promise<Result<{ workflow: Workflow; invitations: readonly IssuedInvitation[] }>> {
  const workflow = await deps.repo.load(input.workflowId);
  if (workflow === undefined) return err(`unknown workflow ${input.workflowId}`);
  const round = workflow.rounds.find((r) => r.id === input.roundId);
  if (round === undefined) return err(`unknown round ${input.roundId}`);
  if (round.status !== 'Issued' && round.status !== 'Collecting') {
    return err('only an Issued or Collecting round can be re-issued');
  }

  const responded = new Set(round.responses.map((r) => r.participantId));
  const pending = audienceIds(workflow, round.audience).filter((id) => !responded.has(id));
  if (pending.length === 0) return err('everyone in this round has already responded');

  const { issued, invitations } = await sealInvitations(deps, workflow, round, pending);
  const reduced = reduce(workflow, {
    kind: 'ReissueInvitations',
    roundId: round.id,
    invitations,
  });
  if (!reduced.ok) return reduced;
  await deps.repo.save(reduced.value);
  return ok({ workflow: reduced.value, invitations: issued });
}

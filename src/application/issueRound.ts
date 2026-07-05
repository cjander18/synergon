import type { CryptoService } from '../ports/cryptoService';
import type { EnvelopeChannel, EnvelopeHandle } from '../ports/envelopeChannel';
import type { PasswordGen } from '../ports/passwordGen';
import type { WorkflowRepository } from '../ports/workflowRepository';
import type { Id } from '../domain/ids';
import type { Result } from '../domain/result';
import type { Invitation, Workflow } from '../domain/workflow';
import { audienceIds } from '../domain/workflow';
import { elicitationFor } from '../domain/strategies/registry';
import { reduce } from '../domain/reducer';
import { err, ok } from '../domain/result';
import { utf8Encode } from '../shared/utf8';

// Returned once and never persisted: the password travels out-of-band
// (docs/architecture/security-model.md).
export interface IssuedInvitation {
  readonly participantId: Id;
  readonly password: string;
  readonly handle: EnvelopeHandle;
}

export async function issueRound(
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
  if (round.status !== 'Draft') return err('only a Draft round can be issued');

  const prompt = utf8Encode(JSON.stringify(elicitationFor(round.elicitation).describe()));
  const issued: IssuedInvitation[] = [];
  const invitations: Invitation[] = [];
  for (const participantId of audienceIds(workflow, round.audience)) {
    const password = deps.passwordGen.next();
    const envelope = await deps.crypto.seal({
      plaintext: prompt,
      password,
      route: { workflowId: workflow.id, roundId: round.id, participantId },
    });
    invitations.push({ roundId: round.id, participantId, envelope });
    issued.push({ participantId, password, handle: await deps.channel.publish(envelope) });
  }

  const reduced = reduce(workflow, { kind: 'IssueRound', roundId: round.id, invitations });
  if (!reduced.ok) return reduced;
  await deps.repo.save(reduced.value);
  return ok({ workflow: reduced.value, invitations: issued });
}

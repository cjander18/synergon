import type { CryptoService } from '../ports/cryptoService';
import type { WorkflowRepository } from '../ports/workflowRepository';
import type { Id } from '../domain/ids';
import type { Result } from '../domain/result';
import type { ValidResponse } from '../domain/responses';
import type { Workflow } from '../domain/workflow';
import { deidentify } from '../domain/responses';
import { elicitationFor } from '../domain/strategies/registry';
import { reduce } from '../domain/reducer';
import { err } from '../domain/result';
import { utf8Decode } from '../shared/utf8';

// Decrypts the round's responses (passwords are re-supplied — they are never
// persisted), validates them against the round's elicitation, de-identifies the
// pool, and runs the aggregation. Nothing is saved unless every step succeeds,
// so a wrong password leaves the stored round untouched and retryable.
export async function runConsolidation(
  deps: { repo: WorkflowRepository; crypto: CryptoService },
  input: { workflowId: Id; roundId: Id; passwords: ReadonlyMap<Id, string> },
): Promise<Result<Workflow>> {
  const workflow = await deps.repo.load(input.workflowId);
  if (workflow === undefined) return err(`unknown workflow ${input.workflowId}`);
  let state = workflow;

  const round = state.rounds.find((r) => r.id === input.roundId);
  if (round === undefined) return err(`unknown round ${input.roundId}`);
  if (round.status === 'Collecting') {
    const closed = reduce(state, { kind: 'CloseIntake', roundId: input.roundId });
    if (!closed.ok) return closed;
    state = closed.value;
  }
  const current = state.rounds.find((r) => r.id === input.roundId);
  if (current === undefined) return err(`unknown round ${input.roundId}`);

  const elicitation = elicitationFor(current.elicitation);
  const entries: { participantId: Id; value: ValidResponse }[] = [];
  for (const stored of current.responses) {
    const password = input.passwords.get(stored.participantId);
    if (password === undefined) {
      return err(`no password provided for participant ${stored.participantId}`);
    }
    const opened = await deps.crypto.open(stored.envelope, password);
    if (!opened.ok) {
      return err(`could not decrypt the response from ${stored.participantId}: ${opened.error}`);
    }
    let raw: unknown;
    try {
      raw = JSON.parse(utf8Decode(opened.value));
    } catch {
      return err(`the response from ${stored.participantId} is not valid JSON`);
    }
    const valid = elicitation.validate(raw);
    if (!valid.ok) {
      return err(`invalid response from ${stored.participantId}: ${valid.error}`);
    }
    entries.push({ participantId: stored.participantId, value: valid.value });
  }

  const reduced = reduce(state, {
    kind: 'RunAggregation',
    roundId: input.roundId,
    pool: deidentify(entries),
  });
  if (!reduced.ok) return reduced;
  await deps.repo.save(reduced.value);
  return reduced;
}

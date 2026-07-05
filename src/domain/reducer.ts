import type { Command } from './commands';
import type { Id } from './ids';
import type { Result } from './result';
import type { Round, Workflow } from './workflow';
import { audienceIds, compatible } from './workflow';
import { aggregationFor } from './strategies/registry';
import { err, ok } from './result';

// Pure state machine for the workflow/round lifecycle
// (docs/architecture/domain-model.md). No side effects: encryption, persistence,
// and envelope emission happen in use-cases around this reducer.
export function reduce(workflow: Workflow, command: Command): Result<Workflow> {
  if (workflow.status === 'Closed') {
    return err(`workflow ${workflow.id} is closed`);
  }

  switch (command.kind) {
    case 'AddParticipants': {
      const existing = new Set(workflow.participants.map((p) => p.id));
      const incoming = new Set(command.participants.map((p) => p.id));
      if (
        incoming.size !== command.participants.length ||
        command.participants.some((p) => existing.has(p.id))
      ) {
        return err('duplicate participant ids');
      }
      return ok({ ...workflow, participants: [...workflow.participants, ...command.participants] });
    }

    case 'DraftRound': {
      const { round } = command;
      if (workflow.rounds.some((r) => r.id === round.id)) {
        return err(`round id ${round.id} already exists`);
      }
      if (workflow.rounds.some((r) => r.status !== 'Closed')) {
        return err('the previous round must be Closed before drafting a new one');
      }
      if (!compatible(round.elicitation, round.aggregation)) {
        return err(
          `${round.aggregation.kind} aggregation is not compatible with ${round.elicitation.kind} elicitation`,
        );
      }
      if (round.audience.kind === 'Subset') {
        if (round.audience.participantIds.length === 0) {
          return err('a Subset audience must not be empty');
        }
        const known = new Set(workflow.participants.map((p) => p.id));
        const unknown = round.audience.participantIds.find((id) => !known.has(id));
        if (unknown !== undefined) return err(`unknown participant ${unknown} in audience`);
      }
      const drafted: Round = {
        ...round,
        index: workflow.rounds.length,
        status: 'Draft',
        invitations: [],
        responses: [],
      };
      return ok({ ...workflow, rounds: [...workflow.rounds, drafted] });
    }

    case 'IssueRound': {
      return updateRound(workflow, command.roundId, (round) => {
        if (round.status !== 'Draft') return err('only a Draft round can be issued');
        const targets = [...audienceIds(workflow, round.audience)].sort();
        const invited = [...new Set(command.invitations.map((i) => i.participantId))].sort();
        const covers =
          command.invitations.length === targets.length &&
          targets.every((id, i) => invited[i] === id) &&
          command.invitations.every((i) => i.roundId === round.id);
        if (!covers) return err('invitations must exactly cover the round audience');
        return ok({ ...round, status: 'Issued', invitations: command.invitations });
      });
    }

    case 'ImportResponse': {
      const { response } = command;
      return updateRound(workflow, response.roundId, (round) => {
        if (round.status !== 'Issued' && round.status !== 'Collecting') {
          return err('responses can only be imported while Issued or Collecting');
        }
        if (!audienceIds(workflow, round.audience).includes(response.participantId)) {
          return err(`participant ${response.participantId} is not in this round's audience`);
        }
        if (round.responses.some((r) => r.participantId === response.participantId)) {
          return err(`participant ${response.participantId} has already responded`);
        }
        return ok({
          ...round,
          status: 'Collecting',
          responses: [...round.responses, response],
        });
      });
    }

    case 'CloseIntake': {
      return updateRound(workflow, command.roundId, (round) => {
        if (round.status !== 'Collecting') return err('only a Collecting round can close intake');
        return ok({ ...round, status: 'Consolidating' });
      });
    }

    case 'RunAggregation': {
      return updateRound(workflow, command.roundId, (round) => {
        if (round.status !== 'Consolidating') {
          return err('aggregation runs only on a Consolidating round');
        }
        if (command.pool.length !== round.responses.length) {
          return err('pool size must match the imported response count');
        }
        const output = aggregationFor(round.aggregation).aggregate(command.pool);
        return ok({ ...round, status: 'Closed', output });
      });
    }

    case 'CloseWorkflow': {
      return ok({ ...workflow, status: 'Closed' });
    }
  }
}

function updateRound(
  workflow: Workflow,
  roundId: Id,
  update: (round: Round) => Result<Round>,
): Result<Workflow> {
  const round = workflow.rounds.find((r) => r.id === roundId);
  if (round === undefined) return err(`unknown round ${roundId}`);
  const updated = update(round);
  if (!updated.ok) return updated;
  return ok({
    ...workflow,
    rounds: workflow.rounds.map((r) => (r.id === roundId ? updated.value : r)),
  });
}

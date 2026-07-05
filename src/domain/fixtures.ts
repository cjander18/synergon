import type { Command } from './commands';
import type { Envelope } from './envelope';
import type { Id } from './ids';
import type { Result } from './result';
import type { StoredResponse } from './responses';
import type { Participant, Workflow } from './workflow';
import { createWorkflow } from './workflow';
import { reduce } from './reducer';

export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(`expected ok, got error: ${result.error}`);
  return result.value;
}

export function expectErr<T>(result: Result<T>): string {
  if (result.ok) throw new Error('expected error, got ok');
  return result.error;
}

export function participants(...ids: string[]): Participant[] {
  return ids.map((id) => ({ id, label: `Label ${id}` }));
}

export function fakeEnvelope(workflowId: Id, roundId: Id, participantId: Id): Envelope {
  return {
    header: {
      v: 1,
      workflowId,
      roundId,
      participantId,
      salt: new Uint8Array(0),
      iv: new Uint8Array(0),
    },
    ciphertext: new Uint8Array([1]),
  };
}

export function fakeResponse(roundId: Id, participantId: Id): StoredResponse {
  return { roundId, participantId, ciphertext: new Uint8Array([1]) };
}

export function baseWorkflow(): Workflow {
  return unwrap(
    createWorkflow({
      id: 'w-1',
      title: 'Quarterly risks',
      participants: participants('p-1', 'p-2', 'p-3'),
    }),
  );
}

export function apply(workflow: Workflow, ...commands: Command[]): Workflow {
  return commands.reduce((state, command) => unwrap(reduce(state, command)), workflow);
}

export function draftRound(id: Id): Command {
  return {
    kind: 'DraftRound',
    round: {
      id,
      audience: { kind: 'All' },
      elicitation: { kind: 'ItemList', prompt: 'List the top risks' },
      aggregation: { kind: 'Deduplicate' },
    },
  };
}

export function issueToAll(workflow: Workflow, roundId: Id): Command {
  return {
    kind: 'IssueRound',
    roundId,
    invitations: workflow.participants.map((p) => ({
      roundId,
      participantId: p.id,
      envelope: fakeEnvelope(workflow.id, roundId, p.id),
    })),
  };
}

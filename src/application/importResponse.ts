import type { WorkflowRepository } from '../ports/workflowRepository';
import type { Envelope } from '../domain/envelope';
import type { Id } from '../domain/ids';
import type { Result } from '../domain/result';
import type { Workflow } from '../domain/workflow';
import { reduce } from '../domain/reducer';
import { err } from '../domain/result';

// The envelope arrives already decoded (the UI/channel owns the text form).
// Its header is authenticated (AAD), so routing by it is tamper-proof — but we
// still confirm it belongs to this workflow before the reducer routes it.
export async function importResponse(
  deps: { repo: WorkflowRepository },
  input: { workflowId: Id; envelope: Envelope },
): Promise<Result<Workflow>> {
  const workflow = await deps.repo.load(input.workflowId);
  if (workflow === undefined) return err(`unknown workflow ${input.workflowId}`);
  const { header } = input.envelope;
  if (header.workflowId !== workflow.id) {
    return err(`envelope belongs to workflow ${header.workflowId}, not ${workflow.id}`);
  }
  const reduced = reduce(workflow, {
    kind: 'ImportResponse',
    response: {
      roundId: header.roundId,
      participantId: header.participantId,
      envelope: input.envelope,
    },
  });
  if (!reduced.ok) return reduced;
  await deps.repo.save(reduced.value);
  return reduced;
}

import type { WorkflowRepository } from '../ports/workflowRepository';
import type { Id } from '../domain/ids';
import type { Result } from '../domain/result';
import type { Workflow } from '../domain/workflow';
import { reduce } from '../domain/reducer';
import { err } from '../domain/result';

// Abandons a round that cannot or should not finish (nobody responded, wrong
// question, lost passwords with no re-issue wanted). The next round can then
// be drafted.
export async function cancelRound(
  deps: { repo: WorkflowRepository },
  input: { workflowId: Id; roundId: Id },
): Promise<Result<Workflow>> {
  const workflow = await deps.repo.load(input.workflowId);
  if (workflow === undefined) return err(`unknown workflow ${input.workflowId}`);
  const reduced = reduce(workflow, { kind: 'CancelRound', roundId: input.roundId });
  if (!reduced.ok) return reduced;
  await deps.repo.save(reduced.value);
  return reduced;
}

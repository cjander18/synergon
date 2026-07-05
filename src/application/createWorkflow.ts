import type { IdGen } from '../ports/idGen';
import type { WorkflowRepository } from '../ports/workflowRepository';
import type { Result } from '../domain/result';
import type { Workflow } from '../domain/workflow';
import { createWorkflow as newWorkflow } from '../domain/workflow';

export async function createWorkflow(
  deps: { repo: WorkflowRepository; idGen: IdGen },
  input: { title: string; participantLabels: readonly string[] },
): Promise<Result<Workflow>> {
  const created = newWorkflow({
    id: deps.idGen.next(),
    title: input.title,
    participants: input.participantLabels.map((label) => ({ id: deps.idGen.next(), label })),
  });
  if (!created.ok) return created;
  await deps.repo.save(created.value);
  return created;
}

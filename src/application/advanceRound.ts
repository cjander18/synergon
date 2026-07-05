import type { IdGen } from '../ports/idGen';
import type { WorkflowRepository } from '../ports/workflowRepository';
import type { Id } from '../domain/ids';
import type { Result } from '../domain/result';
import type { AggregationSpec, Audience, ElicitationSpec, Workflow } from '../domain/workflow';
import { err } from '../domain/result';
import { reduce } from '../domain/reducer';

// Drafts the next round (or the first — the reducer treats them identically).
export async function advanceRound(
  deps: { repo: WorkflowRepository; idGen: IdGen },
  input: {
    workflowId: Id;
    audience: Audience;
    elicitation: ElicitationSpec;
    aggregation: AggregationSpec;
  },
): Promise<Result<Workflow>> {
  const workflow = await deps.repo.load(input.workflowId);
  if (workflow === undefined) return err(`unknown workflow ${input.workflowId}`);
  const reduced = reduce(workflow, {
    kind: 'DraftRound',
    round: {
      id: deps.idGen.next(),
      audience: input.audience,
      elicitation: input.elicitation,
      aggregation: input.aggregation,
    },
  });
  if (!reduced.ok) return reduced;
  await deps.repo.save(reduced.value);
  return reduced;
}

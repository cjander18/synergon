import type { Id } from '../domain/ids';
import type { Workflow } from '../domain/workflow';

export interface WorkflowRepository {
  save(workflow: Workflow): Promise<void>;
  load(id: Id): Promise<Workflow | undefined>;
  list(): Promise<readonly Workflow[]>;
}

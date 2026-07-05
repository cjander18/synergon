import type { Id } from '../domain/ids';
import type { Workflow } from '../domain/workflow';
import type { WorkflowRepository } from '../ports/workflowRepository';

export class InMemoryWorkflowRepository implements WorkflowRepository {
  private readonly store = new Map<Id, Workflow>();

  // Clones on the way in and out so stored state cannot be aliased — the same
  // isolation a real storage engine provides.
  save(workflow: Workflow): Promise<void> {
    this.store.set(workflow.id, structuredClone(workflow));
    return Promise.resolve();
  }

  load(id: Id): Promise<Workflow | undefined> {
    const found = this.store.get(id);
    return Promise.resolve(found === undefined ? undefined : structuredClone(found));
  }

  list(): Promise<readonly Workflow[]> {
    return Promise.resolve([...this.store.values()].map((w) => structuredClone(w)));
  }
}

import { describe, it, expect } from 'vitest';
import type { WorkflowRepository } from '../ports/workflowRepository';
import { apply, baseWorkflow, draftRound } from '../domain/fixtures';

// Shared contract: every WorkflowRepository adapter (in-memory now, IndexedDB in
// M3) must pass this suite so they are provably interchangeable.
export function workflowRepositoryContract(name: string, makeRepo: () => WorkflowRepository) {
  describe(`WorkflowRepository contract: ${name}`, () => {
    it('round-trips a saved workflow', async () => {
      const repo = makeRepo();
      const workflow = apply(baseWorkflow(), draftRound('r-1'));
      await repo.save(workflow);
      expect(await repo.load(workflow.id)).toEqual(workflow);
    });

    it('returns undefined for an unknown id', async () => {
      const repo = makeRepo();
      expect(await repo.load('missing')).toBeUndefined();
    });

    it('overwrites on save with the same id', async () => {
      const repo = makeRepo();
      const v1 = baseWorkflow();
      const v2 = apply(v1, draftRound('r-1'));
      await repo.save(v1);
      await repo.save(v2);
      expect(await repo.load(v1.id)).toEqual(v2);
    });

    it('isolates stored state from later mutation of inputs and outputs', async () => {
      const repo = makeRepo();
      const workflow = baseWorkflow();
      await repo.save(workflow);
      const loaded = await repo.load(workflow.id);
      (loaded as { title: string }).title = 'mutated';
      expect((await repo.load(workflow.id))?.title).toBe(workflow.title);
    });

    it('lists saved workflows', async () => {
      const repo = makeRepo();
      expect(await repo.list()).toEqual([]);
      const workflow = baseWorkflow();
      await repo.save(workflow);
      expect(await repo.list()).toEqual([workflow]);
    });
  });
}

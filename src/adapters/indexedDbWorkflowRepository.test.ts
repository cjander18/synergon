import { describe, it, expect } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { IndexedDbWorkflowRepository } from './indexedDbWorkflowRepository';
import { workflowRepositoryContract } from './workflowRepositoryContract';
import { apply, baseWorkflow, draftRound, fakeResponse, issueToAll } from '../domain/fixtures';

let dbCounter = 0;

workflowRepositoryContract(
  'IndexedDbWorkflowRepository',
  () => new IndexedDbWorkflowRepository(`contract-${++dbCounter}`, new IDBFactory()),
);

describe('IndexedDbWorkflowRepository', () => {
  it('round-trips binary envelope fields intact', async () => {
    const repo = new IndexedDbWorkflowRepository('binary-test', new IDBFactory());
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'), {
      kind: 'ImportResponse',
      response: fakeResponse('r-1', 'p-1'),
    });
    await repo.save(workflow);
    expect(await repo.load(workflow.id)).toEqual(workflow);
  });

  it('state survives a reload (new adapter instance over the same database)', async () => {
    const factory = new IDBFactory();
    const before = new IndexedDbWorkflowRepository('reload-test', factory);
    const workflow = baseWorkflow();
    await before.save(workflow);

    const after = new IndexedDbWorkflowRepository('reload-test', factory);
    expect(await after.load(workflow.id)).toEqual(workflow);
  });
});

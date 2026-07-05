import type { Id } from '../domain/ids';
import type { Workflow } from '../domain/workflow';
import type { WorkflowRepository } from '../ports/workflowRepository';

const STORE = 'workflows';

// One short-lived connection per operation: no connection state to manage, and
// version upgrades never block an open handle. Plenty for MVP volumes.
export class IndexedDbWorkflowRepository implements WorkflowRepository {
  constructor(
    private readonly dbName: string = 'synergon',
    private readonly factory: IDBFactory = indexedDB,
  ) {}

  async save(workflow: Workflow): Promise<void> {
    await this.withStore('readwrite', (store) => store.put(workflow));
  }

  async load(id: Id): Promise<Workflow | undefined> {
    return (await this.withStore('readonly', (store) => store.get(id))) as Workflow | undefined;
  }

  async list(): Promise<readonly Workflow[]> {
    return (await this.withStore('readonly', (store) => store.getAll())) as Workflow[];
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.factory.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('failed to open database'));
    });
  }

  private async withStore<T>(
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await this.openDb();
    try {
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = run(tx.objectStore(STORE));
        let result!: T;
        request.onsuccess = () => {
          result = request.result;
        };
        // Resolve on transaction completion so writes are durable, not merely queued.
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error ?? new Error('transaction failed'));
        tx.onabort = () => reject(tx.error ?? new Error('transaction aborted'));
      });
    } finally {
      db.close();
    }
  }
}

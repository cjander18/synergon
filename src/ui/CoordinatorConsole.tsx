import { useEffect, useState } from 'react';
import type { Workflow } from '../domain/workflow';
import { createWorkflow } from '../application/createWorkflow';
import { decodeWorkflow } from '../adapters/workflowCodec';
import { WorkflowView } from './WorkflowView';
import type { AppDeps } from './types';

export function CoordinatorConsole({ deps }: { deps: AppDeps }) {
  const [workflows, setWorkflows] = useState<readonly Workflow[]>([]);
  const [selected, setSelected] = useState<Workflow>();
  const [title, setTitle] = useState('');
  const [participantsText, setParticipantsText] = useState('');
  const [importText, setImportText] = useState('');
  const [error, setError] = useState('');

  async function importWorkflow() {
    setError('');
    const decoded = decodeWorkflow(importText);
    if (!decoded.ok) {
      setError(decoded.error);
      return;
    }
    await deps.repo.save(decoded.value);
    setImportText('');
    setSelected(decoded.value);
    setWorkflows(await deps.repo.list());
  }

  useEffect(() => {
    void deps.repo.list().then(setWorkflows);
  }, [deps]);

  async function create() {
    setError('');
    const participantLabels = participantsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
    const result = await createWorkflow(deps, { title, participantLabels });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTitle('');
    setParticipantsText('');
    setSelected(result.value);
    setWorkflows(await deps.repo.list());
  }

  function onWorkflowChange(workflow: Workflow) {
    setSelected(workflow);
    setWorkflows((current) => current.map((w) => (w.id === workflow.id ? workflow : w)));
  }

  return (
    <main className="page">
      <h1>Synergon</h1>

      {workflows.length > 0 && (
        <nav>
          {workflows.map((workflow) => (
            <button key={workflow.id} onClick={() => setSelected(workflow)}>
              {workflow.title}
            </button>
          ))}
        </nav>
      )}

      <section className="card">
        <h2>New workflow</h2>
        <label htmlFor="create-title">Title</label>
        <input id="create-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="create-participants">Participants (one per line)</label>
        <textarea
          id="create-participants"
          rows={4}
          value={participantsText}
          onChange={(e) => setParticipantsText(e.target.value)}
        />
        <button onClick={() => void create()}>Create workflow</button>

        <label htmlFor="import-workflow">Import a workflow (paste an exported file's contents)</label>
        <textarea
          id="import-workflow"
          rows={3}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
        />
        <button onClick={() => void importWorkflow()}>Import workflow</button>
        <p className="hint">Importing replaces any existing workflow with the same id.</p>
        {error !== '' && <p role="alert">{error}</p>}
      </section>

      {selected !== undefined && (
        <WorkflowView deps={deps} workflow={selected} onChange={onWorkflowChange} />
      )}
    </main>
  );
}

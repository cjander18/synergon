import { useState } from 'react';
import type { AggregationOutput, Round, RoundStatus, Workflow } from '../domain/workflow';
import { isSettled } from '../domain/workflow';
import type { IssuedInvitation } from '../application/issueRound';
import { issueRound } from '../application/issueRound';
import { reissueInvitations } from '../application/reissueInvitations';
import { cancelRound } from '../application/cancelRound';
import { encodeWorkflow } from '../adapters/workflowCodec';
import { AsyncButton } from './AsyncButton';
import { CollectPanel } from './CollectPanel';
import { DraftRoundForm } from './DraftRoundForm';
import { InvitationsPanel } from './InvitationsPanel';
import { tryDownload } from './download';
import type { AppDeps } from './types';

export function WorkflowView({
  deps,
  workflow,
  onChange,
}: {
  deps: AppDeps;
  workflow: Workflow;
  onChange: (workflow: Workflow) => void;
}) {
  const [invitations, setInvitations] = useState<readonly IssuedInvitation[]>([]);
  const [exportText, setExportText] = useState('');
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [error, setError] = useState('');

  const current = workflow.rounds[workflow.rounds.length - 1];
  const drafting = current === undefined || isSettled(current.status);

  function exportWorkflow() {
    const contents = encodeWorkflow(workflow);
    const slug = workflow.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!tryDownload(`${slug || 'workflow'}.synergon-workflow.json`, contents)) {
      setExportText(contents);
    }
  }

  async function issue(round: Round) {
    setError('');
    const result = await issueRound(deps, { workflowId: workflow.id, roundId: round.id });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInvitations(result.value.invitations);
    onChange(result.value.workflow);
  }

  async function reissue(round: Round) {
    setError('');
    const result = await reissueInvitations(deps, {
      workflowId: workflow.id,
      roundId: round.id,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInvitations(result.value.invitations);
    onChange(result.value.workflow);
  }

  async function cancel(round: Round) {
    setError('');
    const result = await cancelRound(deps, { workflowId: workflow.id, roundId: round.id });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInvitations([]);
    setConfirmingCancel(false);
    onChange(result.value);
  }

  return (
    <article>
      <h2>{workflow.title}</h2>
      <button onClick={exportWorkflow}>Export workflow</button>
      {workflow.rounds.length > 0 && (
        <p className="hint">
          This workflow lives only in this browser, and browsers can evict local storage after
          long inactivity — export a backup after important rounds.
        </p>
      )}
      {exportText !== '' && (
        <>
          <label htmlFor="export-workflow">Exported workflow (save this text as a file)</label>
          <textarea id="export-workflow" rows={4} readOnly value={exportText} />
        </>
      )}

      {workflow.rounds
        .filter((round) => isSettled(round.status))
        .map((round) => (
          <section className="card" key={round.id}>
            <RoundHead index={round.index} status={round.status} />
            {round.output !== undefined && <RoundOutput output={round.output} />}
          </section>
        ))}

      {current !== undefined && !isSettled(current.status) && (
        <section>
          <RoundHead index={current.index} status={current.status} />
          {current.status === 'Draft' && (
            <AsyncButton className="primary" busyLabel="Issuing…" onPress={() => issue(current)}>
              Issue round
            </AsyncButton>
          )}
          {(current.status === 'Issued' || current.status === 'Collecting') && (
            <>
              {invitations.length > 0 ? (
                <InvitationsPanel invitations={invitations} workflow={workflow} />
              ) : (
                <p className="meta">
                  Invitations were generated when this round was issued; passwords are only shown
                  at that moment. Use “Re-issue invitations” to generate fresh links and
                  passwords for anyone who has not yet responded.
                </p>
              )}
              <AsyncButton busyLabel="Re-issuing…" onPress={() => reissue(current)}>
                Re-issue invitations
              </AsyncButton>
              <CollectPanel
                deps={deps}
                workflow={workflow}
                round={current}
                onChange={onChange}
                onConsolidated={() => setInvitations([])}
              />
            </>
          )}
          {confirmingCancel ? (
            <AsyncButton
              className="danger"
              busyLabel="Discarding…"
              onPress={() => cancel(current)}
            >
              Discard round {current.index + 1} — this cannot be undone
            </AsyncButton>
          ) : (
            <button className="danger-outline" onClick={() => setConfirmingCancel(true)}>
              Cancel round
            </button>
          )}
        </section>
      )}

      {drafting && (
        <DraftRoundForm
          key={workflow.rounds.length}
          deps={deps}
          workflow={workflow}
          previousItems={outputItems(workflow)}
          onChange={onChange}
        />
      )}
      {error !== '' && <p role="alert">{error}</p>}
    </article>
  );
}

// The state machine, made visible: round number + a labeled semantic badge.
function RoundHead({ index, status }: { index: number; status: RoundStatus }) {
  return (
    <div className="round-head">
      <h3>Round {index + 1}</h3>
      <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
    </div>
  );
}

// Seeds the next round's item list from the latest closed round's output.
function outputItems(workflow: Workflow): readonly string[] {
  const closed = workflow.rounds.filter((round) => round.status === 'Closed');
  const output = closed[closed.length - 1]?.output;
  if (output === undefined) return [];
  switch (output.kind) {
    case 'ItemPool':
      return output.items;
    case 'ConsolidatedItems':
    case 'ScoredItems':
    case 'RankedItems':
      return output.items.map((item) => item.text);
  }
}

function RoundOutput({ output }: { output: AggregationOutput }) {
  switch (output.kind) {
    case 'ItemPool':
      return (
        <ul className="output">
          {output.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'ConsolidatedItems':
      return (
        <ol className="output">
          {output.items.map((entry) => (
            <li key={entry.text}>
              <span>{entry.text}</span> <span className="support">×{entry.support}</span>
            </li>
          ))}
        </ol>
      );
    case 'ScoredItems':
      return (
        <ol className="output">
          {output.items.map((entry) => (
            <li key={entry.text}>
              <span>{entry.text}</span>{' '}
              <span className="support">{formatScore(entry.score)}</span>
            </li>
          ))}
        </ol>
      );
    case 'RankedItems':
      return (
        <ol className="output">
          {output.items.map((entry) => (
            <li key={entry.text}>
              <span>{entry.text}</span> <span className="support">Σ{entry.rankSum}</span>
            </li>
          ))}
        </ol>
      );
  }
}

function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

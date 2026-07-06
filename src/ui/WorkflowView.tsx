import { useState } from 'react';
import type { AggregationOutput, Round, Workflow } from '../domain/workflow';
import { isSettled } from '../domain/workflow';
import type { IssuedInvitation } from '../application/issueRound';
import { issueRound } from '../application/issueRound';
import { reissueInvitations } from '../application/reissueInvitations';
import { cancelRound } from '../application/cancelRound';
import { CollectPanel } from './CollectPanel';
import { DraftRoundForm } from './DraftRoundForm';
import { InvitationsPanel } from './InvitationsPanel';
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
  const [error, setError] = useState('');

  const current = workflow.rounds[workflow.rounds.length - 1];
  const drafting = current === undefined || isSettled(current.status);

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
    onChange(result.value);
  }

  return (
    <article>
      <h2>{workflow.title}</h2>

      {workflow.rounds
        .filter((round) => isSettled(round.status))
        .map((round) => (
          <section className="card" key={round.id}>
            <h3>
              Round {round.index + 1} — {round.status}
            </h3>
            {round.output !== undefined && <RoundOutput output={round.output} />}
          </section>
        ))}

      {current !== undefined && !isSettled(current.status) && (
        <section>
          <h3>
            Round {current.index + 1} — {current.status}
          </h3>
          {current.status === 'Draft' && (
            <button onClick={() => void issue(current)}>Issue round</button>
          )}
          {(current.status === 'Issued' || current.status === 'Collecting') && (
            <>
              {invitations.length > 0 ? (
                <InvitationsPanel invitations={invitations} workflow={workflow} />
              ) : (
                <p>
                  Invitations were generated when this round was issued; passwords are only shown
                  at that moment. Use “Re-issue invitations” to generate fresh links and
                  passwords for anyone who has not yet responded.
                </p>
              )}
              <button onClick={() => void reissue(current)}>Re-issue invitations</button>
              <CollectPanel
                deps={deps}
                workflow={workflow}
                round={current}
                onChange={onChange}
                onConsolidated={() => setInvitations([])}
              />
            </>
          )}
          <button onClick={() => void cancel(current)}>Cancel round</button>
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

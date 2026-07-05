import { useState } from 'react';
import type { AggregationOutput, Round, Workflow } from '../domain/workflow';
import type { IssuedInvitation } from '../application/issueRound';
import { issueRound } from '../application/issueRound';
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
  const drafting = current === undefined || current.status === 'Closed';

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

  return (
    <article>
      <h2>{workflow.title}</h2>

      {workflow.rounds
        .filter((round) => round.status === 'Closed')
        .map((round) => (
          <section className="card" key={round.id}>
            <h3>
              Round {round.index + 1} — Closed
            </h3>
            {round.output !== undefined && <RoundOutput output={round.output} />}
          </section>
        ))}

      {current !== undefined && current.status !== 'Closed' && (
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
                  at that moment.
                </p>
              )}
              <CollectPanel
                deps={deps}
                workflow={workflow}
                round={current}
                onChange={onChange}
                onConsolidated={() => setInvitations([])}
              />
            </>
          )}
        </section>
      )}

      {drafting && <DraftRoundForm deps={deps} workflow={workflow} onChange={onChange} />}
      {error !== '' && <p role="alert">{error}</p>}
    </article>
  );
}

function RoundOutput({ output }: { output: AggregationOutput }) {
  if (output.kind === 'ItemPool') {
    return (
      <ul className="output">
        {output.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <ol className="output">
      {output.items.map((entry) => (
        <li key={entry.text}>
          {entry.text} <span className="support">×{entry.support}</span>
        </li>
      ))}
    </ol>
  );
}

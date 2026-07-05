import type { Workflow } from '../domain/workflow';
import type { IssuedInvitation } from '../application/issueRound';
import { Qr } from './Qr';

// Passwords appear here once and are never persisted (security-model.md):
// the coordinator sends each link and its password over different channels.
export function InvitationsPanel({
  invitations,
  workflow,
}: {
  invitations: readonly IssuedInvitation[];
  workflow: Workflow;
}) {
  const labelOf = (id: string) => workflow.participants.find((p) => p.id === id)?.label ?? id;
  return (
    <section className="card">
      <h4>Invitations</h4>
      <p className="warn">
        Passwords are shown only now and never stored. Send each link and its password over
        different channels (for example, link by email, password by chat).
      </p>
      {invitations.map((inv) => (
        <div className="invitation" key={inv.participantId}>
          <h5>{labelOf(inv.participantId)}</h5>
          {inv.handle.kind === 'url' ? (
            <>
              <a href={inv.handle.url}>Invitation link</a>
              <Qr text={inv.handle.url} />
            </>
          ) : (
            <>
              <p>
                Too large for a link — send as a file named <code>{inv.handle.fileName}</code>{' '}
                with these contents:
              </p>
              <textarea
                readOnly
                rows={4}
                value={inv.handle.contents}
                aria-label={`File contents for ${labelOf(inv.participantId)}`}
              />
            </>
          )}
          <p>
            Password: <code>{inv.password}</code>
          </p>
        </div>
      ))}
    </section>
  );
}

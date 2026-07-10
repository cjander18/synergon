const EMAIL = 'synergonlabs@gmail.com';
const REPO = 'https://github.com/cjander18/synergon';

// Feedback is always an explicit, user-initiated link out — never an SDK or a
// background call (see docs/architecture/security-model.md, "No phoning home").
// The mailto prefill turns "it's broken" into an actionable report; the plain
// address is the fallback for machines with no mail client configured.
export function FeedbackFooter({ view }: { view?: string }) {
  const body = encodeURIComponent(
    [
      'What were you trying to do?',
      '',
      '',
      'What happened?',
      '',
      '',
      'What did you expect?',
      '',
      '',
      `—${view === undefined ? '' : `\nView: ${view}`}`,
    ].join('\n'),
  );
  const href = `mailto:${EMAIL}?subject=${encodeURIComponent('Synergon feedback')}&body=${body}`;
  return (
    <footer className="feedback">
      <p>
        Questions or feedback? <a href={href}>Email us</a> at <code>{EMAIL}</code> ·{' '}
        <a href={`${REPO}/issues/new/choose`}>Report a problem on GitHub</a>
      </p>
      <p className="hint">
        Feedback is an explicit action — this app never sends anything anywhere on its own.
      </p>
    </footer>
  );
}

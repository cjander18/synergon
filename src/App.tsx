import { decodeEnvelope } from './adapters/envelopeCodec';
import { ContributorView } from './ui/ContributorView';
import { FeedbackFooter } from './ui/FeedbackFooter';
import { CoordinatorConsole } from './ui/CoordinatorConsole';
import type { AppDeps } from './ui/types';

// One static bundle, routed by the URL fragment (ADR-0002): a fragment that
// decodes as an envelope is an invitation -> contributor view; `w=<id>` is a
// coordinator deep link (unambiguous — envelope base64url never contains '=');
// no fragment is the coordinator's console.
export function App({ deps, initialHash }: { deps: AppDeps; initialHash: string }) {
  const fragment = initialHash.startsWith('#') ? initialHash.slice(1) : initialHash;
  if (fragment === '') return <CoordinatorConsole deps={deps} />;
  if (fragment.startsWith('w=')) {
    return <CoordinatorConsole deps={deps} initialWorkflowId={fragment.slice(2)} />;
  }

  const decoded = decodeEnvelope(fragment);
  if (decoded.ok) return <ContributorView crypto={deps.crypto} envelope={decoded.value} />;
  return (
    <main className="page">
      <h1>Synergon</h1>
      <p role="alert">
        This link is not a valid Synergon envelope. Ask your coordinator for a fresh invitation
        link.
      </p>
      <FeedbackFooter view="invalid link" />
    </main>
  );
}

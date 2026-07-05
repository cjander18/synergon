import { decodeEnvelope } from './adapters/envelopeCodec';
import { ContributorView } from './ui/ContributorView';
import { CoordinatorConsole } from './ui/CoordinatorConsole';
import type { AppDeps } from './ui/types';

// One static bundle, routed by the URL fragment (ADR-0002): a fragment that
// decodes as an envelope is an invitation -> contributor view; no fragment is
// the coordinator's console.
export function App({ deps, initialHash }: { deps: AppDeps; initialHash: string }) {
  const fragment = initialHash.startsWith('#') ? initialHash.slice(1) : initialHash;
  if (fragment === '') return <CoordinatorConsole deps={deps} />;

  const decoded = decodeEnvelope(fragment);
  if (decoded.ok) return <ContributorView crypto={deps.crypto} envelope={decoded.value} />;
  return (
    <main className="page">
      <h1>Synergon</h1>
      <p role="alert">
        This link is not a valid Synergon envelope. Ask your coordinator for a fresh invitation
        link.
      </p>
    </main>
  );
}

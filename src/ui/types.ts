import type { CryptoService } from '../ports/cryptoService';
import type { EnvelopeChannel } from '../ports/envelopeChannel';
import type { IdGen } from '../ports/idGen';
import type { PasswordGen } from '../ports/passwordGen';
import type { WorkflowRepository } from '../ports/workflowRepository';

// Composition-root wiring: real adapters in main.tsx, fakes in tests.
export interface AppDeps {
  readonly repo: WorkflowRepository;
  readonly crypto: CryptoService;
  readonly channel: EnvelopeChannel;
  readonly idGen: IdGen;
  readonly passwordGen: PasswordGen;
}

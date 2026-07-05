import type { Id } from './ids';

// The routing header is cleartext but authenticated (AES-GCM AAD) — see
// docs/architecture/security-model.md. The domain treats envelopes as opaque
// data; encryption lives behind the CryptoService port (M2).
export interface EnvelopeHeader {
  readonly v: 1;
  readonly workflowId: Id;
  readonly roundId: Id;
  readonly participantId: Id;
  readonly salt: Uint8Array;
  readonly iv: Uint8Array;
}

export interface Envelope {
  readonly header: EnvelopeHeader;
  readonly ciphertext: Uint8Array;
}

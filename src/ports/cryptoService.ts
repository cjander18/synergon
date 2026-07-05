import type { Envelope } from '../domain/envelope';
import type { Id } from '../domain/ids';
import type { Result } from '../domain/result';

export interface EnvelopeRoute {
  readonly workflowId: Id;
  readonly roundId: Id;
  readonly participantId: Id;
}

export interface CryptoService {
  seal(args: {
    plaintext: Uint8Array<ArrayBuffer>;
    password: string;
    route: EnvelopeRoute;
  }): Promise<Envelope>;

  // Fails on a wrong password OR any tampering of ciphertext/header — AEAD
  // makes the two indistinguishable by design.
  open(envelope: Envelope, password: string): Promise<Result<Uint8Array<ArrayBuffer>>>;
}

import type { Envelope } from '../domain/envelope';
import type { Result } from '../domain/result';
import type { CryptoService, EnvelopeRoute } from '../ports/cryptoService';
import { err, ok } from '../domain/result';
import { utf8Decode, utf8Encode } from '../shared/utf8';
import { InMemoryWorkflowRepository } from '../adapters/inMemoryWorkflowRepository';
import { CopyPasteChannel } from '../adapters/copyPasteChannel';
import type { AppDeps } from './types';

// UI tests exercise the use-case boundary; real PBKDF2/AES is covered by the
// M2/M3 suites. This fake stores the password in the salt field and the
// plaintext as the "ciphertext" — same interface, deterministic and instant.
export class FakeCryptoService implements CryptoService {
  seal(args: {
    plaintext: Uint8Array<ArrayBuffer>;
    password: string;
    route: EnvelopeRoute;
  }): Promise<Envelope> {
    return Promise.resolve({
      header: { v: 1, ...args.route, salt: utf8Encode(args.password), iv: new Uint8Array(0) },
      ciphertext: args.plaintext,
    });
  }

  open(envelope: Envelope, password: string): Promise<Result<Uint8Array<ArrayBuffer>>> {
    if (utf8Decode(envelope.header.salt) !== password) {
      return Promise.resolve(err('wrong password or tampered envelope'));
    }
    return Promise.resolve(ok(envelope.ciphertext));
  }
}

export const TEST_BASE_URL = 'https://synergon.test/app';

export function makeDeps(): AppDeps {
  let ids = 0;
  let passwords = 0;
  return {
    repo: new InMemoryWorkflowRepository(),
    crypto: new FakeCryptoService(),
    channel: new CopyPasteChannel(TEST_BASE_URL),
    idGen: { next: () => `id-${++ids}` },
    passwordGen: { next: () => `secret-pw-${++passwords}` },
  };
}

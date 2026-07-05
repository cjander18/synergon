import type { Envelope, EnvelopeHeader } from '../domain/envelope';
import type { CryptoService, EnvelopeRoute } from '../ports/cryptoService';
import type { Result } from '../domain/result';
import { err, ok } from '../domain/result';
import { utf8Encode } from '../shared/utf8';

// PBKDF2-SHA256 + AES-256-GCM via the Web Crypto API, per
// docs/architecture/security-model.md. The routing header is passed as AAD so
// it is cleartext but authenticated: any tampering fails decryption.
const DEFAULT_ITERATIONS = 600_000; // OWASP guidance for PBKDF2-SHA256

export class WebCryptoService implements CryptoService {
  readonly iterations: number;

  constructor(options?: { iterations?: number }) {
    this.iterations = options?.iterations ?? DEFAULT_ITERATIONS;
  }

  async seal(args: {
    plaintext: Uint8Array<ArrayBuffer>;
    password: string;
    route: EnvelopeRoute;
  }): Promise<Envelope> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const header: EnvelopeHeader = { v: 1, ...args.route, salt, iv };
    const key = await this.deriveKey(args.password, salt);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: aad(header) },
      key,
      args.plaintext,
    );
    return { header, ciphertext: new Uint8Array(ciphertext) };
  }

  async open(envelope: Envelope, password: string): Promise<Result<Uint8Array<ArrayBuffer>>> {
    const key = await this.deriveKey(password, envelope.header.salt);
    try {
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: envelope.header.iv, additionalData: aad(envelope.header) },
        key,
        envelope.ciphertext,
      );
      return ok(new Uint8Array(plaintext));
    } catch {
      return err('wrong password or tampered envelope');
    }
  }

  private async deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
    const material = await crypto.subtle.importKey('raw', utf8Encode(password), 'PBKDF2', false, [
      'deriveKey',
    ]);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: this.iterations, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }
}

// Array form gives deterministic order and unambiguous delimiting; salt and iv
// are implicitly authenticated by their role in decryption.
function aad(header: EnvelopeHeader): Uint8Array<ArrayBuffer> {
  return utf8Encode(
    JSON.stringify([header.v, header.workflowId, header.roundId, header.participantId]),
  );
}

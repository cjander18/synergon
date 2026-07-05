import type { IdGen } from '../ports/idGen';
import type { PasswordGen } from '../ports/passwordGen';

export class CryptoRandomIdGen implements IdGen {
  next(): string {
    return crypto.randomUUID();
  }
}

// 32 characters (no i/l/o/u to avoid transcription mistakes) -> 5 bits each;
// 20 characters = 100 bits of entropy, grouped for reading aloud.
const ALPHABET = 'abcdefghjkmnpqrstvwxyz0123456789';

export class CryptoRandomPasswordGen implements PasswordGen {
  next(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
    return [chars.slice(0, 5), chars.slice(5, 10), chars.slice(10, 15), chars.slice(15, 20)].join(
      '-',
    );
  }
}

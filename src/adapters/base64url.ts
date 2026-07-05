import type { Result } from '../domain/result';
import { err, ok } from '../domain/result';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const REVERSE = new Map([...ALPHABET].map((c, i) => [c, i]));

export function toBase64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += ALPHABET[a >> 2];
    out += ALPHABET[((a & 0x03) << 4) | ((b ?? 0) >> 4)];
    if (b !== undefined) out += ALPHABET[((b & 0x0f) << 2) | ((c ?? 0) >> 6)];
    if (c !== undefined) out += ALPHABET[c & 0x3f];
  }
  return out;
}

export function fromBase64Url(text: string): Result<Uint8Array<ArrayBuffer>> {
  if (text.length % 4 === 1) return err('invalid base64url length');
  const values: number[] = [];
  for (const char of text) {
    const value = REVERSE.get(char);
    if (value === undefined) return err(`invalid base64url character ${JSON.stringify(char)}`);
    values.push(value);
  }
  const bytes: number[] = [];
  for (let i = 0; i < values.length; i += 4) {
    const [a, b, c, d] = [values[i], values[i + 1], values[i + 2], values[i + 3]];
    if (a === undefined || b === undefined) break;
    bytes.push(((a << 2) | (b >> 4)) & 0xff);
    if (c !== undefined) bytes.push(((b << 4) | (c >> 2)) & 0xff);
    if (d !== undefined) bytes.push((((c ?? 0) << 6) | d) & 0xff);
  }
  return ok(new Uint8Array(bytes));
}

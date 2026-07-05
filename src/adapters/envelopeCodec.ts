import type { Envelope } from '../domain/envelope';
import type { Result } from '../domain/result';
import { err, ok } from '../domain/result';
import { fromBase64Url, toBase64Url } from './base64url';

// Wire format: base64url(JSON) — one string usable verbatim as a URL fragment,
// QR payload, or .synergon file body (ADR-0002: three carriers, one encoding).
interface WireEnvelope {
  v: number;
  workflowId: string;
  roundId: string;
  participantId: string;
  salt: string;
  iv: string;
  ciphertext: string;
}

export function encodeEnvelope(envelope: Envelope): string {
  const wire: WireEnvelope = {
    v: envelope.header.v,
    workflowId: envelope.header.workflowId,
    roundId: envelope.header.roundId,
    participantId: envelope.header.participantId,
    salt: toBase64Url(envelope.header.salt),
    iv: toBase64Url(envelope.header.iv),
    ciphertext: toBase64Url(envelope.ciphertext),
  };
  return toBase64Url(new TextEncoder().encode(JSON.stringify(wire)));
}

export function decodeEnvelope(text: string): Result<Envelope> {
  const bytes = fromBase64Url(text.trim());
  if (!bytes.ok) return err('not a valid envelope: bad encoding');
  let wire: unknown;
  try {
    wire = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.value));
  } catch {
    return err('not a valid envelope: bad payload');
  }
  if (typeof wire !== 'object' || wire === null) return err('not a valid envelope: bad payload');
  const w = wire as Partial<WireEnvelope>;
  if (w.v !== 1) return err(`unsupported envelope version ${String(w.v)}`);
  if (
    typeof w.workflowId !== 'string' ||
    typeof w.roundId !== 'string' ||
    typeof w.participantId !== 'string' ||
    typeof w.salt !== 'string' ||
    typeof w.iv !== 'string' ||
    typeof w.ciphertext !== 'string'
  ) {
    return err('not a valid envelope: missing fields');
  }
  const salt = fromBase64Url(w.salt);
  const iv = fromBase64Url(w.iv);
  const ciphertext = fromBase64Url(w.ciphertext);
  if (!salt.ok || !iv.ok || !ciphertext.ok) return err('not a valid envelope: bad binary fields');
  return ok({
    header: {
      v: 1,
      workflowId: w.workflowId,
      roundId: w.roundId,
      participantId: w.participantId,
      salt: salt.value,
      iv: iv.value,
    },
    ciphertext: ciphertext.value,
  });
}

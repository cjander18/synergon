import { describe, it, expect } from 'vitest';
import { decodeEnvelope, encodeEnvelope } from './envelopeCodec';
import { expectErr, unwrap } from '../domain/fixtures';
import type { Envelope } from '../domain/envelope';

function sampleEnvelope(): Envelope {
  return {
    header: {
      v: 1,
      workflowId: 'w-1',
      roundId: 'r-1',
      participantId: 'p-1',
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      iv: new Uint8Array([21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
    },
    ciphertext: new Uint8Array([100, 0, 255, 42, 7]),
  };
}

describe('envelope codec', () => {
  it('round-trips an envelope exactly', () => {
    const envelope = sampleEnvelope();
    expect(unwrap(decodeEnvelope(encodeEnvelope(envelope)))).toEqual(envelope);
  });

  it('produces URL-safe text', () => {
    expect(encodeEnvelope(sampleEnvelope())).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('rejects text that is not an envelope', () => {
    expect(expectErr(decodeEnvelope('definitely not an envelope!!!'))).toMatch(/envelope/i);
  });

  it('rejects structurally wrong payloads', () => {
    // valid base64url, but the JSON inside is not an envelope
    const bogus = encodeEnvelope(sampleEnvelope()).slice(0, 8);
    expect(decodeEnvelope(bogus).ok).toBe(false);
  });

  it('rejects an unsupported version', () => {
    const encoded = encodeEnvelope(sampleEnvelope());
    const decoded = unwrap(decodeEnvelope(encoded));
    const forged = encodeEnvelope({
      ...decoded,
      header: { ...decoded.header, v: 99 as unknown as 1 },
    });
    expect(expectErr(decodeEnvelope(forged))).toMatch(/version/i);
  });
});

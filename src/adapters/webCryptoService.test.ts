import { describe, it, expect } from 'vitest';
import { WebCryptoService } from './webCryptoService';
import { expectErr, unwrap } from '../domain/fixtures';

// Low iteration count keeps the suite fast; KDF strength is configuration,
// and the default is asserted separately below.
const crypto = new WebCryptoService({ iterations: 1_000 });
const route = { workflowId: 'w-1', roundId: 'r-1', participantId: 'p-1' };
const plaintext = new TextEncoder().encode('List the top risks');

describe('WebCryptoService', () => {
  it('seal -> open round-trips the plaintext with the right password', async () => {
    const envelope = await crypto.seal({ plaintext, password: 'pw-1', route });
    const opened = unwrap(await crypto.open(envelope, 'pw-1'));
    expect(new TextDecoder().decode(opened)).toBe('List the top risks');
  });

  it('stamps the route into the authenticated header', async () => {
    const envelope = await crypto.seal({ plaintext, password: 'pw-1', route });
    expect(envelope.header.v).toBe(1);
    expect(envelope.header.workflowId).toBe('w-1');
    expect(envelope.header.roundId).toBe('r-1');
    expect(envelope.header.participantId).toBe('p-1');
  });

  it('rejects the wrong password', async () => {
    const envelope = await crypto.seal({ plaintext, password: 'pw-1', route });
    expect(expectErr(await crypto.open(envelope, 'pw-2'))).toMatch(/password|tampered/i);
  });

  it('rejects tampered ciphertext', async () => {
    const envelope = await crypto.seal({ plaintext, password: 'pw-1', route });
    const flipped = new Uint8Array(envelope.ciphertext);
    flipped[0] = (flipped[0] ?? 0) ^ 0xff;
    const tampered = { ...envelope, ciphertext: flipped };
    expect(expectErr(await crypto.open(tampered, 'pw-1'))).toMatch(/password|tampered/i);
  });

  it('rejects a tampered routing header (misrouting is detected)', async () => {
    const envelope = await crypto.seal({ plaintext, password: 'pw-1', route });
    const tampered = {
      ...envelope,
      header: { ...envelope.header, participantId: 'p-2' },
    };
    expect(expectErr(await crypto.open(tampered, 'pw-1'))).toMatch(/password|tampered/i);
  });

  it('uses a fresh salt and iv per seal', async () => {
    const a = await crypto.seal({ plaintext, password: 'pw-1', route });
    const b = await crypto.seal({ plaintext, password: 'pw-1', route });
    expect(a.header.salt).not.toEqual(b.header.salt);
    expect(a.header.iv).not.toEqual(b.header.iv);
    expect(a.ciphertext).not.toEqual(b.ciphertext);
  });

  it('defaults to a hardened iteration count', () => {
    expect(new WebCryptoService().iterations).toBeGreaterThanOrEqual(600_000);
  });
});

import { describe, it, expect } from 'vitest';
import { CopyPasteChannel } from './copyPasteChannel';
import { encodeEnvelope } from './envelopeCodec';
import { expectErr, unwrap } from '../domain/fixtures';
import type { Envelope } from '../domain/envelope';

function envelopeWithCiphertext(bytes: number): Envelope {
  return {
    header: {
      v: 1,
      workflowId: 'w-1',
      roundId: 'r-1',
      participantId: 'p-1',
      salt: new Uint8Array(16),
      iv: new Uint8Array(12),
    },
    ciphertext: new Uint8Array(bytes).fill(7),
  };
}

describe('CopyPasteChannel', () => {
  const baseUrl = 'https://synergon.local/app';

  it('publishes a small envelope as a URL-fragment handle', async () => {
    const channel = new CopyPasteChannel(baseUrl);
    const handle = await channel.publish(envelopeWithCiphertext(64));
    expect(handle.kind).toBe('url');
    if (handle.kind === 'url') {
      expect(handle.url.startsWith(`${baseUrl}#`)).toBe(true);
    }
  });

  it('falls back to a .synergon file handle when the URL would be too long', async () => {
    const channel = new CopyPasteChannel(baseUrl);
    const handle = await channel.publish(envelopeWithCiphertext(4096));
    expect(handle.kind).toBe('file');
    if (handle.kind === 'file') {
      expect(handle.fileName).toMatch(/\.synergon$/);
      expect(handle.fileName).toMatch(/r-1/);
    }
  });

  it('accepts a pasted URL, raw encoding, or file contents identically', () => {
    const channel = new CopyPasteChannel(baseUrl);
    const envelope = envelopeWithCiphertext(8);
    const encoded = encodeEnvelope(envelope);
    expect(unwrap(channel.accept(`${baseUrl}#${encoded}`))).toEqual(envelope);
    expect(unwrap(channel.accept(encoded))).toEqual(envelope);
    expect(unwrap(channel.accept(`  ${encoded}\n`))).toEqual(envelope);
  });

  it('collect drains everything accepted so far', async () => {
    const channel = new CopyPasteChannel(baseUrl);
    const a = envelopeWithCiphertext(1);
    const b = envelopeWithCiphertext(2);
    channel.accept(encodeEnvelope(a));
    channel.accept(encodeEnvelope(b));
    expect(await channel.collect()).toEqual([a, b]);
    expect(await channel.collect()).toEqual([]);
  });

  it('rejects garbage and does not enqueue it', async () => {
    const channel = new CopyPasteChannel(baseUrl);
    expect(expectErr(channel.accept('not an envelope'))).toMatch(/envelope/i);
    expect(await channel.collect()).toEqual([]);
  });
});

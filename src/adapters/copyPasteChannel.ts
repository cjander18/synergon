import type { Envelope } from '../domain/envelope';
import type { EnvelopeChannel, EnvelopeHandle } from '../ports/envelopeChannel';
import type { Result } from '../domain/result';
import { err, ok } from '../domain/result';
import { decodeEnvelope, encodeEnvelope } from './envelopeCodec';

// Practical cross-browser/mail-client ceiling for hand-distributed links.
const MAX_URL_LENGTH = 2_000;

// Transport A (ADR-0002): the coordinator hand-distributes handles and pastes
// returned envelopes back in. QR is a UI rendering of the same encoded string
// and arrives with the M4 views.
export class CopyPasteChannel implements EnvelopeChannel {
  private inbox: Envelope[] = [];

  constructor(private readonly baseUrl: string) {}

  publish(envelope: Envelope): Promise<EnvelopeHandle> {
    const encoded = encodeEnvelope(envelope);
    const url = `${this.baseUrl}#${encoded}`;
    if (url.length <= MAX_URL_LENGTH) {
      return Promise.resolve({ kind: 'url', url });
    }
    return Promise.resolve({
      kind: 'file',
      fileName: fileNameFor(envelope),
      contents: encoded,
    });
  }

  // Pasted text may be a full link, a bare encoded string, or file contents —
  // all the same encoding.
  accept(text: string): Result<Envelope> {
    const hash = text.lastIndexOf('#');
    const candidate = (hash >= 0 ? text.slice(hash + 1) : text).trim();
    const decoded = decodeEnvelope(candidate);
    if (!decoded.ok) return err(decoded.error);
    this.inbox.push(decoded.value);
    return ok(decoded.value);
  }

  collect(): Promise<readonly Envelope[]> {
    const drained = this.inbox;
    this.inbox = [];
    return Promise.resolve(drained);
  }
}

function fileNameFor(envelope: Envelope): string {
  const safe = (part: string) => part.replace(/[^A-Za-z0-9_-]/g, '-');
  const { roundId, participantId } = envelope.header;
  return `synergon-${safe(roundId)}-${safe(participantId)}.synergon`;
}

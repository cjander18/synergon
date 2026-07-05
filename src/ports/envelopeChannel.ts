import type { Envelope } from '../domain/envelope';

// The Channel half of the Envelope/Channel split (ADR-0002): how encrypted
// blobs physically move. Swapping transports means swapping this adapter only.
export type EnvelopeHandle =
  | { readonly kind: 'url'; readonly url: string }
  | { readonly kind: 'file'; readonly fileName: string; readonly contents: string };

export interface EnvelopeChannel {
  publish(envelope: Envelope): Promise<EnvelopeHandle>;
  collect(): Promise<readonly Envelope[]>;
}

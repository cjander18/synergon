import type { Envelope } from './envelope';
import type { Id } from './ids';

export type ValidResponse =
  | { readonly kind: 'ItemList'; readonly items: readonly string[] }
  | { readonly kind: 'Score'; readonly scores: Readonly<Record<string, number>> }
  | { readonly kind: 'Rank'; readonly ranking: readonly string[] };

// As stored on a round: the full encrypted envelope (salt/iv/header are needed
// to decrypt at consolidation time) plus routing. Never plaintext.
export interface StoredResponse {
  readonly roundId: Id;
  readonly participantId: Id;
  readonly envelope: Envelope;
}

// As handed to an AggregationStrategy: decrypted and structurally incapable of
// carrying identity (docs/architecture/adr/0003-anonymity-scope.md).
export interface DeidentifiedResponse {
  readonly value: ValidResponse;
}

// Strips identity and orders the pool canonically by content, so the pool's
// order cannot leak who responded first.
export function deidentify(
  entries: readonly { readonly participantId: Id; readonly value: ValidResponse }[],
): DeidentifiedResponse[] {
  return entries
    .map((entry) => ({ value: entry.value }))
    .sort((a, b) => {
      const left = JSON.stringify(a.value);
      const right = JSON.stringify(b.value);
      return left < right ? -1 : left > right ? 1 : 0;
    });
}

import type { Id } from './ids';

export type ValidResponse = { readonly kind: 'ItemList'; readonly items: readonly string[] };

// As stored on a round: ciphertext plus routing only. Never plaintext.
export interface StoredResponse {
  readonly roundId: Id;
  readonly participantId: Id;
  readonly ciphertext: Uint8Array;
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

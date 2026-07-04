# Domain Model

The concrete entities of the domain core. These are **pure TypeScript** — no
framework, storage, or crypto types leak in. Shapes below are illustrative of intent,
not a frozen API; they will be driven out by tests.

## Entities

```ts
type Id = string; // opaque; produced by the IdGen port

interface Workflow {
  id: Id;
  title: string;
  participants: Participant[];
  rounds: Round[];
  status: 'Active' | 'Closed';
}

interface Participant {
  id: Id;              // stable within a workflow; the Coordinator's handle for them
  label: string;       // Coordinator-facing display name (never shown to peers)
  // NOTE: no password or key material lives here — see security-model.md
}

interface Round {
  id: Id;
  index: number;                 // position within the workflow
  audience: Audience;
  elicitation: ElicitationSpec;
  aggregation: AggregationSpec;
  status: RoundStatus;
  invitations: Invitation[];     // one per targeted participant, once Issued
  responses: StoredResponse[];   // encrypted at rest; decrypted into the pool on demand
  output?: AggregationOutput;    // set when Consolidating → Closed
}

type RoundStatus =
  | 'Draft' | 'Issued' | 'Collecting' | 'Consolidating' | 'Closed';

type Audience =
  | { kind: 'All' }
  | { kind: 'Subset'; participantIds: Id[] };
```

## Elicitation & aggregation specs

These are **data**, not behaviour. The matching behaviour lives in the
`ElicitationStrategy` / `AggregationStrategy` implementations
(see [generic-workflow.md](generic-workflow.md)), resolved from the spec's `kind`.

```ts
type ElicitationSpec =
  | { kind: 'FreeText'; prompt: string }
  | { kind: 'ItemList'; prompt: string; maxItems?: number }
  | { kind: 'Score'; prompt: string; scale: { min: number; max: number } }
  | { kind: 'Rank'; prompt: string; items: RankableItem[] }
  | { kind: 'Clarify'; items: ClarifiableItem[] };

type AggregationSpec =
  | { kind: 'Identity' }
  | { kind: 'Deduplicate' }
  | { kind: 'Cluster' }
  | { kind: 'Consolidate' }
  | { kind: 'Aggregate'; stat: 'mean' | 'median' | 'rankSum' }
  | { kind: 'Threshold'; min: number };
```

## Responses & de-identification

Two representations, kept distinct by the type system to enforce the anonymity
invariant:

```ts
// As stored: ciphertext plus the routing header needed to place it. Never contains
// plaintext. See security-model.md for how the header is authenticated.
interface StoredResponse {
  roundId: Id;
  participantId: Id;   // routing only; used to know who has/hasn't responded
  ciphertext: Uint8Array;
}

// As handed to an AggregationStrategy: decrypted, and STRIPPED of participantId.
interface DeidentifiedResponse {
  value: ValidResponse;   // FreeText | items | score | ranking
  // no participantId, no label — the type has no field to leak identity
}
```

The Coordinator can see **who has responded** (from `StoredResponse.participantId`, a
progress affordance) but the **content pool used for consolidation is
`DeidentifiedResponse[]`**, which structurally cannot carry identity. This is the
type-level expression of the "attribution stripped before aggregation" invariant.

## Invitations

```ts
interface Invitation {
  roundId: Id;
  participantId: Id;
  envelope: Envelope;   // encrypted prompt; see security-model.md
  // The password is NOT stored here or anywhere persistent — it is shown once at
  // generation time for the Coordinator to distribute out-of-band.
}
```

## State transitions (pure reducer)

The workflow/round lifecycle is a **pure reducer**: `(state, command) → state`,
with no side effects. Side-effecting work (encrypting, persisting, emitting
envelopes) is performed by use-cases *around* the reducer, using the ports.

```
Commands: CreateWorkflow · AddParticipants · DraftRound · IssueRound ·
          ImportResponse · CloseIntake · RunAggregation · AdvanceWorkflow · CloseWorkflow
```

Guards enforced by the reducer (examples):

- `IssueRound` is only valid from `Draft`.
- `ImportResponse` is only valid in `Issued`/`Collecting` and for a `participantId`
  in the round's audience.
- `RunAggregation` is only valid in `Consolidating`.

Because the reducer is pure and deterministic (ids and time come from ports), the
entire lifecycle is unit-testable without a browser, crypto, or storage.

## What is intentionally absent

- **No key material or passwords** in any persistent entity (see
  [security-model.md](security-model.md)).
- **No network, sync, or device concepts** — single-Coordinator, single-device MVP
  (YAGNI; [ADR-0001](adr/0001-local-first-no-backend.md)).

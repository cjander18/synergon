# Roadmap

Sequencing for the MVP. TDD throughout: a failing test specifies each behaviour
before the code that satisfies it. Milestones are ordered inside-out — pure domain
first, UI last — so the hardest-to-change core is the best-tested.

## Milestones

### M0 — Docs & scaffolding
- The documentation set under `docs/` (this milestone's non-code deliverable) —
  **complete and under review**.
- Vite + React + TypeScript (strict) + Vitest project scaffold.
- One deliberately failing test to prove the harness runs red→green.
- **Exit:** `npm test` runs; CI-less local test loop is fast.

### M1 — Domain core (pure, no adapters)
- `Workflow` / `Round` / `Participant` entities.
- The workflow/round lifecycle as a **pure reducer** with guards
  (see [architecture/domain-model.md](architecture/domain-model.md)).
- First `ElicitationStrategy` (`ItemList`) and `AggregationStrategy`
  (`Deduplicate`, then `Consolidate`).
- In-memory `Repository` for tests.
- **Exit:** the canonical loop (elicit → deduplicate → consolidate) runs green in
  unit tests with zero browser/crypto/storage involvement.

### M2 — Crypto envelopes
- `CryptoService` port + `WebCryptoService` adapter (PBKDF2 + AES-GCM, header as AAD).
- `Envelope` encode/decode with round-trip and tamper-detection tests
  (see [architecture/security-model.md](architecture/security-model.md)).
- `EnvelopeChannel` port + `CopyPasteChannel` adapter (URL fragment · file · QR).
- **Exit:** a prompt encrypts to an envelope and decrypts back only with the correct
  password; a tampered header fails; a returned response self-routes by its header.

### M3 — Use-cases wired to real persistence
- `CreateWorkflow`, `IssueRound`, `ImportResponse`, `RunConsolidation`,
  `AdvanceRound`.
- `IndexedDbRepository` adapter with **contract tests** shared with the in-memory
  implementation.
- **Exit:** a full round can be created, issued, imported, and consolidated, and the
  state survives a reload.

### M4 — UI
- Coordinator console: create workflow, add participants, compose a round, generate
  invitations, import responses, run consolidation, advance.
- Contributor view: open link → enter password → decrypt prompt → answer → emit
  response envelope.
- Plain-language anonymity statement in the Contributor view
  ([ADR-0003](architecture/adr/0003-anonymity-scope.md)).
- **Exit:** the canonical loop is runnable end-to-end by a human, two browser
  profiles standing in for Dana and Sam.

### M5 — Evaluation rounds
- `Score` and `Rank` elicitation strategies.
- `Aggregate(mean | median | rankSum)` and `Threshold` aggregation strategies.
- **Exit:** a workflow can end in a ranked/scored, de-identified outcome.

## Definition of done (MVP)

The canonical workflow from [vision.md](vision.md) runs end-to-end, locally, with no
backend: pose a prompt → collect anonymously → deduplicate/cluster/consolidate →
redistribute to all or a subset → clarify → re-consolidate → rank → aggregate.

## YAGNI boundaries (not in the MVP)

Each is isolated behind an existing port so it is additive, not a rewrite:

- **Multi-device / multi-Coordinator sync** and CRDTs — new `Repository`/sync adapter.
- **Relay server / shared-folder transport** (Transport B/C) — new `EnvelopeChannel`
  adapter ([ADR-0002](architecture/adr/0002-crypto-envelope-transport.md)).
- **Coordinator-blind anonymity** — new crypto behind `CryptoService`
  ([ADR-0003](architecture/adr/0003-anonymity-scope.md)).
- **Argon2id KDF**, envelope expiry / one-time-use — `CryptoService` hardening.
- **Accounts, auth, hosting, real-time presence** — out of scope entirely.

## Testing strategy

- **Domain & strategies:** pure unit tests; deterministic via injected `Clock`/`IdGen`.
- **Adapters:** contract tests run against both real and in-memory implementations so
  they are provably interchangeable.
- **Crypto:** round-trip, wrong-password, and tamper-detection tests.
- **UI:** thin; component tests over the use-case boundary, minimal end-to-end smoke.

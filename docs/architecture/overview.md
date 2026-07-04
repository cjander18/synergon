# Architecture Overview

## Goals this architecture serves

- **Local-first, serverless MVP** — a static bundle that runs from `file://` or any
  static host, with no backend (see [ADR-0001](adr/0001-local-first-no-backend.md)).
- **TDD-friendly** — a pure domain core with no framework, storage, or crypto
  coupling, so behaviour is driven out by fast unit tests.
- **Swappable infrastructure** — crypto, storage, and transport sit behind
  interfaces so today's choices (Web Crypto, IndexedDB, copy/paste envelopes) can be
  replaced without touching domain logic.

## Layering (Clean / Hexagonal)

Dependencies point **inward only**. The domain knows nothing about React, IndexedDB,
or the Web Crypto API — it depends on interfaces (ports) that outer layers implement.

```
┌─────────────────────────────────────────────────────────────┐
│ UI (React + TypeScript)                                      │
│   thin components; call use-cases; render state              │
├─────────────────────────────────────────────────────────────┤
│ Application / use-cases                                      │
│   CreateWorkflow, IssueRound, ImportResponse,                │
│   RunConsolidation, AdvanceRound                             │
├─────────────────────────────────────────────────────────────┤
│ Domain core (pure TypeScript)                                │
│   entities · workflow/round state machine ·                  │
│   elicitation & aggregation strategies                       │
│   NO React · NO crypto lib · NO storage                      │
├─────────────────────────────────────────────────────────────┤
│ Ports (interfaces)                                           │
│   CryptoService · Repository · EnvelopeChannel · IdGen · Clock│
└─────────────────────────────────────────────────────────────┘
        ▲ implemented by ▲
┌─────────────────────────────────────────────────────────────┐
│ Adapters                                                     │
│   WebCryptoService · IndexedDbRepository ·                   │
│   CopyPasteChannel · InMemory* (tests)                       │
└─────────────────────────────────────────────────────────────┘
```

### Domain core

Pure, deterministic TypeScript. Holds the entities and the workflow/round state
machine (see [domain-model.md](domain-model.md)) and the two extension points —
elicitation and aggregation strategies (see
[generic-workflow.md](generic-workflow.md)). No `Date.now()`, no `crypto`, no `fetch`,
no `window`; time and identity come from injected ports so tests are deterministic.

### Application / use-cases

Orchestrates the domain with the ports. Each use-case is a single intention:
`CreateWorkflow`, `IssueRound`, `ImportResponse`, `RunConsolidation`, `AdvanceRound`.
Use-cases are tested against **in-memory adapters** — no browser required.

### Ports

| Port | Responsibility | MVP adapter |
|---|---|---|
| `CryptoService` | Derive keys from passwords; encrypt/decrypt envelopes | `WebCryptoService` (Web Crypto API) |
| `Repository` | Persist and load workflows | `IndexedDbRepository` |
| `EnvelopeChannel` | Publish an envelope (link/file/QR) and collect returned ones | `CopyPasteChannel` |
| `IdGen` | Generate ids | `CryptoRandomIdGen` |
| `Clock` | Supply timestamps | `SystemClock` |

The **Envelope vs Channel split** is deliberate: encrypting/serializing an envelope
is transport-agnostic and shared by every future transport; only the *channel*
(how bytes move) differs. This is what makes Transport A → B/C a one-adapter change
(see [ADR-0002](adr/0002-crypto-envelope-transport.md)).

### Adapters

Concrete implementations of the ports. Each adapter has its own **contract tests**
run against both the real and in-memory implementations to guarantee they behave
identically. The UI layer is thin and comes last.

## Technology choices (MVP)

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript (strict) | Type safety across domain and adapters |
| UI | React | Team familiarity; component model fits Coordinator/Contributor views |
| Build/dev | Vite | Fast, static-bundle output; no server needed |
| Test | Vitest | Fast, ESM-native, first-class TS |
| Crypto | Web Crypto API (AES-GCM, PBKDF2) | Native, auditable, no dependency |
| Storage | IndexedDB | Durable local persistence in the browser |
| Transport | Copy/paste · file · QR envelopes | Serverless; preserves local-first premise |

## Deliberately deferred (YAGNI)

- Multi-device / multi-Coordinator **sync** (and therefore CRDTs).
- A **relay server** or hosted service (Transport C).
- **Coordinator-blind** anonymity.
- Accounts, auth, and any network I/O.

Each is isolated behind a port so it can be added later without a domain rewrite.
See the [roadmap](../roadmap.md) for sequencing.

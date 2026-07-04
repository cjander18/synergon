# ADR-0002 — Serverless crypto-envelope transport (Transport A)

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Project owner, architecture

## Context

Given the no-backend decision ([ADR-0001](0001-local-first-no-backend.md)), prompts
and responses must move between the Coordinator and Contributors without any server
to store or relay them. We evaluated three transports:

- **A — Serverless envelopes:** ciphertext carried in the artifact itself
  (URL fragment / QR / file), hand-distributed and hand-collected.
- **B — Shared folder:** envelopes read/written to a synced or shared directory.
- **C — Relay server:** a backend stores envelopes by token; links resolve to it.

## Decision

Adopt **Transport A** for the MVP, structured behind an `EnvelopeChannel` port. Split
transport into two responsibilities:

- **Envelope** — encrypt/serialize a prompt or response into a portable blob. This is
  transport-agnostic and shared by every present and future transport.
- **Channel** — how the blob physically moves. Only this differs between A/B/C.

Emit each envelope as whichever carrier fits the payload — **URL fragment** and **QR**
for small prompts, **file** as the unlimited-size fallback for large responses. These
are encodings of the same bytes, not separate formats.

## Rationale

- **A is the only option that preserves the local-first premise** — a static bundle
  runnable from `file://`, with no infrastructure.
- **A is the most TDD-friendly** — envelope encode/decode is synchronous pure
  functions; the round-trip test needs no mocks.
- **B does not pay for itself** — cross-browser support forces a Chromium-only API or
  a desktop-shell scope jump, and it still leans on a third-party sync tool to move
  bytes.
- **C is a genuine architecture change**, not an adapter swap — two deployables,
  availability concerns, and custody of a ciphertext inbox. It ends "local-first."

## Consequences

**Positive**

- No infrastructure; strongest privacy and adoption story.
- Domain and crypto layers are identical regardless of transport; A→B/C later is a
  **single new adapter**, zero domain change.

**Negative / accepted**

- **Manual distribution and collection** by the Coordinator — the primary UX cost.
- **Payload limits** on URL/QR carriers, mitigated by the file fallback.
- **No delivery confirmation** beyond tracking which participants have responded.

## Invariants established here

- The **password travels out-of-band**, never in the same artifact as the ciphertext
  (see [security-model.md](../security-model.md)).
- The **routing header** (`workflowId/roundId/participantId/salt/iv`) is authenticated
  (AES-GCM AAD) so returned envelopes self-route and cannot be silently misrouted.

## Revisit when

Manual friction blocks real use. Because of the Envelope/Channel split, adopting the
shared-folder (B) or relay (C) channel is additive.

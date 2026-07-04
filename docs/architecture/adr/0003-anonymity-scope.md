# ADR-0003 — Anonymity is between peers, not from the Coordinator

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Project owner, architecture

## Context

Synergon's core value is de-biasing group deliberation, which depends on
contributions being anonymous. There are two possible strengths of that guarantee:

- **Peer-anonymous** — no Contributor can learn what another said.
- **Coordinator-blind** — even the Coordinator cannot map a response to a person.

Coordinator-blind anonymity is what most bias-reduction actually requires (the biases
in [concepts.md](../concepts.md) — HiPPO, anchoring, evaluation apprehension — operate
*between peers*), but achieving true coordinator-blindness without a server implies
blind signatures, a mixnet, or a trusted third party.

## Decision

The MVP guarantees **peer-anonymity only**. The Coordinator knows the recipient list
and which envelope went to whom, and can therefore in principle map a decrypted
response to a person. Anonymity is **between Contributors**.

## Rationale

- **It captures the value.** The bias-reduction the product exists for is a
  peer-to-peer phenomenon; peer-anonymity delivers it.
- **It fits local-first.** Coordinator-blindness without a server (blind signatures /
  mixnet) is disproportionate complexity for an MVP — a clear YAGNI.
- **It is honest.** Over-claiming anonymity we cannot enforce would be worse than a
  clearly-stated, correct boundary.

## Consequences

**Positive**

- Simple, implementable, and truthful. Enforced both cryptographically (per-envelope
  encryption) and structurally (consolidation runs on `DeidentifiedResponse[]`, a type
  with no identity field — see [domain-model.md](../domain-model.md)).

**Negative / accepted**

- Contributors must trust the Coordinator not to de-anonymize them. This must be
  **stated plainly in the Contributor UI**, not glossed. See
  [personas/contributor.md](../../personas/contributor.md).

## Enforcement

- The pool handed to any `AggregationStrategy` is typed `DeidentifiedResponse[]` and
  structurally cannot carry `participantId` or `label`.
- `participantId` is retained only on `StoredResponse` for routing and
  "who-has-responded" progress — never surfaced in consolidated output.

## Revisit when

A concrete need for coordinator-blind anonymity arises. That would likely require a
transport with a server or relay (reopening [ADR-0002](0002-crypto-envelope-transport.md))
and additional cryptography, isolated behind the `CryptoService` and `EnvelopeChannel`
ports.

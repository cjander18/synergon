# Vision

## The problem

Groups routinely make worse decisions than their best members could make alone.
The cause is rarely a lack of intelligence or information in the room — it is the
**social dynamics of how groups talk**:

- **HiPPO effect** — the Highest Paid Person's Opinion wins regardless of merit.
- **Charisma and confidence** get mistaken for correctness.
- **Anchoring** — whoever speaks first sets the frame everyone else adjusts from.
- **Evaluation apprehension** — people self-censor to avoid looking foolish.
- **Production blocking** — only one person can talk at a time, so ideas are lost
  while waiting for a turn.
- **Information cascades and bandwagons** — people converge on the visible majority
  rather than reasoning independently.
- **Groupthink** — the desire for harmony suppresses dissent.

The net effect is that a group's diversity — its greatest asset — is wasted, and
outcomes track seniority and volume rather than insight.

## The insight

There is a mature, evidence-backed body of facilitation practice built precisely to
counteract this (see [concepts.md](concepts.md)). Its common thread is simple:

> **Separate elicitation from evaluation, keep contributions anonymous to peers, and
> let a neutral facilitator consolidate between rounds.**

When people generate ideas independently and anonymously, then evaluate them
independently, the group's collective judgement consistently beats both the loudest
individual and the unstructured discussion.

## What Synergon is

Synergon is a tool that operationalizes that loop:

1. A **Coordinator** poses a prompt to a group.
2. Each **Contributor** responds independently and **anonymously to peers**.
3. The Coordinator **consolidates** the pool — deduplicate, cluster, merge.
4. The Coordinator sends the consolidated result back to **everyone or a subset**.
5. Contributors **clarify, expand, score, or rank**.
6. The Coordinator **aggregates** and runs the next round.
7. Repeat until the group **converges**.

This is a *generic workflow*: "collect anonymously → consolidate → redistribute →
refine" is the primitive. Ranking, clarifying, and scoring are just configured
rounds, not special cases (see
[architecture/generic-workflow.md](architecture/generic-workflow.md)).

## Business case

- **Better decisions, cheaper** — prioritization, estimation, risk assessment, and
  strategy calls that would take multiple meetings converge asynchronously, without
  the meeting tax.
- **De-biased by construction** — outcomes reflect the group's actual judgement, not
  its hierarchy. This is the differentiator against a shared doc or a group chat.
- **Diversity pays off** — quieter, junior, or remote voices contribute on equal
  footing, so the group captures the creative upside of its range instead of
  regressing to the most senior opinion.
- **Trust through locality** — the MVP runs entirely on the Coordinator's machine
  with no server holding anyone's data (see [ADR-0001](architecture/adr/0001-local-first-no-backend.md)),
  which lowers the adoption barrier for sensitive internal discussions.

## Guiding principles

- **Local-first** — a static, serverless bundle for the MVP. No account, no cloud.
- **TDD** — behaviour is specified by tests first; the domain core is driven out
  before any UI or infrastructure exists.
- **YAGNI** — we build the canonical loop and nothing speculative. Multi-device
  sync, coordinator-blind anonymity, and a relay server are explicitly deferred.
- **KISS** — the simplest mechanism that preserves the guarantees. Transport for the
  MVP is copy/paste/file crypto-envelopes, not infrastructure.
- **SOLID** — a pure domain core depends only on interfaces; crypto, storage, and
  transport are swappable adapters.

## Non-goals (MVP)

- Real-time collaboration or presence.
- Multi-device or multi-Coordinator sync.
- Coordinator-blind anonymity (the Coordinator can map a response to whom they sent
  it to; anonymity is *between peers* — see
  [ADR-0003](architecture/adr/0003-anonymity-scope.md)).
- A hosted service, accounts, or a backend of any kind.

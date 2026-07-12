# Synergon

**Structured group deliberation, anonymous to peers — local-first, no backend.**

Synergon turns a group into a better decision-maker than any of its members by
separating *elicitation* from *evaluation* and keeping contributions anonymous to
peers. It is a modern digital implementation of well-established facilitation
practices (Delphi method, Nominal Group Technique) designed to strip out the
social biases that normally degrade group decisions — seniority, charisma,
anchoring, and groupthink.

A **Coordinator** poses a prompt to a group. Each **Contributor** answers
independently, anonymous to their peers. The Coordinator consolidates the pool (deduplicate,
cluster, merge), sends it back out to everyone or a chosen subset, and runs another
round — clarify, expand, score, rank — repeating until the group converges.

## Status

Pre-code. This repository currently holds the architecture and product
documentation under [`docs/`](docs/). Implementation follows TDD once the docs are
approved. See the [roadmap](docs/roadmap.md).

## Principles

- **Local-first** — the MVP is a static bundle with no backend. It can run from
  `file://`. See [ADR-0001](docs/architecture/adr/0001-local-first-no-backend.md).
- **TDD, YAGNI, KISS, SOLID** — the domain core is pure TypeScript, framework- and
  infrastructure-free, and driven out by tests first.
- **Anonymous to peers** — the bias-reduction guarantee the MVP makes. See
  [ADR-0003](docs/architecture/adr/0003-anonymity-scope.md).

## Feedback

We read everything. Email **synergonlabs@gmail.com**, or open a
[bug report or idea](https://github.com/cjander18/synergon/issues/new/choose).
Feedback is always an explicit action on your part — the app itself never
sends anything anywhere (see the
[security model](docs/architecture/security-model.md)).

## Documentation map

| Doc | What it covers |
|---|---|
| [vision.md](docs/vision.md) | The problem, the business case, guiding principles |
| [concepts.md](docs/concepts.md) | Deliberation methods and the bias glossary |
| [personas/coordinator.md](docs/personas/coordinator.md) | Dana, the facilitator/admin |
| [personas/contributor.md](docs/personas/contributor.md) | Sam, the peer-anonymous participant |
| [architecture/overview.md](docs/architecture/overview.md) | Layers, local-first, tech choices |
| [architecture/generic-workflow.md](docs/architecture/generic-workflow.md) | The Round/operation abstraction |
| [architecture/domain-model.md](docs/architecture/domain-model.md) | Entities and the state machine |
| [architecture/security-model.md](docs/architecture/security-model.md) | Crypto, links, passwords, threat model |
| [architecture/adr/](docs/architecture/adr/) | Architecture Decision Records |
| [roadmap.md](docs/roadmap.md) | Milestones, TDD plan, YAGNI boundaries |
| [gtm/strategy.md](docs/gtm/strategy.md) | Go-to-market: model validation, positioning, pricing ladder |
| [gtm/personas.md](docs/gtm/personas.md) | GTM personas: the beachhead, the multiplier, the future buyer |
| [gtm/launch-plan.md](docs/gtm/launch-plan.md) | Launch blockers, phases, channels, metrics, open decisions |
| [gtm/design-partner-kit.md](docs/gtm/design-partner-kit.md) | Outreach, onboarding, and debrief script for design partners |
| [gtm/launch-contingencies.md](docs/gtm/launch-contingencies.md) | Best/worst-case launch runbook with exact commands |
| [gtm/paid-tier-plan.md](docs/gtm/paid-tier-plan.md) | The hosted-relay tier: features, pricing, payment infra, gates |
| [gtm/launch-essay.md](docs/gtm/launch-essay.md) | The founder thesis — one text, four uses (HN, newsletter, long-form, canonical proof) |

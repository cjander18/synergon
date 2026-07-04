# The Generic Workflow

This is the heart of Synergon. The canonical deliberation loop — collect
anonymously → consolidate → redistribute → refine → aggregate — is implemented
**once** as a generic engine. Ranking, clarifying, and scoring are not special
features; they are configured rounds.

## The abstraction

A **Workflow** is an ordered list of **Rounds**, driven by a state machine. A Round
has three configurable parts:

```
Workflow = { id, title, participants[], rounds[], status }

Round    = { id, audience, elicitation, aggregation, status }

audience     : ALL | Subset(participantIds[])
elicitation  : FreeText | ItemList | Score(scale) | Rank(items) | Clarify(items)
aggregation  : Identity | Deduplicate | Cluster | Consolidate | Aggregate(stat) | Threshold
```

- **`elicitation`** — what a Contributor is asked to produce this round.
- **`aggregation`** — the operation the Coordinator applies to the collected pool
  before the next round.
- **`audience`** — everyone, or a targeted subset (used for clarifying rounds aimed
  at specific contributors).

`elicitation` and `aggregation` are the **two extension points** (Open/Closed): a new
deliberation technique is a new variant of one of these, not a change to the engine.

## Two strategy interfaces

Both extension points are strategies the engine calls through an interface, so the
engine never grows a `switch` over round types.

```ts
interface ElicitationStrategy {
  // Describes what to ask and validates a submitted response's shape.
  describe(round: Round): PromptSpec;
  validate(response: RawResponse): Result<ValidResponse>;
}

interface AggregationStrategy {
  // Transforms the de-identified pool into the material for the next round.
  aggregate(pool: DeidentifiedResponse[]): AggregationOutput;
}
```

Adding "pairwise comparison" or "budget allocation" later means writing one strategy
and registering it — the state machine, persistence, and transport are untouched.

## The round lifecycle

Each Round moves through a small state machine. The engine owns these transitions;
the Coordinator triggers them via use-cases.

```
Draft ──issue──▶ Issued ──firstResponse──▶ Collecting ──close──▶ Consolidating ──finish──▶ Closed
  │                                                                   │
  └── (edit while Draft) ──┘                          (Coordinator runs AggregationStrategy)
```

- **Draft** — Coordinator is composing the prompt and choosing audience/elicitation.
- **Issued** — invitations generated; awaiting responses.
- **Collecting** — at least one response imported; more may arrive.
- **Consolidating** — Coordinator has closed intake and runs the aggregation.
- **Closed** — the round's output is fixed and can seed the next round.

A Workflow advances by appending a new Round whose Draft is seeded from the previous
round's aggregation output.

## Worked example — the canonical loop

| Round | audience | elicitation | aggregation | Coordinator sees |
|---|---|---|---|---|
| 1 | ALL | `ItemList` ("List risks") | `Deduplicate` + `Cluster` | de-duplicated, clustered risks |
| 2 | Subset (authors of unclear items) | `Clarify(items)` | `Consolidate` | merged, clarified list |
| 3 | ALL | `Rank(items)` | `Aggregate(rank-sum)` | ranked outcome |

Each row is the same primitive with different configuration. The engine runs all
three identically; only the injected strategies differ.

## Invariants the engine enforces

Derived from the deliberation research (see [../concepts.md](../concepts.md)):

1. **Attribution is stripped before aggregation.** The pool an `AggregationStrategy`
   receives is `DeidentifiedResponse[]` — the type system prevents the Coordinator's
   consolidation step from seeing peer identities.
2. **Elicitation precedes exposure.** A Contributor's view for a round never contains
   peers' current-round responses.
3. **Evaluation is private and aggregated.** `Score`/`Rank` results are only ever
   surfaced through an `Aggregate` output, never per-respondent.

## Why this is the right seam

- **KISS** — one engine, one lifecycle, two strategy interfaces.
- **Open/Closed** — new methods extend via strategies; the core is stable.
- **Testable** — strategies are pure functions over pools; the state machine is a
  pure reducer. Both are unit-tested without any adapter.

See [domain-model.md](domain-model.md) for the concrete entity definitions.

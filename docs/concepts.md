# Concepts & Best Practices

Synergon is grounded in established facilitation research. This document records the
methods it draws from and the biases it is designed to defeat, so that design
decisions can be traced back to a purpose rather than to taste.

## The methods

### Delphi method

An anonymous, iterative forecasting/decision technique. A panel answers a prompt;
a facilitator collects and summarizes the responses with controlled feedback and
sends the summary back; the panel revises in light of it. Repeated over rounds,
responses tend to converge. Key properties Synergon adopts:

- **Anonymity** of contributions removes authority and bandwagon pressure.
- **Iteration with controlled feedback** lets people update on *content*, not on
  who said it.
- **Statistical/synthesized aggregation** rather than live debate.

### Nominal Group Technique (NGT)

A structured meeting method:

1. **Silent independent idea generation** — everyone writes before anyone speaks.
2. **De-identified sharing** — ideas are pooled without attribution.
3. **Clarification** — the group discusses meaning, not merit.
4. **Independent ranking/voting** — each person evaluates privately; results are
   aggregated.

NGT directly attacks production blocking and dominance by the first/loudest voice.

### Estimate–Talk–Estimate (Wideband Delphi)

Participants estimate independently, discuss divergences, then **re-estimate
independently**. The re-estimation step is what captures the value of discussion
without letting discussion produce conformity.

## The Synergon primitive

All three methods share one loop, which Synergon generalizes:

> **elicit independently & anonymously → consolidate → redistribute → refine →
> aggregate → repeat until convergence**

- *Delphi* ≈ elicit → consolidate → redistribute → re-elicit.
- *NGT* ≈ elicit (ideas) → consolidate (dedupe/cluster) → clarify → rank → aggregate.
- *Estimate–Talk–Estimate* ≈ elicit (estimate) → redistribute (divergences) →
  re-elicit (estimate) → aggregate.

Because they are the same primitive with different round configurations, Synergon
implements the primitive once and treats each method as configuration. See
[architecture/generic-workflow.md](architecture/generic-workflow.md).

## Bias glossary — what we are defeating

| Bias / failure | What happens | Synergon countermeasure |
|---|---|---|
| **HiPPO effect** | Senior opinion wins by rank | Peer-anonymous contributions; no attribution in consolidation |
| **Charisma/confidence bias** | Confident delivery beats correct content | Text-only, de-identified pooling |
| **Anchoring** | First voice frames the rest | Independent elicitation before anyone sees others' input |
| **Evaluation apprehension** | People self-censor | Anonymity to peers |
| **Production blocking** | Ideas lost while waiting to speak | Parallel asynchronous elicitation |
| **Information cascade / bandwagon** | Convergence on the visible majority | Independent rounds; controlled feedback |
| **Groupthink** | Harmony suppresses dissent | Private evaluation; dissent surfaces in aggregate |
| **Halo effect** | One trait colours judgement of ideas | Attribution stripped before evaluation |

## Design implications carried forward

- **Attribution must be removed at consolidation**, not merely hidden in the UI —
  the pool the Coordinator works from is de-identified.
- **Elicitation precedes exposure** — a Contributor answers before seeing peers'
  answers, every round.
- **Evaluation is private and aggregated** — scores/rankings are never shown live.

## Scope note

The MVP guarantees anonymity **between peers**. It does not make contributions
anonymous to the Coordinator, who necessarily knows the recipient list. That is a
deliberate, documented boundary — see
[architecture/adr/0003-anonymity-scope.md](architecture/adr/0003-anonymity-scope.md).

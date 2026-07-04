# Persona — Sam, the Contributor

> A member of the group being consulted. Responds to prompts anonymously to peers.

## Snapshot

- **Role:** Anyone on the team or in the group — junior or senior, central or
  peripheral. Synergon's premise is that Sam's seniority should not affect the
  weight of Sam's input.
- **Technical level:** Ordinary software user. Will click a link, type a password,
  and answer a question. Will not install anything or run commands.
- **Context:** Has been asked for input by Dana. May be more candid *because* the
  input is anonymous to peers — which is exactly the point.

## Goals

- Understand the question and answer it **honestly**, without worrying about how it
  looks to colleagues.
- Spend **little effort** — open, read, respond, done.
- Trust that peers **won't see who said what**.
- Participate across **multiple rounds** without friction — clarify, then score or
  rank later.

## Frustrations with the status quo

- Being asked for input in a meeting where the honest answer is socially costly.
- Feedback tools that require an account or feel like they're logging everything.
- Long, ambiguous surveys with no sense of what happens to the answer.

## What Sam does in Synergon

1. Receives a **link (or QR/file)** and, separately, a **password** from Dana.
2. Opens the link in a browser — the same static app, in a lightweight
   Contributor view. Nothing to install.
3. Enters the password; the **prompt decrypts locally**.
4. Answers — free text, a list, a score, or a ranking, depending on the round.
5. The app produces an **encrypted response envelope** (link/file/QR) that Sam sends
   back to Dana over the same channel it arrived on.
6. In later rounds, repeats with clarifications or evaluations.

## Needs from the product

- **Low friction** — no account, no install, minimal steps.
- **Credible anonymity to peers** — a clear, honest statement of who can and cannot
  see the response (peers cannot; the Coordinator's recipient list necessarily can —
  see [ADR-0003](../architecture/adr/0003-anonymity-scope.md)).
- **Clarity** — the prompt and the round's expectation (idea? score? rank?) are
  obvious.
- **Works offline** — decrypting and answering needs no connectivity; only the
  hand-off of envelopes does.

## What Sam is *not*

- Not a user who manages workflows or sees other people's raw responses.
- Not required to trust a server — there isn't one (see
  [ADR-0001](../architecture/adr/0001-local-first-no-backend.md)).

## Related

- Counterpart persona: [Dana, the Coordinator](coordinator.md).
- How the envelope Sam receives and returns works:
  [security-model.md](../architecture/security-model.md).

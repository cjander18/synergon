# Persona — Dana, the Coordinator

> The facilitator/admin who runs a deliberation. The primary user of the MVP.

## Snapshot

- **Role:** Team lead, program manager, or facilitator. Not necessarily the
  decision *owner* — often a neutral party running the process on behalf of one.
- **Technical level:** Comfortable with everyday software; not a developer. Will not
  run a server or touch a terminal.
- **Context:** Wants a group's honest, un-distorted judgement on a question —
  prioritization, estimation, risk, strategy — without the meeting theatre and
  without the answer collapsing onto the most senior voice.

## Goals

- Pose a question to a group and get **independent, unbiased** input back.
- **Consolidate** raw input into something legible — remove duplicates, cluster
  themes, merge near-identical points.
- Control **who** sees the next round (everyone, or a targeted subset).
- Drive the group toward **convergence** — a ranked or scored outcome she can act on.
- Keep the whole thing **private** — no third-party service holding the group's
  candid input.

## Frustrations with the status quo

- Meetings where the loudest or most senior person sets the answer.
- Shared docs and group chats where early comments anchor everyone else.
- Survey tools that are online-only, account-gated, and store data she'd rather keep
  off someone else's server.
- No good way to run *iterative* rounds — collect, refine, re-collect — without
  heroic manual spreadsheet work.

## What she does in Synergon

1. Creates a **Workflow** and adds a list of Contributors.
2. Composes a prompt; Synergon produces a **per-Contributor encrypted invitation**
   (a link, QR, or file) and a **password** for each.
3. Distributes links and passwords **over her own channels** (email, chat), keeping
   the password separate from the link.
4. Imports returned **response envelopes**; Synergon decrypts and pools them
   **de-identified**.
5. Runs a **consolidation** operation — deduplicate, cluster, merge.
6. Opens the **next round** to all or a subset — clarify, then score/rank.
7. Reviews the **aggregated** outcome and either closes the workflow or iterates.

## Needs from the product

- **Zero infrastructure** — it just opens and works; nothing to host or install
  beyond the app itself.
- **Confidence in anonymity** — she can promise Contributors that their peers won't
  see who said what, and mean it.
- **Legible consolidation tools** — the dedupe/cluster/merge step is where her time
  goes; it must be fast and clear.
- **Recoverable state** — closing the laptop and coming back later must not lose a
  workflow mid-flight.

## What she is *not*

- Not an anonymous participant — she knows the recipient list (see
  [ADR-0003](../architecture/adr/0003-anonymity-scope.md)).
- Not a developer or operator — no CLI, no server, no config files.

## Related

- Counterpart persona: [Sam, the Contributor](contributor.md).
- The loop she drives: [generic-workflow.md](../architecture/generic-workflow.md).

# Go-to-Market Strategy

> Companion to [vision.md](../vision.md). Product docs say what Synergon is;
> this says who it's for commercially, why they'll adopt it, and how it makes
> money later. Drafted 2026-07 against the MVP on `mvp-foundation`.

## The model under consideration — and its validation

**Proposed:** target business users; the fully local product is free; paid
addons or tiers come later.

**Verdict: sound, with two amendments.** The reasoning:

### Why the free-local-core model is unusually safe here

Freemium fails when free users cost money to serve. Synergon's free tier is a
**static bundle with no backend** — a free user costs us a few kilobytes of
static hosting bandwidth, once. We can acquire unlimited free users at
effectively zero marginal cost, forever. Very few freemium products can say
this; it removes the classic "free tier is bleeding us" failure mode entirely.

The second structural advantage: the free/paid boundary is **principled, not
crippleware**. Everything that stays free is everything that runs on the
user's device. Everything that could ever be paid is something that inherently
requires infrastructure or services we must run:

| Free forever (runs locally) | Paid later (requires infra we operate) |
|---|---|
| Unlimited workflows, rounds, participants | Hosted relay: links that "just work," no copy/paste (Transport C, already designed as a one-adapter change — ADR-0002) |
| Full crypto, full anonymity guarantees | Multi-device sync / workflow backup |
| All elicitation & aggregation strategies | Response-received notifications |
| QR / link / file transport | Team workspaces, SSO, admin controls |
| | Coordinator-blind anonymity (server-assisted crypto — ADR-0003's deferred upgrade) |
| | Facilitation template library & benchmarks |

Privacy-maximalists stay free forever and become advocates; convenience-seekers
pay. Nobody ever discovers a feature was withheld arbitrarily. This alignment
is rare and worth protecting: **never move a locally-runnable feature behind
the paywall.**

### Amendment 1 — the friction is the wolf, so it must also be the wedge

The MVP's manual transport (copy link out, paste response back) is its weakest
UX and mainstream business users will bounce off it. Two consequences:

1. **Beachhead selection must respect the friction.** Launch to segments where
   manual transport is acceptable or even familiar: facilitators who already
   run heavier manual processes (retros with sticky notes, Delphi studies in
   spreadsheets), and privacy-constrained orgs where "no server" justifies any
   friction. Do NOT launch broadly to "all business teams" on day one.
2. **The hosted relay is the first paid tier, not a nice-to-have.** The
   friction we launch with is precisely what the first paid tier removes. Free
   markets the problem; paid sells the antidote. This converts the MVP's
   biggest weakness into the monetization seam.

### Amendment 2 — lead with better decisions, not with "local-first"

Local-first is our architecture and our trust story, but nobody budgets for
"local-first." The felt pain is: *meetings where the loudest or most senior
voice decides, and everyone knows it.* Lead all messaging with the outcome
(unbiased group decisions, Delphi/NGT made effortless) and deploy
privacy/no-server as the **objection remover** — the reason IT can't say no
and candid input is safe. Exception: for the regulated-industry persona the
order flips; see [personas.md](personas.md).

### One hard messaging rule

We are **peer-anonymous, not coordinator-blind** (ADR-0003). Marketing copy
must always say "anonymous to teammates / other participants" — never bare
"anonymous." Overclaiming here would be dishonest, discovered quickly by
exactly the security-literate audience we court, and fatal to the trust story
that is our differentiation. The contributor UI already states the boundary
plainly; marketing must match it.

## Market and category

Category entry: **structured decision facilitation** — distinct from live
polling (Slido/Mentimeter), surveys (Forms/Typeform), and retro boards
(EasyRetro/FigJam), all of which do one round and leak social influence.
Synergon's job-to-be-done: *"run a Delphi/NGT-quality deliberation without a
consultant, a spreadsheet, or a server."*

| Alternative | What it does | Why we win against it |
|---|---|---|
| Slido / Mentimeter / Polly | Live polls & Q&A in meetings | One-shot, synchronous, no iteration, no consolidation; anchoring persists |
| Retro tools (EasyRetro, TeamRetro, FigJam) | Collect + vote in one pass | No multi-round refine/rank loop; hosted; identity often visible to admins *and* peers |
| Loomio, Pol.is | Async group deliberation | Hosted/server-required; Pol.is is opinion-mapping, not facilitator-driven convergence |
| Welphi, ExpertLens, Delphi SaaS | Real Delphi studies | Expensive, research-oriented, heavyweight; we are the accessible version |
| Spreadsheet + email (the real incumbent) | Manual Delphi/NGT | We automate exactly this workflow; same trust model (files + email), vastly less labor |

The honest competitive frame: **our #1 competitor is the spreadsheet**, and our
transport friction is still far below spreadsheet friction. That is the wedge.

## Positioning statement

> For team leads and facilitators who need a group's honest judgment — not its
> loudest voice — **Synergon** runs anonymous, multi-round deliberations
> (collect → consolidate → clarify → rank) that converge on decisions a team
> actually believes in. Unlike polling and retro tools, it runs the full
> Delphi-style loop; unlike everything else, it runs entirely on your machine —
> no server, no accounts, nothing to get past IT.

### Messaging pillars

1. **Hear everyone, not just the loudest.** Anonymity to peers + independent
   rounds kill HiPPO, anchoring, and groupthink. (Backed by the bias glossary
   in [concepts.md](../concepts.md) — ready-made content marketing.)
2. **A real method, not a gimmick.** Delphi and Nominal Group Technique are
   decades-proven; Synergon operationalizes them in minutes.
3. **Nothing to trust but math.** No server, no account, no data leaves the
   coordinator's machine; responses are end-to-end encrypted envelopes. IT has
   nothing to review.
4. **Free means free.** The local product is complete and free forever — paid
   tiers only ever add hosted convenience.

## Business model sequencing

- **Now → launch + ~2 quarters:** free only. Goal is workflows completed and
  advocates created, not revenue. Resist early monetization; the free product
  is our entire acquisition engine and it costs nothing to run.
- **Trigger for Tier 1 (hosted relay, ~$8–15/coordinator/mo):** repeated
  organic complaints about manual transport from *retained* users (they stayed
  despite friction — they'll pay to remove it). Building it is deliberately
  cheap: one `EnvelopeChannel` adapter + a small relay service.
- **Trigger for Tier 2 (team/org):** first inbound "can we get SSO / can IT
  review this" conversations from orgs with >3 active coordinators.
- **Never:** ads, data monetization, selling insights. Any of these would
  detonate the trust positioning permanently.

## Strategic risks

| Risk | Assessment | Mitigation |
|---|---|---|
| Transport friction kills activation | **Highest risk.** | Beachhead targeting; polished import UX; hosted relay as first tier; measure completion honestly with design partners before public launch |
| "Anonymous" overclaim backlash | High severity, fully avoidable | The hard messaging rule above; security-model.md is public and linkable |
| No telemetry (local-first) = flying blind | Certain | Privacy-respecting proxies: landing analytics, opt-in anonymous completion ping, design-partner interviews (see [launch-plan.md](launch-plan.md)) |
| Category confusion ("another polling tool") | Moderate | Always demo the multi-round loop, never a single poll; lead demos with round 2 (consolidation), which no competitor has |
| Single-device coordinator data loss | Moderate | Ship workflow export/import pre-launch (already backlogged); be honest in docs |
| Public repo with no license | Legal ambiguity now | Decide deliberately pre-launch — see open decisions in [launch-plan.md](launch-plan.md) |

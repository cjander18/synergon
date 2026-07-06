# Launch Plan

> Sequencing, channels, and measurement for taking the free local product to
> market. Strategy and personas: [strategy.md](strategy.md) ·
> [personas.md](personas.md). Timeline is relative to work restarting; the
> suggested public-launch window is early–mid September 2026 (post-summer B2B
> attention, ~8 working weeks out from July 2026).

## Phase 0 — Launch blockers (product & platform, ~2–3 weeks)

Ship-stoppers only; everything else is a fast-follow. Sourced from
CHECKPOINT.md plus GTM needs:

| # | Item | Why it blocks launch |
|---|---|---|
| 1 | Human two-profile smoke test (the open M4 exit criterion) | We do not publicly launch a flow no human has completed |
| 2 | Invitation re-issue for a live round | Passwords are shown once by design; a coordinator who loses one currently has a stuck round — first-session churn |
| 3 | Close/abandon a zero-response round | Same class of stuck-state |
| 4 | Workflow export/import (file-based) | Single-browser-profile durability is not honest to ship silently; also enables "move to my other machine" |
| 5 | Deploy app to a static host + custom domain | The product must be a URL; GitHub Pages or Cloudflare Pages fits the no-backend story at $0 |
| 6 | Landing page (separate from the app) | Positioning, 90-second demo GIF of the *multi-round* loop, security-model link, mailing-list capture |
| 7 | In-app first-run demo workflow | Priya must experience consolidation without recruiting 3 colleagues first — seed a sample workflow with fake responses |
| 8 | License decision executed (see open decisions) | Repo is currently public with **no license** — legally "all rights reserved" with visible source; accidental, must become deliberate |
| 9 | Anonymity copy audit | Every public surface says "anonymous to other participants," never bare "anonymous" |

## Phase 1 — Design partners (overlaps Phase 0, runs ~4 weeks)

Recruit **8–12 hand-picked facilitators**: mostly Priyas (team leads/agile
coaches from our networks), 2–3 Marcuses (independent facilitators — direct
LinkedIn/IAF outreach). Each commits to running ≥2 real deliberations and a
30-minute debrief.

**What we're measuring (this substitutes for telemetry):**
- Round-trip completion rate: of invitations sent, how many responses came back?
- Time-to-first-consolidation; where people stalled; verbatim confusion.
- The killer question: *"Would you run your next real decision through this?"*

**Gate to Phase 2:** ≥70% of design partners complete a full multi-round
workflow with a real team AND ≥half say yes to the killer question. If the
transport friction fails this gate, we pause public launch and reconsider
pulling the hosted relay forward — better to learn this from 10 friendlies
than from a Product Hunt comment section.

## Phase 2 — Public launch (1 concentrated week)

Coordinated burst, all channels pointing at the landing page:

- **Show HN** — lead with the architecture: "Show HN: Synergon – anonymous
  team deliberation that runs entirely in the browser (no backend, E2E-encrypted
  envelopes in the URL fragment)." HN is the one audience that *rewards*
  local-first + crypto detail; link security-model.md in the first comment.
  Honesty about peer-anonymity scope will be respected; overclaiming would be
  dismembered.
- **Product Hunt** — lead with the outcome: "Hear your whole team, not just
  the loudest voice." Demo GIF of the three-round loop. Marcus-type design
  partners primed to comment with real usage stories.
- **Reddit** (r/agile, r/ProductManagement, r/ExperiencedDevs) — native-tone
  posts telling the *method* story ("we digitized Delphi/NGT"), not the
  product pitch; link in comments.
- **LinkedIn** — founder-voice post on the bias problem; design partners
  resharing with their session stories.
- **Facilitation communities** (SessionLab, IAF, Liberating Structures Slack)
  — Marcus-targeted: "a free tool that runs your NGT/Delphi sessions."

## Phase 3 — Content engine (steady state, starts week after launch)

The moat is the method. [concepts.md](../concepts.md) is a content calendar in
disguise — one piece per bias/method, each ending in "run this in Synergon in
10 minutes":

- "Why your retro produced the loudest person's opinion" (anchoring/HiPPO)
- "The Delphi method for product teams, minus the spreadsheet"
- "Nominal Group Technique: the meeting format that outperforms brainstorming"
- "Anonymous team input without sending it to someone else's server" (Renata/SEO)
- "How to run an expert consensus panel for free" (researcher/SEO)

Cadence: 1 piece/every 2 weeks is sustainable solo. Distribution: LinkedIn +
the subreddit that matches each piece + newsletter. SEO intent targets:
"delphi method tool," "anonymous team feedback tool free," "nominal group
technique online."

## Measurement (privacy-respecting by construction)

Local-first means no in-app telemetry by default — we measure at the edges and
by asking:

| Metric | Source | 90-day post-launch target (order-of-magnitude) |
|---|---|---|
| Landing → app-open rate | Static-host analytics (privacy-friendly, e.g. Plausible) | 25% |
| App opens / week | Same (a page load, not behavior tracking) | 300+ |
| **North star: completed workflows** | Opt-in, anonymous, count-only ping on round close (explicit toggle, default off, disclosed) + design-partner self-report | 30+/wk by day 90 |
| Newsletter signups | Landing page | 500 |
| GitHub stars (if open-sourced) | GitHub | 500+ |
| Qualitative: "next real decision?" yes-rate | Rolling user interviews (5/month) | ≥50% |
| Tier-1 demand signal | Unprompted "I'd pay for links that just work" mentions | 10 distinct users → build relay |

## Open decisions (need an explicit call, none block Phase 0 start)

1. **License / open-source posture.** Recommended: **open-source the client
   (MIT or Apache-2.0)** — it is the trust story made verifiable ("don't trust
   us, read it"), HN-launch fuel, and Renata's security review shortcut. The
   future relay server can be a separate, commercial repo (open-core). The
   current public-but-unlicensed state is the worst option and must not
   survive to launch.
2. **Name & domain.** "Synergon" is workable but collides with existing
   corporate names in some markets; do a trademark/domain sanity pass
   (synergon.app availability) before spending on brand. Renaming after launch
   is far costlier than before.
3. **Demo asset format.** GIF on landing vs. 90-second video vs. interactive
   seeded workflow (#7 above). Recommendation: seeded workflow + GIF; skip
   video production for launch.
4. **Newsletter/community home.** Email list only (recommended at this scale)
   vs. Discord/Slack community. Communities demand daily tending; defer.

## What we deliberately are NOT doing

- No paid acquisition (nothing to amortize it against; PLG + content only).
- No sales motion, no demos-on-request, no enterprise pilots — Renata waits
  for Tier 2; her content is planted now, that's all.
- No feature roadmap promises in public launch materials — the free product
  must stand on what it does today.
- No launch-week monetization talk beyond one landing-page line ("free, local,
  forever — hosted convenience tiers later") to set expectations honestly.

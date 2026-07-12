# Launch Readiness — gap-closure tracker

> Follow-up to [PHASE0.md](PHASE0.md) (8/9 done; smoke test remains). Closes
> the gaps found in the 2026-07-10 review and prepares best/worst-case launch
> handling. Statuses: `todo` · `in-progress` · `done` · `blocked-on-user`.

| # | Gap | Status | Notes |
|---|-----|--------|-------|
| 1 | Landing analytics (privacy-respecting) | blocked-on-user | GoatCounter wired on landing+privacy pages only, `open-app` click event = funnel numerator; needs the `synergon` code registered at goatcounter.com |
| 2 | React error boundary | done | Fallback shows error, feedback mailto, reload; data-is-safe reassurance |
| 3 | Mobile contributor/coordinator pass | done | Recorded full loop at 390px: clean, 0 errors, no fixes needed |
| 4 | Copy buttons on the critical path | done | CopyButton w/ Copied✓ + manual-copy fallback |
| 5 | Demo video for landing hero | done | 12.5s / 91KB mp4 + poster via hero-video.mjs + ffmpeg-static; embedded |
| 6 | Email capture / updates channel | done | mailto-subscribe + watch-repo in landing footer; provider still open |
| 7 | Design-partner kit | done | docs/gtm/design-partner-kit.md incl. the Phase-2 gate |
| 8 | Privacy page | done | privacy.html: app collects nothing; landing counts cookie-less; changes need an ADR |
| 9 | Export nudge (storage eviction) | done | Hint under Export once rounds exist |
| 10 | Workflow schema version field | done | v:1 on Workflow, validated on import |
| 11 | Crypto review-status honesty | done | Review-status section added; adversarial review invited |
| 12 | Launch contingencies (best & worst case) | done | docs/gtm/launch-contingencies.md + pre-drafted offline notice + drill |
| 13 | CHECKPOINT.md refresh | done | Rewritten to launch-ready state, blocked-on-Clinton list ordered by value |

## Attention-infrastructure additions (2026-07-11, after the playbook review)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 14 | Thesis / launch essay (category wedge + canonical proof) | done | docs/gtm/launch-essay.md — one text, four uses; frame: peer-anonymous, multi-round, no server |
| 15 | FAQ + comparison pages, llms.txt, JSON-LD (AI discoverability) | done | faq.html, compare.html (honest choose-them-when column), public/llms.txt, schema.org on landing |
| 16 | Barbell content restructure | done | launch-plan Phase 3: monthly anchor → weekly fragments → owned list |
| 17 | Newsletter → pre-launch decision | blocked-on-user | Buttondown recommended (free ≤100 subs, no tracking pixels); needs account |
| 18 | Insiders tier + partner circle | done | design-partners skill: 3–5 curated method voices; circle move post-gate |
| 19 | Third-party frame-repetition signal | done | launch-week skill: `frame-repeat` ledger tag, ≥5/wk-1 threshold |

Deliberately NOT adopted from the playbook: investor-facing measurement,
curated dinners/events, video/podcast cadence, paid attention — wrong stage,
wrong economics, wrong scoreboard.

## Carried over (humans only)

- **Smoke test** (PHASE0 blocker 1) — now best run against the live site,
  and should include a **second round** (the per-round redistribution cost is
  the biggest untested human factor) and **one contributor on a phone**.
- **Default branch flip** — cosmetic; see PHASE0 log.
- **Domain/name decision** — front-runs brand spend, the GIF text, and the
  email swap.
- **GoatCounter account** (if item 1's recommendation is accepted) and
  confirming **synergonlabs@gmail.com** is live and checked.

## Log

- 2026-07-10 — tracker created; work begins.
- 2026-07-10 — items 2,3,4,9,10 (hardening), 1,5,6,8 (web), 7,11,12,13 (docs)
  closed. 12/13 done; item 1 blocked on the GoatCounter account.
- 2026-07-11 — attention-playbook review: items 14–19 added; 14/15/16/18/19
  done same day, 17 (newsletter account) on Clinton.

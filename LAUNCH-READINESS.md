# Launch Readiness — gap-closure tracker

> Follow-up to [PHASE0.md](PHASE0.md) (8/9 done; smoke test remains). Closes
> the gaps found in the 2026-07-10 review and prepares best/worst-case launch
> handling. Statuses: `todo` · `in-progress` · `done` · `blocked-on-user`.

| # | Gap | Status | Notes |
|---|-----|--------|-------|
| 1 | Landing analytics (privacy-respecting) | todo | Landing page ONLY — the app's no-phoning-home contract is untouchable |
| 2 | React error boundary | done | Fallback shows error, feedback mailto, reload; data-is-safe reassurance |
| 3 | Mobile contributor/coordinator pass | done | Recorded full loop at 390px: clean, 0 errors, no fixes needed |
| 4 | Copy buttons on the critical path | done | CopyButton w/ Copied✓ + manual-copy fallback |
| 5 | Demo video for landing hero | todo | Cut from a scripted recording (no ffmpeg on this machine — see notes) |
| 6 | Email capture / updates channel | todo | Zero-infra: mailto-subscribe + watch-repo links; provider still an open decision |
| 7 | Design-partner kit | todo | Outreach template, onboarding steps, debrief script |
| 8 | Privacy page | todo | Says in plain words what we collect: nothing (app), cookie-less counts (landing) |
| 9 | Export nudge (storage eviction) | done | Hint under Export once rounds exist |
| 10 | Workflow schema version field | done | v:1 on Workflow, validated on import |
| 11 | Crypto review-status honesty | todo | security-model.md states self-implemented, not audited, review invited |
| 12 | Launch contingencies (best & worst case) | todo | Concrete runbook: hotfix path, rollback commands, pull-the-app procedure |
| 13 | CHECKPOINT.md refresh | todo | Stale claims (export/CI listed as gaps — both long done) |

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

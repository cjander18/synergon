# Checkpoint — launch-ready, awaiting human smoke test

> Refreshed 2026-07-10. Previous checkpoint (2026-07-06, "MVP complete") is
> superseded — every gap it listed has since been closed. This is the
> resume-here marker; the live trackers are [PHASE0.md](PHASE0.md) and
> [LAUNCH-READINESS.md](LAUNCH-READINESS.md).

## Where things stand

- **Live product:** https://cjander18.github.io/synergon/ (landing + demo
  video + privacy page) and `/app.html` (the app). Deploys: push to
  `mvp-foundation` → Actions verify → Pages, ~3 min.
- **Codebase:** 148 tests green across domain / crypto / use-cases / UI;
  strict TypeScript; TDD throughout. Hardened for launch: error boundary,
  in-flight button states, copy buttons, mobile-clean at 390px, URL-addressable
  selection (`#w=<id>`), export/import with schema `v: 1`, re-issue + cancel
  recovery paths, seeded demo workflow.
- **GTM:** strategy, personas, launch plan, design-partner kit, and
  best/worst-case contingencies in `docs/gtm/`. Feedback channels live
  (synergonlabs@gmail.com + GitHub issue templates); no-phoning-home contract
  documented; crypto review status stated honestly.
- **Skills** (`.claude/skills/`): enterprise-ui-design, demo-recorder (multi-
  actor Playwright harness with verified example flows), launch-week (the
  first-seven-days operating manual with decision thresholds).

## Blocked on Clinton (in order of value)

1. **Smoke test** — PHASE0 blocker 1. Against the live site, two browser
   profiles, **run two rounds** (the per-round redistribution cost is the
   big unknown), one contributor on a phone.
2. **GoatCounter account** — register the `synergon` code; the snippet is
   already live on the marketing pages. Without it the launch decision table
   has no funnel numbers.
3. **Confirm synergonlabs@gmail.com** works and is checked.
4. **Pre-launch drill** — the checklist at the end of
   [docs/gtm/launch-contingencies.md](docs/gtm/launch-contingencies.md).
5. **Domain/name decision** — before brand spend (PHASE0 open decisions).
6. Default branch flip to `main` — cosmetic (see PHASE0 log for the
   environment-policy note if you do).

## Then

Design-partner recruitment ([docs/gtm/design-partner-kit.md](docs/gtm/design-partner-kit.md),
8–12 partners, the Phase-2 gate), then public launch per the launch-week
skill. First paid tier (hosted relay) waits for the ≥10-unprompted-mentions
trigger — it is one `EnvelopeChannel` adapter by design (ADR-0002).

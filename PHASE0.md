# Phase 0 — Launch Blockers Progress

> Live tracker for the pre-launch work defined in
> [docs/gtm/launch-plan.md](docs/gtm/launch-plan.md). Statuses: `todo` ·
> `in-progress` · `done` · `blocked-on-user`. Started 2026-07-06.

| # | Blocker | Status | Notes |
|---|---------|--------|-------|
| 1 | Human two-profile smoke test | blocked-on-user | Instructions below — only a human can run this |
| 2 | Invitation re-issue for a live round | done | Fresh passwords for non-respondents only; responses untouched |
| 3 | Close/abandon a zero-response round | done | `Cancelled` status + Cancel round button from any live state |
| 4 | Workflow export/import | done | Versioned JSON codec (binary as base64url); download w/ copy fallback |
| 5 | Static-host deploy | todo | GitHub Pages via Actions; `base: './'` keeps file:// runnable |
| 6 | Landing page | todo | Static page at `/`, app moves to `/app.html` |
| 7 | In-app demo workflow | done | Built through the real reducer; offered when console is empty |
| 8 | License decision executed | done | MIT shipped (LICENSE + package.json) |
| 9 | Anonymity copy audit | done | README, vision.md qualified; UI was already compliant |

## Blocker 1 — smoke test instructions (for Clinton)

1. `cd ~/repos/synergon && npm run dev` — open the printed URL, add `/app.html`
   once blocker 6 lands (plain `/` until then).
2. As **Dana**: create a workflow (yourself + 2 fake teammates), draft an
   ItemList round, issue it. Copy one invitation link + its password.
3. As **Sam**: open the link in a second browser profile or incognito window.
   Enter the password, answer, copy the encrypted response.
4. Back as Dana: paste the response into "Paste a response envelope", import,
   repeat for the other invitations (you can answer them yourself), enter the
   passwords, run consolidation.
5. Draft a Rank round seeded from the output, run it to a ranked outcome.
6. Record: where you stalled, anything confusing, and whether you'd run a real
   decision through it. That's the M4 exit criterion done.

## Open decisions carried from the launch plan

- **Name/domain sanity pass** — check `synergon.app` availability and trademark
  collisions before spending on brand.
- **Newsletter provider** — deferred; landing ships with GitHub CTA only.
- **LICENSE copyright holder** — shipped as "cjander18"; swap in legal name
  when convenient.

## Log

- 2026-07-06 — tracker created; work begins.

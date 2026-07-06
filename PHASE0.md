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
| 5 | Static-host deploy | blocked-on-user | CI verify passes on GitHub; two admin clicks remain (below) |
| 6 | Landing page | done | Static landing at `/`, app at `/app.html`; honest-anonymity section |
| 7 | In-app demo workflow | done | Built through the real reducer; offered when console is empty |
| 8 | License decision executed | done | MIT shipped (LICENSE + package.json) |
| 9 | Anonymity copy audit | done | README, vision.md qualified; UI was already compliant |

## Blocker 1 — smoke test instructions (for Clinton)

1. `cd ~/repos/synergon && npm run dev` — open the printed URL — landing is at `/`, the app at `/app.html`.
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

## Blocker 5 — two admin clicks for Clinton (the PAT lacks repo-admin rights)

1. **Enable Pages:** repo Settings → Pages → Source: **GitHub Actions**. Then
   re-run the failed `deploy` job (Actions tab) or push any commit to `main`.
   The site will land at `https://cjander18.github.io/synergon/`.
2. **Default branch:** Settings → General → Default branch → **main** (created
   and pushed; currently the default is still `mvp-foundation`).

## Open decisions carried from the launch plan

- **Name sanity pass — findings (2026-07-06):** several existing companies use
  "Synergon": a life-sciences IP-management firm, Synergon Solutions Inc.
  (logging recorders, FL), and a liquidated Hungarian IT integrator. None are
  in team-collaboration/deliberation software, so the collision risk is
  moderate rather than blocking — but a proper trademark search (and a check
  that `synergon.app` is registrable) is warranted before spending on brand.
  Sources: [Crunchbase](https://www.crunchbase.com/organization/synergon-72fd),
  [Synergon Solutions](https://www.linkedin.com/company/synergon-solutions-inc.),
  [Synergon IT Plc](https://www.linkedin.com/company/synergon).
- **Newsletter provider** — deferred; landing ships with GitHub CTA only.
- **LICENSE copyright holder** — shipped as "cjander18"; swap in legal name
  when convenient.

## Log

- 2026-07-06 — tracker created; work begins.
- 2026-07-06 — blockers 8, 9 done (MIT license; anonymity copy audit).
- 2026-07-06 — blockers 2, 3 done (re-issue invitations; cancel round). 132 tests.
- 2026-07-06 — blocker 4 done (workflow export/import). 136 tests.
- 2026-07-06 — blocker 7 done (seeded demo workflow). 137 tests.
- 2026-07-06 — blocker 6 done (landing at `/`, app at `/app.html`, base `./`).
- 2026-07-06 — blocker 5: CI live, verify green on GitHub; `main` created;
  Pages + default-branch switch need Clinton (PAT lacks admin). Name sanity
  pass done (see open decisions). Remaining: blockers 1 and 5's two clicks.

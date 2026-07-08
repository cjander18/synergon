---
name: demo-recorder
description: Records an end-to-end demo of a feature or flow in the running web app, driving multiple simultaneous users (coordinator + contributors) in isolated browser contexts — the automation equivalent of separate Chrome windows/profiles. Produces numbered full-page screenshots per step, one video per actor, captured console/page errors, and a report.md manifest. Invoke when asked to record a demo or walkthrough, capture visual evidence of a feature end-to-end, exercise the multi-user Synergon loop (Dana issuing, Sams responding, consolidation), or gather input for design feedback or testing feedback. Not for unit-level testing (use the Vitest suites) or for static screenshots of a single page.
---

# Demo Recorder

Records multi-user, end-to-end walkthroughs of the app with Playwright. Every
actor (Dana, Sam (Ana), …) gets an **isolated Chromium context** — separate
cookies, storage, and IndexedDB, exactly like distinct Chrome profiles — which
is what Synergon's coordinator/contributor flows require: the coordinator's
workflow lives in *their* browser storage, and each contributor must arrive
with none of it.

## Prerequisites

- `playwright` is a devDependency and Chromium is installed
  (`npx playwright install chromium` — already done in this repo).
- The app must be served. Preferred (matches production):
  `npm run build && npx vite preview --port 4173 --strictPort` in the
  background, then wait for `curl -s http://localhost:4173/app.html` to
  succeed. The dev server (`npm run dev`, port 5173) also works — pass the URL
  via `APP_URL`.

## How to record a flow

1. Write a flow script (`.mjs`) that imports the harness:

   ```js
   import { createRecorder } from './.claude/skills/demo-recorder/scripts/recorder.mjs';
   const rec = await createRecorder({ name: 'my-flow', baseUrl: 'http://localhost:4173' });
   ```

2. Drive it with `rec.step(actorName, description, async (page) => { … })`:
   - The first `step` for a new actor name creates their isolated context.
   - The callback receives that actor's Playwright `page`; after it resolves,
     a full-page screenshot is captured and the step is logged.
   - `step` returns the page, so data can be lifted between actors (links,
     passwords, envelope text) exactly as a human would copy them.
   - End inside each step with a `waitFor()` on something the step should have
     produced — the screenshot then shows the *achieved* state, not a race.

3. Finish with `const { dir, problems } = await rec.finish();` — closes
   contexts (flushing per-actor videos), writes `report.md`, and returns any
   console/page errors observed. Exit non-zero if `problems.length > 0` so a
   recording doubles as a smoke check.

A complete, verified example covering the whole canonical Synergon round
(create → draft → issue → two contributors unlock/answer/encrypt → import ×2 →
consolidate) lives at `examples/canonical-round.mjs`. Start from a copy of it
for any Synergon flow; its selector patterns are the house style.

## Selector conventions for the Synergon UI

Use accessible queries (they double as an a11y check): `page.getByLabel(…)`,
`page.getByRole('button', { name: … })`. Key surfaces:

| Surface | Selector |
|---|---|
| Create workflow | `getByLabel('Title')`, `getByLabel(/participants/i)`, button `Create workflow` |
| Draft round | `getByLabel('Question type'/'Prompt'/'Aggregation')`, audience checkboxes by participant label, button `Draft round` |
| Invitations (shown once!) | `locator('.invitation')` → within: `h5` (label), `a` (link href), `code` (password) |
| Contributor | `getByLabel('Password')`, button `Unlock`, `getByLabel(/your answer/i)`, button `Encrypt response`, `getByLabel(/your encrypted response/i).inputValue()` |
| Import & consolidate | `getByLabel(/paste a response envelope/i)`, button `Import response`, text `N of M responses`, `getByLabel('Password for <label>')`, button `Run consolidation` |
| Round lifecycle | heading `Round N` + status badge: `locator('.badge', { hasText: 'Closed' })` (Draft/Issued/Collecting/Closed/Cancelled) |
| Coordinator deep link | `/app.html#w=<workflowId>` opens the console with that workflow selected; selection changes update the fragment |
| Cancel round | two-step: button `Cancel round`, then button `/discard round N/i` |

Gotchas: invitation passwords appear **only at issue time** — lift them in the
same step. Real PBKDF2 (600k iterations) makes issue/unlock/consolidate take
~0.5–2s each; default timeouts absorb this, so don't add sleeps.

## Output and what to do with it

`demo-recordings/<name>-<timestamp>/` (gitignored):
`report.md` · `shots/NNN-actor-step.png` · `video/<actor>.webm`.

- **For design feedback:** load the `enterprise-ui-design` skill, then walk
  the screenshots against its `references/review-checklist.md`, screen by
  screen. The step descriptions in report.md give each screenshot its context.
- **For testing feedback:** the report's *Console / page errors* section must
  be empty; each step's `waitFor` acts as an assertion that the flow advanced.
  Attach report.md + relevant shots when filing findings.
- **For humans:** send report.md with the videos — one per actor shows each
  user's genuine point of view, including what they could *not* see (peer
  anonymity).

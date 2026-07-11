# Launch Contingencies — best case and worst case, with commands

> Companion to the [launch-week skill](../../.claude/skills/launch-week/SKILL.md)
> (principles and thresholds). This is the infra-specific runbook: exactly what
> to type when things go very right or very wrong. Deploy pipeline: push to
> `mvp-foundation` → GitHub Actions verify (test+typecheck+build) → Pages
> publish, ~2–3 minutes end to end.

## Best case: front page / featured

**Traffic:** GitHub Pages is a global CDN serving ~70KB gzipped of static
files. An HN front page (~30–60k visits/day) is a non-event; there is nothing
to scale, no bill to watch, no server to fall over. **Action: none.**

**People:** thread duty per the launch-week skill (§1.4). Alert design
partners that the wave is live. Watch the email inbox at the same cadence as
the thread — reply latency is part of the show.

**Shipping during the spike — the freeze rule with commands:**
Hotfixes only; nothing ships without the suite green locally first:

```bash
npm test && npm run typecheck && npm run build   # all green or it doesn't ship
git add -A && git commit -m "fix: <specific>"
git push origin mvp-foundation && git push origin mvp-foundation:main
# live in ~3 min; verify:
curl -s -o /dev/null -w "%{http_code}\n" https://cjander18.github.io/synergon/app.html
```

The Actions verify job is the backstop: a red suite cannot deploy.

## Worst case ladder

### W1 — Bad deploy / regression discovered (P1)

Roll back to the last good commit; ~3 minutes to live:

```bash
git log --oneline -5                       # find the bad commit(s)
git revert --no-edit <sha> [<sha>...]      # never force-push; history is the audit
git push origin mvp-foundation && git push origin mvp-foundation:main
```

Then reproduce the bug locally with a failing test before re-fixing.

### W2 — P0: activation path broken, data loss, or a security claim is wrong

Per the launch-week skill: **4-hour fix-or-pull clock.** If no confident fix
inside the window, pull the app while keeping the landing page honest:

1. Replace `app.html`'s content with a short static notice: *"Synergon is
   temporarily offline while we fix <one honest sentence>. Your data is in
   your browser and is unaffected. Updates: <GitHub issue link>."*
   (Remember `index.html`'s CTA now leads to the notice — that is correct.)
2. Pin a GitHub issue titled "Status: <problem>" and post the same sentence.
3. If it is a security-claim problem: say so plainly in the thread/issue
   yourself, before anyone else does. The positioning survives an honest bug;
   it does not survive a discovered cover-up.
4. Restore = revert the notice commit once the fix has a green suite and,
   for crypto issues, a written explanation in the issue.

Existing users are unaffected by a pull: their workflows are local, and an
already-shared invitation link is data in *their* URL — but new opens of the
app stop until restore.

### W3 — Hostile thread, no technical problem

Not an incident. Launch-week skill §1.5: concede fair points, "you're right,
it's logged," never argue anonymity semantics — the qualified claim is the
brand. Do not ship anything reactive the same day.

### W4 — Silence (the likeliest "worst" case)

< 5 HN points in the first hour → let it die per the skill's decision table.
No emergency: the site stays up, design partners continue, retry in 2–4 weeks
with the other headline angle. The failure mode to avoid is spending launch
energy twice in one week.

## Pre-launch drill (do once, before launch day)

- [ ] Rehearse W1: make a trivial commit, revert it, confirm the site updates
      both times (~6 min total).
- [ ] Write the W2 notice text now, calm, and stash it in this file's folder
      as `app-offline-notice.html` — 3 a.m. is not the time to draft it.
- [ ] Confirm the GoatCounter dashboard loads and the `open-app` event fires
      (needs the account — see LAUNCH-READINESS.md).
- [ ] Confirm synergonlabs@gmail.com receives and you can reply from it.
- [ ] Phone: log into GitHub + Gmail so P0 reports reach you away from the desk.

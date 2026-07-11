# Launch-Week Runbook

Checklists for [SKILL.md](../SKILL.md) §1 and §5. Day 0 = the Show HN day. Channels: HN thread, Product Hunt, GitHub issues, synergonlabs@gmail.com, Reddit threads, Plausible dashboard.

## Day −1 (the day before)

- [ ] Full test suite green; deploy the exact bundle you're launching; hard-refresh test on a clean browser profile.
- [ ] Walk the activation path as a stranger: landing → open app → seeded demo workflow → create round → issue invite → import a response. Any break is a launch delay, not a note.
- [ ] Anonymity copy audit (launch-plan.md blocker #9): grep every public surface for bare "anonymous" — landing, README, app UI, the drafted posts. Must read "anonymous to other participants" / "peer-anonymous."
- [ ] Draft and freeze: HN title + first comment (≤300 words, per SKILL §1.3), PH tagline + gallery + maker comment.
- [ ] Create the learning ledger (spreadsheet or pinned issue): `date | channel | verbatim | theme | link | label`, plus a daily-log tab for the three debrief questions.
- [ ] Confirm GitHub labels exist: `P0`, `P1`, `P2`, `idea`, `wont-do`.
- [ ] Prime 2–3 design partners for PH day: real usage stories, posted in the first 2 hours, no "congrats!" comments, no vote-begging.
- [ ] Plausible dashboard bookmarked; note baseline daily visits.
- [ ] Set the on-window (8 hours from posting) and tell whoever shares your life when it ends.

## Day 0 — Show HN (Tue–Thu, post 7:00–9:00 a.m. ET)

| When | Do |
|---|---|
| T+0 | Submit. Within 2 minutes: post the prepared first comment. |
| T+0 → T+1h | Watch only. **< 5 points at T+1h → let it die** (SKILL §4): no delete, no repost, no vote-asking. Log it, retry in 2–4 weeks with a different angle. Salvage the day: answer any comments that did arrive, then stand down to normal cadence. |
| T+1h → T+8h | Sweep every 30–60 min. Reply to every substantive comment, < 1h latency. Concede-and-log critics (issue first, then reply). Every substantive comment → ledger, verbatim. |
| Ongoing | Watch email + GitHub issues each sweep — HN readers file issues instead of commenting. Any P0 report → 4-hour fix-or-pull clock (SKILL §2). |
| T+8h | Hard stop. One last sweep, answer the stragglers, notifications off. |
| Before sleep | Evening debrief (below) + numbers vs. SKILL §4 table. |

## PH day (a different day than HN, if possible)

- 12:01 a.m. PT: launch goes live (schedule it; do not stay up unless you're genuinely awake).
- By ~6 a.m. PT: featured or not? **Not featured → downgrade** to two checks/day and spend the day on community channels. Featured → 8-hour on-window, same cadence as HN; confirm design-partner stories landed.
- Reply to every substantive PH comment; verbatims → ledger.

## Days 1–7 — daily cadence

### Morning sweep (~45 min, same order every day)

1. **Email** — reply to anything approaching the 24h SLA first; shape: thank + log + no roadmap promise + one question back.
2. **GitHub issues** — label everything (`P0/P1/P2/idea/wont-do`); check new reports against the rule of three.
3. **Live threads** — HN, PH, Reddit posts, community threads. Answer stragglers.
4. **Plausible** — landing visits, app opens, landing→app-open rate; jot the three numbers in the daily log.
5. **Ledger** — new verbatims filed; recount themes: anything just hit 3 independent reports?
6. **Pick the day's ONE fix** (or none): a P1 or a rule-of-three UX hotfix. Smallest diff, suite green before deploy, no refactors, no features (freeze rule).

### Days 2–4 only: community posts

One channel per day, native tone, method story not product pitch ("we digitized Delphi/NGT"), link in comments per each community's norms: r/agile, r/ProductManagement, r/ExperiencedDevs, SessionLab / IAF / Liberating Structures Slack. Each post gets a 2-hour attended window after posting.

### Evening debrief (~20 min, in the ledger's daily-log tab)

Three questions, each answered with a verbatim or a link — not an impression:

1. **What broke?** (bugs confirmed, P-labels assigned, fix-or-pull calls made)
2. **What confused?** (exact quotes; which are at 1, 2, 3 reports?)
3. **What resonated?** (which sentence/feature did people repeat back? — that's tomorrow's headline)

Then: today's numbers vs. the SKILL §4 decision table. Any row triggered → tomorrow's plan changes accordingly, tonight, in writing.

### Email SLA tracker

Every inbound email answered < 24h. If the inbox has anything older than 20h, that outranks everything else in the morning sweep.

## Day 7 — the retro (90 min, produces one verdict)

**Inputs:** the ledger (all verbatims + themes), 7 daily debriefs, the numbers.

**1. Score the week against the leading indicators (SKILL §4):**

- Landing → app-open: ≥ 10–15%?
- App opens: ≥ 300 for the week? What does the day-6/7 tail look like vs. peak?
- GitHub stars: ≥ 50–100 (front-paged) / ≥ 20 (not)?
- Newsletter: ≥ 40–60?
- Substantive inbound conversations: ≥ 5? Verbatims in ledger: ≥ 25? Themes: ≥ 3?
- "I'd pay for links that just work" tally: n of 10 toward the Tier-1 trigger.

**2. Pick exactly ONE verdict for the next two weeks:**

| Verdict | Evidence pattern | Next two weeks |
|---|---|---|
| **Persevere** | Thresholds mostly green, themes are polish-level | Start the Phase-3 content engine (1 piece / 2 weeks, per launch-plan.md); keep the daily sweep at once/day; schedule 5 user interviews |
| **Adjust channel** | Product resonated wherever it was actually seen, but 1–2 channels produced all the ledger signal | Reweight to the channels that produced signal; retry HN in 2–4 weeks with the alternate angle (method-led instead of architecture-led, or vice versa) |
| **Adjust message** | Traffic arrived but landing→app-open < 10%, or comments show category confusion ("another polling tool") | Rewrite hero + demo asset (lead with round-2 consolidation); A/B the outcome-led vs. architecture-led framing per audience; re-launch messaging before spending more attention |
| **Adjust product** | Message landed, users activated, then hit the same wall ≥ 3 independent times (expect: transport friction) | Fix the top rule-of-three pattern before further promotion; if it's transport and the paid-relay tally is climbing, revisit launch-plan.md's relay-pull-forward question with the ledger as evidence |

**3. Write it down** in the ledger, with the three verbatims that most justify the verdict. The retro note is the input to the week-3 plan; a verdict without quotes attached is a mood, not a decision.

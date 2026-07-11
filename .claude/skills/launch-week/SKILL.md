---
name: launch-week
description: Operating manual for the first seven days of a bottom-up, product-led public launch (Show HN, Product Hunt, Reddit, niche communities) by a tiny team with no paid acquisition, no sales motion, and no telemetry — written for Synergon but general to any free local-first tool. Invoke when planning or executing launch day (post timing, titles, the prepared first comment), working a live HN/PH comment thread (response cadence, handling critics), triaging the first week's inbound feedback (P0/P1/P2 labels, rule of three, fix-or-pull calls, hotfix freeze rules), judging traction against week-1 numeric thresholds (landing→app-open rate, HN points, inbound volume) to decide persevere vs. re-angle, or writing replies to launch-week emails and hostile comments.
---

# Launch Week

Operating manual for days 0–7 of Synergon's public launch — and any launch shaped like it: free tool, static hosting, solo founder + AI, no telemetry, feedback via email (synergonlabs@gmail.com) and GitHub issues, distribution via Show HN / Product Hunt / Reddit / facilitation communities.

Ground truth lives in `docs/gtm/launch-plan.md` (channels, metrics), `docs/gtm/strategy.md` (positioning, the anonymity messaging rule), `docs/gtm/personas.md` (Priya/Marcus/Renata). Hour-by-hour checklists: [references/launch-week-runbook.md](references/launch-week-runbook.md).

Every section below follows the same shape: **principle → why → mechanical action → the number that triggers it.**

---

## 0. The prime principle: a listening exercise with a megaphone attached

**Principle.** Launch week buys you one thing: a temporary, unrepeatable spike of qualified attention. Its purpose is to *learn* — what breaks, what confuses, what resonates — not to *win*. Upvotes are the receipt, not the product.

**Why.** Attention on HN/PH decays with a half-life of roughly 24 hours; by hour 48 the thread is dead and the traffic is gone. A launch that "wins" (front page, badge) but teaches you nothing about why Priya bounces at the invite step was a waste of the only free marketing spike you get. Conversely, a launch that flops on points but yields ten verbatim confusion reports succeeded.

**Mechanical action.** Before posting anything, create the learning ledger: a spreadsheet (or a pinned GitHub issue titled `Launch week ledger`) with columns `date | channel | verbatim quote | theme | link | label`. Every substantive comment, email, and issue gets a row, verbatim, same day. This is the deliverable of launch week.

**The number.** Plan 100% of your discretionary energy into a 48-hour window per channel, then stop refreshing. Success floor for the week: **≥25 verbatim data points in the ledger** and **≥3 recurring themes identified**. If you end day 7 with fewer than 10 verbatims, the launch failed regardless of points — see the decision table (§5, "opens high but zero inbound").

---

## 1. Launch-day mechanics

### 1.1 Posting windows

**Principle.** Post when the target audience's day starts and the ranking algorithm has the longest runway.

**Why.** HN front-page position compounds: early votes beget visibility begets votes. A great post at a dead hour dies deterministically.

**Mechanical action.**
- **Show HN:** Tuesday–Thursday, 7:00–9:00 a.m. US Eastern. Post from the founder account (with some karma history — never a fresh throwaway).
- **Product Hunt:** launch begins 12:01 a.m. Pacific; schedule the launch for a Tuesday or Wednesday (weekends have less traffic but weaker signal; Monday is crowded). Have the 2–3 Marcus-type design partners primed *the day before* to comment with real usage stories within the first two hours — comments with real stories, not "congrats on the launch!"
- **Stagger channels:** HN and PH on different days if energy is the constraint (solo founder: it is). Reddit (r/agile, r/ProductManagement, r/ExperiencedDevs) and facilitation communities (SessionLab, IAF, Liberating Structures Slack) go days 2–4, native-tone method posts ("we digitized Delphi/NGT"), link in comments per subreddit norms.

**The number.** One primary channel per day, maximum two. Each demands an 8-hour attended window (§1.3) and you have exactly one of you.

### 1.2 Title discipline

**Principle.** Match the title to what each audience rewards. Per `strategy.md`: **architecture-led on HN, outcome-led on PH.**

**Why.** HN is the one audience that rewards local-first + crypto detail and punishes marketing language; PH readers buy outcomes and skim architecture. Using the PH title on HN reads as fluff; using the HN title on PH reads as jargon.

**Mechanical action.**
- HN: `Show HN: Synergon – anonymous team deliberation that runs entirely in the browser (no backend, E2E-encrypted envelopes in the URL fragment)`
- PH tagline: `Hear your whole team, not just the loudest voice` — with the demo GIF of the *three-round* loop (always demo round 2, consolidation — the thing no polling tool has; never demo a single poll, per the category-confusion risk in strategy.md).
- Both link the landing page, not the app root.

**The number.** Zero superlatives, zero exclamation marks, zero "revolutionary." If the title contains a claim you couldn't defend line-by-line in the comments, cut the claim.

### 1.3 The prepared first comment

**Principle.** On HN, the first comment is the real launch post. Write it the day before; post it within 2 minutes of the submission.

**Why.** It frames every reply that follows, preempts the three predictable objections, and signals you're present and honest before the first critic arrives.

**Mechanical action.** Synergon's first comment must contain, in order:
1. **What it is, one paragraph:** multi-round anonymous-to-peers deliberation (Delphi/NGT), coordinator-driven, runs entirely client-side.
2. **The honest architecture:** static bundle, no backend, responses travel as E2E-encrypted envelopes in URL fragments; link `security-model.md` directly.
3. **The anonymity scope, volunteered before anyone asks:** "It's anonymous to other participants, not to the coordinator — the coordinator's machine does the decryption. The doc spells out exactly what each party can see." (Volunteering this defuses it; being caught understating it is fatal — the audience you're courting is the audience that checks.)
4. **The known weakness, named by you first:** manual copy/paste transport. "Our real competitor is a spreadsheet-and-email Delphi; this is less friction than that, but more than a hosted link. Hosted relay is the obvious future paid tier."
5. **What feedback you want:** "Especially interested in where the flow loses you — first confusion, exact step."

**The number.** ≤300 words. Every sentence either informs or concedes; none sells.

### 1.4 Response cadence

**Principle.** During the attention window, presence is the product.

**Why.** HN threads reward engaged founders and bury absent ones; a substantive question left hanging 3 hours reads as abandonment, and the thread's tone is set by whoever *is* answering.

**Mechanical action.** For the first 8 hours after posting: sweep the thread every 30–60 minutes. Respond to **every substantive comment** — questions, critiques, corrections, real feature discussion. Skip pure noise ("cool!") and never feed pure trolling. Copy every substantive comment into the ledger as you answer it.

**The number.** Target **< 1 hour** response latency to any substantive comment during the 8-hour window; < 4 hours until sleep; answer stragglers next morning. After 48 hours, twice-daily sweeps suffice.

### 1.5 Handling critics

**Principle.** Concede fair points publicly, immediately, and specifically. Never argue.

**Why.** In a public thread the audience is not the critic — it's the 200 silent readers scoring your character. A gracious concession converts a critique into a trust signal; a defensive reply converts one skeptic into a pile-on. And for Synergon specifically, *honesty is the positioning* — the trust story ("nothing to trust but math, read the source") dies the moment you're seen spinning.

**Mechanical action — the "you're right, it's logged" move.** Template: *"Fair point — [restate their point accurately, no weasel words]. That's a real limitation today. Logged: [GitHub issue link, created before you hit reply]."* Creating the issue first and linking it is the move: it proves the concession is operational, not rhetorical.

**What NEVER to do:**
- **Never astroturf.** No sockpuppets, no vote rings, no "hey can you upvote" blasts. HN detects and flags voting rings; getting flagged is unrecoverable this launch.
- **Never argue anonymity semantics.** If someone says "this isn't really anonymous," the answer is scope, not debate: agree with what's true (coordinator sees plaintext), state precisely what holds (peers can't attribute), link the doc. See the worked example in §8.
- **Never promise roadmap dates.** Per launch-plan.md: no feature-roadmap promises in public launch materials. "Logged, and it's the kind of thing a hosted tier would solve" is the ceiling. A promised date is a debt collected publicly.
- **Never claim bare "anonymous."** Always "anonymous to other participants / to peers." This rule has no exceptions, including in your own comment replies written at hour 7 while tired.

**The number.** Concede within one reply. If you notice yourself writing a second reply to the same critic defending the same point — stop, concede, log, disengage.

---

## 2. Stop-the-line rules

**Principle.** During peak attention, the codebase is frozen except for hotfixes. Some bugs stop the line entirely.

**Why.** Launch traffic multiplies both the blast radius of a bug and the blast radius of a botched fix. A risky refactor deployed to a front-page audience is how a bad hour becomes a bad launch.

**What qualifies as a launch-week P0 (stop everything):**
- **Data loss:** a coordinator's workflow is destroyed or unrecoverable (Synergon's known moderate risk — single-browser-profile storage; export/import was a launch blocker for exactly this reason).
- **A security claim is broken:** anything that falsifies a sentence in `security-model.md` or the landing page — e.g., an envelope decryptable by a non-recipient, a response leaking outside the URL fragment. This is worse than data loss here: the trust story is the product.
- **Activation-path breakage:** a new visitor cannot complete the happy path — landing → open app → run the seeded demo workflow → create a round → issue an invite. If the first-run demo is broken, every landing click is wasted spike.

**Mechanical action — fix-or-pull:** On a confirmed P0, start a **4-hour clock**. Within 4 hours either (a) a hotfix is deployed with the full test suite green, or (b) you pull: take the affected path down or post a pinned known-issue notice at the top of landing + the HN/PH thread. Silence past hour 4 is the only unacceptable option — the thread will discover it before you announce it, and being scooped on your own bug costs more than the bug. Announcing it yourself ("found a bug in X, fix deploying / feature pulled, details here") is, for this audience, a trust *gain*.

**The freeze rule:** Days 0–7, no refactors, no new features, no dependency bumps, no "quick cleanups." Hotfixes only, smallest possible diff, and **the full test suite must be green before any deploy** — no exceptions for "it's a one-liner." Feature ideas from the thread go to the ledger, not to `main`.

**The numbers.** P0 → 4-hour fix-or-pull clock. P1 (a real bug with a workaround) → fix within launch week, deployed in a daily batch, suite green. P2 → backlog, after week 1.

---

## 3. Triage discipline for feedback

**Principle — the rule of three.** 1 report is an anecdote. 3 independent reports are a pattern. Act on patterns; log anecdotes.

**Why.** Launch week produces loud, articulate, unrepresentative feedback. The most eloquent HN comment may represent one person; three fumbled emails about the same step represent Priya. Without a counting rule you'll build for whoever wrote best.

**Mechanical action.**
- **Label taxonomy** (GitHub labels, applied to every issue and every ledger row): `P0` (stop-the-line, §2) · `P1` (real bug, workaround exists — fix this week) · `P2` (bug, minor — backlog) · `idea` (feature request — log, never promise) · `wont-do` (conflicts with positioning: telemetry, accounts, server-required features, anything moving a locally-runnable feature behind a future paywall — close politely, cite the reasoning).
- **Capture EVERY verbatim.** Exact words, not your paraphrase, into the ledger (§0) — paraphrase launders out the confusion that is the data. "How do I get the answers back in??" is signal; "user confused by import" is you already deciding what it means.
- **Independence check before acting:** three reports count as a pattern only if they arrived independently (different people, not replying to each other in one thread). Ten upvotes on one comment = one report with applause.

**Email SLA and reply shape.** Every email to synergonlabs@gmail.com gets a human reply within **24 hours**. The reply shape is **thank + log + no roadmap promise**:
1. Thank specifically (quote their point back — proves a human read it).
2. Log it visibly (link the GitHub issue you just created, or say where it's recorded).
3. Do not promise. Not "coming soon," not "next month," not "high on our list." Ceiling: "this is logged and it's exactly the kind of signal that decides what we build next."
4. One question back, if any: "what were you trying to decide when you hit this?" — converts a report into an interview.

**The numbers.** 3 independent reports of the same confusion → schedule the UX hotfix this week (subject to §2 freeze discipline: smallest diff, suite green). 24h email SLA, no exceptions during launch week. 10 distinct unprompted "I'd pay for links that just work" mentions → that's the Tier-1 relay trigger from launch-plan.md; count them in the ledger from day 0.

---

## 4. Numbers that drive decisions

**Principle.** Decide from thresholds set before launch, not from vibes at hour 30.

**Why.** Mid-launch you will be sleep-deprived and emotionally invested; every metric will look like whatever you need it to look like. Pre-committed thresholds are the only defense. Synergon has no telemetry — by design — so these run on landing analytics (Plausible), GitHub stars, inbound volume, and the ledger.

**Week-1 leading indicators** (derived from launch-plan.md's 90-day targets: 25% landing→app-open, 300+ opens/wk, 500 stars, 500 newsletter):

| 90-day target | Week-1 leading indicator (healthy) |
|---|---|
| Landing → app-open 25% | ≥ 10–15% by day 3 (launch traffic is colder than steady-state) |
| 300+ app opens/wk | ≥ 300 opens in launch week itself (spike-driven; expect a post-spike crater — judge the *rate* after day 10, not day 7) |
| 500 GitHub stars | ≥ 50–100 in week 1 if the HN post front-paged; ≥ 20 if not |
| 500 newsletter signups | ≥ 40–60 in week 1 |
| ≥50% "next real decision?" yes-rate | ≥ 5 substantive inbound conversations (email/issue) you can ask the killer question in |

**The decision table:**

| Observation | Threshold & timing | Diagnosis | Action |
|---|---|---|---|
| Landing → app-open rate low | < 10% by day 3 | Messaging problem — the hero isn't earning the click | Rewrite the landing hero (lead with the outcome per strategy.md Amendment 2; re-check the demo GIF shows round 2) **before** spending any remaining channel (Reddit posts, community posts wait) |
| Opens high, inbound ~zero | > 200 opens but < 3 emails/issues by day 4 | Feedback friction, or shallow visits that never reach value | Add a low-friction exit prompt in-app ("2 questions, no signup, mailto link"); personally email every newsletter signup asking for 15 minutes; verify the demo workflow actually runs |
| Same confusion, multiple sources | ≥ 3 independent reports | Real UX defect | Hotfix this week (§3), smallest diff, suite green |
| HN post not catching | < 5 points in the first hour | Wrong day/hour/title — not necessarily wrong product | **Let it die.** Do not delete, do not repost today, do not ask friends to vote. Retry in 2–4 weeks with a different angle (e.g., lead with the Delphi-method story instead of the crypto story) — HN norms tolerate a re-attempt after a gap, punish an immediate repost |
| HN front page | Top 30 for > 2 hours | The spike is live | Cancel everything else that day; you are on thread duty for 8 hours (§1.4); alert design partners the wave is coming |
| PH not featured | No feature by ~6 a.m. PT launch day | PH will drive little traffic | Downgrade PH to background: check twice daily, redirect the day's energy to the community channels; treat PH as a backlink, not an event |
| PH featured / top-10 | Featured on the homepage | PH is live | Same duty cycle as HN front page; make sure design-partner stories land in the first 2 hours |
| Paid-relay demand signals | ≥ 10 distinct unprompted mentions (any week) | Tier-1 trigger per launch-plan.md | Don't build during launch week — record names, email them first when relay work starts |
| Traffic cratered post-spike | Day 6–7 opens < 10% of peak day **and** < 3 recurring themes in ledger | Spike didn't convert to a loop | Day-7 retro (runbook) decides: adjust channel vs. message vs. product — with this data on the table |

---

## 5. Daily cadence, day 0 → day 7

**Principle.** Same sweep, same order, twice a day. Ritual beats vigilance.

**Why.** Six channels with no telemetry means signal arrives scattered (HN thread, PH page, GitHub issues, email inbox, Reddit threads, Plausible dashboard). A fixed sweep order is the only way nothing rots for 20 hours, and a fixed evening debrief is the only way the week accumulates into decisions instead of adrenaline.

**Mechanical action.** Full checklists live in [references/launch-week-runbook.md](references/launch-week-runbook.md). The spine:
- **Morning sweep (~45 min):** email → GitHub issues → live threads (HN/PH/Reddit) → Plausible → update ledger → pick the day's ONE fix (if any qualifies under §2/§3).
- **Evening debrief (~20 min):** answer three questions in the ledger's daily-log tab: **What broke? What confused? What resonated?** — each answer a verbatim or a link, not an impression. Then check today's numbers against the §4 table.
- **Day 7 retro (90 min, non-negotiable):** produces exactly one of four verdicts for the next two weeks — **persevere** (thresholds green: keep the plan, start the Phase-3 content engine), **adjust channel** (product resonated where seen, wrong audiences: reweight toward whichever channel produced ledger signal), **adjust message** (traffic fine, click-through/comprehension bad: rewrite hero/titles, retry HN with the alternate angle in 2–4 weeks), or **adjust product** (message landed, users hit a wall — usually transport friction, the pre-identified #1 risk: fix the top rule-of-three pattern before spending any more attention).

**The number.** Two sweeps daily minimum, every day including days 5–7 when it feels dead — day-6 emails are often the most thoughtful, written by people who actually used it for days. Debrief every evening; ≤ 3 sentences per question is fine, zero sentences is not.

---

## 6. Energy and honesty

### 6.1 Solo-founder pacing

**Principle.** Define the on-window in advance; outside it, you are off.

**Why.** You cannot sustain 16 hours/day of thread-watching, and the failure mode is specific: the tired, defensive comment reply at hour 14 that costs more trust than the whole day earned. Attention decays in ~48h per channel (§0) — pacing is why you stagger channels, one launch event per day.

**Mechanical action.** On launch day: one 8-hour on-window (posting time + 8h), a hard stop, one final sweep before sleep. Days 1–7: the two daily sweeps plus at most one afternoon block for the day's fix. Write the risky replies (critics, security questions) in a scratch file first, re-read once, then post. After the hard stop, notifications off — a comment answered well at 7 a.m. beats one answered badly at 1 a.m.

**The number.** 8-hour on-window on a launch day, ~2 attended hours on ordinary days. If you catch yourself refreshing the thread outside a window twice, close the laptop — that's the tell.

### 6.2 The honesty rules specific to this product

**Principle.** The measurement gap and the anonymity boundary are features of the positioning. Never trade them for better launch numbers.

**Why.** Synergon's differentiation *is* the trust story: local-first, no phoning home, nothing to trust but math. Both temptations below get discovered by exactly the security-literate audience the launch courts, and each discovery is permanent.

**Mechanical action.**
- **Never overclaim anonymity.** Every sentence you write in public — titles, comments, replies, tweets — says "anonymous to other participants" / "peer-anonymous," never bare "anonymous." The coordinator can read plaintext; say so before being asked (§1.3). When tired, the qualifier is the first thing you'll drop — that's why it's a rule, not a preference.
- **Never quietly add telemetry to get better numbers.** No "just a tiny error reporter," no session replay, no fingerprinting the app page — not during launch week, not after. The approved measurement surface is: privacy-friendly landing analytics (page loads, not behavior), GitHub stars, inbound volume, and the opt-in **default-off, disclosed** count-only completion ping from launch-plan.md. Flying partially blind is the deal you advertised.
- **Work around the gap with qualitative channels:** the ledger, the 24h-answered inbox, "what were you trying to decide?" follow-up questions, and 5 user interviews/month starting week 2. When an investor-brained voice (including your own) says "but we can't see activation," the answer is: that's the pitch, and the interviews are the instrument.

**The number.** Zero exceptions, forever. And the qualitative floor that replaces telemetry: ≥ 5 real user conversations by day 14, or you schedule outreach until you have them.

---

## 7. Worked examples

### 7.1 Hostile HN comment on the anonymity claim

> **Commenter:** "Calling this 'anonymous' is dishonest. The coordinator decrypts everything — they can trivially correlate who sent what by timing or by who they sent each link to. This is anonymity theater."

**Bad reply (never):** "Actually if you read the docs you'd see we never claimed full anonymity. Timing correlation is a stretch in practice…" — defensive, condescending, argues semantics, and the thread will side with the commenter.

**Good reply:**

> You're right about the boundary, and it's an important one: Synergon is anonymous *to other participants*, not to the coordinator. The coordinator's machine decrypts responses, and yes — a coordinator who issues per-person links and watches arrival timing could correlate authorship. We say exactly this in the contributor UI before anyone submits, and the threat model doc spells out what each party can see: [link to security-model.md].
>
> The timing-correlation point is fair and the doc should call it out explicitly — logged: [issue link]. Coordinator-blind anonymity (server-assisted crypto) is a designed-but-deferred upgrade; it needs infrastructure we deliberately don't run today.

Why it works: concedes the true part in the first sentence, states the precise claim without retreating from it, converts the novel sub-point (timing) into a logged issue created *before* replying, and mentions the deferred upgrade without promising a date.

### 7.2 Feature-request email

> **From a Priya, day 3:** "Ran this with my team yesterday — the consolidation round was genuinely great. But chasing 8 people to paste responses back nearly killed it. Any chance of Slack integration or just… normal links? Would honestly pay for that."

**Good reply:**

> Thanks for this — "the consolidation round was genuinely great, but chasing 8 people nearly killed it" is about the most useful sentence anyone has sent us this week.
>
> You've hit the tradeoff at the center of the design: everything runs on your machine with no server, which is why there's no account, nothing for IT to review — and also why responses travel by copy/paste instead of a link that just works. A hosted relay that fixes exactly this is the obvious first paid tier; you're now formally counted in the "would pay for links that just work" column, which is the signal that decides when we build it. Logged here so you can follow along: [issue link].
>
> No promises on timing — the free local product has to stand on its own first. One question back, if you have 30 seconds: what was the decision you ran the team through? Helps us far more than any feature vote.

Why it works: thanks with their own words, explains the constraint as a choice rather than an apology, logs visibly, explicitly tallies the Tier-1 demand signal (§4), makes no date promise, and ends by converting the report into interview data.

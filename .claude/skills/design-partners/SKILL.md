---
name: design-partners
description: Operating procedure for finding and onboarding Synergon's 8–12 pre-launch design partners (launch-plan.md Phase 1) — sourcing, qualification, pipeline arithmetic, 48-hour onboarding, debrief operations, close-the-loop messaging, and the Phase-2 gate math. The agent assists a solo founder who sends all messages and takes all calls; the agent builds sourcing lists, drafts and personalizes outreach and follow-ups, qualifies leads, tracks the pipeline, assembles debrief prep packs, logs verbatims, and computes the gate. Invoke when: finding or sourcing partner candidates; drafting or personalizing outreach, bumps, or follow-ups; qualifying or disqualifying a lead; onboarding a new partner; scheduling, preparing, or logging a debrief; maintaining the pipeline tracker; sending a "you said X, we shipped Y" note; or judging the ≥70% multi-round / ≥50% killer-yes Phase-2 gate.
---

# Design Partners

Operating procedure for recruiting and running Synergon's Phase-1 design-partner program: 8–12 hand-picked facilitators, each running ≥2 real deliberations plus one 30-minute debrief (`docs/gtm/launch-plan.md`, Phase 1).

The collateral already exists — do not duplicate it, reference it:
- **`docs/gtm/design-partner-kit.md`** — the outreach message, onboarding steps, 30-min debrief script, tracking fields, and the Phase-2 gate definition. This is the single source of truth for message wording and the debrief questions.
- **`docs/gtm/personas.md`** — Priya (facilitating team lead, the beachhead), Marcus (independent facilitator/consultant, the multiplier), Renata (compliance-bound buyer — **not** a design-partner target).
- **`docs/gtm/launch-plan.md`** — Phase 1 scope and the gate to Phase 2.
- **`.claude/skills/launch-week/SKILL.md`** §3 — the learning ledger and rule-of-three conventions; debrief verbatims flow into the same ledger under the same rules.

Division of labor: the agent does sourcing lists, message drafts, pipeline tracking, prep packs, gate math. **The human sends every message and takes every call.** Never send outreach on the founder's behalf; always hand off drafts.

Message templates beyond the kit (day-4 bump, scheduling, pre-debrief confirmation, shipped-it note, ghost replacement): [references/pipeline-playbook.md](references/pipeline-playbook.md).

Every section follows the house shape: **principle → why → mechanical action → the number that drives it.**

---

## 0. Prime principle: partners are hired to falsify, not to flatter

**Principle.** A design partner's job is to try to break the two things nobody has measured — the **second round** (per-round link-redistribution cost) and **phone contributors** — with a real group and a real decision on the line. Recruit people who have a decision pending and a reason to quit; their friction is the data. A partner who breezes through the demo and says nice things has produced zero information.

**Why.** Phase 1 substitutes for telemetry (launch-plan.md): the only instrument is partners hitting real walls and reporting them verbatim. Friendly enthusiasts who never run round 2 with a real team cannot falsify the transport-friction hypothesis — and it is precisely the hypothesis the Phase-2 gate tests. Better to learn "round 2 isn't worth it" from 10 friendlies than from a Product Hunt comment section.

**Mechanical action.** Every sourcing, qualification, and onboarding decision below optimizes for *probability the person runs two real multi-round sessions*, not for enthusiasm, seniority, or audience size. When ranking a candidate list, sort by "has a nameable decision in the next 2–3 weeks" first.

**The numbers.** 8–12 active partners, no more — because (a) **debriefs are the bottleneck: 2 calls/week is the sustainable solo ceiling**, so 8–12 debriefs fit the ~4-week Phase-1 window with slack, and (b) the rule of three (launch-week §3) needs **≥3 independent Priyas** hitting the same wall before it counts as a pattern — under 8 partners the rule of three starves; over 12, debriefs queue past the phase.

---

## 1. Sourcing: three tiers, worked in order

**Principle.** Warm network first, communities second, targeted cold third. Exhaust each tier before descending — reply rates fall an order of magnitude per tier.

**Why.** Warm 1st-degree contacts who run retros/workshops reply at ~30–50%; targeted cold LinkedIn at ~5–10%. Every warm slot filled saves ~8 cold messages of the founder's time. And in communities, recruitment blasts get you banned from exactly the rooms Phase-2 launch needs intact.

**Mechanical action.**
- **Tier 1 — warm network.** Build a list from the founder's 1st-degree contacts: anyone who runs retros, planning, workshops, or research panels. Draft each message from the kit's outreach template with a genuinely personal first line (a session they ran, a post they wrote).
- **Tier 2 — communities, participation before solicitation.** Priya lives in r/agile, Lenny's Newsletter community, Mind the Product; Marcus lives in SessionLab, IAF chapters, LinkedIn consulting content (personas.md "where she/he lives"). The pattern is **DM-after-engaging**: the founder participates in a thread on facilitation pain, then DMs individuals who expressed the pain. **Never cold-post a recruitment blast to a community** — it burns the channel that Phase-2 launch posts depend on.
- **Tier 3 — targeted cold.** Build LinkedIn search lists on: `"agile coach"`, `"scrum master"`, `"facilitator"`, `"org development"` (add `"workshop"` and `"retrospective"` as content-activity filters — prefer people *posting about* facilitation over people with the title only). 2–3 slots reserved for hand-picked Marcuses per launch-plan.md.

**Qualify (all three must hold):**
1. Actually facilitates groups **≥1×/month** (recent, verifiable — a retro cadence, a client roster, a workshop calendar).
2. Has a **nameable upcoming decision** ("our Q3 risk review", "client offsite on the 20th") — not "sounds cool, someday."
3. Has a **3–8 person team/group available** to actually respond to rounds.

**Disqualify:**
- **Tool collectors** — enthusiastic, no session on the calendar. They will run the demo, never a real round, and consume a debrief slot producing nothing.
- **Renata-types** — regulated-org decision leads. Wrong phase (personas.md: content/SEO and patience play, Tier-2 buyer). Politely park them for the future.
- **Anyone who'd only ever run the demo** — if you cannot name their decision and their group, they cannot falsify anything.

**The numbers.** Expect ~30–50% reply warm, ~5–10% reply cold. Fill Tier 1 before touching Tier 3. Persona mix per launch-plan.md: mostly Priyas, **2–3 Marcuses**.

---

## 2. Pipeline arithmetic

**Principle.** Work backward from 8–12 seated partners to the required top of funnel, and let stage-conversion numbers — not optimism — set the outreach volume.

**Why.** Every stage leaks. Without the arithmetic the founder contacts 15 people, seats 3, and discovers the shortfall four weeks in — after the Phase-1 window is spent.

**Mechanical action.** Track every candidate through these stages, with blended (warm+cold) planning conversions:

| Stage | Conversion from previous | Running count (from 50 contacted) |
|---|---|---|
| contacted | — | 50 |
| replied | ~40% blended | ~20 |
| agreed | ~55% of replies | ~11 |
| onboarded (first workflow created) | ~85% of agreed | ~9–10 |
| session 1 run | ~80% of onboarded | ~8 |
| session 2 run | ~75% of session-1 | ~6–7 |
| debriefed | ~90% of session-2 | ~6 |

So: **contact 40–60 to seat 8–12** agreed/onboarded partners, and expect only ~6–8 to complete the full two-session + debrief arc — which is exactly why the gate denominators in §7 matter.

**Follow-up discipline:** exactly **one bump at day 4–5** after the initial message (template in the playbook), then stop. Silence is an answer; a second chase converts a non-reply into an annoyed non-reply and costs founder credibility in small communities.

**Tracker — and the PII rule.** Columns: `name · contact channel · persona type (Priya/Marcus) · source tier (warm/community/cold) · org size · their named decision · stage · last-touch date · next action + owner · sessions run · rounds per session · debrief date · killer-question answer · would-pay-for-relay · standout verbatim` (the last six are the kit's tracking fields — the gate reads from them).

**The tracker contains names and employer details. It must NEVER land in the public repo.** Not in `docs/gtm/partner-pipeline.md`, not gitignored-in-repo, not in a commit that later gets reverted — the Synergon repo is public and its visible source *is the trust pitch*. Keep the tracker in a private spreadsheet or local note **outside the repository** (e.g. `~/synergon-private/partner-pipeline.md` or Google Sheets). If the founder asks you to create the tracker inside the repo, refuse and say why. Only anonymized aggregates (stage counts, gate percentages) may appear in repo docs.

**The numbers.** 40–60 contacted → 8–12 seated. One bump, day 4–5, then stop. Zero PII in the public repo, zero exceptions.

---

## 3. Onboarding: first workflow inside 48 hours

**Principle.** Time from "yes" to their first real workflow must be **< 48 hours**, and the two unknowns get seeded explicitly at onboarding — not discovered at debrief.

**Why.** Momentum from a "yes" decays like launch-week attention does: a partner who hasn't created a workflow within two days joins the ~15–20% who silently stall at each subsequent stage (§2 table). And if the second-round ask and the phone-contributor ask aren't planted up front, partners default to the path of least resistance — one round, all-desktop — and Phase 1 ends without exercising exactly the two things it exists to measure.

**Mechanical action.** Within hours of a "yes", draft for the founder to send:
1. The kit's **onboarding steps verbatim** (design-partner-kit.md "Onboarding steps") — do not rewrite them — plus **one personal line** referencing their named decision ("your Q3 risk review sounds like a perfect first workflow").
2. **The concierge move:** an explicit offer of async support during their first issue round — "while your first round is live, email/message me anytime and I'll answer same-day." Solo-scalable for ≤12 partners and it converts first-round confusion into captured verbatims instead of silent churn.
3. **Seed the two unknowns, by name:**
   - *The second-round ask:* "The second round matters most to us — that's the multi-round redistribution cost nobody has measured. Please push through to round 2 even if round 1 felt like enough."
   - *The one-phone-contributor ask:* "If you can, make sure at least one contributor responds from a phone — that's our other blind spot."
4. **Schedule the debrief now** (§4) — in the same message thread as the onboarding steps.

**The numbers.** < 48h from yes to first workflow (if the tracker shows a "yes" older than 48h with no workflow, that's today's next-action). One personal line per onboarding message — zero is a form letter, three is noise. Two seeded asks: round 2 and one phone contributor, every partner, no exceptions.

---

## 4. Debrief operations

**Principle.** The debrief is scheduled at the moment the partner says yes to session 1 — never "after your sessions, we'll find a time." The agent assembles a prep pack before every call, and verbatims land in the learning ledger the same day.

**Why.** Debriefs are the bottleneck resource (2/week, §0); an unscheduled debrief after a completed session decays into a ghost — the session-2→debriefed leak in §2 is mostly unscheduled calls. And same-day verbatim capture is the launch-week §3 rule: paraphrase launders out the confusion that is the data, and a debrief transcribed three days later is paraphrase.

**Mechanical action.**
- **At the yes:** draft the scheduling message (playbook template) offering 2–3 concrete slots ~1–2 weeks out — after their likely session-2 date, inside the 2-calls/week budget. Log the date in the tracker.
- **Day before the call:** send the pre-debrief confirmation (playbook template).
- **Prep pack** — assemble for the founder before each call, from the tracker and any correspondence:
  1. Their pipeline row (persona, named decision, sessions run, rounds per session, stage history).
  2. Every email/message they've sent, with friction points highlighted.
  3. **Which rounds they ran** — and specifically whether they reached round 2 and whether any contributor was on a phone; flag either gap so the founder probes it live using the kit's debrief-script questions 2 and 3.
  4. The kit's debrief script itself (design-partner-kit.md "Debrief script") — the founder runs it as written, especially the killer question and the $10/month relay tally.
- **Same day after the call:** log verbatims — exact words — to the learning ledger (launch-week §0/§3 format: `date | channel | verbatim quote | theme | label`, channel = `debrief:<name>`), and update the tracker row: killer-question answer, would-pay-for-relay, standout verbatim, rounds completed.
- **Rule of three across partners:** ≥3 *independent* partners reporting the same wall (not echoing each other) → it's a pattern → propose the concrete action (a fix, a copy change, or — for transport friction — the §7 relay conversation). 1–2 reports → log and watch.

**The numbers.** Max 2 debrief calls/week. Prep pack ≥24h before each call. Verbatims logged same day, zero-day lag. 3 independent reports → action; fewer → ledger.

---

## 5. Closing the loop: "you said X, we shipped Y"

**Principle.** When anything ships that a partner asked for or complained about, they hear about it personally — within a week — in a message that quotes their own words back.

**Why.** This is the single highest-leverage retention-and-advocacy move in the program: it proves the "you shape the roadmap" promise from the kit's deal was real, it reactivates stalled partners more reliably than any nudge, and it is what turns a Marcus into someone who *wants* to tell the launch-day story. It costs one short message.

**Mechanical action.**
- After any deploy/fix, sweep the ledger and tracker for partners whose verbatim matches what shipped. Draft the you-said-X-we-shipped-Y note (playbook template) for each: their exact quote, what shipped, one-line ask to try it in their next round.
- **Marcus-types and the launch-day story:** per launch-plan.md Phase 2, Marcuses are primed to comment on Product Hunt with real usage stories. Ask for that commitment **only after their second session succeeded** — a story request before they've experienced round 2 is asking them to vouch for something they haven't done, and it poisons the debrief candor you hired them for.

**The numbers.** Shipped-it note within **7 days** of the deploy, to every matching partner. Launch-story ask: only after session 2 is confirmed complete in the tracker — never earlier.

---

## 6. Ghosts and slot recycling

**Principle.** A partner slot is a scarce debrief-capacity slot; a ghost holds one hostage. One gentle nudge, then recycle.

**Why.** With 8–12 slots and a ~4-week window, a partner who stalls for two weeks has consumed ~half the phase producing nothing, and the pipeline (§2) says a replacement takes ~a week to source and onboard from the warm backlog — so the decision point must come early.

**Mechanical action.** Tracker sweep (do it whenever the skill is invoked for pipeline work): any onboarded partner with **no session in 14 days** → draft the gentle replace-a-ghost nudge (playbook template — an easy out, not a guilt trip). No reply or no session within 5 more days → mark the row `recycled`, keep them on the launch announcement list, and promote the next candidate from the replied/agreed backlog.

**The numbers.** 14 days without a session → one nudge. Nudge + 5 days of silence → recycle the slot. Exactly one nudge — a ghost is also an answer (it's transport-friction data: log *why* they stalled if they ever say).

---

## 7. The Phase-2 gate, mechanically

**Principle.** The gate is arithmetic on the tracker, computed on demand — not a vibe at the end of Phase 1: **≥70% of partners complete a multi-round workflow with a real team AND ≥50% answer the killer question yes** (design-partner-kit.md, launch-plan.md).

**Why.** Pre-committed thresholds are the defense against a sleep-deprived founder squinting at mixed results and seeing whatever the launch date needs (the launch-week §4 principle, applied a phase earlier). The gate exists to catch transport friction — the second-round redistribution cost — before it's discovered publicly.

**Mechanical action.** Whenever asked to judge the gate (or when ≥6 debriefs are logged), compute from the tracker:
- **Denominator:** partners who were onboarded and given a real chance (recycled ghosts count in the denominator — a partner who quit at round 2 *is* the transport-friction signal, and excluding them cooks the gate).
- **Multi-round completion rate** = partners with ≥1 workflow reaching round 2 with a real team ÷ denominator. Pass ≥ 70% (e.g., 10 partners → ≥7).
- **Killer-yes rate** = debriefed partners answering yes to "would you run your next real decision through this?" ÷ debriefed partners. Pass ≥ 50% (e.g., 8 debriefs → ≥4 yes).
- Report both numbers with numerators/denominators shown, plus the would-pay-for-relay tally (the Tier-1 trigger counts toward launch-plan.md's 10-distinct-mentions threshold).

**On a miss:** per launch-plan.md — **pause the public launch**, then diagnose which leg failed:
- Multi-round completion < 70% and debrief verbatims cluster on link redistribution → transport friction is confirmed; put "pull the hosted relay forward" on the table as a real option, with the relay-tally count as supporting evidence.
- Completion fine but killer-yes < 50% → the friction isn't transport; mine debrief question 4 (did the output change their decision?) for whether the *value* leg failed, and re-plan from that.
- Either way: the output of a miss is a diagnosis memo with verbatims and counts, not a rescheduled launch date.

**The numbers.** ≥70% multi-round AND ≥50% killer-yes, both legs required. Compute with visible numerators and denominators. Miss → pause launch + diagnose; never round 65% up to "basically passing."

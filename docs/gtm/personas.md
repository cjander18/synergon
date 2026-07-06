# GTM Personas

> These are *marketing* personas — who we acquire and how they buy. They map
> onto the *product* personas ([Dana](../personas/coordinator.md) /
> [Sam](../personas/contributor.md)), which describe in-app roles. Every GTM
> persona below acts as a Dana; their teams are Sams.

Priority order matters: Priya is the launch beachhead, Marcus is the
multiplier, Renata is the future buyer of paid tiers. We speak to them in that
order, not simultaneously.

---

## 1. Priya — the facilitating team lead (PRIMARY / beachhead)

**Who:** Engineering manager, product manager, or agile coach at a 30–500
person company. Runs retros, planning, prioritization, incident reviews, and
risk workshops. 5–15 direct collaborators per session.

**Trigger moments (when she goes looking):**
- A retro where the same two people talked and nothing new surfaced.
- A prioritization meeting that ended where the senior-most person started.
- Preparing a "what are our top risks?" exercise and dreading the spreadsheet.

**Where she lives:** r/agile, r/ExperiencedDevs, LinkedIn PM/EM content,
Lenny's Newsletter community, Mind the Product, SessionLab & Liberating
Structures communities, internal #facilitation Slack channels.

**Message that lands:** "Your retro produced the loudest person's opinion.
Here's the 40-year-old method that fixes that — now it takes 10 minutes
instead of a spreadsheet afternoon."

**What she needs from the product:** a first workflow she can run *today*
without asking anyone's permission; a demo she can show her team; results that
look credibly neutral when she presents them.

**Objections:** "My team won't do the copy/paste dance." → Position rounds as
async, low-effort (2 minutes per contributor per round); acknowledge the
friction honestly and note the hosted option is coming. "Another tool?" → No
account, no install, nothing for the team to adopt — they just click a link.

**Value to us:** activation volume, word-of-mouth inside companies, the
retention signal that triggers Tier 1.

---

## 2. Marcus — the independent facilitator/consultant (SECONDARY / multiplier)

**Who:** Independent or boutique-firm facilitator, org-development consultant,
or fractional exec who runs workshops *for clients* — offsites, strategy
sessions, expert panels, post-mortems. Runs 2–10 sessions a month across
multiple client organizations.

**Trigger moments:** a client whose IT forbids external SaaS; an expert-panel
engagement that is literally a Delphi study; wanting a signature
"bias-proof" methodology to differentiate his practice.

**Where he lives:** IAF (International Association of Facilitators) chapters,
SessionLab blog/community, LinkedIn consulting content, ICF/OD networks,
conference hallway tracks.

**Message that lands:** "Run a client-grade Delphi panel with zero client IT
involvement — no accounts, no data ever touching your servers or theirs. Your
deliverable is the consolidated, ranked output."

**What he needs:** professional-looking outputs he can paste into a client
deck; the ability to run the *same* structured process across clients;
credibility materials (the method documentation in
[concepts.md](../concepts.md) is his sales collateral too).

**Objections:** "Can I bill for something free?" → He bills for facilitation,
not software; free tooling with a rigorous method *raises* his margin and his
credibility.

**Value to us:** each Marcus exposes Synergon to many organizations per month
— the highest-leverage advocate we can recruit. Worth direct outreach (10–20
hand-picked facilitators as design partners; see launch plan).

---

## 3. Renata — the compliance-bound decision lead (TERTIARY / future buyer)

**Who:** Director/VP in a regulated or security-sensitive org — healthcare,
finance, defense-adjacent, public sector, or any company with a strict
security review for new SaaS. Needs candid internal input (risk assessments,
clinical/technical consensus, investment committees) but cannot send it to a
third-party cloud.

**Trigger moments:** a consensus exercise blocked by security review; a
whistle-quiet risk process where nobody wrote down what everyone knew; an
audit finding about decision documentation.

**Where she lives:** industry-vertical communities, GRC/security networks,
peer forums; reached mostly via content/SEO ("anonymous team input without a
server", "Delphi method tool on-premise") and via Marcus-type consultants.

**Message that lands (privacy-first ordering — the exception to Amendment 2):**
"The deliberation tool with no server: input stays on your machines,
end-to-end encrypted in transit, nothing for security review to reject. And
it's the full Delphi method, not a poll."

**What she needs:** the [security model](../architecture/security-model.md)
published and linkable; precise anonymity language (peer-anonymous — her
auditors will read the fine print, and our honesty here *is* the pitch);
eventually: self-hosted relay, SSO, admin controls — she is the Tier 2 buyer.

**Objections:** "Unvetted tool from where?" → static bundle she can host
herself; source visible; threat model documented. (This is where the
open-source/license decision has GTM teeth.)

**Value to us:** future revenue. Not a launch target — a content/SEO and
patience play.

---

## Adjacent free segment worth serving cheaply: the Delphi researcher

Academic and clinical researchers run formal Delphi studies today with paid
niche SaaS or spreadsheets. They arrive via search ("free Delphi study tool"),
tolerate friction well, cite tools in papers (durable SEO), and cost us
nothing. No dedicated marketing — just one landing page/blog post that speaks
their language ("rounds," "panel," "consensus threshold") and captures the
search demand. They validate the method story that Priya then trusts.

# Paid Tier Plan

> Extends [strategy.md](strategy.md)'s business-model sequencing into a
> buildable plan: what Tier 1 is, what it costs to run, how payment works, and
> the gates that keep us from building it before anyone wants it. Drafted
> 2026-07 — deliberately ahead of the demand trigger, so the plan exists when
> the trigger fires.

## The two rules that everything below obeys

1. **Never paywall a locally-runnable feature.** Free = everything that runs
   on the user's device, forever. Paid = only things that inherently require
   infrastructure we operate. This boundary is principled and marketed; break
   it once and the trust positioning is gone.
2. **Don't build before the trigger.** Tier 1 work starts when **≥10 distinct
   users unprompted** ask for hosted links / complain about copy-paste
   *while continuing to use the product* (retention + demand, not just
   complaints). The tally lives in the learning ledger; the design-partner
   debrief script already asks the priming question.

## Tier structure

### Free — forever (unchanged)

Everything that exists today. No feature currently shipped ever moves behind
the paywall. The free app also never gains license checks, accounts, or
upsell nags beyond one quiet "hosted links available" line where transport
friction is felt (the issue/re-issue panel).

### Tier 1 — "Hosted links" (the relay)

**The pitch:** links that just work. No copy-paste, no manual collection.

| Feature | What it means | Why it's paid-side |
|---|---|---|
| Hosted invitation links | Contributor opens a short `https://…/i/<token>` link; the encrypted envelope is fetched from the relay instead of living in the URL | Requires a server |
| Automatic response return | Contributor clicks "Send" — the encrypted response lands in the relay; Dana's console pulls it in automatically | Requires a server |
| Response notifications | Email to the coordinator as responses arrive ("2 of 5 in") | Requires a server + email |
| Encrypted workflow backup/sync | Workflow blob, client-side encrypted under a coordinator passphrase, stored on the relay; restore on any device | Requires storage |
| Longer-lived rounds | Relay-held envelopes survive re-shares and lost chat messages; 90-day retention | Requires storage |

**What the relay must never do:** see plaintext, see passwords, or hold keys.
It stores and forwards **ciphertext envelopes only** — the exact bytes that
travel by copy-paste today, same crypto, same AAD-authenticated headers.
Passwords remain out-of-band between Dana and Sam. The trust story evolves
from "no server" (free) to "a server that only ever sees ciphertext, and
here's the code and the ADR" (paid). Both are honest; the free tier keeps the
stronger claim, which is exactly the right shape: privacy maximalists stay
free, convenience buyers pay.

**Pricing:**
- **$10 / coordinator / month, or $96/year.** Contributors never pay, never
  sign up — that asymmetry matches the value flow (Dana budgets, Sams click)
  and keeps virality intact.
- **Trial: first two hosted workflows free**, not time-boxed. Facilitation is
  episodic — a 14-day clock lapses between a monthly retro cadence; a
  usage-based trial survives it.
- Marcus (consultants) pay the same rate and expense it. Renata's org needs
  (SSO, self-hosted relay, admin, invoicing) are **Tier 2 — explicitly out of
  scope** until Tier 1 has paying users and inbound org asks; parking-lot
  price anchor ~$1–2k/yr self-hosted license.

## Architecture (why this is cheap to build)

ADR-0002's Envelope/Channel split was designed for this day. The client work
is **one new `EnvelopeChannel` adapter** (`RelayChannel`) behind the existing
port — domain, crypto, and use-cases untouched. The new build is the relay
itself:

**Relay API sketch** (boring on purpose):
```
POST /v1/envelopes            auth: coordinator  → {token}        (store invitation ciphertext)
GET  /v1/envelopes/:token     public             → envelope       (contributor fetch)
POST /v1/responses/:token     public             → 204            (contributor return)
GET  /v1/inbox                auth: coordinator  → envelopes[]    (Dana's pull; delete-on-ack)
```
Plus magic-link email auth for coordinators (no passwords to store) and an
email-notification hook on response arrival.

**Runtime recommendation: Cloudflare Workers + D1/R2.** Global edge, no
servers to patch, generous free tier then ~$5/mo — envelopes are kilobytes and
volumes are small, so infrastructure cost is noise (<2% of revenue at any
realistic scale). Fallback if Workers chafes: a single small Fly.io/Hono +
SQLite service — the API is four endpoints; portability is trivial.

**Repo split (open-core, per strategy.md):** the `RelayChannel` client
adapter ships MIT in this repo; the relay server lives in a separate
commercial repo. Publishing the relay's *protocol* (an ADR) keeps the
security story reviewable even where the server code isn't.

## Payment infrastructure

**Decision: use a merchant of record (MoR), not raw Stripe.**

| Option | Fees (approx) | Handles global sales tax/VAT | Fit |
|---|---|---|---|
| Stripe direct | ~2.9% + 30¢ | **No — you are the merchant**; EU VAT, UK, US state nexus are your problem | Right at scale, wrong for a solo founder's first SKU |
| **Paddle** | ~5% + 50¢ | Yes | Mature SaaS MoR; strong for invoicing later (Tier 2) |
| **Lemon Squeezy** | ~5% + 50¢ | Yes | Simple checkout + subscriptions + license API; Stripe-owned |
| **Polar** | ~4% + 40¢ | Yes | Developer/open-source-native MoR, built on Stripe; usage-based support |

The ~2-point premium over raw Stripe is the cheapest tax-compliance
department money can buy. **Recommendation: Polar or Lemon Squeezy for v1**
(developer-native, fast setup, subscriptions + webhooks); revisit Paddle when
Tier 2 orgs want invoices and POs, and raw Stripe only past ~$10k MRR if fees
ever dominate.

**Entitlement flow (no license keys in the app, ever):**
checkout (MoR-hosted page, linked from a pricing page) → webhook →
provision/flag the coordinator's relay account → the app discovers the
entitlement only when the user signs in to the relay. The free app remains
account-free and check-free; billing state lives entirely server-side.

## Sequencing and gates

| Phase | Gate to enter | Work | Exit |
|---|---|---|---|
| **G0 — now** | — | Nothing but tallying. Optional cheap demand probe: a "Want hosted links when they exist? →email" line on the landing page | ≥10 unprompted mentions from retained users |
| **R0 — design (~1 wk)** | Trigger fired | ADR-0004: relay protocol + trust-story evolution; pricing page draft; MoR account setup; email the tallied names ("would you pay $10/mo?" — count the yeses) | ≥5 "yes, charge me" replies |
| **R1 — relay MVP (~2–3 wks)** | R0 exit | Workers+D1 relay (4 endpoints + magic-link auth + notification email); `RelayChannel` adapter, TDD against the existing `EnvelopeChannel` contract; security-model + privacy-page updates | Full loop over the relay, E2E-encrypted, in staging |
| **R2 — billing (~1 wk)** | R1 exit | MoR checkout + webhook provisioning; two-free-workflows trial logic; pricing page live | A stranger can pay and get provisioned with zero manual steps |
| **R3 — beta → GA (~2–4 wks)** | R2 exit | The tallied names get 3 months free as beta users; fix what they hit; then GA + launch post ("the relay only sees ciphertext — here's the ADR") | ≥5 paying coordinators, <2% relay error rate |

**Total: roughly 6–9 part-time weeks from trigger to GA** — small because the
architecture prepaid for it.

## Risks and their handles

- **Building before demand** — the gates above; G0 costs nothing.
- **Trust-story dilution** ("so there IS a server now?") — the free tier's
  claim is unchanged and stated side-by-side; the relay ADR and
  ciphertext-only design are public; the app only talks to the relay after
  explicit sign-in (the no-phoning-home rule holds for free users verbatim).
- **Episodic usage → churn** — annual pricing nudge, usage-based trial,
  and a pause-subscription option beat fighting the cadence.
- **Paid = SLA expectations** — Workers' reliability is bought, not built;
  publish a simple status page; the copy-paste transport remains as the
  always-available fallback (a genuinely unusual resilience story: the paid
  feature degrades gracefully to the free one).
- **MoR onboarding friction** (KYC, payout setup) — do it in R0, not R2.

## Metrics for the tier (once live)

Trial→paid conversion (target ≥25% of coordinators who host 2 workflows),
MRR, logo churn (<5%/mo given episodic use), relay delivery success (>99.5%),
and the only vanity-proof one: **hosted workflows completed per week**.

# Checkpoint — MVP complete (M0–M5)

> Status snapshot taken 2026-07-06 on branch `mvp-foundation`. This file is the
> resume-here marker for the next working session. Delete it once its contents
> have been absorbed into an issue tracker or the docs.

## Where things stand

The full MVP roadmap (docs/roadmap.md, M0–M5) is implemented and green:

| Verification | Result |
|---|---|
| `npm test` | 121 tests, 16 files, all passing |
| `npm run typecheck` | clean (TS strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes) |
| `npm run build` | static bundle, ~63 KB gzip |
| `npm audit` | 0 vulnerabilities |

Branch history (one commit per milestone, docs first):

```
a90a606 feat(m5): evaluation rounds — Score/Rank elicitation, statistical aggregation
032a040 feat(m4): UI — coordinator console and contributor view
d95e78d feat(m3): use-cases wired to real IndexedDB persistence
7e782d9 feat(m2): crypto envelopes — WebCrypto seal/open, codec, copy/paste channel
b46bbb5 feat(m1): pure domain core — entities, lifecycle reducer, strategies
a943e62 chore(m0): scaffold Vite 7 + React 18 + TS strict + Vitest 3
cc63bab docs: architecture and product plan for Synergon MVP
```

The definition of done from docs/roadmap.md is met at the automated level: the
canonical loop (elicit → deduplicate → consolidate → clarify-by-subset → rank →
aggregate) runs end-to-end in tests, ending in a ranked, de-identified outcome.

## The one unchecked box

**The human two-profile smoke test has not been run yet** (M4's exit criterion:
"runnable end-to-end by a human, two browser profiles standing in for Dana and
Sam"). To run it: `npm run dev`, create a workflow as Dana, open an invitation
link in a second browser profile as Sam, answer, paste the response back,
consolidate. Do this before building anything further on top.

## Load-bearing decisions (details in docs/architecture/)

- **Transport A** — serverless crypto-envelopes; one base64url encoding carried
  as URL fragment, QR, or `.synergon` file (ADR-0002). The Envelope/Channel
  split means B (shared folder) or C (relay server) are one-adapter additions.
- **Anonymity is peer-to-peer only** (ADR-0003), enforced structurally:
  `DeidentifiedResponse` has no identity field, and `deidentify()` canonically
  orders pools so import order cannot leak who answered first.
- **Passwords are never persisted** — shown once at issue time; consolidation
  requires re-entering them. PBKDF2-SHA256 (600k) → AES-256-GCM, with the
  routing header authenticated as AAD.
- **Pure-reducer domain** — all lifecycle transitions in `src/domain/reducer.ts`
  behind guards, including elicitation/aggregation compatibility at draft time.
- **Vite 7, not 8** — Vite 8 is rolldown-based and its plugin types conflict
  with Vitest 3's bundled rollup-based Vite. Revisit when Vitest aligns.

## Known gaps / backlog candidates (deliberate, not oversights)

1. **Human smoke test** (above) — the only remaining MVP item.
2. **Invitation regeneration** — if Dana reloads after issuing, passwords are
   gone (by design) and there is no re-issue affordance; a stuck round cannot
   currently be re-keyed. Likely the first real-usage complaint.
3. **CloseIntake requires ≥1 response** — a round nobody answers cannot be
   closed or abandoned from the UI.
4. **No workflow export/import** — durability is one browser profile's
   IndexedDB.
5. **FreeText / Clarify / Identity / Cluster** round variants — deferred
   (YAGNI); each is one strategy + registry entry.
6. **Argon2id KDF, envelope expiry/one-time-use** — deferred hardening behind
   `CryptoService` (security-model.md).
7. **No CI** — tests run locally only. A GitHub Actions workflow running
   test + typecheck + build would be cheap insurance.
8. **QR is render-only** — there is no camera/scan input path; contributors on
   a second device still need the link or file to respond.

## How to resume

- Read docs/roadmap.md and docs/architecture/overview.md first; they are
  accurate to the code as of this commit (domain-model.md was updated in M5 to
  the driven-out shapes).
- TDD discipline so far: every suite was written and run red before its
  implementation; adapter equivalence is enforced by shared contract tests
  (`src/adapters/workflowRepositoryContract.ts`). Keep that pattern.
- UI tests inject `FakeCryptoService` (`src/ui/testSupport.ts`) at the port
  boundary; real crypto is covered in the M2/M3 suites. Node/jsdom environments
  are selected per test file via `@vitest-environment` docblocks.

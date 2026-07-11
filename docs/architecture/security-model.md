# Security Model

Scope: the local-first MVP with Transport A (serverless crypto-envelopes). This
document states what Synergon protects, how, and — just as importantly — what it does
**not** protect, so no one relies on a guarantee that isn't there.

## What we protect

- **Confidentiality of prompts and responses in transit.** Envelopes moving between
  Dana and Sam are encrypted; anyone who intercepts a link/file/QR without the
  password learns nothing.
- **Anonymity between peers.** No Contributor can learn what another Contributor said.
  This is enforced both cryptographically (each envelope is separately encrypted) and
  structurally (consolidation operates on de-identified pools; see
  [domain-model.md](domain-model.md)).

## What we do NOT protect (MVP non-goals)

- **Coordinator-blind anonymity.** Dana knows the recipient list and which envelope
  went to whom, so Dana can in principle map a decrypted response to a person.
  Anonymity is *between peers*, not from the Coordinator. See
  [ADR-0003](adr/0003-anonymity-scope.md).
- **Availability / integrity of the transport channel.** Delivery is manual
  (copy/paste/file). Synergon does not guarantee a message arrives or detect that one
  was dropped — beyond showing which participants have not yet responded.
- **Endpoint security.** If Sam's or Dana's device is compromised, plaintext is
  exposed. Local-first means the trust boundary is the device.
- **Metadata hiding.** The channel Dana uses (email/chat) sees that a message was
  sent and to whom; only the *content* is encrypted.

## Cryptographic design

### Keys from passwords

- Each invitation is encrypted under a key **derived from a per-participant,
  per-round password** using **PBKDF2** (Web Crypto API) with a random salt and a
  high iteration count. (Argon2 would be preferable but is not in the Web Crypto API;
  adopting it is a deferred hardening step, not an MVP need.)
- The salt is carried in the envelope header (it is not secret). The password is not.

### Envelope encryption

- Payloads are encrypted with **AES-GCM** (authenticated encryption) using a random
  96-bit IV per envelope.
- The **routing header** — `workflowId`, `roundId`, `participantId`, `salt`, `iv` — is
  passed as **AES-GCM Additional Authenticated Data (AAD)**. It is not encrypted (the
  importing app needs it to route the envelope) but it **is authenticated**: tampering
  with the header fails decryption. This binds a response to its round and participant.

```
Envelope = {
  header: { v, workflowId, roundId, participantId, salt, iv },  // authenticated, cleartext
  ciphertext: AES-GCM(key = PBKDF2(password, salt), iv, aad = header, plaintext)
}
```

### Encodings (same envelope, three carriers)

Per [ADR-0002](adr/0002-crypto-envelope-transport.md), an envelope is emitted as
whichever carrier fits the payload — they are encodings of the identical bytes, not
different formats:

- **URL fragment** (`#<base64url>`) — small prompts; the ciphertext never leaves the
  client (fragments are not sent to any server even if one hosts the static app).
- **QR code** — small payloads, in-person / second-screen hand-off.
- **File** (`.synergon`) — the unlimited-size fallback for long responses.

## The out-of-band rule (invariant)

> **The password never travels in the same artifact as the ciphertext.**

Dana distributes the link/file/QR over one path and the password over another (or at
another time). Putting both together would make the encryption theatre. The app
enforces this by design: it shows the password **once, separately**, at generation
time and never embeds it in the envelope, the invitation entity, or persistent
storage (see [domain-model.md](domain-model.md)).

## Data at rest

- Workflows persist in **IndexedDB** on Dana's device. Stored responses are kept as
  **ciphertext** (`StoredResponse.ciphertext`); decryption happens in memory when a
  pool is built for consolidation.
- No passwords or derived keys are persisted. Re-opening a workflow that still has
  encrypted, un-imported responses requires the relevant passwords again.

## Review status — read this before relying on the crypto

The cryptography uses standard, well-worn constructions (PBKDF2-SHA256 key
derivation, AES-256-GCM authenticated encryption, both via the browser's Web
Crypto API — no custom primitives, no third-party crypto code). It has **not
been independently audited**: it was designed and implemented by the project
itself, with automated tests for round-trips, wrong-password rejection, and
header/ciphertext tamper detection. Treat the guarantees accordingly, and if
you have the expertise, adversarial review is actively invited — the
implementation is ~150 lines in `src/adapters/webCryptoService.ts` and issues
are open.

## No phoning home

The application makes **no network requests of its own** — no telemetry, no
analytics, no error reporting, no update checks. Beyond fetching its own static
assets on load, nothing leaves the device unless the user explicitly carries it
(an envelope) or clicks a clearly labeled external link (the feedback email or
GitHub links in the footer). Any future change to this is a change to the
product's trust contract and gets an ADR, not a quiet commit.

## Threat model summary

| Adversary | Can they? | Why / mitigation |
|---|---|---|
| A peer Contributor | See another's response | **No** — separate encryption + de-identified pool |
| Network/channel eavesdropper | Read prompt/response content | **No** without the password (AES-GCM) |
| Channel eavesdropper | See that a message was sent, to whom | **Yes** — metadata is not hidden (non-goal) |
| The Coordinator (Dana) | Map a response to a person | **Yes** — accepted; peer-anonymity only |
| Someone who tampers with an envelope header | Misroute a response undetected | **No** — header is AES-GCM AAD (authenticated) |
| Attacker with Dana's/Sam's unlocked device | Read plaintext | **Yes** — endpoint trust is out of scope |

## Deferred hardening (not MVP)

- Argon2id key derivation (via WASM) in place of PBKDF2.
- Per-response signing / verifiable de-identification for coordinator-blind mode.
- Envelope expiry / one-time-use enforcement.

These are isolated behind the `CryptoService` port and can be added without domain
changes.

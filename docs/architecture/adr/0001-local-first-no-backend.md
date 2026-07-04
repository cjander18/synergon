# ADR-0001 — Local-first, no backend for the MVP

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Project owner, architecture

## Context

Synergon collects candid, often sensitive group input. The MVP must be trivial to
adopt and must not require anyone to trust a third-party service with their data. We
also want the shortest path to a working product and the cleanest surface for TDD.

## Decision

The MVP is a **static, serverless, single-device application**. It runs from a static
host or `file://`, persists to the browser's IndexedDB, and has **no backend**.
There are no accounts, no network I/O, and no server holding any workflow data.

## Consequences

**Positive**

- Maximal privacy story: no server means no central data store to breach or subpoena.
- Zero infrastructure to run, host, or secure for the MVP.
- The app is deterministic and fully testable without network or server fakes.
- Lowest adoption barrier for the Coordinator (Dana): it just opens and works.

**Negative / accepted**

- **Transport is manual** — distributing invitations and collecting responses is
  hand-driven (see [ADR-0002](0002-crypto-envelope-transport.md)). This is the main
  UX cost we accept.
- **No multi-device or multi-Coordinator sync.** State lives on one device.
- Durability depends on the browser's IndexedDB; workflow export/import is a likely
  early convenience but is not core to this decision.

## Alternatives considered

- **Tiny relay server (Transport C).** Removes manual transport and makes links "just
  work," but it is a second deployable, introduces availability/hosting concerns, and
  makes us custodian of an inbox of (encrypted) data — i.e. it ends "local-first."
  Rejected for the MVP; reachable later as an alternate `EnvelopeChannel` adapter
  with no domain change.
- **Shared-folder transport (Transport B).** Less manual, but forces either a
  Chromium-only File System Access dependency or a desktop-shell (Tauri/Electron)
  scope jump, and outsources delivery to Dropbox/Syncthing. Rejected for the MVP.

## Revisit when

Manual transport friction is demonstrably blocking real use, or a concrete
multi-device requirement appears. Both are additive (new adapter) rather than a
rewrite, by design.

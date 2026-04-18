# Phase 8: Track Compatibility and Launch Content Robustness - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-18
**Phase:** 08-track-compatibility-and-launch-content-robustness
**Areas discussed:** Launch content source and delivery, compatibility and persistence strategy, future-ready track metadata, robustness guards
**Mode:** `--auto` (non-interactive)

---

## Launch content source and delivery

| Option | Description | Selected |
|--------|-------------|----------|
| Bundled static modules | Keep catalogue and tracks in local app assets, no runtime puzzle-data fetch dependency | ✓ |
| Runtime JSON fetch from local public path | Read puzzle catalogue via fetch at runtime, still offline-capable when cached | |
| Hybrid fallback | Prefer fetch, fall back to bundled snapshot on failures | |

**Auto choice:** `[auto]` Bundled static modules (recommended default)
**Notes:** Aligns with `CNT-01`/`CNT-02` and current architecture (`src/puzzles/catalogue.js`, `src/puzzles/tracks.js`).

---

## Compatibility and persistence strategy

| Option | Description | Selected |
|--------|-------------|----------|
| ID-stable compatibility | Keep solved/in-progress state keyed by puzzle IDs with sanitizing migration behavior | ✓ |
| Track-index migration | Re-key progress to track index positions for tighter coupling to browse order | |
| Hard reset on schema drift | Wipe progress whenever compatibility ambiguity is detected | |

**Auto choice:** `[auto]` ID-stable compatibility (recommended default)
**Notes:** Protects `TRK-06` and matches existing `loadStore` + `activeState.puzzleId` model.

---

## Future-ready track metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Optional forward-compatible fields | Add optional mode-entry metadata while preserving current flow and defaults | ✓ |
| Separate mode registry file | Keep modes in a distinct registry disconnected from track records | |
| Strict mode enforcement now | Require all tracks to define full mode behavior immediately | |

**Auto choice:** `[auto]` Optional forward-compatible fields (recommended default)
**Notes:** Satisfies `TRK-05` without forcing Phase 8 to implement future modes.

---

## Robustness guards

| Option | Description | Selected |
|--------|-------------|----------|
| Fail-soft integrity checks | Validate references at startup and degrade gracefully on invalid entries | ✓ |
| Fail-fast strict mode | Throw and block launch on any catalogue/track mismatch | |
| Silent ignore only | Ignore invalid entries without explicit integrity checks | |

**Auto choice:** `[auto]` Fail-soft integrity checks (recommended default)
**Notes:** Keeps shipped launch content playable while surfacing data issues for maintenance.

---

## Claude's Discretion

- Exact warning/telemetry mechanism for integrity anomalies.
- Final naming of optional future-mode metadata keys.

## Deferred Ideas

- Remote content update mechanism and backend sync.
- Full random/guided/tutorial runtime mode implementation.

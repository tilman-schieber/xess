---
phase: 11-move-legality-hardening
plan: "01"
subsystem: puzzle-data
tags: [loader, catalogue, schema, vitest]
requires: []
provides:
  - Canonical case mapping (uppercase=white, lowercase=black) in puzzle parsing
  - Deprecated pawnDirections removal from loader and bundled catalogue content
  - Default controllableColors/capturableByColor/promote normalization at parse boundary
affects: [engine-legality, controller-policy]
tech-stack:
  added: []
  patterns: [parse-time schema normalization, fixture regression guards]
key-files:
  created: []
  modified:
    - src/puzzles/loader.js
    - src/puzzles/loader.test.js
    - src/puzzles/catalogue.js
    - src/puzzles/catalogue.test.js
key-decisions:
  - "No compatibility path for pawnDirections; active catalogue data is normalized in place."
  - "Policy defaults are emitted from parsePuzzle to keep controller behavior backward compatible."
patterns-established:
  - "Loader owns canonical puzzle contract defaults consumed by runtime layers."
requirements-completed: [LOGIC-01]
duration: 9min
completed: 2026-04-19
---

# Phase 11 Plan 01: Loader/Content Canonicalization Summary

**Puzzle parsing now enforces canonical case semantics, removes pawnDirections legacy fields, and emits default control/capture/promotion policy metadata for downstream legality layers.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-19T16:37:35Z
- **Completed:** 2026-04-19T16:39:10Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Re-locked parser behavior to uppercase=white/lowercase=black for board and goal target parsing.
- Removed per-pawn direction dependency from loader and active catalogue fixtures.
- Added regression tests to keep deprecated schema fields out and defaults stable.

## Task Commits

1. **Task 1 (RED): Lock parser contract tests** - `20f7804` (test)
2. **Task 1 (GREEN): Normalize loader contract** - `b695a69` (feat)
3. **Task 2 (RED): Add failing catalogue guards** - `fa8b6db` (test)
4. **Task 2 (GREEN): Remove deprecated fixture fields** - `6572a0e` (feat)

## Files Created/Modified
- `src/puzzles/loader.test.js` - Updated parser expectations for canonical case/pawn-policy/defaults.
- `src/puzzles/loader.js` - Removed pawnDirections path; added default controllable/capturable/promote fields.
- `src/puzzles/catalogue.test.js` - Added parse-all and deprecated-field regression checks.
- `src/puzzles/catalogue.js` - Removed all `pawnDirections` entries from bundled puzzles.

## Decisions Made
- Removed legacy schema support immediately (D-02) instead of adding migration fallback.
- Kept parser-level default policies to preserve prior white-controls-black behavior when metadata is omitted.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Engine/controller layers can now consume a stable parser contract without `piece.direction`.
- Plan 11-02 and 11-03 can proceed on canonical schema assumptions.

## Self-Check: PASSED

- Verified summary file exists.
- Verified task commits exist: `20f7804`, `b695a69`, `fa8b6db`, `6572a0e`.

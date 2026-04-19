---
phase: 11-move-legality-hardening
plan: "02"
subsystem: engine
tags: [moves, pawn, promotion, vitest]
requires:
  - phase: 11-01
    provides: Canonical parser contract without pawnDirections
provides:
  - Direction-free pawn move generation with fixed upward semantics
  - Opt-in pawn promotion to queen in move application
  - Engine regressions covering pawn edge cases and promotion negative paths
affects: [controller, legality-filtering]
tech-stack:
  added: []
  patterns: [deterministic move semantics, promotion-before-win-check]
key-files:
  created: []
  modified:
    - src/engine/moves.js
    - src/engine/moves.test.js
    - src/engine/index.test.js
    - src/engine/apply.js
    - src/engine/apply.test.js
key-decisions:
  - "Pawns now always move toward row-0 regardless of color; engine ignores any direction metadata."
  - "Promotion remains opt-in (`promote===true`) and always yields a queen in this phase."
patterns-established:
  - "Mutation flow in applyMove can enrich moved piece state before checkWin executes."
requirements-completed: [LOGIC-01]
duration: 8min
completed: 2026-04-19
---

# Phase 11 Plan 02: Engine Legality and Promotion Summary

**Engine legality now treats pawns as fixed-upward movers and applies deterministic, opt-in top-row auto-promotion to queen before win evaluation.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-19T16:40:50Z
- **Completed:** 2026-04-19T16:42:45Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Replaced direction-based pawn legality with canonical upward-only movement/capture semantics.
- Added promotion behavior in `applyMove` guarded by `puzzle.promote===true` and destination row 0.
- Expanded tests to prove both positive and negative promotion paths and preserve existing geometry invariants.

## Task Commits

1. **Task 1 (RED): Pawn upward legality regressions** - `6c60025` (test)
2. **Task 1 (GREEN): Fixed-upward pawn engine logic** - `8f1a1fc` (feat)
3. **Task 2 (RED): Promotion behavior tests** - `2fa4e05` (test)
4. **Task 2 (GREEN): Promotion implementation** - `f516b4b` (feat)

## Files Created/Modified
- `src/engine/moves.test.js` - Replaced direction-parametrized pawn tests with fixed-upward legality checks.
- `src/engine/index.test.js` - Aligned integration fixtures to canonical case mapping.
- `src/engine/moves.js` - Removed `piece.direction` dependency from pawn move generation.
- `src/engine/apply.test.js` - Added explicit promote true/false/absent behavior checks.
- `src/engine/apply.js` - Added promotion mutation before `checkWin` call.

## Decisions Made
- Chose row-coordinate logic (`row - 1`) as the sole pawn-forward rule to eliminate schema ambiguity.
- Kept promotion strictly boolean-gated and queen-only to avoid introducing UI/choice complexity in this phase.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Controller can now rely on deterministic pawn move lists without direction metadata.
- Promotion behavior is available for policy-level tests in controller workflows.

## Self-Check: PASSED

- Verified summary file exists.
- Verified task commits exist: `6c60025`, `8f1a1fc`, `2fa4e05`, `f516b4b`.

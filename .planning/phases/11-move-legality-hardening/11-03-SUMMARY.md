---
phase: 11-move-legality-hardening
plan: "03"
subsystem: controller
tags: [controller, policy-gates, persistence, invariants, vitest]
requires:
  - phase: 11-01
    provides: controllable/capturable/promote defaults in parsed puzzle data
provides:
  - Controllable-color enforcement for selection and move attempts
  - Capture-permission filtering before mutation and in selectable destinations
  - Regression proof that rejected moves do not mutate board/history or persistence
affects: [ui-move-selection, store-persistence]
tech-stack:
  added: []
  patterns: [pre-mutation policy gating, side-effect-free rejection paths]
key-files:
  created: []
  modified:
    - src/controller.js
    - src/controller.test.js
    - src/puzzles/catalogue.js
    - src/main.gap-ux.test.js
key-decisions:
  - "Controller now treats capturableByColor as a legality gate for both selection previews and makeMove execution."
  - "Rejected moves uniformly return illegal_move without touching undo stack or persistence writers."
patterns-established:
  - "Selection API and mutation API must share the same policy filter to avoid UI/backend drift."
requirements-completed: [LOGIC-02, LOGIC-01]
duration: 10min
completed: 2026-04-19
---

# Phase 11 Plan 03: Controller Policy Gate Hardening Summary

**Controller move handling now enforces puzzle-level controllable and capture permissions before mutation, while proving rejected moves remain fully non-mutating across board, undo, and persistence paths.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-19T16:46:30Z
- **Completed:** 2026-04-19T16:50:20Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Replaced hardcoded white-only controls with `puzzle.controllableColors` policy checks.
- Added capture policy filtering (`capturableByColor`) in both `selectPiece` and `makeMove` legality paths.
- Added invariants confirming invalid moves do not mutate board snapshots, undo stack, or persistence calls.

## Task Commits

1. **Task 1 (RED): controller policy gate tests** - `6333532` (test)
2. **Task 1 (GREEN): policy gate implementation** - `c9ce7e9` (feat)
3. **Task 2 (RED): non-mutation and policy-visibility tests** - `0f8070a` (test)
4. **Task 2 (GREEN): align selectable moves with capture policy** - `77519ff` (feat)

## Files Created/Modified
- `src/controller.test.js` - Reworked regression suite around canonical puzzle colors and policy-gate invariants.
- `src/controller.js` - Added controllable/capturable policy helpers and pre-mutation filtering in selection/move flows.
- `src/puzzles/catalogue.js` - Corrected reach-puzzle rook encoding to preserve intended white controllable piece under canonical case mapping.
- `src/main.gap-ux.test.js` - Ensured JSDOM `window` exists when verifying sanitized description rendering.

## Decisions Made
- Enforced one policy source for both previewed legal moves and executed move validation.
- Preserved standardized `error: 'illegal_move'` responses for all rejected move attempts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Restored full-suite compatibility after canonical case migration side effects**
- **Found during:** Final full-suite verification (`npm test -- --run`)
- **Issue:** Reach puzzles in catalogue still used lowercase rook/goal-target encoding, making test/UI flows treat key piece as non-controllable; separate description rendering tests lacked a runtime `window`, causing sanitizer output to be blank.
- **Fix:** Updated reach puzzle fixture case/goalTargets to canonical white encoding and added explicit `globalThis.window` setup in JSDOM-rich-text tests.
- **Files modified:** `src/puzzles/catalogue.js`, `src/main.gap-ux.test.js`
- **Committed in:** `11849dc`

---

**Total deviations:** 1 auto-fixed (Rule 1)
**Impact on plan:** Regression-only fixes; no scope expansion.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Controller invariants now provide stable guardrails for any future UI changes around selection and drag/drop.
- Phase 11 end-to-end verification can rely on deterministic policy behavior with zero side effects on rejected moves.

## Self-Check: PASSED

- Verified summary file exists.
- Verified task/deviation commits exist: `6333532`, `c9ce7e9`, `0f8070a`, `77519ff`, `11849dc`.

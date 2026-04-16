---
phase: 01-puzzle-format-and-engine
plan: 03
subsystem: engine
tags: [chess-engine, apply-move, win-conditions, undo, tdd, vitest, immutable-board, snapshot-clone]
dependency_graph:
  requires:
    - phase: 01-puzzle-format-and-engine
      plan: 01
      provides: posKey/parseKey from loader.js, parsePuzzle, Map<"col,row",Cell> board shape
    - phase: 01-puzzle-format-and-engine
      plan: 02
      provides: getLegalMoves from moves/index.js
  provides:
    - src/engine/apply.js (applyMove — immutable move application with snapshot undo)
    - src/engine/win.js (checkWin — both win condition types)
    - src/engine/index.js (public API barrel: getLegalMoves, applyMove, checkWin, posKey, parseKey)
  affects:
    - Phase 2 game controller (imports from src/engine/index.js)
    - Any UI layer calling applyMove and maintaining undo stack
tech_stack:
  added: []
  patterns:
    - structuredClone(board) for deep-cloning Map<string,Cell> — avoids JSON.stringify which silently converts Map to {}
    - Caller-owned undo stack: caller pushes previous board before calling applyMove; pop to undo
    - checkWin called inside applyMove — callers cannot accidentally skip win detection (T-03-04)
    - Barrel re-export index.js: all engine consumers import from one stable path
    - Vacuously true win: reach-all-goal-squares with zero goal squares returns true (A3 edge case verified)

key_files:
  created:
    - src/engine/apply.js
    - src/engine/win.js
    - src/engine/index.js
    - src/engine/apply.test.js
    - src/engine/win.test.js
    - src/engine/index.test.js
  modified: []

key_decisions:
  - "structuredClone used for board snapshot — not JSON.stringify/parse which silently loses Map type (ENG-08)"
  - "applyMove calls checkWin internally and returns won in result — Phase 2 cannot bypass win detection"
  - "Caller-managed undo stack pattern: applyMove returns new board, caller pushes old board; undo by history.pop()"
  - "Barrel index.js provides single stable import path for all engine consumers"

requirements-completed: [ENG-05, ENG-06, ENG-07, ENG-08]

duration: "118s"
completed: "2026-04-16"
---

# Phase 01 Plan 03: applyMove, checkWin, and Public Engine API Summary

**Immutable move application via structuredClone, two-condition win detection, and a barrel re-export index completing Phase 1 with 93 passing Vitest tests across all FMT and ENG requirements.**

## Performance

- **Duration:** 118s (~2 minutes)
- **Completed:** 2026-04-16
- **Tasks:** 2
- **Files created:** 6

## Accomplishments

- Implemented `applyMove` with `structuredClone(board)` for deep isolation — original board is never mutated (ENG-08)
- Implemented `checkWin` with both goal type branches: `capture-all-targets` and `reach-all-goal-squares` (ENG-05, ENG-06)
- Verified vacuously-true edge case (A3): `reach-all-goal-squares` with zero goal squares returns `true`
- `applyMove` always calls `checkWin` internally before returning — win detection cannot be skipped by callers
- Created public barrel `src/engine/index.js` re-exporting all engine symbols from one stable path
- Full suite: 93 tests across 12 test files, all passing; exit 0
- ENG-07 verified: zero DOM/localStorage/window imports anywhere in src/engine/
- ENG-04 verified: no check, castle, pin, or en-passant logic (comment in pawn.js documents absence)

## Task Commits

Each task was committed atomically:

1. **Task 1: applyMove + checkWin implementation and tests** - `80f29c7` (feat)
2. **Task 2: Public engine index and full integration tests** - `87970c3` (feat)

## Files Created

- `src/engine/apply.js` — applyMove with structuredClone, captures, checkWin call
- `src/engine/win.js` — checkWin for capture-all-targets and reach-all-goal-squares
- `src/engine/index.js` — barrel re-export of all engine public symbols
- `src/engine/apply.test.js` — 8 tests: move mechanics, capture, snapshot isolation, undo pattern, isGoal preservation, win detection
- `src/engine/win.test.js` — 7 tests: both goal types, vacuous truth edge case, unknown goalType defensive case
- `src/engine/index.test.js` — 9 integration tests: full parsePuzzle -> getLegalMoves -> applyMove -> won pipeline

## Decisions Made

- `structuredClone` is the correct tool for cloning Map — JSON.stringify/parse silently converts a Map to `{}`, breaking all board lookups.
- `checkWin` is always called inside `applyMove` (not exposed as an optional step) — this architectural choice prevents Phase 2 from accidentally omitting win detection after a move.
- The undo pattern is caller-managed: `applyMove` returns a new board and the caller stores the old board on a stack. The engine holds no mutable state of its own.

## Deviations from Plan

None — plan executed exactly as written. All implementation files match PATTERNS.md templates and all required test cases were covered.

## Known Stubs

None — all files are fully functional. The public engine API is the stable contract for Phase 2.

## Threat Flags

None — no new network endpoints, auth paths, or external data sources. Engine remains pure (grep-verified).

## TDD Gate Compliance

Both tasks followed RED/GREEN/REFACTOR cycle:

- **Task 1 RED:** apply.test.js and win.test.js written first (modules not yet created). Both suites failed with ERR_MODULE_NOT_FOUND.
- **Task 1 GREEN:** win.js then apply.js implemented. 15/15 tests pass.
- **Task 2 RED:** index.test.js written first (index.js not yet created). Failed with ERR_MODULE_NOT_FOUND.
- **Task 2 GREEN:** index.js created as barrel re-export. 9/9 integration tests pass. Full suite: 93/93 tests, exit 0.
- No REFACTOR commits needed — implementations were clean on first pass.

## Self-Check: PASSED

All 6 created files found. Both task commits (80f29c7, 87970c3) present in git log. 93 tests pass (exit 0).

---
*Phase: 01-puzzle-format-and-engine*
*Completed: 2026-04-16*

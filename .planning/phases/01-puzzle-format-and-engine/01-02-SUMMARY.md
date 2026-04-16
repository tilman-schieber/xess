---
phase: 01-puzzle-format-and-engine
plan: 02
subsystem: engine
tags: [chess-engine, move-generation, tdd, vitest, pawn, knight, bishop, rook, queen, king]
dependency_graph:
  requires:
    - phase: 01-puzzle-format-and-engine
      plan: 01
      provides: posKey/parseKey from loader.js, Map<"col,row",Cell> board shape
  provides:
    - src/engine/moves/rook.js (getRookMoves, walkRay)
    - src/engine/moves/bishop.js (getBishopMoves)
    - src/engine/moves/queen.js (getQueenMoves)
    - src/engine/moves/pawn.js (getPawnMoves)
    - src/engine/moves/knight.js (getKnightMoves)
    - src/engine/moves/king.js (getKingMoves)
    - src/engine/moves/index.js (getLegalMoves dispatcher)
  affects:
    - src/engine/index.js (Phase 1 Plan 03 — will re-export getLegalMoves)
    - Phase 2+ game controller (calls getLegalMoves for interactive play)
tech_stack:
  added: []
  patterns:
    - walkRay shared by rook/bishop/queen — import from rook.js rather than duplicating
    - knight/king use .filter() on mapped offsets — no ray walking
    - pawn capture offsets derived by 90-degree rotation of direction vector [dc,dr] -> [dr,dc] and [-dr,-dc]
    - getLegalMoves dispatcher uses switch(piece.type) with cases p/n/b/r/q/k
    - impassable squares absent from Map — !board.has(key) is the only wall check for all pieces

key_files:
  created:
    - src/engine/moves/rook.js
    - src/engine/moves/bishop.js
    - src/engine/moves/queen.js
    - src/engine/moves/pawn.js
    - src/engine/moves/knight.js
    - src/engine/moves/king.js
    - src/engine/moves/index.js
    - src/engine/moves/rook.test.js
    - src/engine/moves/bishop.test.js
    - src/engine/moves/queen.test.js
    - src/engine/moves/pawn.test.js
    - src/engine/moves/knight.test.js
    - src/engine/moves/king.test.js
    - src/engine/moves/index.test.js
  modified: []

key_decisions:
  - "walkRay exported from rook.js and imported by bishop.js and queen.js — avoids duplication, single source of truth for ray walking logic"
  - "pawn capture squares derived by 90-degree rotation of direction vector — direction-agnostic, correct for any cardinal or diagonal direction"
  - "getLegalMoves dispatcher in index.js uses switch(piece.type) — O(1) dispatch, no instanceof checks, works with plain JS objects"

patterns-established:
  - "Ray walking: walkRay(board, col, row, dc, dr, pieceColor) — !board.has(key) stops ray immediately"
  - "Step/jump pieces: .map offsets then .filter by board.has and friendly-fire check"
  - "All move generators return Array<[col, row]> tuples — consistent with getLegalMoves signature"

requirements-completed: [ENG-01, ENG-02, ENG-03, ENG-04]

duration: "4m 45s"
completed: "2026-04-16"
---

# Phase 01 Plan 02: Move Generators Summary

**All 6 chess piece move generators implemented as pure functions on Map<string,Cell> boards with 49 passing Vitest tests covering impassable squares, friendly blocking, enemy capture, knight jumping, and direction-agnostic pawn movement.**

## Performance

- **Duration:** 4m 45s
- **Started:** 2026-04-16T21:07:07Z
- **Completed:** 2026-04-16T21:11:52Z
- **Tasks:** 2
- **Files created:** 14

## Accomplishments

- Implemented `walkRay` shared by rook, bishop, and queen — ray halts immediately on `!board.has(key)` (impassable or off-board treated identically per D-11)
- Implemented `getPawnMoves` using 90-degree direction vector rotation for capture offsets — no hardcoded "up" direction, works for all 4 cardinal directions
- Implemented `getKnightMoves` with jump semantics — path cells never checked, only target square must be in board Map
- Implemented `getKingMoves` with no check detection (ENG-04)
- Implemented `getLegalMoves` dispatcher routing by `piece.type` for all 6 types
- 49 tests across 7 test files, all green; full suite (69 tests) passes

## Task Commits

Each task was committed atomically:

1. **Task 1: Sliding pieces — rook, bishop, queen with tests** - `6a28679` (feat)
2. **Task 2: Jump and step pieces — knight, king, pawn + getLegalMoves dispatcher** - `a168d08` (feat)

## Files Created

- `src/engine/moves/rook.js` — getRookMoves + walkRay (shared by bishop and queen)
- `src/engine/moves/bishop.js` — getBishopMoves (imports walkRay from rook.js)
- `src/engine/moves/queen.js` — getQueenMoves (all 8 directions via walkRay)
- `src/engine/moves/pawn.js` — getPawnMoves (direction-agnostic, no double-advance)
- `src/engine/moves/knight.js` — getKnightMoves (jump semantics, 8 offsets)
- `src/engine/moves/king.js` — getKingMoves (1 square, 8 directions, no check detection)
- `src/engine/moves/index.js` — getLegalMoves dispatcher
- `src/engine/moves/rook.test.js` — 6 tests
- `src/engine/moves/bishop.test.js` — 5 tests
- `src/engine/moves/queen.test.js` — 3 tests
- `src/engine/moves/pawn.test.js` — 13 tests (parameterized with test.each over 4 directions)
- `src/engine/moves/knight.test.js` — 5 tests
- `src/engine/moves/king.test.js` — 4 tests
- `src/engine/moves/index.test.js` — 9 dispatcher smoke tests

## Decisions Made

- `walkRay` exported from `rook.js` and imported by `bishop.js` and `queen.js` — avoids duplicating identical logic; rook.js is the canonical home since walkRay was designed for orthogonal rays and diagonal rays are just different direction constants.
- Pawn capture squares derived by 90-degree rotation of `[dc, dr]`: offsets become `[dr, dc]` and `[-dr, -dc]`. This is direction-agnostic and handles all 4 cardinal pawn orientations correctly.
- `getLegalMoves` dispatcher uses `switch(piece.type)` rather than a lookup map — explicit, readable, zero overhead.

## Deviations from Plan

None — plan executed exactly as written. All implementation files match PATTERNS.md templates. All tests match the required cases specified in the plan behavior sections.

## Known Stubs

None — all 7 implementation files are fully functional. The king move generator is spec-complete even though king pieces do not appear on current puzzle boards (ENG-04 notes this explicitly in king.js).

## Threat Flags

None — no network endpoints, auth paths, file access patterns, or schema changes. All engine functions are pure (no imports of document, window, or localStorage — verified by grep).

## TDD Gate Compliance

Both tasks followed RED/GREEN/REFACTOR cycle:

- **Task 1 RED:** rook/bishop/queen test files written first with stub implementations throwing "not implemented". 14 tests failed as expected.
- **Task 1 GREEN:** Full implementations written. All 14 tests pass.
- **Task 2 RED:** pawn/knight/king test files written with stubs. 26 tests failed as expected.
- **Task 2 GREEN:** Full implementations + dispatcher written. All 35 new tests pass. Full suite: 49/49 moves tests, 69/69 total.
- No REFACTOR commits needed — implementations were clean on first pass.

## Self-Check: PASSED

All 14 created files found. Both task commits (6a28679, a168d08) verified in git log. 69 tests pass (exit 0).

---
*Phase: 01-puzzle-format-and-engine*
*Completed: 2026-04-16*

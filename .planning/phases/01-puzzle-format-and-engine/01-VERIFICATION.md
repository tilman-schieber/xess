---
phase: 01-puzzle-format-and-engine
verified: 2026-04-16T23:22:00Z
status: passed
score: 5/5
overrides_applied: 0
---

# Phase 1: Puzzle Format and Engine Verification Report

**Phase Goal:** A tested, correct chess engine for non-standard boards is ready and the puzzle definition format is fully specified
**Verified:** 2026-04-16T23:22:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A developer can define a puzzle with an irregular board (impassable squares, goal squares) using the text-grid format and load it as a valid JS module | VERIFIED | `src/puzzles/catalogue.js` exports 2 puzzles (one per goal type) with text-grid, impassable `x` chars, `G` goal chars. `parsePuzzle` converts them to board `Map<string,Cell>`. 20 tests pass covering FMT-01 through FMT-05. |
| 2 | The engine returns correct legal moves for all 6 piece types across any board shape, including proper wall behavior for impassable squares and jump-but-no-land behavior for knights | VERIFIED | `src/engine/moves/` contains all 6 generators. `walkRay` halts on `!board.has(key)` (absent = impassable). Knight filters only by target key presence, not intermediate squares. 49 move-generator tests pass. |
| 3 | Pawn movement is driven by the per-piece direction property — not inferred from position or color | VERIFIED | `pawn.js` line 15: `const [dc, dr] = piece.direction`. No color-based or row-based direction logic anywhere. `pawn.test.js` uses `test.each` over all 4 cardinal directions (3 parameterized test groups). |
| 4 | Both win conditions (capture-all-targets and reach-all-goal-squares) are detected correctly after `applyMove` | VERIFIED | `win.js` implements both branches. `applyMove` always calls `checkWin` internally before returning. 7 win tests pass, including vacuous-true edge case (zero goal squares). `apply.test.js` verifies `won: true` when last target is captured. |
| 5 | Undo pops to the exact prior board state with no data mutation; Vitest suite passes with no failures | VERIFIED | `applyMove` uses `structuredClone(board)` — original is never mutated. Snapshot isolation test in `apply.test.js` mutates the returned board and confirms original is unchanged. Undo test verifies `history.pop()` restores exact prior piece positions. Full suite: 93/93 tests pass (exit 0). |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | Vite + Vitest project config with `"vitest"` in devDependencies | VERIFIED | Contains `"vitest": "^4.1.4"` and `"type": "module"` |
| `vitest.config.js` | Test runner config — node environment | VERIFIED | Contains `environment: 'node'` and `include: ['src/**/*.test.js']` |
| `src/puzzles/catalogue.js` | Static puzzle array with schemaVersion, id, goalType, grid, pawnDirections | VERIFIED | 2 puzzles: `xk3m9pq2` (capture-all-targets) and `gt7wz4r1` (reach-all-goal-squares). Default export array. |
| `src/puzzles/loader.js` | `parsePuzzle`, `posKey`, `parseKey` exports | VERIFIED | All 3 named exports present. `parsePuzzle` excludes `x` chars, sets `isGoal`, reads case for color, attaches direction only on pawns. |
| `src/puzzles/loader.test.js` | Automated tests covering FMT-01 and FMT-02 (min 50 lines) | VERIFIED | 16 `it()` calls; file is ~100 lines |
| `src/puzzles/catalogue.test.js` | Automated tests covering FMT-03, FMT-04, FMT-05 (min 20 lines) | VERIFIED | 9 expect assertions; covers unique IDs, schemaVersion, goalType validity |
| `src/engine/moves/rook.js` | `getRookMoves` + `walkRay` | VERIFIED | Both exports present. `walkRay` is used by bishop.js and queen.js. |
| `src/engine/moves/bishop.js` | `getBishopMoves` (imports walkRay from rook.js) | VERIFIED | Imports `walkRay` from `./rook.js`; exports `getBishopMoves` |
| `src/engine/moves/queen.js` | `getQueenMoves` (all 8 directions via walkRay) | VERIFIED | 8-direction array; imports `walkRay` from `./rook.js` |
| `src/engine/moves/pawn.js` | `getPawnMoves` (direction-agnostic, no double-advance) | VERIFIED | Uses `piece.direction`; comment documents "no double-advance, no en passant" |
| `src/engine/moves/knight.js` | `getKnightMoves` (jump, 8 offsets) | VERIFIED | 8 KNIGHT_OFFSETS present; filters only on target key existence |
| `src/engine/moves/king.js` | `getKingMoves` (1 square, 8 directions, no check detection) | VERIFIED | ENG-04 note in comment at bottom of file |
| `src/engine/moves/index.js` | `getLegalMoves` dispatcher | VERIFIED | `switch(piece.type)` with cases `'p','n','b','r','q','k'` |
| `src/engine/apply.js` | `applyMove: (board, from, to, puzzle) => { board, captured, won }` | VERIFIED | `structuredClone(board)` used; `checkWin` called; correct return shape |
| `src/engine/win.js` | `checkWin: (board, puzzle) => boolean` | VERIFIED | Both goal-type branches implemented; fallback returns `false` for unknown type |
| `src/engine/index.js` | Public engine API barrel: `getLegalMoves`, `applyMove`, `checkWin`, `posKey`, `parseKey` | VERIFIED | Re-exports all 5 symbols using `export { X } from '...'` syntax |
| `src/engine/apply.test.js` | Tests for applyMove (min 40 lines) | VERIFIED | 80 lines; 8 `it()` calls including snapshot isolation and undo |
| `src/engine/win.test.js` | Tests for both win conditions (min 30 lines) | VERIFIED | 63 lines; 7 tests across 3 describe blocks |
| `src/engine/index.test.js` | Integration smoke tests through public API (min 20 lines) | VERIFIED | 100 lines; 9 `it()` calls exercising full parsePuzzle → getLegalMoves → applyMove → won pipeline |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/puzzles/catalogue.js` | `src/puzzles/loader.js` | `parsePuzzle` called on each raw entry | VERIFIED | `parsePuzzle` imported and called in index.test.js using catalogue entries; loader exports confirmed |
| `src/puzzles/loader.js` | board Map | `board.set(posKey(col, row), ...)` in rows.forEach | VERIFIED | 3 `board.set` calls in `parsePuzzle`, one per cell type (empty, goal, piece) |
| `src/engine/moves/bishop.js` | `src/engine/moves/rook.js` | `import { walkRay }` | VERIFIED | Line 1: `import { walkRay } from './rook.js'` |
| `src/engine/moves/queen.js` | `src/engine/moves/rook.js` | `import { walkRay }` | VERIFIED | Line 1: `import { walkRay } from './rook.js'` |
| All move generators | `src/puzzles/loader.js` | `import { posKey }` | VERIFIED | rook.js, knight.js, king.js, pawn.js all import posKey from loader.js (bishop and queen delegate through walkRay) |
| `src/engine/moves/index.js` | each piece module | `switch(piece.type)` dispatch | VERIFIED | Cases 'p','n','b','r','q','k' all present and mapped to correct generators |
| `src/engine/apply.js` | `src/engine/win.js` | `import { checkWin }` called inside applyMove | VERIFIED | Import on line 2; `checkWin(newBoard, puzzle)` in return statement |
| `src/engine/index.js` | `src/engine/moves/index.js` | `export { getLegalMoves }` | VERIFIED | `export { getLegalMoves } from './moves/index.js'` |
| `src/engine/apply.js` | `structuredClone` | deep clone of board Map before mutation | VERIFIED | `const newBoard = structuredClone(board)` on line 27 |

### Data-Flow Trace (Level 4)

Not applicable — this phase produces pure functions with no async data sources or external state. All data flows through function arguments, not async stores or fetches.

### Behavioral Spot-Checks

| Behavior | Result | Status |
|----------|--------|--------|
| Full Vitest suite exits 0 | 93 tests passed across 12 test files, exit 0 | PASS |
| ENG-07 purity: no DOM/localStorage in engine | `grep -r "document\|window\|localStorage" src/engine/` returned empty | PASS |
| ENG-04 absence: no check/castle/pin/en-passant logic in non-comment code | Only comment references in pawn.js and knight.js JSDoc; no implementation code | PASS |
| Key link: `structuredClone` used (not JSON.stringify) | `structuredClone(board)` found in apply.js | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| FMT-01 | 01-01 | Board shape encoded as text-grid | SATISFIED | `parsePuzzle` parses text-grid rows into board Map; 16 loader tests cover grid-to-Map conversion |
| FMT-02 | 01-01 | Piece type, color, and pawn direction encoded | SATISFIED | Color from char case, type from lowercase char, direction on pawn pieces only |
| FMT-03 | 01-01 | Goal type encoded (capture-all-targets or reach-all-goal-squares) | SATISFIED | catalogue.test.js asserts `goalType` is one of the two valid values |
| FMT-04 | 01-01 | Stable opaque string IDs | SATISFIED | catalogue.test.js asserts all IDs are unique; IDs are hand-assigned strings ('xk3m9pq2', 'gt7wz4r1') |
| FMT-05 | 01-01 | `schemaVersion` field | SATISFIED | catalogue.test.js asserts `schemaVersion === 1`; `parsePuzzle` throws on wrong version |
| ENG-01 | 01-02 | Legal moves for all 6 piece types | SATISFIED | 6 move generator files, each with test file; 49 move tests pass |
| ENG-02 | 01-02 | Impassable squares as walls; knight cannot land | SATISFIED | `!board.has(key)` is the only wall check in all generators; knight tests verify jump-but-no-land |
| ENG-03 | 01-02 | Pawn uses per-piece direction property | SATISFIED | `pawn.js` uses `piece.direction` exclusively; 4-direction parameterized test suite |
| ENG-04 | 01-02 | No check, pin, castling logic | SATISFIED | Grep confirms only comment/JSDoc references to these concepts; no implementation code |
| ENG-05 | 01-03 | capture-all-targets win condition | SATISFIED | `win.js` branch; 3 tests: one target remains (false), none remain (true), zero from start (true) |
| ENG-06 | 01-03 | reach-all-goal-squares win condition | SATISFIED | `win.js` branch; 3 tests: empty goal (false), all occupied (true), no goals vacuous (true) |
| ENG-07 | 01-03 | Pure functions — no DOM/localStorage | SATISFIED | Grep over `src/engine/` returns empty; all engine functions take board+args, return values |
| ENG-08 | 01-03 | Snapshot-based undo | SATISFIED | `structuredClone(board)` in applyMove; snapshot isolation test and undo test in apply.test.js |

### Anti-Patterns Found

No blockers or warnings found.

| File | Pattern | Severity | Notes |
|------|---------|----------|-------|
| `pawn.js` JSDoc | Mentions "no double-advance, no en passant" in comment | Info | Documenting absence of forbidden features — not a code smell |
| `knight.js` JSDoc | Mentions "path cells are never checked" | Info | Explanatory comment — correct and intentional |

### Human Verification Required

None — all must-haves are verifiable programmatically for this engine-only phase. No UI, no external services, no visual behavior.

### Gaps Summary

No gaps. All 5 ROADMAP success criteria are fully verified. All 13 requirements (FMT-01 through ENG-08) are traced to passing tests. The full Vitest suite (93 tests, 12 files) passes with exit 0.

---

_Verified: 2026-04-16T23:22:00Z_
_Verifier: Claude (gsd-verifier)_

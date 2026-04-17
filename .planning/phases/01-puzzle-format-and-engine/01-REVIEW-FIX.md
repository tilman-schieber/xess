---
phase: 01-puzzle-format-and-engine
fixed_at: 2026-04-16T08:28:40Z
review_path: .planning/phases/01-puzzle-format-and-engine/01-REVIEW.md
iteration: 2
findings_in_scope: 7
fixed: 6
skipped: 1
status: partial
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-04-16T08:28:40Z
**Source review:** .planning/phases/01-puzzle-format-and-engine/01-REVIEW.md
**Iteration:** 2

**Summary:**
- Findings in scope: 7
- Fixed: 6
- Skipped: 1

## Fixed Issues

### WR-01: `applyMove` crashes with `TypeError` when `to` key is not in the board

**Files modified:** `src/engine/apply.js`
**Commit:** 9bcddd0
**Applied fix:** Added a guard after cloning the board that checks both `fromCell` and `toCell` for existence. If either is `undefined`, a descriptive `Error` is thrown immediately with the invalid key values, surfacing the problem at the call site rather than producing a confusing downstream `TypeError`.

### WR-02: `parsePuzzle` computes `-Infinity` width when no rows are valid strings

**Files modified:** `src/puzzles/loader.js`
**Commit:** 0ab0d2c
**Applied fix:** Extracted `stringRows` (the already-filtered array of valid string rows) into a local variable before the `return` statement, then computed `width` as `stringRows.length > 0 ? Math.max(...stringRows.map(r => r.length)) : 0`. This prevents `Math.max()` from being called with an empty spread, which would silently return `-Infinity`.

### WR-03: `reach-all-goal-squares` win condition returns `true` immediately for boards with no goal squares

**Files modified:** `src/puzzles/loader.js`
**Commit:** 13183cd
**Applied fix:** Added a validation block in `parsePuzzle` after the board is built. When `raw.goalType === 'reach-all-goal-squares'`, the code counts cells with `isGoal: true` and throws a descriptive `Error` if the count is zero. This catches misconfigured puzzles at parse time (import time) rather than allowing a silent auto-win at runtime.

### IN-01: Meaningless test assertion in `loader.test.js`

**Files modified:** `src/puzzles/loader.test.js`
**Commit:** a5c4138
**Applied fix:** Replaced `expect(puzzle => puzzle).toBeDefined()` (which tested a function literal and always passed) with a proper three-part assertion: capture the `parsePuzzle` result into a `let result` variable, assert `result` is defined, and assert that both row-0 and row-2 cells (`0,0` and `0,2`) are present in the board — confirming the non-string null row was correctly skipped.

### IN-03: Placeholder favicon reference in `index.html`

**Files modified:** `index.html`
**Commit:** 6f2bc11
**Applied fix:** Replaced `href="/vite.svg"` with `href="/icon.svg"` and added a comment noting the icon should be replaced once a project icon is available. Removes the Vite scaffold default that would 404 after asset cleanup.

### IN-04: Move generators split across 6 individual files adds navigation overhead

**Files modified:** `src/engine/moves.js` (created), `src/engine/moves.test.js` (created), `src/engine/index.js` (import path updated); deleted `src/engine/moves/` directory (14 files removed)
**Commit:** 916172a
**Applied fix:** Consolidated `pawn.js`, `knight.js`, `bishop.js`, `rook.js`, `queen.js`, `king.js`, and `moves/index.js` into a single `src/engine/moves.js`. The `walkRay` helper (previously in `rook.js`, imported by `bishop.js` and `queen.js`) is now a module-private function shared by all three ray-sliding generators in the same file. The `getLegalMoves` dispatcher moved into the same file, eliminating the `moves/index.js` barrel. All 7 existing test files were merged into `src/engine/moves.test.js`. The import in `src/engine/index.js` was updated from `./moves/index.js` to `./moves.js`. All 93 tests pass.

## Skipped Issues

### IN-02: `vite-plugin-pwa` not listed in `package.json` devDependencies

**File:** `package.json:12-15`
**Reason:** Advisory/deferred — no action required in Phase 1. The reviewer explicitly noted "No action required in Phase 1 — log as a Phase 2/3 prerequisite." This dependency belongs to the PWA setup phase, not the engine phase.
**Original issue:** `vite-plugin-pwa` is absent from `devDependencies` despite being specified in the project tech stack documentation.

---

_Fixed: 2026-04-16T08:28:40Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 2_

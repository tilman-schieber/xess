---
phase: 01-puzzle-format-and-engine
fixed_at: 2026-04-16T07:26:40Z
review_path: .planning/phases/01-puzzle-format-and-engine/01-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-04-16T07:26:40Z
**Source review:** .planning/phases/01-puzzle-format-and-engine/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3
- Fixed: 3
- Skipped: 0

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
**Applied fix:** Added a validation block in `parsePuzzle` after the board is built. When `raw.goalType === 'reach-all-goal-squares'`, the code counts cells with `isGoal: true` and throws a descriptive `Error` if the count is zero. This catches misconfigured puzzles at parse time (import time) rather than allowing a silent auto-win at runtime. All 93 existing tests continue to pass — the catalogue's `reach-all-goal-squares` puzzle already has a `G` square.

---

_Fixed: 2026-04-16T07:26:40Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

---
phase: "06"
plan: "01"
subsystem: ui/board
tags: [css, layout, grid, square-cells]
dependency-graph:
  requires: []
  provides: [square-cell-geometry]
  affects: [board-rendering]
tech-stack:
  added: []
  patterns: [css-grid-explicit-rows, per-cell-aspect-ratio]
key-files:
  modified:
    - src/styles/board.css
    - src/main.js
    - src/main.gap-ux.test.js
decisions:
  - "Move aspect-ratio from .cell--playable to .cell so void cells also reserve square space"
  - "Replace grid-auto-rows with grid-template-rows using explicit --rows variable"
  - "Remove minmax from grid-template-columns to prevent column/row size mismatch"
  - "Remove aspect-ratio from .board so non-square boards no longer distort"
metrics:
  duration: "3 minutes"
  completed: "2026-04-17T15:05:39Z"
  tasks-completed: 2
  files-changed: 3
---

# Phase 06 Plan 01: Square Cells — Grid Layout Fix Summary

**One-liner:** Fixed board grid to use explicit `grid-template-rows` and per-cell `aspect-ratio` so every cell (playable and void) is perfectly square on non-square boards.

## What Was Built

The board CSS was producing non-square cells on boards where width ≠ height because:
1. `.board` had `aspect-ratio: 1/1` forcing the container square regardless of board dimensions
2. `grid-auto-rows: 1fr` let the browser auto-size rows without coordinating with columns
3. `minmax(var(--touch-target-min), 1fr)` columns caused column/row size mismatch
4. `aspect-ratio: 1/1` was only on `.cell--playable`, leaving void cells without reserved space

### Changes Made

**`src/styles/board.css`:**
- Removed `aspect-ratio: 1/1` from `.board`
- Changed `grid-auto-rows: 1fr` → `grid-template-rows: repeat(var(--rows), 1fr)`
- Changed `grid-template-columns: repeat(var(--cols), minmax(var(--touch-target-min), 1fr))` → `repeat(var(--cols), 1fr)`
- Removed `aspect-ratio: 1/1` from `.cell--playable`
- Added `aspect-ratio: 1/1` to `.cell` (base rule, covers all cell types)

**`src/main.js`:**
- Added `board.style.setProperty('--rows', String(model.height))` after the existing `--cols` line

**`src/main.gap-ux.test.js`:**
- Updated CSS regression test to check for new patterns (`grid-template-rows`, `aspect-ratio` on `.cell` instead of `.cell--playable`)

## Verification

- All 167 tests pass
- `npm run build` succeeds

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Test Update] Updated CSS regression test to match new patterns**
- **Found during:** Task 1 verification
- **Issue:** `main.gap-ux.test.js` asserted the old `grid-auto-rows: 1fr` and `aspect-ratio` on `.cell--playable` — both patterns intentionally removed by this plan
- **Fix:** Updated assertions to verify `grid-template-rows: repeat(var(--rows), 1fr)` and `aspect-ratio` on `.cell`
- **Files modified:** `src/main.gap-ux.test.js`
- **Commit:** 57578d5

## Self-Check: PASSED

- `src/styles/board.css` — modified ✓
- `src/main.js` — modified ✓
- `src/main.gap-ux.test.js` — modified ✓
- Commit `57578d5` exists ✓
- 167/167 tests pass ✓
- Build succeeds ✓

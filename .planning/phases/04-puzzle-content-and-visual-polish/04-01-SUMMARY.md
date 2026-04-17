---
phase: 04-puzzle-content-and-visual-polish
plan: "04-01"
subsystem: puzzles
tags: [content, puzzles, catalogue]
dependency_graph:
  requires: []
  provides: [puzzle-catalogue-40]
  affects: [src/puzzles/catalogue.js]
tech_stack:
  added: []
  patterns: [grid-string-encoding, pawn-directions-map]
key_files:
  created: []
  modified:
    - src/puzzles/catalogue.js
decisions:
  - Retained original puzzle IDs xk3m9pq2 and gt7wz4r1 as first two entries to preserve test compatibility
  - Used lowercase piece chars for pieces intended as color='white' per loader.js convention (char.toLowerCase() === char → white)
metrics:
  duration: "5 minutes"
  completed: "2026-04-17"
  tasks_completed: 1
  files_changed: 1
---

# Phase 04 Plan 01: Author 40 Curated Puzzles Summary

**One-liner:** Expanded puzzle catalogue from 2 placeholders to 40 curated puzzles spanning 3×3 to 5×5 boards with irregular shapes, complete difficulty arc from single-move to multi-piece complex puzzles.

## What Was Built

Replaced the 2-entry placeholder catalogue with 40 fully specified puzzles:

| Range     | Board Size     | Count | Notes                              |
|-----------|---------------|-------|------------------------------------|
| 1–8       | 3×3           | 8     | Tutorial-level, single/2-move      |
| 9–16      | 4×3 / 3×4     | 8     | Introduce wider boards             |
| 17–26     | 4×4           | 10    | Multi-piece, queen enters at #20   |
| 27–36     | 5×4/4×5/5×5   | 10    | Larger boards, more complexity     |
| 33–40     | Irregular     | 8     | `x` impassables: cross, diamond, notched, T-shape, swiss cheese, L-shape |

Goal type split: ~50/50 capture-all-targets vs reach-all-goal-squares.

Piece variety: rooks, bishops, knights, pawns (10+ puzzles), queen (puzzles 20+).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test compatibility: retained original puzzle IDs**
- **Found during:** Task 1 (test run)
- **Issue:** UI tests (main.ui.test.js, main.gap-ux.test.js, controller.test.js) hardcoded original puzzle IDs `xk3m9pq2` and `gt7wz4r1` with specific board layout assertions
- **Fix:** Kept the original two puzzles as entries 1 and 2 of the 40-puzzle catalogue (replacing placeholder puzzles 1 and 2 that were authored fresh)
- **Files modified:** src/puzzles/catalogue.js
- **Commit:** eab5880

## Verification

All 167 tests pass after changes.

## Self-Check: PASSED

- [x] `src/puzzles/catalogue.js` exists and exports 40 entries
- [x] All puzzle IDs unique (catalogue.test.js)
- [x] All puzzles have schemaVersion 1
- [x] All goalTypes valid
- [x] capture-all-targets puzzles have non-null targetColor
- [x] Commit eab5880 exists

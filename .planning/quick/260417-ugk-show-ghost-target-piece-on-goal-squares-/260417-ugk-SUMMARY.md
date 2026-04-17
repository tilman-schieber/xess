---
quick_id: 260417-ugk
slug: show-ghost-target-piece-on-goal-squares-
status: complete
created: 2026-04-17
completed: 2026-04-17
commit: affac9a
---

# Quick Task 260417-ugk Summary

- Added explicit goal-target piece mapping for reach puzzles via `goalTargets` in puzzle encoding.
- Rendered ghost pieces on empty goal squares for reach puzzles so the expected destination piece is visible.
- Updated win logic so reach puzzles with `goalTargets` require the correct piece type/color on each mapped goal square.
- Added parser, renderer, win, and UI tests for the new goal-target and ghost behavior.

Validation:
- `npm test -- src/puzzles/loader.test.js src/ui/boardRenderer.test.js src/engine/win.test.js src/main.ui.test.js`
- `npm test`

Result: reach puzzles now clearly indicate which piece belongs on target goals through in-board ghost markers.

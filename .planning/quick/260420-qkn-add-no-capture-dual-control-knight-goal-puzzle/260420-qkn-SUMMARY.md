---
quick_id: 260420-qkn
slug: add-no-capture-dual-control-knight-goal-puzzle
status: complete
created: 2026-04-20
completed: 2026-04-20
commit: pending
---

# Quick Task 260420-qkn Summary

- Confirmed the requested encoding is supported by current contracts: `goalTargets` can pin a specific black knight target, `controllableColors` can enable both colors, and `capturableByColor` can disable captures for both sides.
- Added puzzle `b4c5d6e7` (`Knight Relay`) to `src/puzzles/catalogue.js` using the provided grid and policy fields.
- Added the puzzle to `src/puzzles/tracks.js` so track discovery and launch helpers continue to cover all catalogue entries.
- Added loader and catalogue tests to lock the dual-control/no-capture policy behavior and ensure the active catalogue entry parses as intended.

Validation:
- Solvability and policy feasibility checked with a local BFS script against current engine move/apply behavior (18-move solution found).
- Contract tests updated in `src/puzzles/loader.test.js` and `src/puzzles/catalogue.test.js`.

Result: The requested puzzle is now encoded in the active catalogue with policy-safe loader/test coverage and track compatibility maintained.

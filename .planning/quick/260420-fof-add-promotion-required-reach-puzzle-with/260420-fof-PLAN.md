---
quick_id: 260420-fof
slug: add-promotion-required-reach-puzzle-with
status: ready
created: 2026-04-20
---

# Quick Task 260420-fof

Add a new catalogue puzzle that requires pawn promotion before satisfying a queen-only goal square, wire it into track metadata, and lock parser/catalogue/engine expectations with tests.

## Tasks

1. Add the promotion-required puzzle to `src/puzzles/catalogue.js` with canonical policy fields (`goalTargets`, `capturableByColor`, `promote`).
2. Add the puzzle id to active track metadata in `src/puzzles/tracks.js` so it appears in app flow.
3. Update loader/catalogue and engine tests to validate parser normalization and promotion-required goal integrity for the new puzzle contract.
4. Run the test suite and capture completion details in quick-task artifacts/state.

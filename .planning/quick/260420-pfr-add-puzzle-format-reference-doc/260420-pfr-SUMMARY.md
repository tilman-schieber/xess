---
quick_id: 260420-pfr
slug: add-puzzle-format-reference-doc
status: complete
created: 2026-04-20
completed: 2026-04-20
commit: pending
---

# Quick Task 260420-pfr Summary

- Added `docs/puzzle-format.md` as a single-source reference aligned with `src/puzzles/loader.js` and `src/puzzles/loader.test.js`.
- Documented required fields, defaults, grid symbols, FEN-like case/color mapping, goal types, `goalTargets`, and policy fields (`controllableColors`, `capturableByColor`, `promote`).
- Included minimal valid examples for both goal types and practical validation/pitfall notes from current loader behavior.

Validation:
- Content accuracy cross-checked against `src/puzzles/loader.js`, `src/puzzles/loader.test.js`, `src/puzzles/catalogue.js`, and goal handling in `src/engine/win.js`.

Result: Puzzle authoring now has a concise, implementation-accurate reference in one place.

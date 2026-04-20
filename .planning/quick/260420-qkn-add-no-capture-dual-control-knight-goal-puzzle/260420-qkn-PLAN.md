---
quick_id: 260420-qkn
slug: add-no-capture-dual-control-knight-goal-puzzle
status: ready
created: 2026-04-20
---

# Quick Task 260420-qkn

Assess whether the requested puzzle encoding is supported (dual-color control, no captures, black knight target on goal), then add it to the active catalogue and keep loader/catalogue/track contracts valid.

## Tasks

1. Validate encoding support against current loader/controller policy fields (`goalTargets`, `controllableColors`, `capturableByColor`).
2. Add the puzzle to `src/puzzles/catalogue.js` using canonical schema conventions and assign it to a track in `src/puzzles/tracks.js`.
3. Add/adjust loader and catalogue tests so the new policy contract and discovery compatibility remain covered.

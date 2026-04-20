---
quick_id: 260420-pfr
slug: add-puzzle-format-reference-doc
status: ready
created: 2026-04-20
---

# Quick Task 260420-pfr

Add a concise, implementation-accurate single-source puzzle format reference at `docs/puzzle-format.md` based on current loader behavior, tests, and real catalogue examples.

## Tasks

1. Extract actual parser/test contract from `src/puzzles/loader.js` and `src/puzzles/loader.test.js` (required fields, defaults, validation behavior).
2. Cross-check examples in `src/puzzles/catalogue.js` and include minimal valid examples for both goal types.
3. Document policy fields and common validation errors in practical authoring language.

---
quick_id: 260419-krg
slug: adjust-active-square-selection-behavior-
status: complete
created: 2026-04-19
completed: 2026-04-19
commit: e0163a8
---

# Quick Task 260419-krg Summary

- Updated tap handling so non-movable squares no longer trigger selection/illegal feedback when no piece is selected.
- Added UI regression coverage for initial board state and empty-square tap behavior to keep the active frame hidden until explicit piece selection.
- Kept legal destination and illegal-destination feedback behavior intact once a movable piece has been selected.

Validation:
- `npm test -- src/main.ui.test.js`
- `npm test -- src/main.ui.test.js src/main.gap-ux.test.js` *(existing unrelated failures in `src/main.gap-ux.test.js` rich-text description assertions remain)*

Result: active-square framing now appears only after selecting a movable white piece; empty squares no longer appear selected.

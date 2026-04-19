---
quick_id: 260419-krg
slug: adjust-active-square-selection-behavior-
status: ready
created: 2026-04-19
---

# Quick Task 260419-krg

Adjust gameplay selection feedback so the active-square frame appears only after explicitly selecting a movable white piece.

## Tasks

1. Update tap handling so tapping a non-movable square when nothing is selected does not trigger selection or illegal highlight feedback.
2. Add UI interaction regression tests for initial render and empty-square taps to ensure no selected frame appears by default.
3. Run focused UI tests to verify legal/illegal move feedback still works once a piece is selected.

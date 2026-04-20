---
quick_id: 260420-rst
slug: restart-reloads-catalogue-state
status: complete
created: 2026-04-20
completed: 2026-04-20
commit: pending
---

# Quick Task 260420-rst Summary

- Updated controller reset behavior to fully refresh puzzle state from the latest catalogue entry (including puzzle metadata), then clear persisted active state.
- Updated UI restart handling to accept refreshed puzzle data from reset so runtime render state uses the latest catalogue definition after restart.
- Added a controller regression test that starts from persisted active-state rehydration, mutates the in-memory catalogue entry, and verifies reset reflects the updated catalogue content instead of stale persisted board state.

Validation:
- `npm test -- src/controller.test.js src/main.ui.test.js`
- `npm test`

Result: pressing restart/reset now reliably reloads the current puzzle definition from `src/puzzles/catalogue.js`, even when an older active-state snapshot exists.

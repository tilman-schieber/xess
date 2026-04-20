---
quick_id: 260420-rst
slug: restart-reloads-catalogue-state
status: ready
created: 2026-04-20
---

# Quick Task 260420-rst

Ensure restart/reset always reloads the current puzzle definition from `src/puzzles/catalogue.js` instead of continuing from persisted active-state snapshots.

## Tasks

1. Update restart/reset flow so controller reset refreshes puzzle data from current catalogue content, not just board snapshots.
2. Keep UI model synchronized with refreshed puzzle data when restart is triggered.
3. Add regression coverage for persisted active-state rehydration + restart so latest catalogue mutations are reflected.
4. Run focused and full test suites to confirm no behavior regressions.

---
quick_id: 260420-fof
slug: add-promotion-required-reach-puzzle-with
status: complete
created: 2026-04-20
completed: 2026-04-20
commit: pending
---

# Quick Task 260420-fof Summary

- Added puzzle `c7d8e9f0` (`Crown the Route`) to the active catalogue using the provided grid and `reach-all-goal-squares` goal contract.
- Encoded goal targeting with `goalTargets: { '0,3': 'Q' }`, enabled `promote: true`, and set `capturableByColor` to disallow captures for both colors.
- Kept control policy single-side via canonical default parsing (`controllableColors` omitted in raw entry; loader resolves to `['white']`).
- Added the puzzle id to `labyrinths` track metadata so it appears in track-driven app flow.
- Extended loader/catalogue and engine apply tests to lock promotion-required queen-goal parsing and win behavior.

Validation:
- `npm test` (19 files, 226 tests) passes.

Result: Promotion-required queen-goal puzzle is now in the active catalogue with track discovery coverage and parser/engine contract tests.

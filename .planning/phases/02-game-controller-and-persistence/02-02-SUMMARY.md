---
phase: 02-game-controller-and-persistence
plan: "02"
subsystem: puzzles
tags: [navigation, catalogue, unlock-logic, pure-functions, vitest, tdd]

# Dependency graph
requires:
  - phase: 02-game-controller-and-persistence
    provides: catalogue.js default-export array with id/title/goalType/grid per entry

provides:
  - getUnlockedIds(solvedIds, catalogue): string[] of currently unlocked puzzle IDs
  - isUnlocked(puzzleId, solvedIds, catalogue): boolean unlock status
  - getPuzzlePosition(puzzleId, catalogue): "N / M" 1-based position string or null
  - getPuzzleList(solvedIds, catalogue): catalogue entries with solved/unlocked/locked status

affects:
  - 02-game-controller-and-persistence (plan 03: game controller uses nav.js for unlock gating)
  - phase-03 (UI puzzle list display and position string rendering)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Optional catalogue injection: functions accept catalogue as last param defaulting to real import — enables hermetic tests without vi.mock"
    - "Set-based deduplication: solvedIds converted to Set at function entry — O(1) lookups throughout"
    - "TDD red-green cycle: nav.test.js committed as RED gate before nav.js created"

key-files:
  created:
    - src/puzzles/nav.js
    - src/puzzles/nav.test.js

key-decisions:
  - "Optional catalogue parameter for test injection (no vi.mock needed — keeps tests hermetic)"
  - "Functions are fully pure: no localStorage, no DOM, no side effects — decoupled from Phase 2 persistence layer"
  - "solvedIds accepted as Set<string> or string[] — converted to Set internally; callers may pass either"

patterns-established:
  - "Catalogue injection pattern: last optional param defaults to imported module — reusable for future catalogue consumers"

requirements-completed: [NAV-01, NAV-02, NAV-03, NAV-05]

# Metrics
duration: 4min
completed: 2026-04-17
---

# Phase 02 Plan 02: Catalogue Navigation Helpers Summary

**Pure sequential-unlock navigation API (getUnlockedIds, isUnlocked, getPuzzlePosition, getPuzzleList) with 17 Vitest tests covering all unlock states, position strings, and puzzle list status fields**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-17T08:38:00Z
- **Completed:** 2026-04-17T08:42:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Written nav.test.js (RED gate) — 17 hermetic tests using mock catalogue, no vi.mock required
- Implemented nav.js (GREEN gate) — 4 pure functions with optional catalogue injection
- Full test suite passes at 124 tests (107 Phase 1 + 17 nav tests), zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing tests for nav.js (RED gate)** - `291ecb3` (test)
2. **Task 2: Implement nav.js (GREEN gate)** - `51f3e65` (feat)

_Note: TDD tasks have two commits (test → feat) following the red-green cycle._

## Files Created/Modified

- `src/puzzles/nav.js` — Pure navigation API: getUnlockedIds, isUnlocked, getPuzzlePosition, getPuzzleList
- `src/puzzles/nav.test.js` — 17 Vitest tests across 4 describe groups using mock catalogue

## Decisions Made

- Optional catalogue parameter pattern chosen over vi.mock — simpler, avoids module hoisting issues, makes test intent explicit
- Functions are pure (no localStorage, no DOM) — decoupled from the store.js persistence layer so Plan 03 controller can compose freely
- solvedIds accepted as either Set or Array — converted to Set internally so callers have flexibility

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

RED gate: `291ecb3` — test(02-02) commit with failing tests (ERR_MODULE_NOT_FOUND)
GREEN gate: `51f3e65` — feat(02-02) commit with passing implementation
All 17 nav tests pass; no REFACTOR commit needed (implementation was clean as written).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- nav.js is ready for Plan 03 (game controller): call `isUnlocked(puzzleId, solvedIds)` to gate puzzle access, `getPuzzlePosition` for UI display, `getPuzzleList` for the puzzle selection screen
- Phase 3 UI can use `getPuzzleList` directly to render the puzzle list with status badges
- No blockers

---
*Phase: 02-game-controller-and-persistence*
*Completed: 2026-04-17*

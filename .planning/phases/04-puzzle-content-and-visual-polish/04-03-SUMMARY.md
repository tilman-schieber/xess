---
phase: 04-puzzle-content-and-visual-polish
plan: "04-03"
subsystem: navigation-ui
tags: [navigation, puzzle-list, goal-badge, position-indicator, dom]
dependency_graph:
  requires: [css-design-tokens, nav-helpers]
  provides: [puzzle-list-screen, prev-next-nav, goal-badge, position-indicator]
  affects: [src/main.js, src/puzzles/nav.js, src/ui/puzzleList.js, src/styles/puzzle-list.css, src/styles/app.css]
tech_stack:
  added: []
  patterns: [vanilla-dom, pure-component, navigation-state-machine]
key_files:
  created:
    - src/ui/puzzleList.js
    - src/styles/puzzle-list.css
  modified:
    - src/puzzles/nav.js
    - src/main.js
    - src/styles/app.css
decisions:
  - Used pure DOM builder (renderPuzzleList) returning HTMLElement — no side effects, testable
  - mountGameUi now owns navigation state (currentPuzzleId, showingList) with shared controller instance
  - Win banner uses data-win-next-puzzle attribute separate from nav data-next-puzzle to avoid selector collision
  - getGoalBadgeData exported as named function for testability
  - renderToDom extended with puzzle/puzzleId/prevId/nextId on model — backwards compatible
metrics:
  duration: "~8 minutes"
  completed: "2026-04-17"
  tasks_completed: 2
  files_modified: 5
---

# Phase 04 Plan 03: Navigation Shell Summary

**One-liner:** Complete navigation shell with full-screen puzzle list, prev/next controls, goal-type badge, and "N / M" position indicator wired into the game UI via shared controller state.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Build puzzleList component + nav helpers | 5e45f25 |
| 2 | Wire navigation, goal badge, position indicator into main.js | efcb76c |

## What Was Built

### Task 1 — puzzleList component + nav helpers
- Added `getPrevId` and `getNextId` exports to `nav.js` using `_catalogue` default parameter
- Created `src/ui/puzzleList.js` — pure DOM builder returning full-screen overlay:
  - Header with "Puzzles" heading and close button (aria-label="Close puzzle list")
  - Scrollable `<ul>` of puzzle items with solved ✓ / locked 🔒 status indicators
  - Screen-reader-only labels ("Solved", "Locked") via `.sr-only` spans
  - Locked items have `pointer-events: none` (T-04-04) and `is-locked` class
  - All text uses `textContent` only — no `innerHTML` (T-04-06 XSS mitigation)
- Created `src/styles/puzzle-list.css` with full-screen overlay styles using CSS custom properties

### Task 2 — Navigation shell in main.js
- Added `getGoalBadgeData(puzzle)` export returning `{ label, type }` for capture/reach/unknown goals
- Updated `renderToDom` to include:
  - Goal badge (`<div class="goal-badge" data-goal-type>`) with correct UI-SPEC labels
  - Position indicator (`<span class="puzzle-position" data-puzzle-position>`) showing "N / M"
  - Puzzle list button (`data-open-list`, aria-label="Puzzle list") in meta header
  - Prev/next nav buttons with `aria-disabled` when at catalogue boundaries
  - Win banner: "Next Puzzle" CTA when not last puzzle, or "All N puzzles solved! 🎉" at end
- Updated `mountGameUi` to:
  - Own navigation state (`currentPuzzleId`, `showingList`)
  - Share a single `createController()` instance across puzzle loads
  - `loadPuzzle(id)` creates fresh `createGameUiController` per puzzle
  - `renderGameScreen()` extends model with `prevId`/`nextId`/`puzzleId` before render
  - `renderListScreen()` uses `renderPuzzleList` with live controller puzzle list
- Added nav styles to `app.css`: `.goal-badge`, `.puzzle-nav`, `.nav-btn`, `.btn-next-puzzle`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] src/ui/puzzleList.js exists and exports renderPuzzleList
- [x] src/styles/puzzle-list.css exists with :root token-based styles
- [x] src/puzzles/nav.js exports getPrevId and getNextId
- [x] src/main.js exports getGoalBadgeData, getPuzzleObjectiveText, createGameUiController, mountGameUi
- [x] All 167 tests pass
- [x] Build succeeds (37.6 kB JS, 10.6 kB CSS)

## Self-Check: PASSED

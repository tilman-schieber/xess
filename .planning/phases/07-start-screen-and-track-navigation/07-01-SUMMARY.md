---
phase: 07-start-screen-and-track-navigation
plan: 01
subsystem: navigation
tags: [tracks, nav, vitest]
requires:
  - phase: 02-game-controller-and-persistence
    provides: pure catalogue navigation helpers and solved-status list contracts
provides:
  - static track metadata contract for grouped puzzle navigation
  - pure track list and launch selection helpers
  - deterministic fallback behavior tests for unknown/empty tracks
affects: [main-flow, track-browser-ui]
tech-stack:
  added: []
  patterns: [pure helper modules, optional dependency injection for tests]
key-files:
  created: [src/puzzles/tracks.js]
  modified: [src/puzzles/nav.js, src/puzzles/nav.test.js]
key-decisions:
  - "Track launch fallback order is active-in-track -> first-unsolved -> first-track -> null."
  - "Track metadata is static and local; unknown track IDs return safe empty/null results instead of throwing."
patterns-established:
  - "Track helpers stay side-effect free and storage-agnostic in nav.js."
requirements-completed: [TRK-02, TRK-03, TRK-04]
duration: 1m 15s
completed: 2026-04-18
---

# Phase 7 Plan 1: Track Metadata and Navigation Contracts Summary

**Static track metadata plus pure track-aware navigation helpers now provide deterministic grouping, within-track numbering, and launch/resume selection without storage or DOM coupling.**

## Performance

- **Duration:** 1m 15s
- **Started:** 2026-04-18T11:46:01+02:00
- **Completed:** 2026-04-18T11:47:16+02:00
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `src/puzzles/tracks.js` with three named tracks covering every catalogue puzzle exactly once.
- Extended `nav.js` with `getTracks`, `getTrackPuzzleList`, and `getTrackLaunchPuzzleId` pure exports.
- Added branch-complete tests for track grouping, numbering, and launch fallback rules.

## Task Commits

1. **Task 1: Add track metadata contract and indexing helpers** - `ae59125`, `41feaa0` (test, feat)
2. **Task 2: Implement track launch/resume selection rules** - `3c51d2b`, `50b692d` (test, feat)

## Files Created/Modified
- `src/puzzles/tracks.js` - static track definitions with ids, labels, subtitles, and ordered puzzle ids.
- `src/puzzles/nav.js` - track-aware pure helpers for listing and launch target selection.
- `src/puzzles/nav.test.js` - contract tests for grouping, numbering, and deterministic fallback behavior.

## Decisions Made
- Track metadata is the single source for group ordering; puzzle numbering is always computed per track.
- Missing or unknown track data is treated as safe null/empty output to avoid runtime navigation failures.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None.

## Next Phase Readiness

- Track-domain contracts are stable and test-covered for UI consumption.
- Ready for start-screen and track-browser renderer work.

## Self-Check: PASSED

- FOUND: `.planning/phases/07-start-screen-and-track-navigation/07-01-SUMMARY.md`
- FOUND commits: `ae59125`, `41feaa0`, `3c51d2b`, `50b692d`

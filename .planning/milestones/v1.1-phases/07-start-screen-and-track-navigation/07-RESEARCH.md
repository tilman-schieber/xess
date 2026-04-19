# Phase 7 Research: Start Screen and Track Navigation

**Phase:** 7 — Start Screen and Track Navigation
**Date:** 2026-04-18
**Status:** complete

## Scope Restatement

Phase 7 introduces a start-first UX and track-based puzzle navigation while keeping the existing puzzle engine/controller behavior intact.

Mapped requirements:
- TRK-01: Land on start screen before puzzle play
- TRK-02: Show grouped tracks instead of one flat list
- TRK-03: Open a track and browse puzzles numbered within that track
- TRK-04: Start/resume puzzle from selected track context
- UXP-03: Consistent visual hierarchy and spacing across start/list/play

## Current Codebase Signals

1. `src/main.js` currently mounts gameplay directly and toggles only between game view and a global puzzle list overlay.
2. `src/puzzles/nav.js` is pure and already suitable for extension; today it assumes one flat catalogue.
3. `src/controller.js` owns runtime game state and persistence wiring; this is the safest place to expose track-resume helpers.
4. Styling tokens for spacing/typography are centralized in `src/styles/app.css`, so new start/list screens should consume existing CSS variables.

## Recommended Implementation Direction

1. Add a **track metadata contract** (`src/puzzles/tracks.js`) that maps track IDs to ordered puzzle IDs without mutating puzzle IDs.
2. Extend navigation helpers in `src/puzzles/nav.js` with track-aware pure functions (grouping, within-track numbering, resume target selection).
3. Add two pure UI renderers:
   - `src/ui/startScreen.js`
   - `src/ui/trackBrowser.js`
4. Convert `src/main.js` from a two-screen toggle to a small screen-state machine:
   - `start` → `track-browser` → `play`
5. Keep storage schema unchanged in Phase 7; defer migration/compatibility hardening to Phase 8 as already mapped in roadmap.

## Constraints / Non-goals

- No new dependencies required (Level 0 discovery)
- No backend/API changes
- Do not alter engine move logic
- Do not introduce puzzle ID re-indexing or storage schema migration in this phase

## Test Strategy

- Unit tests (Vitest) for track-aware pure navigation helpers
- DOM/unit tests for start and track browser renderers
- Integration tests for main flow (start screen first, track open, launch/resume behavior)

## Validation Architecture

- Per-task quick check: targeted Vitest file runs for touched subsystem
- Per-wave check: `npm test -- --run`
- Manual sanity checks only for optional visual polish nuances; all phase requirements must have automated coverage

## Risks and Mitigations

1. **Risk:** Track model breaks existing `getPuzzlePosition` expectations in puzzle UI
   - **Mitigation:** Keep existing global position helpers and add dedicated track-position helpers for track browser
2. **Risk:** Resume behavior is ambiguous when active puzzle belongs to another track
   - **Mitigation:** Explicit rule in helper: resume active puzzle only when active puzzle belongs to selected track, otherwise launch first unsolved puzzle in that track
3. **Risk:** UI inconsistency across start/list/play
   - **Mitigation:** Reuse `app.css` tokens and add screen-specific CSS files that depend on common variables

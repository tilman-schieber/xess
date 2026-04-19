# Phase 8 Research: Track Compatibility and Launch Content Robustness

**Phase:** 8 — Track Compatibility and Launch Content Robustness  
**Date:** 2026-04-18  
**Status:** complete

## Scope Restatement

Phase 8 must keep launch puzzle content fully local/static while hardening track metadata and persistence compatibility after Phase 7's track-first navigation shift.

Mapped requirements:
- CNT-01: Placeholder launch puzzle set is playable immediately after install/update
- CNT-02: Catalogue remains static local assets (no runtime puzzle-data network dependency)
- TRK-05: Track metadata can represent future mode entry points without breaking current flow
- TRK-06: Existing solved/in-progress data remains compatible after track indexing migration

## Current Codebase Signals

1. `src/puzzles/catalogue.js` and `src/puzzles/tracks.js` are static module imports today (no fetch path).
2. `src/puzzles/nav.js` already provides pure safe-return helpers (`[]`/`null` on unknown IDs), making it the right hardening seam.
3. `src/store/store.js` sanitizes shape/type but does not yet validate puzzle IDs against the shipped catalogue.
4. `src/controller.js` rehydrates persisted active state and already falls back to fresh parsed puzzle state on malformed board snapshots.

## Recommended Implementation Direction

1. Add a dedicated puzzle-content integrity helper in `src/puzzles/` that:
   - validates track-to-catalogue references,
   - detects duplicate/missing/invalid references,
   - returns a filtered, playable-safe track set and warning list.
2. Extend `src/puzzles/tracks.js` metadata with optional mode-entry fields (`random`, `guided`, `tutorial`) while preserving backward-compatible defaults.
3. Update `src/puzzles/nav.js` to consume the integrity helper and fail-soft (`[]`/`null`) for invalid future metadata fields.
4. Strengthen `src/store/store.js` sanitization to retain only valid puzzle IDs for `solvedIds` and `activeState.puzzleId`, preserving valid records and dropping stale ones non-destructively.
5. Add controller/store/nav regression tests to guarantee immediate launch playability and compatibility after stale-data migration scenarios.

## Constraints / Non-goals

- No backend/API or runtime fetch for puzzle catalogue/track data (D-01, D-02).
- No implementation of future game modes in this phase; only metadata compatibility (D-05).
- No hard failure on malformed metadata or stale IDs; degrade gracefully and keep app playable (D-06, D-08).

## Test Strategy

- Unit tests for content integrity helper branches (missing IDs, duplicates, empty track, invalid mode metadata).
- Unit tests for nav helper behavior with sanitized/filtered track data.
- Store/controller tests for stale solved/active IDs migration behavior and preserved valid progress.
- Focused integration test ensuring startup path remains playable from static local assets.

## Validation Architecture

- Per-task quick checks: targeted Vitest runs for touched subsystem.
- Per-wave check: `npm test -- --run`.
- No manual-only requirement for this phase's core behaviors; all requirements should have automated checks.

## Risks and Mitigations

1. **Risk:** Over-aggressive filtering could hide too many puzzles and appear like content loss.
   - **Mitigation:** Filter only invalid references; preserve every valid ID and emit deterministic warnings.
2. **Risk:** Stale persisted IDs after update may break resume/launch flow.
   - **Mitigation:** Sanitize `solvedIds` and `activeState.puzzleId` against current catalogue IDs; keep valid records intact.
3. **Risk:** Future mode metadata fields could break current UI if malformed.
   - **Mitigation:** Treat mode metadata as optional and ignore unknown/invalid keys in current flow.

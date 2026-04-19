# Roadmap: Xess

## Milestones

- ✅ **v1.1 UX Launch Polish** — Phases 7-10 (shipped 2026-04-19, archive: `.planning/milestones/v1.1-ROADMAP.md`)
- ◆ **v1.2 Puzzle Logic Improvement** — Phases 11-12 (active)

## Phases

<details>
<summary>✅ v1.1 UX Launch Polish (Phases 7-10) — SHIPPED 2026-04-19</summary>

- [x] Phase 7: Start Screen and Track Navigation (3/3 plans) — completed 2026-04-18
- [x] Phase 8: Track Compatibility and Launch Content Robustness (2/2 plans) — completed 2026-04-18
- [x] Phase 9: Puzzle Rich Text Content (2/2 plans) — completed 2026-04-18
- [x] Phase 10: UX and Audio Launch Polish (3/3 plans) — completed 2026-04-18

</details>

## Current Milestone: v1.2 Puzzle Logic Improvement

**Goal:** Tune puzzle logic and improve move tracking reliability before adding new gameplay modes.

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 11 | Move Legality Hardening | 3/3 | Complete   | 2026-04-19 |
| 12 | Tracking State and UX Verification | 1/3 | In Progress|  |

### Phase 11: Move Legality Hardening

Goal: Remove geometry-edge move inconsistencies and enforce strict invalid-move rejection.

Requirements: LOGIC-01, LOGIC-02

**Plans:** 3/3 plans complete

Plans:
- [x] 11-01-PLAN.md — Normalize puzzle schema/content to canonical case and policy defaults
- [x] 11-02-PLAN.md — Refactor engine legality + opt-in promotion with edge-path regression tests
- [x] 11-03-PLAN.md — Enforce controller policy gates and strict invalid-move non-mutation

Success criteria:
1. Legal move generation behaves consistently across representative non-rectangular and blocked-board fixtures.
2. Invalid move attempts never mutate board state, move counter, or history stacks.
3. Engine/controller regression tests cover edge movement paths for all supported piece types.
4. Existing solved puzzle flow remains unchanged for valid moves.

### Phase 12: Tracking State and UX Verification

Goal: Introduce canonical move events plus synced move-history UX with undo/redo/reload-safe tracking state.

Requirements: LOGIC-03, MOVE-01, MOVE-02, MOVE-03, MOVE-04

**Plans:** 1/3 plans executed

Plans:
- [x] 12-01-PLAN.md — Extend store schema and sanitization for replay-safe tracking persistence and solved move-count metadata
- [ ] 12-02-PLAN.md — Implement controller canonical events with synchronized undo/redo/counter/reload semantics
- [ ] 12-03-PLAN.md — Wire gameplay undo/redo + move counter UX while deferring visible history list rendering

Success criteria:
1. Every committed move appends one canonical tracking event with deterministic replay semantics.
2. Move counter remains accurate through forward moves, undo, redo, and reset.
3. Redo availability clears immediately when a new divergent move is committed.
4. Persisted active puzzle snapshots rehydrate board, history, and counter without mismatch.
5. Regression tests cover undo/redo/reload invariants and reject drift cases.
6. Active puzzle UI exposes chronological move history with stable ordering and readable entries.
7. History view stays synchronized with current board position after undo/redo/reset and excludes invalid moves.

# Phase 11 Research: Move Legality Hardening

**Phase:** 11 — Move Legality Hardening  
**Date:** 2026-04-19  
**Status:** complete

## Scope Restatement

Phase 11 hardens legality handling for geometry-edge movement and invalid-move rejection, while aligning puzzle schema/content with locked context decisions for piece case mapping, pawn semantics, control/capture policy, and optional promotion.

Mapped requirements:
- LOGIC-01: legal moves are consistent across non-rectangular/blocked boards
- LOGIC-02: invalid moves never mutate board, progress, or history state

## Locked Decision Impact (from CONTEXT.md)

- D-01/D-02: Standard FEN case mapping with in-place content update (no legacy dual-mode support)
- D-03/D-04: Remove per-pawn direction, pawns move upward only (`dr=-1`) with upward diagonals
- D-05/D-06/D-07: Preserve current defaults but support puzzle-level control and capture permissions
- D-08/D-09: Optional puzzle-level `promote` flag auto-promotes pawn to queen on top row

## Current Codebase Signals

1. `src/puzzles/loader.js` already normalizes puzzle-level metadata (`controllableColors`, `capturableByColor`, `promote`) and is the schema boundary.
2. `src/puzzles/catalogue.js` still contains `pawnDirections` entries that conflict with D-03.
3. `src/engine/moves.js` currently depends on `piece.direction` and supports non-upward pawn movement; this must be replaced for D-04.
4. `src/engine/apply.js` is the correct mutation seam for promotion state transitions.
5. `src/controller.js` enforces invalid-move rejection and is the right gate for controllable/capturable policy integration without bypassing existing legality guardrails.

## Discovery Notes (Level 0)

No new dependencies or external APIs are required. Existing architecture and test stack (Vitest + pure engine/controller modules) is sufficient.

## Recommended Implementation Direction

1. **Schema/content alignment first**
   - Keep uppercase=white and lowercase=black parsing (D-01).
   - Remove all `pawnDirections` handling from loader tests/content and update catalogue fixtures in-place (D-02, D-03).
   - Keep defaults `controllableColors=['white']`, `capturableByColor.white=['black']`, `promote=false` to preserve current behavior (D-05).

2. **Engine move semantics hardening**
   - Refactor pawn move generation to fixed upward movement and upward-diagonal captures (D-04).
   - Preserve impassable/geometry handling through `board.has(key)` constraints.
   - Add edge-fixture tests that assert stable behavior on irregular and blocked boards for each piece family (LOGIC-01).

3. **Move commit hardening + promotion**
   - Apply promotion in `applyMove` when `puzzle.promote===true` and pawn reaches row `0` (D-08, D-09).
   - Keep immutable board replacement and win-check semantics unchanged.

4. **Controller policy + invalid-move invariants**
   - Enforce puzzle-level `controllableColors` in `selectPiece`.
   - Enforce `capturableByColor` as legality filter in `makeMove` before mutation.
   - Add regression tests proving illegal attempts do not mutate board, undo stack, solved state, or persisted active state (LOGIC-02).

## Constraints / Non-goals

- No castling/check/en-passant logic changes.
- No migration compatibility window for legacy pawn-direction content.
- No UI move-history work in this phase (belongs to Phase 12).

## Test Strategy

- `src/puzzles/loader.test.js` + `src/puzzles/catalogue.test.js`: schema/content normalization and compatibility.
- `src/engine/moves.test.js` + `src/engine/index.test.js`: pawn and geometry-edge legality coverage.
- `src/engine/apply.test.js`: promotion behavior + immutable move application.
- `src/controller.test.js`: control/capture policy enforcement and invalid-move non-mutation guarantees.
- Full regression: `npm test -- --run`.

## Validation Architecture

- Task-level: targeted Vitest command for each touched subsystem.
- Plan-level: grouped legality suite after each plan.
- Phase-level: full test suite before completion.

## Risks and Mitigations

1. **Risk:** Case-mapping/content updates silently invert piece ownership.
   - **Mitigation:** loader + catalogue tests assert explicit color parsing and fixture validity.
2. **Risk:** Pawn refactor breaks irregular-board legality.
   - **Mitigation:** dedicated edge-path fixtures in engine tests for blocked/non-rectangular boards.
3. **Risk:** New capture policy introduces false-positive legality in controller.
   - **Mitigation:** controller tests assert policy-filtered legal targets and no mutation on rejected moves.

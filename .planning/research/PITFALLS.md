# Pitfalls Research (Milestone v1.2)

**Project:** Xess
**Milestone focus:** puzzle logic and move tracking
**Researched:** 2026-04-19

## High-Risk Pitfalls

1. **History drift after undo/redo**
   - Risk: board state and move list diverge.
   - Mitigation: test state invariants after every transition.

2. **Invalid move mutates state indirectly**
   - Risk: rejected intents still alter selection/history/counters.
   - Mitigation: enforce early-return contract on invalid paths.

3. **Redo branch corruption**
   - Risk: redo remains available after a new divergent move.
   - Mitigation: clear redo stack whenever a fresh forward move is committed.

4. **Persistence schema mismatch**
   - Risk: old saved states crash or silently drop tracking fields.
   - Mitigation: tolerant rehydrate defaults + migration-safe parsing.

5. **Geometry edge-case regressions**
   - Risk: fixes for one piece type break another on irregular boards.
   - Mitigation: piece-by-piece regression suite for representative puzzle fixtures.

## Warning Signs During Implementation

- Move counter does not match history length.
- Undo restores board but not selected/active UI state.
- Reloaded game resumes with impossible legal moves.
- Same intent produces different outcomes from identical start state.

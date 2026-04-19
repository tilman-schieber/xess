# Architecture Research (Milestone v1.2)

**Project:** Xess
**Milestone focus:** puzzle logic tuning and move tracking
**Researched:** 2026-04-19

## Integration Approach

Continue using the existing layering:

1. Renderer emits move intents.
2. Controller validates through engine.
3. Controller applies valid moves and updates history stacks.
4. Store persists active puzzle + tracking metadata.
5. Renderer reflects current board + tracking state.

## New/Modified Components

| Component | Change type | v1.2 focus |
|-----------|-------------|------------|
| Engine move generation | Modify | Close edge cases on irregular geometry and blocked paths |
| Game controller | Modify | Enforce atomic move apply/reject behavior and history bookkeeping |
| Persistence store | Modify | Serialize/rehydrate move tracking fields safely |
| Play UI renderer | Modify | Surface invalid move feedback, move count, and move history view |

## Data Flow Notes

- Invalid move path: `intent -> validate false -> feedback -> no state write`.
- Valid move path: `intent -> validate true -> apply -> append history -> persist`.
- Undo path: `pop undo -> push redo -> render -> persist`.
- Redo path: `pop redo -> push undo -> render -> persist`.

## Build Order Recommendation

1. Define move-history state contract (single source of truth).
2. Tighten engine/controller legality behavior with tests.
3. Add undo/redo invariants and persistence recovery.
4. Add play-surface tracking and feedback UI.

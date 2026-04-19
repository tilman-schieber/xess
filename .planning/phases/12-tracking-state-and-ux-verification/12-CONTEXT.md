# Phase 12: Tracking State and UX Verification - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 12 delivers deterministic runtime move tracking with undo-safe counting and persistence guarantees for active puzzle recovery. This phase does not include visible move-history UI rendering.

</domain>

<decisions>
## Implementation Decisions

### Runtime Tracking and Undo/Redo Contract
- **D-01 [auto]:** Implement move recording/counting as a core runtime feature, not as a UI-only concern.
- **D-02 [auto]:** Move count must stay correct through forward moves, undo, redo, and reset/reload paths.
- **D-03 [auto]:** Redo history must be invalidated immediately when a new divergent move is committed after undo.

### History UI Scope
- **D-04 [auto]:** Chronological move-history UI rendering is out of scope for this milestone; runtime history data still must be tracked canonically.

### Puzzle Completion Persistence
- **D-05 [auto]:** Persist per-puzzle solved move count when a puzzle is solved.

### Compatibility Guarantees
- **D-06 [auto]:** Preserve existing progress/unlock behavior and solved progression semantics while introducing tracking data.

### Claude's Discretion
- Choose exact event payload schema and serialization shape, but keep deterministic replay semantics explicit and testable.
- Select whether move-count persistence for solved puzzles lives in existing progress structures or a parallel metadata structure, as long as compatibility is preserved.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope and Requirements
- `.planning/ROADMAP.md` — Phase 12 goal and tracking/recovery success criteria.
- `.planning/REQUIREMENTS.md` — LOGIC-03 and MOVE-01..MOVE-04 requirement intent.
- `.planning/STATE.md` — current milestone state and prior compatibility constraints.

### Runtime State and Persistence
- `src/controller.js` — move commit flow, undo behavior, solved progression, and active-state persistence entry points.
- `src/store/store.js` — localStorage schema, active puzzle serialization, and persistence guards.
- `src/engine/apply.js` — canonical mutation boundary for committed moves.

### UI Integration Surface (Future History Rendering)
- `src/main.js` — gameplay orchestration and current runtime model handoff to UI.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createController` in `src/controller.js` already centralizes legal move commit, undo stack updates, and solved persistence, making it the correct integration point for canonical tracking events and move counts.
- `saveActiveState` and `loadStore` in `src/store/store.js` already own serialization/rehydration for in-progress puzzles and can be extended for replay-safe tracking state.

### Established Patterns
- Board mutation happens only on validated moves (`makeMove` -> `applyMove`), which is the stable boundary for emitting canonical move events.
- Invalid move attempts return explicit errors and do not mutate board/undo state; tracking must preserve that invariant.
- Solved puzzles currently clear active state and persist solved IDs; new solved move-count persistence must not regress this behavior.

### Integration Points
- Runtime move history and count should be updated in `makeMove`, `undo`, `reset`, and load/rehydration paths.
- Any persistence schema extension must remain robust to malformed localStorage payloads and preserve existing fallback behavior.

</code_context>

<specifics>
## Specific Ideas

- Treat move-history data as canonical runtime state first, then expose it in UI in a later phase.
- Capture enough event detail to replay and verify count/history consistency in tests without requiring UI rendering.

</specifics>

<deferred>
## Deferred Ideas

- Active puzzle move-history UI rendering (chronological list surface) deferred to a follow-up phase.

</deferred>

---

*Phase: 12-tracking-state-and-ux-verification*
*Context gathered: 2026-04-19*

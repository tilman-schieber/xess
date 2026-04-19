# Phase 11: Move Legality Hardening - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 11 removes move-legality inconsistencies and hardens invalid-move rejection while updating puzzle schema/content expectations that directly affect legal move generation (piece case mapping, pawn movement semantics, control/capture policy, and promotion behavior).

</domain>

<decisions>
## Implementation Decisions

### Puzzle Encoding and Schema Policy
- **D-01 [auto]:** Standardize puzzle encoding to standard FEN case mapping: uppercase = white, lowercase = black.
- **D-02 [auto]:** No migration path is required for legacy content; active puzzle content is updated in-place to the new mapping.

### Pawn Rules
- **D-03 [auto]:** Remove per-pawn direction configuration from puzzle schema and runtime model.
- **D-04 [auto]:** Pawns always move upward (`dr = -1`) for forward movement and use corresponding upward diagonals for captures.

### Control and Capture Permissions
- **D-05 [auto]:** Preserve current default behavior: black pieces are non-player-controllable and capturable by white.
- **D-06 [auto]:** Add puzzle-level configurability for controllable pieces/colors.
- **D-07 [auto]:** Add puzzle-level configurability for capture permissions.

### Promotion Behavior
- **D-08 [auto]:** Add puzzle-level `promote` flag.
- **D-09 [auto]:** When `promote` is `true`, a pawn that reaches the top row auto-promotes to a queen.

### Claude's Discretion
- Keep exact field naming and shape for new puzzle-level configurability consistent with existing loader/controller patterns.
- Update tests at parser, move-generation, and controller levels where behavior changes.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope and Requirements
- `.planning/ROADMAP.md` — Phase 11 goal, requirements, and success criteria.
- `.planning/REQUIREMENTS.md` — LOGIC-01 and LOGIC-02 constraints.
- `.planning/STATE.md` — active milestone state and prior decision history that this context supersedes.

### Puzzle Schema and Runtime Parsing
- `src/puzzles/loader.js` — piece case parsing, puzzle-level control/capture/promote fields.
- `src/puzzles/catalogue.js` — active puzzle content to update for case mapping and pawn rule changes.

### Move Generation and Move Application
- `src/engine/moves.js` — pawn movement semantics and legal move generation.
- `src/engine/apply.js` — move commit behavior where promotion handling may attach.
- `src/controller.js` — controllable color enforcement and invalid-move guard behavior.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `parsePuzzle` in `src/puzzles/loader.js` already centralizes schema normalization and is the right entry point for new puzzle-level control/capture/promote contracts.
- `getPawnMoves` in `src/engine/moves.js` is isolated and can absorb fixed upward pawn semantics with targeted tests.
- `selectPiece` in `src/controller.js` already gates control by color and can be generalized to puzzle-level controllable policy.

### Established Patterns
- Puzzle metadata is parsed once at load time and then consumed as normalized fields in controller/engine flow.
- Move legality is enforced before mutation (`controller.makeMove`) and mutation logic is isolated in `applyMove`.
- Regression safety relies on focused Vitest coverage across loader, engine, and controller layers.

### Integration Points
- Puzzle content migration happens in `src/puzzles/catalogue.js` and must stay aligned with `parsePuzzle` assumptions.
- Capture-permission policy needs to align move generation and/or legality filtering so invalid captures are rejected before state mutation.
- Promotion behavior must occur in committed move flow and remain compatible with win-check and history invariants.

</code_context>

<specifics>
## Specific Ideas

- Explicitly supersede the prior state decision that pawn direction is per-piece; Phase 11 now standardizes upward pawn movement.
- Treat schema/content update as mandatory in this phase (no dual-format support window).

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 11-move-legality-hardening*
*Context gathered: 2026-04-19*

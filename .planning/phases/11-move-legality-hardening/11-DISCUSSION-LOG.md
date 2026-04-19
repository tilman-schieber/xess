# Phase 11: Move Legality Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 11-move-legality-hardening
**Areas discussed:** puzzle case mapping, schema migration strategy, pawn direction model, default control/capture policy, puzzle-level permissions, promotion behavior

---

## Puzzle Case Mapping

| Option | Description | Selected |
|--------|-------------|----------|
| Keep current mapping | Retain current case-to-color interpretation | |
| Standard FEN mapping | Uppercase = white, lowercase = black | ✓ |

**User's choice:** Standard FEN mapping.
**Notes:** Auto-mode locked this as an explicit implementation decision.

---

## Migration Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Dual support with migration window | Support both encodings temporarily, migrate later | |
| In-place content update, no migration path | Update active puzzles now and remove legacy path | ✓ |

**User's choice:** No migration path; update active puzzle content to the new mapping.
**Notes:** Decision favors strictness and simpler legality code paths.

---

## Pawn Direction Model

| Option | Description | Selected |
|--------|-------------|----------|
| Keep per-pawn direction config | Continue puzzle-defined direction vectors | |
| Fixed upward pawn movement | Remove per-pawn config; pawns always move upward | ✓ |

**User's choice:** Remove per-pawn direction config; pawns always move upward.
**Notes:** This supersedes prior roadmap/state convention that direction is per-piece.

---

## Default Control/Capture Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Change default side behavior | Adjust baseline control/capture defaults | |
| Preserve current default behavior | Black non-player-controllable and capturable by white | ✓ |

**User's choice:** Preserve existing defaults.
**Notes:** New configurability must not break current puzzle behavior by default.

---

## Puzzle-Level Permissions

| Option | Description | Selected |
|--------|-------------|----------|
| Keep global hardcoded policy | No puzzle-level overrides | |
| Add puzzle-level control/capture permissions | Per-puzzle control and capture policy configuration | ✓ |

**User's choice:** Add puzzle-level configurability for controllable pieces/colors and capture permissions.
**Notes:** Defaults remain backward-compatible with current white-player behavior.

---

## Pawn Promotion Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| No promotion support | Keep current no-promotion behavior | |
| Add optional promotion flag | `promote=true` auto-promotes pawn on top row to queen | ✓ |

**User's choice:** Add puzzle-level `promote` flag with auto-promotion to queen on top-row reach.
**Notes:** Behavior is opt-in per puzzle.

---

## Claude's Discretion

- Field names and shape for puzzle-level permissions are implementation details for planning.
- Promotion execution point (engine vs controller handoff) remains implementation detail as long as legality invariants hold.

## Deferred Ideas

None.

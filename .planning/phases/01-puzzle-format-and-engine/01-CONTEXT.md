# Phase 1: Puzzle Format and Engine - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers two things:
1. A fully specified text-grid puzzle definition format (the spec that all puzzle files will follow)
2. A correct, tested chess movement engine for non-standard boards — legal move generation, win condition detection, and snapshot-based undo

No UI, no rendering, no localStorage, no PWA. Pure logic + format spec, testable in isolation with Vitest.

</domain>

<decisions>
## Implementation Decisions

### Puzzle Catalogue Structure
- **D-01:** All puzzles live in a single file: `src/puzzles/catalogue.js`
- **D-02:** The file exports a default array: `export default [puzzle1, puzzle2, ...]`
- No per-puzzle files, no JSON, no dynamic imports — one import anywhere, easy to reorder

### Piece Character Encoding
- **D-03:** Lowercase = white pieces, uppercase = black pieces (e.g. `p` = white pawn, `P` = black pawn)
- **D-04:** FEN-style character mapping: `p/P` pawn, `n/N` knight, `b/B` bishop, `r/R` rook, `q/Q` queen, `k/K` king
- **D-05:** Grid special characters: `-` = empty, `x` = impassable, `G` = goal square (consistent with PROJECT.md example)

### Color Semantics (Critical Clarification)
- **D-06:** There is no "player" vs "opponent" in Xess. ALL pieces of BOTH colors are movable by the player.
- **D-07:** Colors exist solely to enable clear puzzle instructions (e.g. "use the white knight to capture all black pawns")
- **D-08:** Capture rule: white pieces capture black pieces, black pieces capture white pieces (standard chess color-based capture — applies even though the player controls both colors)
- **D-09:** Win condition for "capture-all-targets" means all pieces of the TARGET color have been captured — not a specific named opponent

### Engine Internals
- **D-10:** Board represented as `Map<string, Cell>` with `"col,row"` string keys (per CLAUDE.md recommendation)
- **D-11:** Impassable squares are excluded from the cell map entirely — not stored as a special cell type
- **D-12:** Each piece type implements `getMoves(board, position) => Position[]` — pure function pattern
- **D-13:** Knights jump over impassable squares (cannot land on them, but path is irrelevant)

### Claude's Discretion
- Engine module file structure (how many files, naming) — follow existing patterns when src/ is scaffolded
- Exact snapshot shape for undo stack (which fields are cloned) — follow ENG-08 requirements
- Win condition check timing — after applyMove or as separate exported function
- Test file placement — colocated (`src/engine/*.test.js`) or under `tests/` — either works

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §FMT-01–FMT-05 — Complete puzzle format spec (text-grid encoding, piece encoding, goal types, stable IDs, schema versioning)
- `.planning/REQUIREMENTS.md` §ENG-01–ENG-08 — Complete engine requirements (move generation, impassable squares, pawn direction, no check/castling, win conditions, pure functions, undo)

### Architecture Guidance
- `CLAUDE.md` — Board representation recommendation (Map<string, Cell>), move generation pattern, tech stack decisions (Vanilla JS, Vitest, no chess.js)

### Project Context
- `.planning/ROADMAP.md` §Phase 1 — Success criteria (5 checkpoints that define "done")
- `.planning/PROJECT.md` §Context — Text-grid notation example and key decisions (no castling, no check, pawn direction per-piece)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — project is at initialization, `src/` does not exist

### Established Patterns
- None yet — Phase 1 establishes the patterns all subsequent phases follow

### Integration Points
- `src/puzzles/catalogue.js` — Phase 1 creates this; Phase 2 (game shell) imports it
- Engine module (to be created in Phase 1) — Phase 2 and 3 import `getLegalMoves`, `applyMove`, `checkWin`, `undo`
- All puzzle files authored in Phase 4 must conform to the format spec locked in Phase 1

</code_context>

<specifics>
## Specific Ideas

- The text-grid format example from PROJECT.md (`p`=white pawn, `P`=black pawn, `n`=knight, `-`=empty, `x`=impassable) is the authoritative starting point — Phase 1 formalizes this into the full spec
- The color mechanic is a puzzle-design tool, not a gameplay restriction: colors let puzzle authors write clear instructions without needing named piece IDs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-puzzle-format-and-engine*
*Context gathered: 2026-04-16*

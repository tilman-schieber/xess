# Phase 1: Puzzle Format and Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 01-puzzle-format-and-engine
**Areas discussed:** Puzzle catalogue structure, Piece character encoding

---

## Puzzle Catalogue Structure

| Option | Description | Selected |
|--------|-------------|----------|
| One catalogue file | All puzzles in `src/puzzles/catalogue.js`, `export default [...]` | ✓ |
| Per-puzzle JS modules | Each puzzle its own file, requires generated index | |
| JSON files | Puzzles in JSON, requires a loader module | |

**User's choice:** One catalogue file — `src/puzzles/catalogue.js` with `export default [...]`
**Notes:** Simple, easy to reorder, single import point for Phase 2+.

---

## Piece Character Encoding

| Option | Description | Selected |
|--------|-------------|----------|
| Lowercase = white, uppercase = black | FEN-style chars: p/P n/N b/B r/R q/Q k/K | ✓ |
| Uppercase = player, lowercase = opponent | Reversed convention | |
| Prefix notation (wp, bp) | More explicit but breaks single-char grid | |

**User's choice:** Lowercase = white, uppercase = black, FEN-style character mapping.

**Critical clarification from user (freeform):** There is no player vs opponent in Xess. ALL pieces (both colors) are movable by the player. Colors exist solely for puzzle instruction clarity (e.g. "capture all black pawns"). Capture rule is standard chess color-based: white captures black, black captures white — even though the player controls both.

**Capture rule follow-up:**

| Option | Description | Selected |
|--------|-------------|----------|
| Color-based: white captures black, black captures white | Standard chess rule | ✓ |
| Goal-defined: capture targets listed in puzzle definition | No color-based rule | |
| Any piece captures any piece | Maximum flexibility | |

**User's choice:** Color-based capture — white captures black, black captures white.

---

## Claude's Discretion

- Engine module file structure and naming
- Exact undo snapshot shape
- Win condition check timing (inside applyMove vs exported separately)
- Test file placement (colocated vs tests/ directory)

## Deferred Ideas

None.

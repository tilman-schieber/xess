# Phase 3: Board Renderer and Core UI - Research

**Researched:** 2026-04-17
**Domain:** Board rendering, touch interaction, mobile-first layout, controller-to-UI integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

No phase-specific CONTEXT.md exists for Phase 3.

Planning and implementation must therefore derive constraints from ROADMAP.md, REQUIREMENTS.md, and already-implemented phase contracts.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INT-01 | Piece selection + legal destination highlighting | Controller contract (`selectPiece`) + board DOM state model |
| INT-02 | Move on highlighted destination + illegal tap feedback | Controller contract (`makeMove`) + invalid-interaction feedback pattern |
| INT-05 | Piece movement animation 150–200ms | CSS transform/transition strategy |
| RND-01 | Render any board shape (variable + non-rectangular + impassable) | CSS Grid derived from parsed puzzle dimensions + null-cell rendering rules |
| RND-02 | Uniform square colors + distinct goal squares | Cell state class system (not checkerboard alternation) |
| RND-03 | Readable at 375px + 44px minimum targets | Mobile-first sizing constraints and touch layout decisions |
| RND-04 | SVG pieces + CSS Grid board | Inline SVG or sprite mapping + grid-based board renderer |
| VIS-02 | Responsive mobile + desktop usability | Single layout that scales from phone to desktop with CSS custom props |

</phase_requirements>

---

## Summary

Phase 3 should remain frontend-only and build directly on existing Phase 2 contracts. `createController()` is already DOM-free and exposes the exact interaction primitives needed by UI (`loadPuzzle`, `selectPiece`, `makeMove`, `undo`, `reset`, `getPuzzleList`, etc.). This enables a clean “UI shell over pure controller” architecture where rendering concerns are isolated in new `src/ui/*` modules and `main.js` orchestrates event delegation.

For non-rectangular boards, the most robust strategy is to render a fixed rectangular CSS Grid using `puzzle.width` and `puzzle.height`, then style impassable/missing cells as non-interactive voids. This preserves board geometry and keeps pointer math trivial. Legal-move highlighting should be class-based (`is-selected`, `is-legal`, `is-illegal-feedback`, `is-goal`) and driven from controller responses each interaction.

Animation requirement (INT-05) is best met with transform-based transitions on piece elements (`transition: transform 180ms ease`) and class toggles; avoid JS animation loops. Touch targets must use min-size CSS constraints to guarantee 44px hit areas at 375px viewport width.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Runtime game state | `src/controller.js` | `src/store/store.js` | Existing source of truth for board/undo/win/persistence |
| DOM rendering of board | New `src/ui/boardRenderer.js` | `src/main.js` | Keeps rendering logic isolated and testable |
| User interaction wiring | `src/main.js` | `src/ui/interaction.js` (optional) | Central event routing between DOM and controller |
| Cell/piece visual state | `src/styles/board.css` | CSS custom properties in `:root` | Declarative styling for selected/legal/goal/win states |
| Piece asset mapping | New `src/ui/pieces.js` | Static `/public` assets | Stable SVG lookup by piece type/color |

---

## Standard Stack

| Layer | Choice | Notes |
|------|--------|-------|
| Runtime | Vanilla JS (existing) | Preserve current architecture; no framework needed |
| Layout | CSS Grid | Required for variable board dimensions |
| Interaction | Pointer events (`pointerdown`) | Unified touch + mouse behavior |
| Animation | CSS transitions (150–200ms) | Requirement-conformant and GPU-friendly |
| Testing | Vitest + jsdom-like DOM tests where needed | Keep logic in pure modules for fast tests |

No new npm dependencies are required for this phase.

---

## Interface Contracts to Preserve

From `src/controller.js`:

- `loadPuzzle(puzzleId) -> { puzzle, board, undoStack, solvedIds, won }`
- `selectPiece(positionKey) -> string[]` (posKey list of legal destinations)
- `makeMove(from, to) -> { board, won, captured } | { error }`
- `undo() -> { board, undoStack }`
- `reset() -> { board } | { error }`

From `src/puzzles/loader.js` parsed puzzle shape:

- `puzzle.width`, `puzzle.height` drive CSS Grid template
- `board` is `Map<string, { piece, isGoal }>` where absent keys represent impassable/off-board cells

These contracts should be treated as stable inputs for UI modules.

---

## Implementation Patterns

1. **Board render pass**
   - Iterate rows `0..height-1` and cols `0..width-1`
   - Build `posKey(col,row)`
   - If `board.has(key)` false: render `.cell.cell--void` and disable interaction
   - Else render `.cell` with piece/goal classes from cell content

2. **Two-tap interaction model**
   - Tap a player piece → set `selectedKey`, fetch legal keys via `selectPiece`
   - Tap legal destination → call `makeMove(selectedKey, to)`, clear selection, re-render
   - Tap illegal destination or wrong piece → trigger temporary `illegal-feedback` class (visual pulse/shake)

3. **Move animation strategy**
   - Keep stable `data-pos` attributes on pieces/cells
   - Toggle CSS class to animate from previous to next position with `transform` transition at `180ms`
   - Avoid layout-affecting animations (top/left) for performance

4. **Win-state UX**
   - On `makeMove(...).won === true`, reveal persistent win banner/overlay near board controls
   - Keep controls available for reset/next interaction in later phases

---

## Common Pitfalls

1. **Assuming rectangular occupancy means playable cells**
   - Wrong: rendering every grid coordinate as playable.
   - Correct: only keys present in `board` are playable.

2. **Treating `selectPiece` return as move objects**
   - It returns `string[]` keys; UI must compare against `data-key`/`posKey` strings directly.

3. **Implicit chessboard colors**
   - Forbidden by RND-02; do not alternate light/dark squares by parity.

4. **Touch target regressions on small viewport**
   - Must enforce 44px min size even if board scales; combine `minmax(44px, 1fr)` where needed.

5. **Animating full board rerender via JS timers**
   - Use CSS transitions and class state; JS timers are unnecessary and brittle.

---

## Security Considerations (ASVS L1-aligned for this phase)

- Treat DOM dataset values as untrusted input crossing UI → controller boundary.
- Validate candidate destination by strict membership in controller legal set (already enforced by controller, but UI should gate as first line).
- Never inject unsanitized HTML into board cells; use `textContent` or pre-defined SVG templates.
- Keep persistence writes in controller/store only; UI should not write localStorage directly.

---

## Validation Architecture

This phase can maintain fast feedback with:

- **Quick checks per task:** targeted Vitest command for changed modules
- **Wave checks:** full `npm test` plus `npm run build`
- **UI behavior checks:** deterministic DOM tests around selection/highlight/illegal-feedback/win-banner transitions

The VALIDATION.md contract should include explicit commands for Phase 3 tasks and map each REQ ID to at least one automated check.

---

## Recommendation for Planning

Plan Phase 3 as three executable plans:

1. **UI scaffolding + board renderer contract** (DOM structure, CSS Grid, piece/goal/void cells)
2. **Interaction flow integration** (selection, legal highlight, illegal feedback, move execution + win presentation)
3. **Responsive/accessibility + animation hardening** (44px touch targets, 375px layout checks, 150–200ms transitions)

Keep each plan at 2 tasks and enforce automated verification commands (`npm test ...`, `npm run build`).

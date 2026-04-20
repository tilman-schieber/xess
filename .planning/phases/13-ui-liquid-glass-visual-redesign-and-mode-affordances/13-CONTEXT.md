# Phase 13: UI Liquid-Glass Visual Redesign and Mode Affordances - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a polished liquid-glass visual redesign for the active puzzle play surface (board + puzzle meta + puzzle controls), implement translucent selected/legal overlay affordances, apply mode-aware opponent styling for reach puzzles, and verify MODE-04/MODE-05 behavior via regression checks only.

This phase does not add a new standalone mode-rules foundation; it preserves existing mode logic while redesigning presentation and safeguards.

</domain>

<decisions>
## Implementation Decisions

### Liquid-glass visual direction
- **D-01:** [auto] Use a balanced liquid-glass look (depth + translucency + polish) rather than minimal-flat or heavy-frosted extremes.
- **D-02:** [auto] Apply the liquid-glass language to the gameplay surface only (board, puzzle meta, puzzle controls) for this phase.
- **D-03:** [auto] Implement visual language through centralized CSS tokens (color/alpha/shadow/edge/blur vars), not ad-hoc literals.

### Overlay affordances
- **D-04:** [auto] Selected squares use translucent fill overlays with subtle inner edge treatment; no frame-only ring style.
- **D-05:** [auto] Legal destinations use translucent green-toned destination overlays on board cells; overlays must remain readable on irregular board geometry.
- **D-06:** [auto] Overlays are rendered at the cell layer so piece glyphs remain visually intact (no piece recoloring).
- **D-07:** [auto] Illegal feedback keeps existing timing behavior and is restyled to align with the overlay system.

### Mode-aware opponent styling
- **D-08:** [auto] Red/dark-red opponent treatment is active for `reach-all-goal-squares` mode only; capture mode retains current neutral opponent appearance.
- **D-09:** [auto] Mode styling uses semantic hooks (board/goal badge mode attributes or classes plus CSS token switching), not direct SVG internals patching.
- **D-10:** [auto] Reach-mode opponent treatment prioritizes contrast/readability on mobile and desktop and must stay distinguishable from selection/legal/goal overlays.
- **D-11:** [auto] Goal ghost pieces remain neutral/desaturated and are not tinted like live opponents.

### Regression guard expectations
- **D-12:** [auto] MODE-04/MODE-05 scope in this phase is regression verification only; no standalone mode-engine expansion.
- **D-13:** [auto] Extend existing Vitest behavior suites for controller + UI to preserve capture/no-capture legality and interaction contracts during visual changes.
- **D-14:** [auto] Add/maintain visual regression assertions proving selected/legal affordances are translucent overlays (not frame-only outlines) and do not recolor piece assets.
- **D-15:** [auto] Keep existing drag/tap, undo/redo, and persistence contracts stable while implementing the redesign.

### Claude's Discretion
- Exact token values for blur radius, alpha, and shadows within the chosen balanced liquid-glass direction.
- Final micro-interaction timing/easing for visual polish where behavior invariants remain unchanged.
- Precise CSS selector strategy for mode hooks, as long as semantics and testability remain explicit.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` — Phase 13 goal, success criteria, and explicit regression-only expectation for mode behavior.
- `.planning/REQUIREMENTS.md` — VIS-01, VIS-02, VIS-03 and MODE-04/MODE-05 traceability for this phase.
- `.planning/PROJECT.md` — milestone intent and current v1.3 priority on presentation clarity.
- `.planning/STATE.md` — active milestone state and current-phase focus context.

### Consolidation decision history
- `.planning/quick/260420-vux-condense-v13-to-ui-ux-phases/260420-vux-PLAN.md` — source quick-task intent for two-phase v1.3 consolidation.
- `.planning/quick/260420-vux-condense-v13-to-ui-ux-phases/260420-vux-SUMMARY.md` — explicit decision to keep mode work as minimal regression checks inside UI phase.

### Mode/rules contract reference
- `docs/puzzle-format.md` — current puzzle/mode policy fields (`goalType`, `controllableColors`, `capturableByColor`, `promote`) used by regression expectations.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/ui/interactionFeedback.js`: existing interaction state model (`is-selected`, `is-legal`, `is-illegal-feedback`, `is-won`) is the direct affordance hook for redesigned overlays.
- `src/styles/app.css`: root token system and shell/meta/control styling scaffold can absorb liquid-glass tokens without architectural rewrite.
- `src/styles/board.css`: current board/cell/piece styling and interaction class selectors are the primary integration surface for overlay and mode visual updates.
- `src/main.js`: `renderToDom` already emits mode-adjacent hooks (`data-goal-type`) and composes board/cell/piece classes from render model.

### Established Patterns
- Interaction feedback is class-driven and state-derived; visual updates should continue to flow from render model state, not ad-hoc DOM mutation.
- CSS custom properties are already used for spacing/colors/touch targets and should remain the single source of styling tokens.
- Pointer-first interaction contracts with keyboard parity are already enforced and should remain behavior-invariant.

### Integration Points
- Board/cell affordance styling: `src/styles/board.css` + interaction classes from `src/ui/interactionFeedback.js`.
- Mode-aware visual state: board and goal badge hooks assembled in `src/main.js` render pipeline.
- Regression coverage anchors: `src/main.ui.test.js`, `src/main.gap-ux.test.js`, and `src/controller.test.js`.

</code_context>

<specifics>
## Specific Ideas

- Liquid-glass direction should feel intentional and modern rather than generic neon-dark styling.
- Overlay affordances should read as translucent layers on cells, not hard chess-like borders.
- Reach-mode opponent red treatment should clearly telegraph mode semantics while preserving readability on small screens.
- Auto-mode selections were applied for all decision areas and logged in `13-DISCUSSION-LOG.md`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-ui-liquid-glass-visual-redesign-and-mode-affordances*
*Context gathered: 2026-04-20*

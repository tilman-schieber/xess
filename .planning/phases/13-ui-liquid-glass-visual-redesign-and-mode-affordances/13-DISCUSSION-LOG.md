# Phase 13: UI Liquid-Glass Visual Redesign and Mode Affordances - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 13-ui-liquid-glass-visual-redesign-and-mode-affordances
**Mode:** auto (`--auto`)
**Areas discussed:** Liquid-glass visual direction, Overlay affordances, Mode-aware opponent styling, Regression guard expectations

---

## Liquid-glass visual direction

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle polish only | Keep near-current look with minor polish. | |
| Balanced liquid-glass treatment | Add deliberate translucency/depth while preserving clarity. | ✓ |
| Heavy frosted/glow-first treatment | Push maximal glassmorphism emphasis. | |

**User's choice:** [auto] Balanced liquid-glass treatment (recommended)
**Notes:** [auto] Q: "How strong should the liquid-glass treatment be?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Board only | Restrict redesign to board container and cells. | |
| Board + puzzle meta + controls | Keep gameplay UI cohesive in one visual language. | ✓ |
| Entire app now | Include start/tracks shell work in this phase. | |

**User's choice:** [auto] Board + puzzle meta + controls (recommended)
**Notes:** [auto] Q: "Where should the new visual language apply?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Ad-hoc literals | Hardcode values in each selector. | |
| Centralized CSS variables | Tokenized design system via custom properties. | ✓ |
| Per-component palettes | Independent local token sets per module. | |

**User's choice:** [auto] Centralized CSS variables (recommended)
**Notes:** [auto] Q: "How should color/blur/shadow values be managed?" -> Selected recommended default.

---

## Overlay affordances

| Option | Description | Selected |
|--------|-------------|----------|
| Frame/ring only | Outline selected cells only. | |
| Translucent fill + subtle inner edge | Fill-based affordance aligned to VIS-01 intent. | ✓ |
| Solid recolor | Opaque color replacement on selected cells. | |

**User's choice:** [auto] Translucent fill + subtle inner edge (recommended)
**Notes:** [auto] Q: "How should selected squares be highlighted?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Frame-only outlines | Border markers only for legal cells. | |
| Translucent destination overlays | Fill overlays for legal destination cells. | ✓ |
| Animated pulses only | Motion-only legal hints. | |

**User's choice:** [auto] Translucent destination overlays (recommended)
**Notes:** [auto] Q: "How should legal destinations be shown?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Tint piece SVG directly | Apply color changes to piece assets. | |
| Cell-layer overlays + explicit stacking | Keep pieces readable above overlays. | ✓ |
| Disable overlays on occupied cells | Skip overlay where pieces exist. | |

**User's choice:** [auto] Cell-layer overlays + explicit stacking (recommended)
**Notes:** [auto] Q: "How do we ensure overlays do not recolor piece glyphs?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Increase feedback duration | Lengthen illegal state display. | |
| Keep duration, restyle visuals | Preserve timing contract while redesigning style. | ✓ |
| Remove illegal feedback | Drop invalid move feedback indicator. | |

**User's choice:** [auto] Keep duration, restyle visual treatment (recommended)
**Notes:** [auto] Q: "What should happen to illegal feedback timing?" -> Selected recommended default.

---

## Mode-aware opponent styling

| Option | Description | Selected |
|--------|-------------|----------|
| Always tint opponents red | Global opponent tint regardless of mode. | |
| Reach-mode only tinting | Apply red/dark-red treatment in move-to-goal mode only. | ✓ |
| No mode-specific styling | Keep a single opponent style in all modes. | |

**User's choice:** [auto] Reach-mode only tinting (recommended)
**Notes:** [auto] Q: "When should opponent red/dark-red styling be active?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Inline style switches | JS-only imperative styling changes. | |
| Semantic hooks + CSS variables | Mode classes/attributes and tokenized style branches. | ✓ |
| Patch SVG files per mode | Maintain separate mode-specific asset variants. | |

**User's choice:** [auto] Semantic hooks + CSS variables (recommended)
**Notes:** [auto] Q: "How should mode styling hooks be represented in DOM/CSS?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Aesthetic-first | Permit low-contrast edge cases. | |
| Contrast-first in palette | Preserve readability while keeping visual direction. | ✓ |
| Max saturation warning red | Extreme attention tinting. | |

**User's choice:** [auto] Contrast-first within liquid-glass palette (recommended)
**Notes:** [auto] Q: "What readability target should mode styling meet?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Tint ghosts like opponents | Merge ghost and opponent color language. | |
| Keep neutral ghost treatment | Preserve ghost distinction from active opponents. | ✓ |
| Hide ghosts in reach mode | Remove ghost cue entirely. | |

**User's choice:** [auto] Keep neutral ghost treatment (recommended)
**Notes:** [auto] Q: "How should goal ghost visuals interact with mode tinting?" -> Selected recommended default.

---

## Regression guard expectations

| Option | Description | Selected |
|--------|-------------|----------|
| Build new mode foundation now | Expand logic scope in UI phase. | |
| Regression-only verification | Keep mode logic scope fixed, verify behavior stability. | ✓ |
| Skip mode checks | No mode regression assertions in this phase. | |

**User's choice:** [auto] Regression-only verification in existing stacks (recommended)
**Notes:** [auto] Q: "How should MODE-04/MODE-05 coverage be handled in this UI phase?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Manual checks only | Validate behavior without automated extension. | |
| Extend existing Vitest suites | Preserve current behavior contracts during redesign. | ✓ |
| Snapshot-only replacement | Replace behavior checks with snapshots. | |

**User's choice:** [auto] Extend existing Vitest regression suites (recommended)
**Notes:** [auto] Q: "Which existing test suites should guard behavior while redesigning UI?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| No explicit visual assertions | Leave overlay semantics implicit. | |
| Explicit overlay semantic assertions | Assert translucent overlays + piece readability contracts. | ✓ |
| Defer to next phase | Move overlay assertions out of this phase. | |

**User's choice:** [auto] Keep explicit CSS/model guards for overlay semantics (recommended)
**Notes:** [auto] Q: "What visual guard should ensure overlays meet VIS-01/VIS-02 intent?" -> Selected recommended default.

| Option | Description | Selected |
|--------|-------------|----------|
| Refactor interaction flow now | Broaden scope into interaction redesign. | |
| Preserve interaction contracts | Keep behavior stable while applying visual redesign. | ✓ |
| Relax interaction tests | Temporarily loosen coverage. | |

**User's choice:** [auto] Keep behavior stable; style and mode affordance focused changes only (recommended)
**Notes:** [auto] Q: "Should interactions unrelated to visual redesign be modified?" -> Selected recommended default.

---

## Claude's Discretion

- Precise visual token values and final polish tuning within selected direction.
- Concrete CSS selector wiring for mode hooks, provided semantics remain explicit and testable.

## Deferred Ideas

None.

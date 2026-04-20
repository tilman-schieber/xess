# Technology Stack (Milestone v1.3)

**Project:** Xess
**Milestone focus:** Interface polish, onboarding clarity, and explicit puzzle-mode presentation
**Researched:** 2026-04-20

## Stack Additions Needed

No new framework dependency is required; milestone fits current Vanilla JS + CSS architecture.

| Area | Current choice | v1.3 recommendation | Why |
|------|----------------|---------------------|-----|
| Interaction highlighting | Existing board cell classes | Add semantic overlay classes/tokens (`is-selected`, `is-legal`, `is-legal-capture`) | Matches major chess-site affordances while preserving board geometry constraints |
| Piece visuals | Static SVG imports | Keep static SVG pipeline; add CSS tint token for goal-mode opponents | Enables red/dark-red mode distinction without swapping full asset sets |
| App shell/navigation | Existing mode renderers | Add layout shell module + responsive menu state in UI controller | Keeps routing simple and avoids framework/router introduction |
| Onboarding flow | Start/tracks/play flow | Extend start model with contextual actions and first-visit heuristics | Preserves local-only architecture with minimal state additions |
| Testing | Vitest + jsdom | Add UI contract tests for overlays/menu/actions and rule-mode tests for no-capture goal mode | Highest risk is UX/state regressions across responsive and mode-specific behavior |

## What Not To Add

- Do not introduce CSS/UI frameworks solely for header/footer/menu work.
- Do not fork piece assets per mode unless CSS tinting proves insufficient.
- Do not add remote analytics or backend-driven onboarding state.

## Integration Notes

- Keep mode semantics in puzzle metadata and controller rule checks, not in renderer-only conditions.
- Keep overlay rendering driven by legal move data already produced by controller/engine.
- Keep onboarding/resume context in existing local storage schema, extending with additive safe defaults.

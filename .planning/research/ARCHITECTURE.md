# Architecture Research (Milestone v1.3)

**Project:** Xess
**Milestone focus:** UI shell polish, onboarding progression, and mode-specific presentation
**Researched:** 2026-04-20

## Integration Approach

Preserve current architecture, extend in targeted layers:

1. Puzzle metadata defines rule/presentation mode (`capture` vs `goal`).
2. Controller exposes legal move descriptors with move-kind metadata (quiet/capture/blocked).
3. Renderer maps descriptors to overlay classes and mode-aware piece appearance.
4. App shell renderer manages header/footer/menu and screen-level actions.
5. Store provides contextual launch state (new user, in-progress puzzle, tutorial availability).

## New/Modified Components

| Component | Change type | v1.3 focus |
|-----------|-------------|------------|
| Puzzle schema + catalogue metadata | Modify | Add explicit puzzle mode and mode-specific visual tokens |
| Game controller | Modify | Enforce no-capture behavior in goal mode and expose mode-safe legal moves |
| Board/play renderer | Modify | Apply translucent selected/legal overlays and mode-aware enemy styling |
| App shell/start renderer | Modify | Build landing page, menu shell, and contextual actions |
| Track metadata/content | Modify | Add tutorial track with concept-sequenced puzzles |

## Data Flow Notes

- Landing action path: `store snapshot -> derive contextual actions -> render landing CTA set`.
- Selection visualization path: `select piece -> legal keys -> classify destinations -> render overlays`.
- Goal-mode move path: `intent -> controller rejects captures -> only goal-legal moves commit`.
- Mode visual path: `puzzle mode -> renderer class tokens -> piece tint + legend copy`.

## Build Order Recommendation

1. Introduce mode metadata contract and controller enforcement (capture vs no-capture).
2. Implement board overlay affordances and mode-specific enemy visual styling.
3. Build responsive app shell (header/footer/menu) and improved landing experience.
4. Add tutorial track + onboarding copy using finalized mode semantics.

# Research Summary (Milestone v1.3)

**Project:** Xess
**Milestone:** v1.3 Interface and Onboarding Clarity
**Researched:** 2026-04-20

## Stack Additions

- No new framework dependency required; milestone fits existing Vanilla JS + CSS + Vitest stack.
- Add semantic UI tokens/classes for selected/legal/capture overlays and mode-aware piece tint.

## Feature Table Stakes

- Responsive app shell with header/footer/menu and mobile hamburger behavior.
- Board interaction overlays: selected square and legal destinations as translucent fills (not frames).
- Contextual landing flow for first-time vs returning players with continue/tutorial/start actions.
- Explicit dual-mode system: capture mode and no-capture move-to-goal mode.
- Tutorial track that explains both puzzle concepts with matching in-game behavior.

## Watch Out For

- Visual cues that look polished but do not match controller-enforced rules.
- Overlay contrast issues on small screens and unusual board geometries.
- Stale resume/tutorial action targets after catalogue updates.
- Mode-specific red tint reducing readability on some backgrounds.

## Recommended Milestone Emphasis

Ship rule-faithful visual clarity first (overlays + mode enforcement), then complete onboarding shell/tutorial so new users immediately understand what to do and why boards behave differently.

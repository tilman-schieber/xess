# Pitfalls Research (Milestone v1.3)

**Project:** Xess
**Milestone focus:** UI/UX polish and dual-mode onboarding
**Researched:** 2026-04-20

## High-Risk Pitfalls

1. **Overlay ambiguity on dense irregular boards**
   - Risk: selected and legal overlays look too similar, reducing clarity.
   - Mitigation: use same hue family but distinct alpha/intensity and test on smallest mobile viewport.

2. **Renderer-only mode logic drift**
   - Risk: goal mode appears no-capture visually but controller still allows captures.
   - Mitigation: enforce mode rules in controller first; renderer only reflects state.

3. **Hamburger/menu state leaks across screen modes**
   - Risk: menu remains open during board interactions, causing accidental taps.
   - Mitigation: centralize menu open/close transitions and close on navigation/action.

4. **Contextual landing actions point to invalid/stale puzzle IDs**
   - Risk: continue/tutorial CTA fails after catalogue changes.
   - Mitigation: sanitize action targets against active catalogue and fall back to safe defaults.

5. **Mode-specific piece tint reduces accessibility**
   - Risk: dark-red enemy pieces become hard to read on some board colors.
   - Mitigation: define contrast-checked color tokens and fallback to neutral dark theme if contrast fails.

## Warning Signs During Implementation

- Players mis-click legal targets because overlays blend with base cell colors.
- Goal-mode puzzle accepts a capture despite UX indicating no-capture.
- Landing page repeatedly suggests "Continue" when no recoverable active puzzle exists.
- Tutorial copy and actual puzzle behavior disagree on mode rules.

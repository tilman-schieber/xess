# Feature Research (Milestone v1.3)

**Project:** Xess
**Milestone focus:** UI/UX polish + tutorial and dual puzzle-mode clarity
**Researched:** 2026-04-20

## Table Stakes For This Milestone

| Category | Feature | Complexity | Notes |
|----------|---------|------------|-------|
| Interaction visuals | Selected origin square highlighted as filled translucent overlay | Low | Common chess UX baseline; avoid piece recolor on selection |
| Interaction visuals | Legal move targets shown as subtle filled overlays (not heavy borders) | Low | Best readability on irregular boards with many blocked cells |
| Navigation shell | Header/footer/menu with responsive hamburger behavior | Medium | Expected for mobile-first PWA navigation clarity |
| Onboarding | Landing page with contextual next actions (continue/tutorial/start) | Medium | Reduces friction for first-time and return users |
| Tutorial | Dedicated tutorial track introducing board twist + goal types | Medium | Needed to explain non-standard board assumptions quickly |
| Mode clarity | Distinct capture mode vs move-to-goal mode rules and visuals | Medium | Core comprehension requirement for broader content growth |

## Major Chess-Site Interaction Patterns (relevant adaptation)

| Pattern | Typical presentation | Recommendation for Xess |
|---------|----------------------|--------------------------|
| Selected piece | Soft fill on source square, often with slight glow | Use translucent green overlay on selected cell only |
| Legal non-capture destinations | Dot/overlay centered on destination cell | Use translucent green destination overlay to match requested style |
| Legal capture destinations | Distinct stronger marker than quiet moves | Use stronger alpha variant (same hue family) rather than frame ring |
| Last move/context hints | Light directional or dual-square highlight | Defer unless needed; prioritize selected/legal cues first |

## Differentiators

| Feature | Value |
|---------|-------|
| Goal-mode enemy red treatment (including dark-red SVG tint) | Immediate visual understanding that mode semantics changed |
| Context-sensitive landing actions | Makes progression feel intentional instead of menu-hunting |
| Tutorial that explicitly compares both puzzle types | Prevents early confusion and improves retention |

## Anti-Features For v1.3

| Anti-feature | Why avoid now |
|--------------|---------------|
| Fully custom board editor | Expands scope away from polish/onboarding objective |
| Animated piece effects on every move | Visual noise and performance risk on mobile |
| Global redesign of all prior puzzle content taxonomy | Not required to ship dual-mode clarity milestone |

## Dependencies

- Visual overlays depend on stable legal move descriptors from controller.
- Goal-mode color treatment depends on puzzle metadata carrying explicit mode/type.
- Contextual landing actions depend on reliable active/solved/tutorial state lookup in store.

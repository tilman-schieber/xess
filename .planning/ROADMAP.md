# Roadmap: Xess

## Milestones

- ✅ **v1.1 UX Launch Polish** — Phases 7-10 (shipped 2026-04-19, archive: `.planning/milestones/v1.1-ROADMAP.md`)
- ✅ **v1.2 Puzzle Logic Improvement** — Phases 11-12 (shipped 2026-04-19, archive: `.planning/milestones/v1.2-ROADMAP.md`)
- ◆ **v1.3 Interface and Onboarding Clarity** — Phases 13-14 (active)

## Phases

<details>
<summary>✅ v1.1 UX Launch Polish (Phases 7-10) — SHIPPED 2026-04-19</summary>

- [x] Phase 7: Start Screen and Track Navigation (3/3 plans) — completed 2026-04-18
- [x] Phase 8: Track Compatibility and Launch Content Robustness (2/2 plans) — completed 2026-04-18
- [x] Phase 9: Puzzle Rich Text Content (2/2 plans) — completed 2026-04-18
- [x] Phase 10: UX and Audio Launch Polish (3/3 plans) — completed 2026-04-18

</details>

<details>
<summary>✅ v1.2 Puzzle Logic Improvement (Phases 11-12) — SHIPPED 2026-04-19</summary>

- [x] Phase 11: Move Legality Hardening (3/3 plans) — completed 2026-04-19
- [x] Phase 12: Tracking State and UX Verification (3/3 plans) — completed 2026-04-19

</details>

## Current Milestone: v1.3 Interface and Onboarding Clarity

**Goal:** Make gameplay interactions and progression immediately understandable with a polished UI redesign and a clearer UX flow for onboarding and tutorial learning.

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 13 | UI Liquid-Glass Visual Redesign and Mode Affordances | Deliver a modern liquid-glass board/chrome style while implementing selected/legal overlays, mode-aware opponent styling, and minimal mode-regression validation | VIS-01, VIS-02, VIS-03, MODE-04, MODE-05 | 5 |
| 14 | UX Navigation, Landing, and Tutorial Clarity | Ship a coherent shell + onboarding flow so first-time and returning players can reliably start, continue, and learn puzzle concepts | NAV-01, NAV-02, ONB-01, ONB-02, MODE-03 | 5 |

### Phase 13: UI Liquid-Glass Visual Redesign and Mode Affordances

Goal: Create a polished, modern liquid-glass presentation while delivering clear board affordances and mode styling without re-opening standalone mode-foundation scope.

Requirements: VIS-01, VIS-02, VIS-03, MODE-04, MODE-05

Plans: TBD

Success criteria:
1. Board and surrounding UI adopt a deliberate liquid-glass visual direction (depth, translucency, polish) that feels modern and non-boring on desktop and mobile.
2. Selected piece square uses a translucent overlay treatment consistent with the new visual language and does not recolor piece SVG assets.
3. Legal destination squares use translucent overlays (not frame-only outlines) with clear readability on irregular boards.
4. Move-to-goal opponent pieces render in red/dark-red treatment with acceptable contrast in the redesigned theme.
5. Regression checks confirm existing capture/no-capture gameplay behavior still works (no standalone mode-rules foundation expansion in this milestone).

### Phase 14: UX Navigation, Landing, and Tutorial Clarity

Goal: Make navigation and onboarding intuitive through a clearer app shell, contextual landing behavior, and tutorial teaching flow.

Requirements: NAV-01, NAV-02, ONB-01, ONB-02, MODE-03

Plans: TBD

Success criteria:
1. App renders a persistent shell with clear landing/tracks/play navigation affordances across responsive breakpoints.
2. Mobile hamburger menu interaction is predictable, tap-friendly, and does not conflict with gameplay board interactions.
3. First-time users see a clear guided start path while returning users see contextual continue/tutorial/browse actions from sanitized local progress.
4. Tutorial track is discoverable and teaches capture vs move-to-goal concepts with language tied to in-game cues.
5. Landing/tutorial transitions fail safely when stored references are stale, always leaving users with valid next actions.

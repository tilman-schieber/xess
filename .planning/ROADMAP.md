# Roadmap: Xess

## Milestones

- ✅ **v1.1 UX Launch Polish** — Phases 7-10 (shipped 2026-04-19, archive: `.planning/milestones/v1.1-ROADMAP.md`)
- ✅ **v1.2 Puzzle Logic Improvement** — Phases 11-12 (shipped 2026-04-19, archive: `.planning/milestones/v1.2-ROADMAP.md`)
- ◆ **v1.3 Interface and Onboarding Clarity** — Phases 13-16 (active)

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

**Goal:** Make gameplay interactions and progression immediately understandable by polishing board visuals, navigation shell, onboarding flow, and explicit puzzle-mode teaching.

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 13 | Mode Rules and Metadata Foundation | Establish explicit capture vs goal-mode contracts in puzzle metadata/controller so behavior is deterministic before UI polish | MODE-04, MODE-05 | 5 |
| 14 | Board Visual Affordances and Mode Styling | Deliver chess-familiar selected/legal overlays and mode-specific opponent styling on all supported board geometries | VIS-01, VIS-02, VIS-03 | 5 |
| 15 | App Shell and Contextual Landing Flow | Replace minimal entry with responsive shell, mobile hamburger menu, and context-aware first/return actions | NAV-01, NAV-02, ONB-01, ONB-02 | 5 |
| 16 | Tutorial Track and Concept Teaching | Create/ship tutorial content that explains Xess puzzle concepts and dual-mode expectations in-play | MODE-03 | 4 |

### Phase 13: Mode Rules and Metadata Foundation

Goal: Establish explicit puzzle mode contracts and controller rule enforcement for capture and no-capture goal puzzles.

Requirements: MODE-04, MODE-05

Plans: TBD

Success criteria:
1. Puzzle schema/catalogue supports explicit mode metadata for capture and move-to-goal puzzles.
2. Controller enforces move-to-goal no-capture rule so capture attempts are rejected without mutation.
3. Capture mode preserves current white-control/black-capture semantics and regression coverage.
4. Existing v1.2 move tracking/undo/redo behavior remains intact after mode-rule integration.
5. Mode-related tests fail if puzzle metadata is malformed or mode enforcement drifts.

### Phase 14: Board Visual Affordances and Mode Styling

Goal: Implement polished board cues for selection/legal moves and mode-distinct opponent styling.

Requirements: VIS-01, VIS-02, VIS-03

Plans: TBD

Success criteria:
1. Selected piece square uses a translucent green-toned overlay without recoloring the piece SVG.
2. Legal destination squares use translucent overlays (not frame-only outlines) with clear readability on irregular boards.
3. Move-to-goal opponent pieces render in red/dark-red treatment while maintaining acceptable contrast.
4. Overlay presentation differentiates quiet vs capture destinations clearly enough for touch input.
5. UI regression tests validate class/token behavior for selected, legal, and mode-specific states.

### Phase 15: App Shell and Contextual Landing Flow

Goal: Ship a full landing/shell experience with responsive navigation and context-aware next actions.

Requirements: NAV-01, NAV-02, ONB-01, ONB-02

Plans: TBD

Success criteria:
1. App renders persistent header/footer shell with clear navigation affordances in landing/tracks/play contexts.
2. Mobile hamburger menu opens/closes predictably and does not interfere with board interaction handling.
3. First-time users see clear start guidance and tutorial-first pathway.
4. Returning users with valid progress see contextual continue/start options derived from sanitized local state.
5. Landing CTA fallbacks remain safe when active puzzle or tutorial references are stale/missing.

### Phase 16: Tutorial Track and Concept Teaching

Goal: Deliver a tutorial track that teaches puzzle concepts and mode-specific rules in practical sequence.

Requirements: MODE-03

Plans: TBD

Success criteria:
1. Tutorial track exists in metadata and is discoverable from contextual landing actions and track browser.
2. Tutorial sequence explicitly explains capture puzzles versus move-to-goal puzzles with matching gameplay behavior.
3. Tutorial copy uses concise language tied to observable board cues (selection overlays, legal destination overlays, red opponents in goal mode).
4. Completing tutorial leaves player at a clear next step (continue puzzle flow or browse tracks) without dead-end navigation.

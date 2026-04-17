# Roadmap: Xess

## Overview

Xess is built bottom-up following the dependency graph: the puzzle engine is the foundation that everything else depends on, so it ships first with exhaustive tests. The game controller and persistence layer integrate engine logic before any UI exists. The board renderer then builds on stable interfaces from both prior phases. With infrastructure solid, puzzle content is authored against a working game loop and visual design is refined. Finally, PWA configuration and sound polish complete a launch-ready product that installs offline on any device.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Puzzle Format and Engine** - Define the versioned puzzle schema and build a fully-tested, pure-function chess engine for non-standard boards (completed 2026-04-16)
- [x] **Phase 2: Game Controller and Persistence** - Wire the engine into a complete move loop with localStorage-backed progress and sequential unlock logic (completed 2026-04-17)
- [x] **Phase 3: Board Renderer and Core UI** - Build the SVG board renderer with two-tap interaction, legal move highlighting, and mobile-first layout (completed 2026-04-17)
- [x] **Phase 4: Puzzle Content and Visual Polish** - Author the full puzzle catalogue, complete puzzle navigation UX, and apply the premium visual style (completed 2026-04-17)
- [ ] **Phase 5: PWA and Launch Readiness** - Configure service worker precaching, offline support, PWA installability, and optional sound feedback

## Phase Details

### Phase 1: Puzzle Format and Engine
**Goal**: A tested, correct chess engine for non-standard boards is ready and the puzzle definition format is fully specified
**Depends on**: Nothing (first phase)
**Requirements**: FMT-01, FMT-02, FMT-03, FMT-04, FMT-05, ENG-01, ENG-02, ENG-03, ENG-04, ENG-05, ENG-06, ENG-07, ENG-08
**Success Criteria** (what must be TRUE):
  1. A developer can define a puzzle with an irregular board (including impassable squares and goal squares) using the text-grid format and load it as a valid JS module
  2. The engine returns correct legal moves for all 6 piece types across any board shape, including proper wall behavior for impassable squares and jump-but-no-land behavior for knights
  3. Pawn movement is driven by the per-piece direction property — not inferred from position or color
  4. Both win conditions (capture-all-targets and reach-all-goal-squares) are detected correctly after `applyMove`
  5. Undo pops to the exact prior board state with no data mutation; Vitest suite passes with no failures
**Plans**: 3 plans
Plans:
- [x] 01-01-PLAN.md — Scaffold Vite project and puzzle format layer
- [x] 01-02-PLAN.md — Chess movement engine (all 6 piece types)
- [x] 01-03-PLAN.md — applyMove, checkWin, and public engine API

### Phase 2: Game Controller and Persistence
**Goal**: The complete game loop (select piece → move → validate → persist → detect win → unlock next) runs correctly without any UI
**Depends on**: Phase 1
**Requirements**: INT-03, INT-04, INT-06, NAV-01, NAV-02, NAV-03, NAV-05, PRS-01, PRS-02, PRS-03, PRS-04
**Success Criteria** (what must be TRUE):
  1. Solved puzzle IDs survive a browser close and reopen — the next session resumes at the correct unlock state
  2. Active puzzle state (piece positions and undo stack) is restored on revisit without data loss
  3. A new puzzle becomes available to play immediately after the previous one is solved, following sequential unlock order
  4. State is written on every move (debounced) and synchronously when the page hides — no progress is lost on tab switch or device sleep
  5. The localStorage schema version field is present; a future schema change does not silently corrupt existing save data
**Plans**: 3 plans
Plans:
- [x] 02-01-PLAN.md — localStorage persistence layer (store.js)
- [x] 02-02-PLAN.md — Catalogue navigation helpers (nav.js)
- [x] 02-03-PLAN.md — Game controller wiring engine + persistence + navigation

### Phase 3: Board Renderer and Core UI
**Goal**: Players can interact with the game — select pieces, see legal moves, make moves, and receive immediate visual feedback — on any board shape at mobile size
**Depends on**: Phase 2
**Requirements**: INT-01, INT-02, INT-05, RND-01, RND-02, RND-03, RND-04, VIS-02
**Success Criteria** (what must be TRUE):
  1. The board renders correctly for any board shape — including non-rectangular grids and impassable squares — using a CSS Grid driven by the puzzle definition dimensions
  2. Tapping a piece highlights its legal destination squares; tapping a highlighted square completes the move with a smooth CSS transition (150–200ms); tapping an illegal square gives immediate visual feedback and ignores the tap
  3. All pieces and squares are touch-accessible at 375px viewport width with minimum 44px touch targets
  4. Goal squares are visually distinct from empty squares; all squares are uniform (no alternating chess colors)
  5. Win state is presented clearly to the player immediately after the winning move
**Plans**: 5 plans
Plans:
- [x] 03-01-PLAN.md — Board renderer contract for irregular geometry and SVG pieces
- [x] 03-02-PLAN.md — Two-tap interaction wiring with legal highlights and win feedback
- [x] 03-03-PLAN.md — Mobile-first responsive CSS and touch-target hardening
- [x] 03-04-PLAN.md — Gap closure: static square sizing + puzzle objective context UI
- [x] 03-05-PLAN.md — Gap closure: curated open-licensed SVG piece set + attribution
**UI hint**: yes

### Phase 4: Puzzle Content and Visual Polish
**Goal**: Players can browse and play the full catalogue of 25–50 curated puzzles through a complete, polished game experience
**Depends on**: Phase 3
**Requirements**: NAV-04, VIS-01, CNT-01, CNT-02
**Success Criteria** (what must be TRUE):
  1. The app ships with 25–50 curated puzzles that exercise multiple board shapes and both goal types — all embedded as static JS modules requiring no network fetch
  2. The puzzle list shows solved puzzles as marked and future locked puzzles as locked; the current position indicator ("7 / 42") is visible during play
  3. Each puzzle clearly displays its goal type and target before and during play
  4. The visual style is premium and distinctive — custom piece SVGs, refined color palette, considered typography — with no standard chess clichés
**Plans**: 3 plans
Plans:
- [x] 04-01-PLAN.md — Puzzle catalogue: 40 curated puzzles (CNT-01, CNT-02)
- [x] 04-02-PLAN.md — CSS design token system + Inter font bundling (VIS-01 foundation)
- [x] 04-03-PLAN.md — Puzzle list screen, nav controls, goal badge, position indicator (NAV-04, VIS-01)
**UI hint**: yes

### Phase 5: PWA and Launch Readiness
**Goal**: The app installs as a PWA, plays fully offline after first load, and provides optional sound feedback — the product is ready for public launch
**Depends on**: Phase 4
**Requirements**: SND-01, SND-02, PWA-01, PWA-02, PWA-03, PWA-04
**Success Criteria** (what must be TRUE):
  1. The app installs from the browser on Android (Chrome) and iOS (Safari) with the correct icon sizes (192, 512, 180 Apple Touch) and opens in standalone display mode
  2. After first load, all puzzles and app assets are fully playable with no network connection
  3. When a new app version is deployed, a reload prompt appears and the new version activates immediately on reload — no stale puzzle data
  4. iOS Safari users who have not installed the app see a persistent "Add to Home Screen" instruction
  5. Optional sound feedback (off by default) plays on piece moves and puzzle solve; the preference persists across sessions
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Puzzle Format and Engine | 3/3 | Complete   | 2026-04-16 |
| 2. Game Controller and Persistence | 3/3 | Complete | 2026-04-17 |
| 3. Board Renderer and Core UI | 5/5 | Complete | 2026-04-17 |
| 4. Puzzle Content and Visual Polish | 3/3 | Complete   | 2026-04-17 |
| 5. PWA and Launch Readiness | 0/TBD | Not started | - |

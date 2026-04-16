# Project Research Summary

**Project:** Xess
**Domain:** Client-side chess puzzle PWA with non-standard board geometry
**Researched:** 2026-04-16
**Confidence:** HIGH (stack and architecture) / MEDIUM (features, mobile quirks)

## Executive Summary

Xess is a focused single-screen puzzle game: no backend, no accounts, no server logic. The defining technical novelty is non-rectangular board geometry, which disqualifies every standard chess library and demands a custom-built puzzle engine. The recommended approach is Vite + Vanilla JS + a hand-written movement engine, bundled as a PWA with vite-plugin-pwa/Workbox handling offline caching. The total runtime dependency count is zero — all chess logic, puzzle data, and persistence are implemented with native browser APIs. This matches the explicit PROJECT.md constraint of "Vanilla JS or lightweight framework" and keeps the bundle minimal.

The architecture is a clean five-layer stack: PWA Shell → Persistence Store → Puzzle Catalogue (static JSON) → Puzzle Engine (pure functions) → Game Controller → Board Renderer (SVG). Each layer communicates downward only. The most important structural decision is building the Puzzle Engine as pure, side-effect-free functions from day one — this makes it trivially testable with Vitest and portable to a Web Worker if needed. The Board Renderer uses SVG (not Canvas) because non-rectangular hit detection and crisp vector pieces at any DPI are free with SVG but require significant manual work in Canvas.

The biggest risk cluster is the chess engine's correctness on non-standard boards. Pins, en passant state management, impassable-square ray casting, and pawn direction all have well-documented failure modes that corrupt puzzle states silently. These must be tested exhaustively with Vitest before any puzzle authoring begins. The second risk cluster is PWA delivery on iOS Safari: no `beforeinstallprompt`, potential localStorage eviction, and service worker behavior that differs from Chrome. Both risk clusters are fully preventable with known mitigations — the key is addressing them at foundation time rather than retrofitting.

---

## Key Findings

### Recommended Stack

The stack is intentionally minimal. Vite handles build tooling, HMR, and asset hashing with zero configuration overhead. vite-plugin-pwa wraps Workbox to generate a service worker and precache manifest automatically from the build output. The chess engine, board renderer, and persistence layer are all custom — no chess library can handle Xess's variable board geometry, so writing ~300–400 lines of pure movement logic is the only viable path. localStorage is the right persistence layer at this data scale (well under 100KB for 50 puzzles).

**Core technologies:**
- **Vite ~6.x**: build tooling and dev server — dominant standard for client-only JS apps, fastest HMR, trivial PWA integration
- **vite-plugin-pwa ~0.21.x + Workbox ~7.x**: service worker generation and precaching — zero boilerplate, handles cache versioning and update prompts
- **Vanilla JS (ES2022+)**: no framework — appropriate for a single-screen game; zero KB framework overhead; revisit Preact only if DOM management becomes unpleasant
- **Custom chess engine**: move generation and validation — chess.js is hardcoded to 8x8 FEN-based boards; a custom engine is ~300 lines and gives full control over impassable squares and board shape
- **localStorage (native)**: puzzle progress persistence — synchronous, universally supported, adequate for KB-scale puzzle state; abstract behind a `storage.js` module
- **CSS Grid + vanilla CSS**: board layout and theming — CSS Grid maps directly to the puzzle board model; CSS custom properties handle dynamic board dimensions
- **Vitest ~3.x**: unit testing for the movement engine — Vite-native, Jest-compatible API, no separate transform config needed

All version numbers are marked [VERIFY] in STACK.md — confirm against npm before pinning.

### Expected Features

The critical path is: puzzle format → board renderer → move validation → win detection. Every other feature depends on this chain.

**Must have (table stakes):**
- Two-tap select-and-move with legal move highlighting — fundamental input model
- Move validation with visual feedback — illegal moves rejected with immediate, clear feedback
- Multi-level undo + reset puzzle — undo history in memory only (not persisted); reset from static puzzle definition
- Win detection with clear win state — animation/celebration required; absent win state feels broken
- Sequential puzzle unlock with localStorage persistence — progress must survive browser close
- Offline play after install — precache ALL puzzle assets at service worker install time
- Installable PWA (manifest + service worker) — standalone display mode, correct icon sizes (192, 512)
- Readable board at mobile scale — SVG pieces, 44px minimum touch target enforced
- Clear goal communication per puzzle — goal type label + visual highlighting of targets
- Puzzle position indicator ("7 / 42")

**Should have (differentiators):**
- Non-rectangular board shapes — the core mechanic; board renderer must handle arbitrary connected-cell graphs
- Smooth piece movement animations — CSS transitions at 150-200ms; low effort, high perceived quality
- Puzzle solved celebration — short particle burst or CSS keyframe animation under 500ms
- Sound feedback (off by default) — design audio hooks early; add samples in polish phase
- Elegant premium visual style — custom piece set, refined palette; not standard chess aesthetics

**Defer (v2+):**
- Difficulty labeling / visible curve in puzzle list
- Export/import puzzle progress (iOS localStorage eviction safety net)

**Explicitly out of scope:** Hints, par system, timer, accounts, leaderboards, level editor, opponent turns, pawn promotion, achievements, ads.

### Architecture Approach

Five layers with strict downward-only communication: Board Renderer fires events up to Game Controller, which calls Puzzle Engine (pure functions) and Persistence Store, then issues render commands back to the Renderer. The Game Controller owns all in-memory state. The Puzzle Engine has zero DOM dependencies. The Persistence Store is the only component that touches localStorage directly. The Puzzle Catalogue is static JSON embedded in JS modules — no network fetch, offline by default.

**Major components:**
1. **Puzzle Engine** — move generation, validation, win detection; pure functions; zero browser dependencies; unit-tested exhaustively
2. **Puzzle Catalogue** — static JSON puzzle definitions imported at build time; one file per puzzle, barrel-imported
3. **Persistence Store** — localStorage read/write; owns schema and migration logic; schema-versioned from day one
4. **Game Controller** — wires engine + store + UI; owns in-memory BoardState; maintains undo stack as array of snapshots
5. **Board Renderer** — SVG-based; builds grid from puzzle definition; single delegated pointer event listener; never calls engine functions directly
6. **PWA Shell** — vite-plugin-pwa; cache-first all app assets; `skipWaiting` + `clients.claim` for immediate updates

**Puzzle definition format** — JSON with text-grid board encoding. Grid chars: `-` = empty playable, `x` = impassable, `G` = goal square, lowercase letter = piece identifier. Puzzle catalogue embedded in a JS module, imported at build time (zero runtime fetch).

### Critical Pitfalls

1. **Non-rectangular board breaks ray casting** — impassable squares are walls, not holes; all sliding-piece code must call `isValidSquare(row, col)` returning false for out-of-bounds AND impassable cells; knights jump over impassable squares but cannot land on them (different rule, must be tested explicitly)

2. **Pawn direction is ambiguous on irregular boards** — encode `direction: +1 | -1` per pawn piece instance in the puzzle definition; never infer direction from board orientation or piece color alone; resolve before authoring more than a handful of puzzles

3. **Stale service worker leaves players on old puzzle data** — use `skipWaiting` + `clients.claim`; implement a "new version available" reload prompt; use Workbox (via vite-plugin-pwa) for cache versioning; set this up before first deploy, not after

4. **Puzzle format designed ad hoc becomes unmaintainable** — define a versioned JSON schema with `schemaVersion` field before authoring more than 2-3 test puzzles; text-grid is a human-readable authoring convenience but the canonical format must be validated JSON with stable opaque puzzle IDs (never array indexes)

5. **iOS Safari PWA** — `beforeinstallprompt` does not fire on iOS; show a persistent in-app "Add to Home Screen" instruction conditioned on iOS UA and `navigator.standalone !== true`; test on real iOS Safari device; localStorage may be evicted under storage pressure (low risk at Xess's data scale, but document it)

---

## Implications for Roadmap

### Phase 1: Foundation — Puzzle Format and Engine

**Rationale:** Everything depends on two things: a formalized puzzle definition format, and a correct chess engine for non-standard boards. No UI work, no puzzle authoring, and no other component can proceed until the BoardState shape is agreed and the engine is tested.

**Delivers:** Versioned JSON puzzle schema with `schemaVersion`; complete BoardState data structure; Puzzle Engine module with `getLegalMoves`, `applyMove`, `checkWinCondition`; Vitest test suite covering all 6 piece types, impassable square behavior, pin detection, en passant, pawn direction, undo stack; 2-3 test puzzle definitions validating the format.

**Addresses:** Puzzle format definition, move validation foundation, win detection for both goal types, undo/reset foundation.

**Avoids pitfalls:** Ray casting through impassable squares (Pitfall 3), pawn direction ambiguity (Pitfall 5), ad hoc format at scale (Pitfall 12), castling rights corruption on undo (Pitfall 4), en passant state bug (Pitfall 2), pins ignored (Pitfall 1).

**Research flag:** STANDARD PATTERNS — chess engine correctness requirements are well-documented. Use PITFALLS.md as the test specification checklist. No phase-level research needed.

---

### Phase 2: Game Controller and Persistence

**Rationale:** The Game Controller is the integration layer between engine and UI. Building it before the renderer means the complete game loop (move → validate → persist → win check) can be tested without visual dependencies. The storage schema must be finalized before puzzle authoring begins at scale.

**Delivers:** Game Controller wiring engine + store; full move loop with undo stack management; Persistence Store with localStorage schema (schema version, solved puzzle IDs by stable opaque ID, active puzzle snapshot); sequential unlock logic; debounced save on move + forced save on `visibilitychange`.

**Addresses:** Progress persistence, sequential unlock, undo stack, puzzle state restoration across sessions.

**Avoids pitfalls:** localStorage write on every render (ARCHITECTURE anti-pattern 3), progress tied to array index (Pitfall 13), undo history in localStorage causing quota errors (Pitfall 15).

**Research flag:** STANDARD PATTERNS.

---

### Phase 3: Board Renderer and Core UI

**Rationale:** The renderer requires agreed BoardState types from Phase 1 and the Game Controller interface from Phase 2. Building it third means the engine and controller are stable by the time the renderer integrates. Note: renderer development against fixture state can begin in parallel with Phase 2 once Phase 1 is complete.

**Delivers:** SVG board renderer; dynamic grid construction from puzzle definition; piece rendering via `<use>` elements with CSS transitions for movement animation; pointer event handling (Pointer Events API, tap-to-select model); legal move highlighting; win state visual feedback; puzzle position indicator; goal type display; mobile-first responsive layout; 44px minimum touch targets enforced; `touch-action: none` on board container.

**Addresses:** Two-tap select-and-move, legal move highlighting, win detection feedback, board readability at mobile scale, goal communication, non-rectangular board shapes.

**Avoids pitfalls:** Scroll conflict with page scroll (Pitfall 11), double event firing touch/mouse (Pitfall 9), touch target too small (Pitfall 10), SVG/engine coordinate system mismatch (Pitfall 16), renderer calling engine directly (ARCHITECTURE anti-pattern 2), full DOM re-render on every move (Pitfall 14).

**Research flag:** STANDARD PATTERNS for SVG and Pointer Events API. If non-rectangular cells use SVG polygon hit regions rather than rectangular cells, a short spike on polygon pointer event accuracy on mobile is worthwhile.

---

### Phase 4: Puzzle Content and Game Loop Integration

**Rationale:** With engine, controller, store, and renderer all stable, puzzle authoring can proceed without a moving target. All 25-50 puzzles are authored, sequential unlock flow is validated end-to-end, and visual polish is added.

**Delivers:** Full puzzle catalogue (25-50 curated puzzles exercising multiple board shapes and both goal types); complete sequential unlock flow with puzzle list UI; reset puzzle flow; win state celebration animation; premium visual style (custom piece SVGs, refined color palette, considered typography).

**Addresses:** All puzzle content, sequential unlock UX, win celebration, premium aesthetics, non-rectangular board shapes as core puzzle mechanic.

**Avoids pitfalls:** Puzzle IDs changing between deploys (append-only puzzle list, stable IDs), goal verification edge cases (Pitfall 18).

**Research flag:** NO RESEARCH NEEDED for content authoring. If a particle/confetti library is desired for win celebration, evaluate canvas-confetti as a lightweight option — but CSS keyframes alone may be sufficient.

---

### Phase 5: PWA, Polish, and Launch Readiness

**Rationale:** PWA integration is last because precaching requires knowing the complete, stable asset set. Polish features (sound) are added here after the core loop is validated on real devices.

**Delivers:** vite-plugin-pwa configuration with Workbox `generateSW` and `skipWaiting` + `clients.claim`; precache manifest covering all static assets; "new version available" reload prompt; iOS-specific "Add to Home Screen" instruction UI; PWA manifest with all required icon sizes (192, 512 maskable, 180 Apple Touch); optional sound feedback (off by default); final cross-browser and cross-device QA including real iOS Safari.

**Addresses:** Offline play after install, PWA installability, smooth animations, sound feedback.

**Avoids pitfalls:** Stale cache after deploy (Pitfall 6), assets not precached (Pitfall 7), iOS Safari install failure (Pitfall 8), missing manifest icon sizes (Pitfall 17).

**Research flag:** VERIFY — confirm current versions of vite-plugin-pwa and Workbox on npm (all versions marked [VERIFY] in STACK.md). Confirm iOS Safari PWA behavior against current iOS release before finalizing install prompt strategy.

---

### Phase Ordering Rationale

- The bottom-up build order (Format → Engine → Controller → Renderer → Content → PWA) follows the dependency graph from ARCHITECTURE.md exactly.
- Testing the engine before building any UI prevents the most dangerous class of silent correctness bug.
- Separating content authoring (Phase 4) from infrastructure (Phases 1-3) means puzzles are authored against a stable, tested game loop.
- PWA last is intentional: precaching requires knowing the complete asset set, and retrofitting cache invalidation is painful (noted explicitly in PITFALLS.md).

### Research Flags

Needs research:
- **Phase 5 (PWA):** Verify current vite-plugin-pwa and Workbox versions on npm; confirm current iOS Safari PWA behavior before finalizing install prompt strategy.

Standard patterns (no phase research needed):
- **Phase 1 (Engine):** Chess engine correctness requirements are thoroughly documented; PITFALLS.md is the test spec.
- **Phase 2 (Controller/Persistence):** localStorage schema and event-driven controller patterns are standard.
- **Phase 3 (Renderer):** SVG rendering and Pointer Events API are well-specified W3C standards.
- **Phase 4 (Content):** Puzzle authoring follows the format spec established in Phase 1.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All choices well-established for this problem type; version numbers need npm verification before use |
| Features | MEDIUM | Based on training-data knowledge of comparable puzzle games; no live market research available |
| Architecture | HIGH | Well-established patterns from open-source chess UIs (chessground, lichess) and PWA documentation |
| Pitfalls | HIGH (engine/PWA) / MEDIUM (mobile) | Chess engine correctness is documented fact; mobile-specific behaviors change across OS versions |

**Overall confidence:** HIGH for technical decisions; MEDIUM for feature prioritization.

### Gaps to Address

- **Version verification:** Confirm Vite, vite-plugin-pwa, and Vitest current versions on npm before project setup — all versions in STACK.md have an August 2025 training cutoff.
- **iOS PWA behavior:** Confirm current iOS Safari PWA behavior hands-on; training data reflects through iOS 17/early 18 and this changes with each release.
- **Castling scope decision:** PROJECT.md states no alternating turns; if no Xess puzzle ever includes castling, remove it from the engine entirely — this simplifies undo and state management significantly. Make this decision explicit before Phase 1 implementation.
- **Pin enforcement scope:** Confirm whether the player's king can appear on a puzzle board. If not, pin enforcement can be omitted (though implementing it fully from the start is safer and ~20 lines of code).

---

## Sources

### Primary (HIGH confidence)
- ARCHITECTURE.md — component boundaries, data flow, SVG vs Canvas analysis (training knowledge, well-established patterns)
- PITFALLS.md — chess engine correctness requirements, PWA service worker lifecycle, Pointer Events API (W3C specs and MDN documentation)
- STACK.md — technology choices and rationale (training knowledge, August 2025 cutoff)
- PROJECT.md — stated requirements and constraints (authoritative for scope decisions)

### Secondary (MEDIUM confidence)
- FEATURES.md — feature landscape based on Chess.com, Lichess, Really Bad Chess, mobile puzzle game conventions

### Tertiary (LOW confidence — verify before use)
- All specific version numbers in STACK.md — training cutoff August 2025; verify against npm
- iOS Safari PWA behavior specifics — changes with each iOS release; verify against current release

---
*Research completed: 2026-04-16*
*Ready for roadmap: yes*

---
phase: 03-board-renderer-and-core-ui
verified: 2026-04-17T14:34:00Z
status: human_needed
score: 11/11 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 7/7
  gaps_closed:
    - "Empty playable squares collapse visually after moves"
    - "Puzzle objective/context is not visible in UI"
    - "Piece visuals are low quality placeholder drawings"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Re-run touch usability UAT on real 375px-class device"
    expected: "All playable cells remain stable-size and comfortably tappable (>=44px) through repeated moves"
    why_human: "Physical tap comfort and mis-tap rate cannot be proven by static CSS contract tests"
  - test: "Re-evaluate visual clarity of selected/legal/illegal/win feedback with new SVG assets"
    expected: "State changes are immediately distinguishable and piece visuals are clearly readable"
    why_human: "Perceived visual clarity and aesthetic quality are subjective and require human judgment"
  - test: "Confirm objective comprehension in first-time play"
    expected: "Players can state the puzzle objective from title/objective panel before first move"
    why_human: "Comprehension and UX communication quality are not directly machine-verifiable"
---

# Phase 3: Board Renderer and Core UI Verification Report

**Phase Goal:** Players can interact with the game — select pieces, see legal moves, make moves, and receive immediate visual feedback — on any board shape at mobile size.
**Verified:** 2026-04-17T14:34:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure execution (Plans 03-04 and 03-05)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Board renders irregular shapes (including void/impassable coordinates) from puzzle dimensions and board occupancy. | ✓ VERIFIED | `src/ui/boardRenderer.js` uses nested `puzzle.height/width` loops and `board.has(key)` as playability source (lines 25-31); void cells emitted as `cell--void` (30-41); covered by `src/ui/boardRenderer.test.js` (13-31). |
| 2 | Piece selection highlights legal destination squares. | ✓ VERIFIED | `tapCell()` calls `controller.selectPiece(positionKey)` and feeds returned keys into feedback state (src/main.js 101-105, 129-132); tested in `src/main.ui.test.js` (34-46). |
| 3 | Legal tap executes move, illegal tap is ignored with immediate feedback. | ✓ VERIFIED | Legal path guarded by `snapshot.legalKeys.includes(positionKey)` then `makeMove` + `state.board = result.board` (main.js 117-126); illegal path uses `feedback.triggerIllegal` without board mutation (119-121, 133); no-mutation test in `main.ui.test.js` (70-84). |
| 4 | Move transition timing is within 150–200ms. | ✓ VERIFIED | `MOVE_TRANSITION_MS = 180` in `src/ui/interactionFeedback.js` (1), propagated to CSS var in DOM render (main.js 186), and bounded by tests in `main.ui.test.js` (64-66). |
| 5 | Win state is shown immediately after winning move. | ✓ VERIFIED | Winning move sets feedback won state via `feedback.applyMove(..., result.won)` (main.js 125); board/win banner consume `is-won` (178-180); tested in `main.ui.test.js` (86-98). |
| 6 | Squares are visually uniform (no checkerboard); goal squares are distinct. | ✓ VERIFIED | Renderer always emits `cell--playable`; goal is additive `cell--goal` (boardRenderer.js 45-47); tests explicitly reject parity classes (boardRenderer.test.js 33-56); styling in `src/styles/board.css` (`.cell--playable`, `.cell--goal`). |
| 7 | UI remains usable at 375px with >=44px touch targets. | ✓ VERIFIED | `app.css` constrains mobile shell to 375px (39-40); `board.css` sets `min-inline-size/min-block-size: 44px` on `.cell` (22-23); responsive/touch contract tests in `main.ui.test.js` (101-123). |
| 8 | Empty playable squares keep stable geometry (no collapse after piece moves). | ✓ VERIFIED | `.board` uses `grid-auto-rows: 1fr` and playable cells enforce `aspect-ratio: 1 / 1` (board.css 9, 33); regression test in `main.gap-ux.test.js` (49-57). |
| 9 | Puzzle title and objective are shown before interaction. | ✓ VERIFIED | Render model includes `puzzleTitle` and goal-derived `objectiveText` (main.js 36-38, 48-65); DOM renders metadata panel with `data-puzzle-title/objective` (159-171); regression test in `main.gap-ux.test.js` (30-47). |
| 10 | Piece rendering remains deterministic SVG with strict whitelist/unknown-key rejection. | ✓ VERIFIED | `pieces.js` statically imports 12 SVGs and validates color/type allow-list (4-15, 29-42, 44-50); `pieces.test.js` verifies all keys + rejection behavior (20-35). |
| 11 | Piece asset source/license obligations are documented in-repo. | ✓ VERIFIED | `src/ui/piece-assets/ATTRIBUTION.md` records source collection, license terms, URLs, and attribution notice (1-29). |

**Score:** 11/11 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/ui/boardRenderer.js` | Board model for irregular geometry and goal/void semantics | ✓ VERIFIED | Exists; substantive logic and piece metadata binding; imported by `src/main.js`. |
| `src/ui/pieces.js` | Deterministic SVG whitelist mapper | ✓ VERIFIED | Exists; static imports for all 12 keys; strict validation and no dynamic path construction. |
| `src/main.js` | Controller→renderer→DOM orchestration | ✓ VERIFIED | Exists; two-tap flow, win/illegal handling, objective panel rendering, CSS variable wiring. |
| `src/ui/interactionFeedback.js` | Centralized feedback transitions | ✓ VERIFIED | Exists; selection/legal/illegal/moving/won snapshot state machine. |
| `src/styles/board.css` | Grid + touch target + stable square constraints | ✓ VERIFIED | Exists; includes `grid-template-columns`, `grid-auto-rows`, 44px mins, playable aspect ratio. |
| `src/styles/app.css` | Mobile-first shell + metadata panel styling | ✓ VERIFIED | Exists; 375px-first constraints and desktop media query. |
| `src/main.ui.test.js` | Interaction + responsive contracts | ✓ VERIFIED | Exists; 6 tests covering select/move/illegal/win and responsive constraints. |
| `src/main.gap-ux.test.js` | Gap-closure regression coverage | ✓ VERIFIED | Exists; 3 tests for objective panel, static square geometry, class continuity. |
| `src/ui/pieces.test.js` | Asset mapping + safety invariants | ✓ VERIFIED | Exists; validates 12-key coverage, unknown key throws, SVG shape invariants. |
| `src/ui/piece-assets/ATTRIBUTION.md` | Licensing and provenance | ✓ VERIFIED | Exists; documents origin and attribution obligations. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/main.js` | `src/controller.js` | `selectPiece` / `makeMove` / `loadPuzzle` | ✓ WIRED | Calls in main.js at 78, 102, 118, 129; state updates reflect controller outputs. |
| `src/ui/boardRenderer.js` | puzzle dimensions + board occupancy | `puzzle.width/height` + `board.has(posKey)` | ✓ WIRED | Dimension-driven loops + occupancy guard at lines 25-31. |
| `src/ui/boardRenderer.js` | `src/ui/pieces.js` | `getPieceSvgKey` + `getPieceSvg` | ✓ WIRED | Imports at line 2; calls at 56-57. |
| `src/main.js` | puzzle metadata panel | render model `puzzleTitle/objectiveText` → DOM | ✓ WIRED | Model fields set at 36-38, DOM `textContent` at 166 and 171. |
| CSS square constraints | runtime board markup | `.board/.cell/.cell--playable` class hooks | ✓ WIRED | main.js emits class hooks (183, 192); board.css targets same selectors (1, 18, 32). |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/main.js` | `state.board` rendered into cells | `controller.loadPuzzle()` and `controller.makeMove()` | Yes — controller parses catalogue puzzle data and applies engine move results (`src/controller.js` 50-53, 118-134). | ✓ FLOWING |
| `src/main.js` | `puzzleTitle` / `objectiveText` | `loaded.puzzle` metadata (`goalType`, `targetColor`, `title`) | Yes — generated from parsed puzzle object, not hardcoded placeholder (`src/puzzles/catalogue.js`, `main.js` 48-65). | ✓ FLOWING |
| `src/ui/boardRenderer.js` | `cells[]` (void/goal/piece flags) | `puzzle.width/height` + `board` `Map` entries | Yes — each render reflects current board map and puzzle geometry. | ✓ FLOWING |
| `src/ui/pieces.js` | SVG payload per piece key | static local `?raw` imports (`piece-assets/*.svg`) | Yes — non-empty local assets validated by tests (`src/ui/pieces.test.js` 20-45). | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Renderer contracts hold | `npm test -- src/ui/boardRenderer.test.js --run` | 3 tests passed | ✓ PASS |
| Interaction + responsive behavior holds | `npm test -- src/main.ui.test.js --run` | 6 tests passed | ✓ PASS |
| Gap-closure UX regressions covered | `npm test -- src/main.gap-ux.test.js --run` | 3 tests passed | ✓ PASS |
| Piece asset contracts hold | `npm test -- src/ui/pieces.test.js --run` | 3 tests passed | ✓ PASS |
| Build emits runnable assets | `npm run build` | Build succeeded; emitted JS/CSS bundles in `dist/assets` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `INT-01` | 03-02 | Select piece and highlight legal destinations | ✓ SATISFIED | `main.js` selection flow (101-105, 129-132) + `main.ui.test.js` (34-46). |
| `INT-02` | 03-02 / 03-04 | Legal moves execute; illegal taps ignored with visual feedback | ✓ SATISFIED | Legal/illegal branches in `main.js` (117-126, 119-121, 133) + `main.ui.test.js` (48-84). |
| `INT-05` | 03-02 | Smooth 150–200ms move transition | ✓ SATISFIED | `MOVE_TRANSITION_MS=180` + test bounds (main.ui.test.js 64-66). |
| `RND-01` | 03-01 | Correct rendering for arbitrary board shapes | ✓ SATISFIED | `board.has`-driven playability and void output in renderer + tests (boardRenderer.test.js 13-31). |
| `RND-02` | 03-01 | Uniform squares; goal squares distinct | ✓ SATISFIED | `cell--playable` baseline + `cell--goal` overlay + no parity classes tests. |
| `RND-03` | 03-03 / 03-04 | 375px readability and >=44px touch target | ✓ SATISFIED | CSS touch-size constraints + responsive tests + square-stability regression tests. |
| `RND-04` | 03-01 / 03-05 | SVG pieces and CSS Grid board layout | ✓ SATISFIED | Grid layout in board.css; curated SVG mapping in pieces.js; contract tests in pieces.test.js. |
| `VIS-02` | 03-03 / 03-04 / 03-05 | Mobile-first responsive usable phone+desktop UI | ✓ SATISFIED | `app.css` mobile-first + desktop query, metadata panel, and passing responsive/gap UX tests. |

Orphaned requirements check: **None**. `REQUIREMENTS.md` Phase 3 traceability lists `INT-01, INT-02, INT-05, RND-01, RND-02, RND-03, RND-04, VIS-02`, and all are claimed in Phase 3 plan frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| Phase 3 target files | — | No TODO/FIXME/placeholders or stub return patterns found | ℹ️ Info | No blocker anti-patterns detected in renderer/UI gap-closure code |
| `src/main.ui.test.js`, `src/main.gap-ux.test.js` | style-contract tests | CSS verification relies on source-text regex contracts (not rendered layout metrics) | ⚠️ Warning | Correct for CI guardrails, but does not replace real-device tap/visual validation |

### Human Verification Required

### 1. Real-device touch usability at 375px after square-stability fix

**Test:** On a real touch device (or accurate touch simulator), play repeated move sequences and tap dense clusters of playable cells.
**Expected:** Empty/playable squares remain stable and taps are reliable with low mis-tap rate.
**Why human:** Static CSS contracts prove intent, not physical touch ergonomics.

### 2. Visual clarity and quality with curated piece set

**Test:** Compare selected/legal/illegal/win states during play and assess piece legibility/quality at normal phone viewing distance.
**Expected:** State changes are obvious and piece visuals are clearly improved over placeholders.
**Why human:** Aesthetic quality and perceptual clarity are subjective.

### 3. Objective comprehension before first move

**Test:** Open puzzle and, before interacting, verify a user can explain the goal from the title/objective panel.
**Expected:** Objective text is understandable and accurately reflects puzzle goal type.
**Why human:** UX comprehension cannot be fully inferred from DOM presence alone.

### Gaps Summary

No code-level gaps were found against roadmap success criteria, Phase 3 plan must-haves, or the specified requirement IDs. Previous HUMAN-UAT issues are now covered by concrete implementation plus regression tests:
- static square geometry (`grid-auto-rows` + `aspect-ratio`),
- puzzle objective context panel,
- curated open-licensed SVG piece assets with attribution.

Automated verification passes; human UX/device confirmation is still required.

---

_Verified: 2026-04-17T14:34:00Z_
_Verifier: the agent (gsd-verifier)_

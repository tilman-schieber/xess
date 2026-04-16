# Requirements: Xess

**Defined:** 2026-04-16
**Core Value:** A chess puzzle game where the twist is the board, not the rules — players who know chess can immediately play, but the strange board geometries create fresh, surprising challenges.

## v1 Requirements

### Puzzle Format

- [x] **FMT-01**: Puzzle definition encodes board shape as a text-grid (rows of character codes: `-`=empty, `x`=impassable, `G`=goal square, piece chars for pieces)
- [x] **FMT-02**: Puzzle definition encodes piece type, piece color (player/opponent), and for pawns an explicit direction property
- [x] **FMT-03**: Puzzle definition encodes goal type (capture-all-targets or reach-all-goal-squares)
- [x] **FMT-04**: Each puzzle has a stable opaque string ID (never an array index) used for localStorage keys
- [x] **FMT-05**: Puzzle format is versioned with a `schemaVersion` field

### Puzzle Engine

- [ ] **ENG-01**: Engine generates legal moves for all 6 piece types (King, Queen, Rook, Bishop, Knight, Pawn) following standard chess movement rules
- [ ] **ENG-02**: Engine treats impassable squares as walls for all sliding pieces and as jumpable obstacles (cannot land) for knights
- [ ] **ENG-03**: Engine enforces pawn movement using per-piece direction property (not inferred from color or board orientation)
- [ ] **ENG-04**: Engine does not implement check, pin detection, or castling (no king-safety rules — king is never on the board in any puzzle)
- [ ] **ENG-05**: Engine supports "capture-all-targets" win condition: all opponent pieces must be captured
- [ ] **ENG-06**: Engine supports "reach-all-goal-squares" win condition: specified player pieces must occupy all goal squares
- [ ] **ENG-07**: Engine exposes pure functions with no DOM or localStorage dependencies (testable in isolation with Vitest)
- [ ] **ENG-08**: Undo is snapshot-based: each move stores the full board state; undo pops the stack (multi-level, no limit)

### Game Interaction

- [ ] **INT-01**: Player selects a piece by tapping/clicking it; legal destination squares are highlighted
- [ ] **INT-02**: Player completes a move by tapping/clicking a highlighted destination; illegal taps are ignored with visual feedback
- [ ] **INT-03**: Player can undo any number of moves back to the puzzle start state
- [ ] **INT-04**: Player can reset the puzzle to its initial state with a single action
- [ ] **INT-05**: Piece movement is animated with a smooth CSS transition (150–200ms)
- [ ] **INT-06**: Win state is detected immediately after each move and presented clearly to the player

### Puzzle Navigation

- [ ] **NAV-01**: Player sees a list of all puzzles; solved puzzles are marked; unsolved future puzzles are locked
- [ ] **NAV-02**: Puzzles unlock sequentially — a puzzle is unlocked only when the previous one is solved
- [ ] **NAV-03**: Current puzzle position is displayed ("7 / 42")
- [ ] **NAV-04**: Each puzzle displays its goal type and target clearly before and during play
- [ ] **NAV-05**: Puzzles are ordered by implied difficulty (easier first, harder later) with no explicit difficulty labels

### Persistence

- [ ] **PRS-01**: Solved puzzle IDs are persisted in localStorage and survive browser close/reopen
- [ ] **PRS-02**: Active puzzle state (piece positions, move history for undo) is persisted in localStorage and restored on revisit
- [ ] **PRS-03**: localStorage schema includes a version field; migrations are handled gracefully
- [ ] **PRS-04**: State is written on every move (debounced) and synchronously on `visibilitychange: hidden`

### Board Rendering

- [ ] **RND-01**: Board renders correctly for any board shape: variable dimensions, non-rectangular grids, impassable squares
- [ ] **RND-02**: All squares are visually uniform (no alternating chess colors); goal squares are distinctly highlighted (e.g. green)
- [ ] **RND-03**: Board and pieces are readable at 375px viewport width; minimum touch target per piece is 44px
- [ ] **RND-04**: Piece rendering uses SVG; board layout uses CSS Grid driven by puzzle definition dimensions

### Visual Design

- [ ] **VIS-01**: Visual style is elegant and premium — custom piece set, refined color palette, considered typography; no standard chess clichés
- [ ] **VIS-02**: UI is mobile-first responsive and usable on both phone and desktop

### Sound

- [ ] **SND-01**: Optional sound feedback for piece moves and puzzle solve (off by default; preference persisted in localStorage)
- [ ] **SND-02**: Sound uses a single AudioContext with 3–4 short samples; no sound plays unless user has enabled it

### PWA

- [ ] **PWA-01**: App is installable as a PWA: valid Web App Manifest with required icon sizes (192, 512, 180 Apple Touch), standalone display mode
- [ ] **PWA-02**: App works fully offline after first load: service worker precaches all static assets and all puzzle data at install time
- [ ] **PWA-03**: New app versions activate immediately using `skipWaiting` + `clients.claim`; a reload prompt is shown to the player
- [ ] **PWA-04**: iOS Safari users who haven't installed see a persistent "Add to Home Screen" instruction (conditioned on iOS UA + `navigator.standalone !== true`)

### Content

- [ ] **CNT-01**: App ships with 25–50 curated puzzles exercising multiple board shapes and both goal types
- [ ] **CNT-02**: Puzzle catalogue is embedded as static JS modules (no network fetch; offline from build time)

---

## v2 Requirements

### Polish

- **POL-01**: Puzzle solved celebration — short particle burst or CSS keyframe animation on solve
- **POL-02**: Difficulty labels visible in puzzle list (Easy / Medium / Hard)
- **POL-03**: Export/import puzzle progress (safety net for iOS localStorage eviction)

### Content

- **CNT-V2-01**: Additional puzzle packs beyond initial 25–50
- **CNT-V2-02**: Puzzle packs grouped by board shape theme or difficulty tier

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Hint system | Requires solver infrastructure; reduces solve satisfaction; undo + reset is the safety net |
| Move count / par system | Pressures players on unfamiliar boards; exploration is the point |
| Timer / speed challenge | Wrong genre for geometry puzzles; adds anxiety |
| In-app level editor | Different UI surface, validation tooling, QA scope; curated content is a feature |
| Online leaderboards / accounts | Requires backend, auth, ops cost; local progress tracking is sufficient |
| Pawn promotion | Geometrically ambiguous on non-standard boards; adds rules complexity with no puzzle design benefit |
| Castling | Never used in any Xess puzzle; removed from engine to simplify undo state |
| Check / pin enforcement | King never appears on any Xess puzzle board; rules enforcement not needed |
| Alternating-turn chess | Static opponent pieces only; turns the game into a tactics trainer, not a geometry puzzle |
| Server-side persistence | Purely client-side; local storage is the contract |
| Achievements / badge system | Hollow without thoughtful design; completion checkmarks are sufficient |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FMT-01 | Phase 1 | Complete |
| FMT-02 | Phase 1 | Complete |
| FMT-03 | Phase 1 | Complete |
| FMT-04 | Phase 1 | Complete |
| FMT-05 | Phase 1 | Complete |
| ENG-01 | Phase 1 | Pending |
| ENG-02 | Phase 1 | Pending |
| ENG-03 | Phase 1 | Pending |
| ENG-04 | Phase 1 | Pending |
| ENG-05 | Phase 1 | Pending |
| ENG-06 | Phase 1 | Pending |
| ENG-07 | Phase 1 | Pending |
| ENG-08 | Phase 1 | Pending |
| INT-01 | Phase 3 | Pending |
| INT-02 | Phase 3 | Pending |
| INT-03 | Phase 2 | Pending |
| INT-04 | Phase 2 | Pending |
| INT-05 | Phase 3 | Pending |
| INT-06 | Phase 2 | Pending |
| NAV-01 | Phase 2 | Pending |
| NAV-02 | Phase 2 | Pending |
| NAV-03 | Phase 2 | Pending |
| NAV-04 | Phase 4 | Pending |
| NAV-05 | Phase 2 | Pending |
| PRS-01 | Phase 2 | Pending |
| PRS-02 | Phase 2 | Pending |
| PRS-03 | Phase 2 | Pending |
| PRS-04 | Phase 2 | Pending |
| RND-01 | Phase 3 | Pending |
| RND-02 | Phase 3 | Pending |
| RND-03 | Phase 3 | Pending |
| RND-04 | Phase 3 | Pending |
| VIS-01 | Phase 4 | Pending |
| VIS-02 | Phase 3 | Pending |
| SND-01 | Phase 5 | Pending |
| SND-02 | Phase 5 | Pending |
| PWA-01 | Phase 5 | Pending |
| PWA-02 | Phase 5 | Pending |
| PWA-03 | Phase 5 | Pending |
| PWA-04 | Phase 5 | Pending |
| CNT-01 | Phase 4 | Pending |
| CNT-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 after roadmap creation*

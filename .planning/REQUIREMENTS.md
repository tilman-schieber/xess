# Requirements: Xess

**Defined:** 2026-04-20
**Core Value:** A chess puzzle game where the twist is the board, not the rules — players who know chess can immediately play, but the strange board geometries create fresh, surprising challenges.

## v1 Requirements

Requirements for milestone v1.3 Interface and Onboarding Clarity.

### Navigation and Shell

- [ ] **NAV-01**: Player can navigate the app through a persistent header/footer shell with clear entry points for landing, tracks, and active play context.
- [ ] **NAV-02**: Player on mobile can open and use a hamburger menu with tap-friendly controls that do not interfere with board interactions.

### Board Visual Affordances

- [x] **VIS-01**: Player sees the currently selected piece square highlighted with a translucent green-toned overlay that does not recolor the piece glyph.
- [x] **VIS-02**: Player sees legal destination squares indicated by translucent green-toned overlays on board cells (not frame-only outlines).
- [x] **VIS-03**: Player sees mode-aware opponent styling where move-to-goal puzzles render opposing pieces in red/dark-red treatment that remains readable on mobile and desktop.

### Onboarding and Progression

- [ ] **ONB-01**: New players land on a full landing page that clearly explains available next actions instead of entering directly into minimal gameplay UI.
- [ ] **ONB-02**: Returning players see contextual actions (for example continue active puzzle, start tutorial, or browse tracks) derived from current local progress state.

### Puzzle Modes and Tutorial

- [ ] **MODE-03**: Player can start and complete a dedicated tutorial track that teaches Xess-specific puzzle concepts and board expectations.
- [x] **MODE-04**: Player can play capture puzzles where only white pieces are controllable and objective progress relies on capturing black pieces according to puzzle goals.
- [x] **MODE-05**: Player can play move-to-goal puzzles where captures are disallowed by rules and objectives are completed by reaching designated goal squares.

## v2 Requirements

Deferred while v1.3 focuses on clarity and onboarding fundamentals.

### Modes and Content Expansion

- **MODE-01**: User can start a random puzzle mode from the start screen.
- **MODE-02**: User can run a guided progression mode with curated constraints.
- **CNT-V2-01**: User can play expanded track libraries beyond the launch placeholder set.
- **CNT-V2-02**: Tracks can be tagged and filtered by theme/difficulty in the start flow.

## Out of Scope

| Feature | Reason |
|---------|--------|
| User-generated level editor | Not required for this milestone; focus is polish of curated experience |
| Multiplayer races/leaderboards | Out of scope for local-first single-player constraints |
| Cloud profile sync | Violates local-only storage requirement |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 14 | Pending |
| NAV-02 | Phase 14 | Pending |
| VIS-01 | Phase 13 | Complete |
| VIS-02 | Phase 13 | Complete |
| VIS-03 | Phase 13 | Complete |
| ONB-01 | Phase 14 | Pending |
| ONB-02 | Phase 14 | Pending |
| MODE-03 | Phase 14 | Pending |
| MODE-04 | Phase 13 (regression checks) | Complete |
| MODE-05 | Phase 13 (regression checks) | Complete |

**Coverage:**
- v1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-20*
*Last updated: 2026-04-20 after v1.3 UI/UX phase consolidation*

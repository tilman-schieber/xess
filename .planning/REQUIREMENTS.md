# Requirements: Xess

**Defined:** 2026-04-18
**Core Value:** A chess puzzle game where the twist is the board, not the rules — players who know chess can immediately play, but the strange board geometries create fresh, surprising challenges.

## v1 Requirements

### Launch Completion

- [x] **CNT-01**: User can play a placeholder launch puzzle set immediately; puzzle quality/content expansion will be authored manually later.
- [x] **CNT-02**: Puzzle catalogue ships as static local assets with no runtime network dependency for puzzle data.
- [ ] **SND-02**: Sound system uses one shared `AudioContext` with a small sample set and never plays unless explicitly enabled.

### Tracks and Start Screen

- [x] **TRK-01**: User lands on a new start screen before entering puzzle play.
- [x] **TRK-02**: User sees puzzle tracks grouped as separate collections (not one flat list).
- [x] **TRK-03**: User can open a track and browse puzzles numbered within that track.
- [x] **TRK-04**: User can start or resume a puzzle from track context.
- [x] **TRK-05**: Track metadata supports future mode entry points (random, guided, tutorial) without breaking current flow.
- [x] **TRK-06**: Existing solved/progress data remains compatible after migration to track-based indexing.

### Puzzle Rich Text

- [ ] **TXT-01**: User sees a short puzzle description rendered in the puzzle UI.
- [ ] **TXT-02**: Puzzle description supports curated HTML formatting from puzzle author data.
- [ ] **TXT-03**: HTML rendering is sanitized or allowlisted so unsafe markup is not executed.

### UX/UI Polish

- [ ] **UXP-01**: Primary controls meet mobile touch-target expectations (>= 44px interactive targets).
- [ ] **UXP-02**: Puzzle completion message layout is corrected, including proper line breaks and spacing.
- [x] **UXP-03**: Start/list/play screens use consistent visual hierarchy and spacing.
- [ ] **UXP-04**: Known interaction rough edges in the current UI are resolved for launch quality.

## v2 Requirements

### Game Modes

- **MODE-01**: User can start a random puzzle mode from the start screen.
- **MODE-02**: User can run guided track mode with curated progression constraints.
- **MODE-03**: User can access a tutorial track with onboarding-focused puzzle sequencing.

### Content Expansion

- **CNT-V2-01**: User can play expanded track libraries beyond the placeholder launch set.
- **CNT-V2-02**: Tracks can be tagged by theme/difficulty and filtered in the start flow.

## Out of Scope

| Feature | Reason |
|---------|--------|
| AI-generated puzzle authoring | Puzzle quality and pedagogy should be manually authored by the project owner |
| Server-backed track sync | Product remains local-first/browser-only for current milestone |
| New chess mechanics beyond current engine | Milestone targets structure/presentation polish, not rule expansion |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CNT-01 | Phase 8 | Complete |
| CNT-02 | Phase 8 | Complete |
| SND-02 | Phase 10 | Pending |
| TRK-01 | Phase 7 | Complete |
| TRK-02 | Phase 7 | Complete |
| TRK-03 | Phase 7 | Complete |
| TRK-04 | Phase 7 | Complete |
| TRK-05 | Phase 8 | Complete |
| TRK-06 | Phase 8 | Complete |
| TXT-01 | Phase 9 | Pending |
| TXT-02 | Phase 9 | Pending |
| TXT-03 | Phase 9 | Pending |
| UXP-01 | Phase 10 | Pending |
| UXP-02 | Phase 10 | Pending |
| UXP-03 | Phase 7 | Complete |
| UXP-04 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-18*
*Last updated: 2026-04-18 after milestone v1.1 scope definition*

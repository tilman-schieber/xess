# Xess

## What This Is

Xess is a client-side chess-based puzzle game that runs in the browser and installs as a PWA. Pieces move exactly like chess, but the boards are non-standard — variable sizes, non-rectangular grids, impassable squares — and all squares are uniform (no alternating colors). Players solve curated puzzles by capturing target pieces or moving pieces onto goal squares.

## Core Value

A chess puzzle game where the twist is the board, not the rules — players who know chess can immediately play, but the strange board geometries create fresh, surprising challenges.

## Current State

- Shipped **v1.1 UX Launch Polish** on 2026-04-19.
- Launch UX now includes a start screen, track-first navigation, and track-scoped puzzle selection.
- Puzzle metadata supports safe curated rich-text descriptions.
- Audio remains explicit opt-in and robust across browser/runtime failures.

## Next Milestone Goals

- Define first playable game modes (`MODE-01`, `MODE-02`, `MODE-03`) on top of the new start/track entry structure.
- Expand puzzle content beyond placeholder launch set (`CNT-V2-01`).
- Add theme/difficulty tagging and filtering in track browsing (`CNT-V2-02`).

## Requirements

### Validated

- [x] Launch content ships as static local assets and remains playable offline (`CNT-01`, `CNT-02`) — v1.1
- [x] Sound remains explicit opt-in with shared runtime context (`SND-02`) — v1.1
- [x] Start-screen and track-based navigation flow is shipped (`TRK-01`..`TRK-06`) — v1.1
- [x] Puzzle rich-text descriptions are sanitized and rendered in-play (`TXT-01`, `TXT-02`, `TXT-03`) — v1.1
- [x] Touch-target and completion-flow UX polish delivered (`UXP-01`..`UXP-04`) — v1.1

### Active

- [ ] User can start a random puzzle mode from the start screen (`MODE-01`)
- [ ] User can run a guided progression mode with curated constraints (`MODE-02`)
- [ ] User can access a tutorial track with onboarding-focused sequencing (`MODE-03`)
- [ ] User can play expanded track libraries beyond the launch placeholder set (`CNT-V2-01`)
- [ ] Tracks can be tagged and filtered by theme/difficulty in the start flow (`CNT-V2-02`)

### Out of Scope

- Moving opponent pieces — opponents are static targets only; no alternating-turn chess
- Move count / par system — puzzles have no target move count
- In-app level editor — puzzles are curated, not user-created (v1)
- Pawn promotion — pawns move and capture normally but never promote
- Online multiplayer or leaderboards — purely local single-player
- Server-side persistence — everything lives in local storage

## Context

- Purely client-side; no backend needed — local storage is the only persistence layer
- Target: mobile-first but also works on desktop
- PWA requirements: service worker, manifest, offline play
- v1.1 established stable screen modes (`start`, `tracks`, `play`) and track context preservation on back navigation
- Rich text rendering now uses allowlist sanitization and test coverage to keep authoring safe
- Touch interaction contracts and opt-in audio behavior are now validated by automated regression tests

## Constraints

- **Tech stack**: Vanilla JS or lightweight framework — no backend, runs entirely in browser
- **Storage**: Local storage only — no accounts, no sync
- **Offline**: Must work offline after first load (PWA service worker)
- **Compatibility**: Modern mobile browsers (iOS Safari, Chrome Android) + desktop

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Client-side only, no backend | Simplicity, no hosting costs, privacy — puzzles are static content | ✓ Good |
| Track launch fallback order: active-in-track -> first-unsolved -> first-track -> null | Preserve resume-first UX while staying deterministic for empty/unknown progress states | ✓ Good |
| Sanitized rich-text rendering with strict allowlist | Allow puzzle flavor text without introducing XSS in browser runtime | ✓ Good |
| Explicit user opt-in for audio with fail-silent runtime behavior | Prevent surprise audio and keep game stable when audio/storage APIs fail | ✓ Good |
| Sequential unlock (not open) | Original v1.0 progression plan; now under milestone reconsideration as tracks are introduced | ⚠️ Revisit |
| No hints system | Keeps the puzzle honest; undo/reset is the safety net | — Pending |
| Pawns don't promote | Avoids complexity on non-standard boards where promotion zones are ambiguous | — Pending |

## Milestone History

<details>
<summary>v1.1 UX Launch Polish (shipped 2026-04-19)</summary>

- Archive: `.planning/milestones/v1.1-ROADMAP.md`
- Requirements archive: `.planning/milestones/v1.1-REQUIREMENTS.md`
- Planning history: `.planning/milestones/v1.1-phases/`

</details>

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-19 after v1.1 milestone completion*

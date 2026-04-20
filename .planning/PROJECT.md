# Xess

## What This Is

Xess is a client-side chess-based puzzle game that runs in the browser and installs as a PWA. Pieces move exactly like chess, but the boards are non-standard — variable sizes, non-rectangular grids, impassable squares — and all squares are uniform (no alternating colors). Players solve curated puzzles by capturing target pieces or moving pieces onto goal squares.

## Core Value

A chess puzzle game where the twist is the board, not the rules — players who know chess can immediately play, but the strange board geometries create fresh, surprising challenges.

## Current State

- Shipped **v1.2 Puzzle Logic Improvement** on 2026-04-19.
- Core move legality, undo/redo tracking, and replay-safe persistence are now stable and verified.
- Launch UX includes start + tracks + play modes, but onboarding and visual affordances remain minimal.
- Next milestone focuses on presentation clarity and puzzle-mode comprehension.

## Current Milestone: v1.3 Interface and Onboarding Clarity

**Goal:** Make Xess feel polished and immediately understandable by improving visual interaction patterns, onboarding flow, and explicit puzzle-mode presentation.

**Target features:**
- Add polished app shell and responsive navigation (header/footer/menu + mobile hamburger)
- Improve board interaction visuals for selected pieces and legal destinations with transparent overlays
- Introduce clear onboarding: richer landing page, contextual actions, tutorial track, and explicit dual puzzle modes

## Requirements

### Validated

- [x] Launch content ships as static local assets and remains playable offline (`CNT-01`, `CNT-02`) — v1.1
- [x] Sound remains explicit opt-in with shared runtime context (`SND-02`) — v1.1
- [x] Start-screen and track-based navigation flow is shipped (`TRK-01`..`TRK-06`) — v1.1
- [x] Puzzle rich-text descriptions are sanitized and rendered in-play (`TXT-01`, `TXT-02`, `TXT-03`) — v1.1
- [x] Touch-target and completion-flow UX polish delivered (`UXP-01`..`UXP-04`) — v1.1
- [x] Move legality and tracking reliability shipped (`LOGIC-01`..`LOGIC-03`, `MOVE-01`..`MOVE-04`) — v1.2

### Active

- [ ] Player sees a polished responsive app shell with clear desktop/mobile navigation patterns (`NAV-01`)
- [ ] Board interactions use clear overlay affordances for selection and legal destinations (`VIS-01`)
- [ ] Landing and resume flow presents contextual next actions for new and returning players (`ONB-01`)
- [ ] Tutorial track explains core puzzle concepts and mode differences (`MODE-03`)
- [ ] Capture mode and move-to-goal mode are explicit, visually distinct, and rule-consistent (`MODE-04`, `MODE-05`)

### Out of Scope

- Moving opponent pieces — opponents are static targets only; no alternating-turn chess
- Move count / par system — puzzles have no target move count
- In-app level editor — puzzles are curated, not user-created (v1)
- Pawn promotion — pawns move and capture normally but never promote
- Online multiplayer or leaderboards — purely local single-player
- Server-side persistence — everything lives in local storage
- Random mode rollout (`MODE-01`) — deferred while tutorial and core mode clarity are prioritized
- Guided meta-progression mode (`MODE-02`) — deferred until onboarding patterns stabilize
- Track tagging/filtering expansion (`CNT-V2-01`, `CNT-V2-02`) — deferred until post-onboarding milestone

## Context

- Purely client-side; no backend needed — local storage is the only persistence layer
- Target: mobile-first but also works on desktop
- PWA requirements: service worker, manifest, offline play
- v1.1 established stable screen modes (`start`, `tracks`, `play`) and track context preservation on back navigation
- Rich text rendering now uses allowlist sanitization and test coverage to keep authoring safe
- Touch interaction contracts and opt-in audio behavior are now validated by automated regression tests
- New milestone focus is UX clarity and mode comprehension after shipping core gameplay correctness

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
| Milestone v1.2 prioritizes puzzle logic and move tracking over mode expansion | Trust in core move behavior is prerequisite for additional game modes/content growth | ✓ Good |
| Milestone v1.3 prioritizes polished interaction affordances and onboarding clarity | New users need immediate visual comprehension of legal moves and mode rules before content scale-up | — Pending |
| Sequential unlock (not open) | Original v1.0 progression plan; now under milestone reconsideration as tracks are introduced | ⚠️ Revisit |
| No hints system | Keeps the puzzle honest; undo/reset is the safety net | — Pending |
| Pawns don't promote | Avoids complexity on non-standard boards where promotion zones are ambiguous | — Pending |

## Milestone History

<details>
<summary>v1.2 Puzzle Logic Improvement (shipped 2026-04-19)</summary>

- Archive: `.planning/milestones/v1.2-ROADMAP.md`
- Requirements archive: `.planning/milestones/v1.2-REQUIREMENTS.md`
- Planning history: `.planning/milestones/v1.2-phases/`

</details>

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
*Last updated: 2026-04-20 after starting v1.3 milestone*

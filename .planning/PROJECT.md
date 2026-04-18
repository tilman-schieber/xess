# Xess

## What This Is

Xess is a client-side chess-based puzzle game that runs in the browser and installs as a PWA. Pieces move exactly like chess, but the boards are non-standard — variable sizes, non-rectangular grids, impassable squares — and all squares are uniform (no alternating colors). Players solve curated puzzles by capturing target pieces or moving pieces onto goal squares.

## Core Value

A chess puzzle game where the twist is the board, not the rules — players who know chess can immediately play, but the strange board geometries create fresh, surprising challenges.

## Current Milestone: v1.1 UX Launch Polish

**Goal:** Ship launch-critical gaps while introducing a track-based puzzle structure and start screen foundation for future game modes.

**Target features:**
- Finish launch gaps: complete content and sound robustness
- Replace the flat puzzle list with grouped puzzle tracks and per-track numbering
- Add a new start screen that becomes the main entry point for future play modes
- Add short per-puzzle rich text content displayed during play
- Polish touch-first UX details (button sizing, completion messaging, and interaction rough edges)

## Requirements

### Validated

- [x] Every puzzle can define short authored HTML text shown in the puzzle UI (`TXT-01`, `TXT-02`, `TXT-03`) — Validated in Phase 09: puzzle-rich-text-content

### Active

- [ ] Finish launch gaps for content and audio robustness (`CNT-01`, `CNT-02`, `SND-02`)
- [ ] Puzzles are organized into tracks, with numbering scoped per track (not one global flat list)
- [ ] New start screen exists and routes into puzzle experience; foundation exists for random/guided/tutorial track modes
- [ ] Core UI polish pass improves tap-target sizing, completion banner readability, and related interaction rough edges

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
- Puzzle format needs to encode: board shape, piece positions, piece colors/types, goal type, goal parameters (target pieces or goal squares)
- The example puzzle uses a text-grid notation (e.g. `p`=white pawn, `P`=black pawn, `n`=knight, `-`=empty, `x`=impassable) — worth formalizing as the puzzle definition format
- Launch scope now includes structural navigation changes (tracks/start screen) to support later game modes without rewiring core gameplay
- Puzzle rich text is curated author content, but rendering must sanitize or strictly constrain allowed HTML tags/attributes

## Constraints

- **Tech stack**: Vanilla JS or lightweight framework — no backend, runs entirely in browser
- **Storage**: Local storage only — no accounts, no sync
- **Offline**: Must work offline after first load (PWA service worker)
- **Compatibility**: Modern mobile browsers (iOS Safari, Chrome Android) + desktop

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Client-side only, no backend | Simplicity, no hosting costs, privacy — puzzles are static content | — Pending |
| Sequential unlock (not open) | Original v1.0 progression plan; now under milestone reconsideration as tracks are introduced | ⚠️ Revisit |
| No hints system | Keeps the puzzle honest; undo/reset is the safety net | — Pending |
| Pawns don't promote | Avoids complexity on non-standard boards where promotion zones are ambiguous | — Pending |

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
*Last updated: 2026-04-18 after Phase 09 completion*

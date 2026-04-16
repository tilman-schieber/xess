# Xess

## What This Is

Xess is a client-side chess-based puzzle game that runs in the browser and installs as a PWA. Pieces move exactly like chess, but the boards are non-standard — variable sizes, non-rectangular grids, impassable squares — and all squares are uniform (no alternating colors). Players solve curated puzzles by capturing target pieces or moving pieces onto goal squares.

## Core Value

A chess puzzle game where the twist is the board, not the rules — players who know chess can immediately play, but the strange board geometries create fresh, surprising challenges.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Puzzle engine supports standard chess movement for all 6 piece types (King, Queen, Rook, Bishop, Knight, Pawn) with multiple instances of any type allowed
- [ ] Board can be any shape: variable dimensions, non-rectangular grids, impassable squares (knights can jump over them)
- [ ] All squares are uniform (no alternating dark/light); goal squares are visually distinct (e.g. green)
- [ ] Two goal types: "capture all target pieces" and "move pieces onto goal squares"
- [ ] 25–50 curated puzzles at launch, unlocked sequentially
- [ ] Undo move and reset puzzle (no hints)
- [ ] Progress persisted in local storage (solved puzzles, current puzzle state)
- [ ] Installable as a PWA, mobile-ready responsive layout
- [ ] Elegant, premium visual style

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

## Constraints

- **Tech stack**: Vanilla JS or lightweight framework — no backend, runs entirely in browser
- **Storage**: Local storage only — no accounts, no sync
- **Offline**: Must work offline after first load (PWA service worker)
- **Compatibility**: Modern mobile browsers (iOS Safari, Chrome Android) + desktop

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Client-side only, no backend | Simplicity, no hosting costs, privacy — puzzles are static content | — Pending |
| Sequential unlock (not open) | Creates progression and pacing; prevents players skipping to hard puzzles | — Pending |
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
*Last updated: 2026-04-16 after initialization*

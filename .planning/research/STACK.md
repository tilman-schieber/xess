# Technology Stack (Milestone v1.2)

**Project:** Xess
**Milestone focus:** Puzzle logic tuning and move tracking improvements
**Researched:** 2026-04-19

## Stack Additions Needed

No new runtime libraries are required for this milestone.

| Area | Current choice | v1.2 recommendation | Why |
|------|----------------|---------------------|-----|
| Movement logic | Custom engine in `src/engine` | Keep custom engine | Board geometry rules are project-specific; external chess libs do not fit |
| Move tracking | Existing in-memory + persisted state | Extend existing controller/store contracts | Avoid extra state frameworks and keep current architecture stable |
| Validation/testing | Vitest | Expand engine/controller tests | Logic and replay safety are the core risk for this milestone |
| UI feedback | Existing DOM/CSS | Use existing UI layer for explicit invalid-move and history cues | No dependency needed; small targeted renderer updates are enough |

## What Not To Add

- Do not introduce a global state library only for move history.
- Do not add chess.js or notation libraries for engine behavior.
- Do not move persistence away from localStorage.

## Integration Notes

- Keep move validation in pure engine/controller seams.
- Treat move history as app state metadata, not as a separate subsystem.
- Persist only what is needed to recover active puzzle state and history.

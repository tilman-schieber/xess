# Feature Research (Milestone v1.2)

**Project:** Xess
**Milestone focus:** tune puzzle logic and improve move tracking
**Researched:** 2026-04-19

## Table Stakes For This Milestone

| Category | Feature | Complexity | Notes |
|----------|---------|------------|-------|
| Logic correctness | Legal moves are deterministic across irregular boards | Medium | Must cover rays, jumps, blocked cells, and capture rules |
| Logic correctness | Illegal moves are consistently rejected | Low | Never mutate board state on invalid requests |
| Move tracking | Multi-step undo | Medium | Expected in puzzle games; must remain stable after complex paths |
| Move tracking | Move list visibility in play UI | Medium | Improves trust and player learning |
| Move tracking | Accurate move counter + replay consistency | Medium | Counter and history must stay in sync with undo/redo/reset |
| Persistence | Active puzzle history resumes after reload | Medium | Restore in-progress confidence and prevent player frustration |

## Differentiators

| Feature | Value |
|---------|-------|
| Redo after undo | Enables exploration without losing branches immediately |
| Clear invalid-move feedback | Makes unusual board geometry feel understandable |
| Move history semantics tied to puzzle outcomes | Improves debuggability and future analytics hooks |

## Anti-Features For v1.2

| Anti-feature | Why avoid now |
|--------------|---------------|
| Full PGN/FEN export | Not core to player value; unnecessary complexity |
| Advanced analysis engine | Outside puzzle gameplay scope |
| Cloud move sync | Violates local-only storage constraint |

## Dependencies

- Move history UI depends on stable controller-level history contracts.
- Redo depends on explicit branch invalidation policy after new moves.
- Persistence recovery depends on schema-safe serialization of history metadata.

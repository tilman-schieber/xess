# Milestones

## v1.2 Puzzle Logic Improvement (Shipped: 2026-04-19)

**Phases completed:** 2 phases, 6 plans, 12 tasks

**Key accomplishments:**

- Puzzle parsing now enforces canonical case semantics, removes pawnDirections legacy fields, and emits default control/capture/promotion policy metadata for downstream legality layers.
- Engine legality now treats pawns as fixed-upward movers and applies deterministic, opt-in top-row auto-promotion to queen before win evaluation.
- Controller move handling now enforces puzzle-level controllable and capture permissions before mutation, while proving rejected moves remain fully non-mutating across board, undo, and persistence paths.
- Replay-safe active puzzle tracking and per-puzzle solved move-count metadata now persist through localStorage with fail-soft sanitization and legacy compatibility.
- Controller runtime now emits deterministic canonical move events and keeps board history, undo/redo, and move counters synchronized across commit, divergence, and reload paths.
- Gameplay UI now shows synchronized move counts with undo/redo controls while keeping chronological move-history list rendering intentionally deferred.

---

## v1.1 UX Launch Polish (Shipped: 2026-04-19)

**Phases completed:** 4 phases, 10 plans, 22 tasks

**Known deferred items at close:** 1 (see `STATE.md` Deferred Items)

**Key accomplishments:**

- Static track metadata plus pure track-aware navigation helpers now provide deterministic grouping, within-track numbering, and launch/resume selection without storage or DOM coupling.
- A pure start screen plus a dual-mode track browser renderer now deliver grouped track navigation UI with token-aligned styling and automated interaction coverage.
- The runtime now boots on a dedicated start screen, routes through track browsing before play, and preserves selected track context for back navigation from active puzzle play.
- Static track metadata now supports optional random/guided/tutorial mode entries while launch/list helpers consume validator-sanitized puzzle IDs to keep malformed references non-fatal.
- Persisted solved and active progress now survive updates through catalogue-ID filtering that strips stale entries without wiping valid player data or blocking startup.
- DOMPurify-backed allowlist sanitization and loader-level optional description normalization now provide a safe, reusable rich-text foundation for puzzle metadata.
- In-play puzzle metadata now shows sanitizer-filtered authored rich descriptions near the objective with compact styling and regression-guarded XSS safety.
- Launch-critical start, track, and play controls now enforce tokenized 44px minimum touch targets with regression assertions that catch selector-level coverage drift.
- Solved messaging now renders through explicit state wrappers, and play-flow pointer seams are hardened to prevent drag/tap double triggers while preserving keyboard activation for primary controls.
- Sound feedback is now contract-tested and hardened to keep move/solve cues deterministic after explicit opt-in while remaining fail-silent across storage and Web Audio failures.

---

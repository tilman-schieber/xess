---
phase: quick-260420-n4p
plan: 01
subsystem: css
tags: [css, visual, phase-13, bug-fix]
dependency_graph:
  requires: []
  provides: [flip-clip-fix, crimson-opponent-filter, glass-token-surfaces]
  affects: [src/styles/board.css, src/styles/start-screen.css, src/styles/track-browser.css]
tech_stack:
  added: []
  patterns: [glass-token-application, sepia-first-filter-chain]
key_files:
  modified:
    - src/styles/board.css
    - src/styles/start-screen.css
    - src/styles/track-browser.css
decisions:
  - "sepia-first filter chain (sepia(1) saturate(4) hue-rotate(320deg) brightness(0.75)) injects hue into achromatic Cburnett SVGs before rotating to crimson"
  - "overflow: hidden removed from .cell — FLIP animation translate path was clipped at cell boundary; isolation: isolate retained for stacking context"
  - "Shared border removed from combined primary+secondary selector; each button rule now owns its border declaration independently"
metrics:
  duration: 5min
  completed: "2026-04-20T14:43:31Z"
  tasks: 2
  files_modified: 3
---

# Quick Task 260420-n4p: Fix Phase 13 FLIP Clip Bug and Red Recoloring Summary

**One-liner:** Removed overflow:hidden FLIP clip from .cell, applied sepia-first crimson filter for black SVG pieces, and propagated Phase 13 glass tokens to start screen and track browser surfaces.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix FLIP clip bug and red recoloring in board.css | 26ff868 | src/styles/board.css |
| 2 | Apply glass tokens to start-screen.css and track-browser.css | f01f894 | src/styles/start-screen.css, src/styles/track-browser.css |

## What Was Done

**Task 1 — board.css**

- Removed `overflow: hidden` from `.cell` — the FLIP animation sets `transform: translate(dx, dy)` on a piece to position it at the source square, then transitions to zero. With overflow clipping the piece was invisible outside its destination cell during the entire translate phase.
- Replaced the ineffective `hue-rotate(-26deg) saturate(180%) brightness(0.82) contrast(1.16)` filter with `sepia(1) saturate(4) hue-rotate(320deg) brightness(0.75)`. The Cburnett SVGs are pure achromatic (black/white), so hue-rotate alone has no effect. The sepia step injects brown hue, saturate(4) amplifies it, hue-rotate(320deg) rotates brown to crimson, brightness(0.75) deepens the result. Applied only to the reach-all-goal-squares opponent selector.

**Task 2 — start-screen.css and track-browser.css**

- `.start-screen-panel` and `.track-card`: replaced `surface-card` background and `border-subtle` border with `glass-meta-bg`, `glass-border-soft/strong`, `glass-shadow-soft`, and `glass-blur` backdrop filter — matching the gameplay chrome established in Phase 13.
- `.start-screen-secondary`, `.track-browser-back`, `.track-action-resume`: replaced `transparent` background and `border-subtle` with `glass-chip-bg`, `glass-border-soft`, and `glass-highlight` inset shadow.
- `.track-puzzle-item`: replaced `surface-card`/`border-subtle` with `glass-chip-bg`/`glass-border-soft`.
- Primary/accent buttons (`.start-screen-primary`, `.track-action-open`) left entirely unchanged.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `grep overflow: hidden src/styles/board.css` — no match in .cell rule
- `grep sepia src/styles/board.css` — hits reach-mode filter line
- `grep glass-meta-bg src/styles/start-screen.css src/styles/track-browser.css` — hits in both files
- `grep surface-card src/styles/start-screen.css src/styles/track-browser.css` — no hits
- `grep isolation: isolate src/styles/board.css` — still present in .cell
- Full test suite: 234/234 passed (19 test files)

## Self-Check: PASSED

- src/styles/board.css modified and committed at 26ff868
- src/styles/start-screen.css modified and committed at f01f894
- src/styles/track-browser.css modified and committed at f01f894
- All 234 tests pass with no regressions

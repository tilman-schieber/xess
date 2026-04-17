---
phase: 06-drag-and-drop-interaction-and-square-cell-layout
plan: 02
subsystem: ui/interaction
tags: [drag-and-drop, pointer-events, touch, interaction]
dependency_graph:
  requires: [06-01]
  provides: [drag-and-drop piece movement]
  affects: [src/main.js, src/ui/dragDrop.js, src/styles/board.css]
tech_stack:
  added: []
  patterns: [Pointer Events API, pointer capture, ghost element, tap/drag coexistence]
key_files:
  created:
    - src/ui/dragDrop.js
  modified:
    - src/styles/board.css
    - src/main.js
decisions:
  - Used two-listener design (pointerdown resets flag, pointerup fires tap logic) to prevent double-fire of game logic during drag
  - Ghost is appended to document.body to escape board overflow clipping
  - DRAG_THRESHOLD=8px distinguishes tap from drag cleanly on both mouse and touch
metrics:
  duration: ~15min
  completed: 2026-04-17
  tasks_completed: 2
  files_changed: 3
---

# Phase 06 Plan 02: Pointer Drag-and-Drop Piece Movement Summary

**One-liner:** Pointer Events drag-and-drop with floating ghost, 8px threshold, and tap/drag coexistence via two-listener tap-on-pointerup design.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Create src/ui/dragDrop.js | e3923a0 | src/ui/dragDrop.js |
| 2 | Wire CSS + main.js | e3923a0 | src/styles/board.css, src/main.js |

## What Was Built

### src/ui/dragDrop.js
New module exporting `initDragDrop(boardEl, { onDragStart, onDrop, onCancel })`. Implements:
- 8px DRAG_THRESHOLD — below threshold = tap (module does nothing), above = drag takes over
- `boardEl.setPointerCapture()` called when threshold exceeded to receive all subsequent pointer events
- Ghost element cloned from piece SVG, appended to `document.body` (fixed position, z-index 9999)
- `document.elementFromPoint()` with ghost temporarily hidden to hit-test the target cell on pointerup
- `cleanupDrag()` removes ghost and `cell--dragging` class; cleanup function tears down all listeners

### src/styles/board.css
Added `.cell--dragging { opacity: 0.35 }` and `.drag-ghost` rules (fixed position, scale(1.1), box-shadow, piece sizing at 72%).

### src/main.js
- Import `initDragDrop` added
- `_dragCleanup` and `_isDragging` variables added to `mountGameUi`
- `renderGameScreen` tears down previous drag handler then calls `initDragDrop` with three callbacks:
  - `onDragStart` → sets `_isDragging=true`, calls `ui.tapCell(fromKey)` to select piece
  - `onDrop` → calls `ui.tapCell(toKey)` to execute move, plays sound, rerenders
  - `onCancel` → deselects if still selected, rerenders
- Root `pointerdown` listener replaced with two-listener design: pointerdown only resets `_isDragging`; pointerup fires tap logic only when `_isDragging === false`

## Decisions Made

1. **Two-listener tap design**: Moving tap from `pointerdown` to `pointerup` (gated by `_isDragging`) is the cleanest way to prevent double-fire. The slight latency difference is imperceptible for a select-then-move interaction.
2. **onDragStart calls tapCell**: Since drag sets `_isDragging=true` before `pointerup` fires, the tap path is skipped. `onDragStart` calls `tapCell(fromKey)` to select the piece and show legal moves.
3. **Ghost on document.body**: The board element uses `overflow: hidden` for its grid layout; appending the ghost to body ensures it's visible while dragging near board edges.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npm test -- --run`: 167 tests pass (13 files)
- `npm run build`: succeeds, 45.51 kB JS bundle

## Self-Check: PASSED

- `src/ui/dragDrop.js` exists ✓
- `src/styles/board.css` contains `.cell--dragging` and `.drag-ghost` ✓
- `src/main.js` imports `initDragDrop` and wires `_isDragging` ✓
- Commit `e3923a0` exists ✓

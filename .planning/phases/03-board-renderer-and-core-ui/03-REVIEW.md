---
phase: 03-board-renderer-and-core-ui
reviewed: 2026-04-17T12:27:50Z
depth: standard
files_reviewed: 22
files_reviewed_list:
  - src/ui/boardRenderer.js
  - src/ui/pieces.js
  - src/ui/interactionFeedback.js
  - src/main.js
  - src/styles/app.css
  - src/styles/board.css
  - src/ui/boardRenderer.test.js
  - src/ui/pieces.test.js
  - src/main.ui.test.js
  - src/main.gap-ux.test.js
  - src/ui/piece-assets/white-k.svg
  - src/ui/piece-assets/white-q.svg
  - src/ui/piece-assets/white-r.svg
  - src/ui/piece-assets/white-b.svg
  - src/ui/piece-assets/white-n.svg
  - src/ui/piece-assets/white-p.svg
  - src/ui/piece-assets/black-k.svg
  - src/ui/piece-assets/black-q.svg
  - src/ui/piece-assets/black-r.svg
  - src/ui/piece-assets/black-b.svg
  - src/ui/piece-assets/black-n.svg
  - src/ui/piece-assets/black-p.svg
findings:
  critical: 0
  warning: 2
  info: 0
  total: 2
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-17T12:27:50Z
**Depth:** standard
**Files Reviewed:** 22
**Status:** issues_found

## Summary

Reviewed all phase 03 renderer/UI files plus gap-closure work (03-04, 03-05), including JS/CSS source, tests, and piece SVG assets. Overall implementation quality is solid and test coverage is strong, but two warnings remain: one crash path on malformed persisted board cells and one DOM XSS sink pattern (`innerHTML`) that should be hardened even with a static SVG allow-list.

## Warnings

### WR-01: Renderer can crash on malformed persisted board cell values

**File:** `src/ui/boardRenderer.js:47-57`
**Issue:** `createBoardRenderModel` trusts that `board.get(key)` always returns a valid cell object. If persisted `boardEntries` are tampered/corrupted (e.g., `null`/`undefined` value for an existing key), accesses like `cell.isGoal` and `cell.piece` throw and crash rendering.
**Fix:** Guard and normalize cell values before dereferencing.

```js
const cell = board.get(key)
if (!cell || typeof cell !== 'object') {
  cells.push({
    key,
    col,
    row,
    isVoid: false,
    isPlayable: true,
    isGoal: false,
    piece: null,
    classes: ['cell', 'cell--playable'],
  })
  continue
}
```

### WR-02: `innerHTML` used as markup injection sink for SVG payload

**File:** `src/main.js:198`
**Issue:** `pieceEl.innerHTML = cell.piece.svg` uses a known HTML injection sink. Current inputs are constrained to local static assets, which reduces risk, but this is still a fragile security boundary and can become exploitable if assets change or are replaced in future.
**Fix:** Parse/append sanitized SVG nodes (or render via image URLs) instead of assigning raw markup.

```js
const doc = new DOMParser().parseFromString(cell.piece.svg, 'image/svg+xml')
const svgEl = doc.documentElement
svgEl.querySelectorAll('script, foreignObject').forEach(n => n.remove())
pieceEl.append(svgEl)
```

---

_Reviewed: 2026-04-17T12:27:50Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_

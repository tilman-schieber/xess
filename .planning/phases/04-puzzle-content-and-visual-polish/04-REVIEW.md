---
phase: 04-puzzle-content-and-visual-polish
reviewed: 2026-04-17T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/puzzles/catalogue.js
  - src/styles/app.css
  - src/styles/board.css
  - src/styles/puzzle-list.css
  - src/ui/puzzleList.js
  - src/puzzles/nav.js
  - src/main.js
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-04-17
**Depth:** standard
**Files Reviewed:** 7
**Status:** ISSUES_FOUND

## Summary

Phase 4 introduces 40 curated puzzles, a CSS design token system, and the puzzle list overlay with navigation helpers. The code is generally well-structured and readable. No security vulnerabilities or data loss risks were found — the SVG sanitisation in `main.js` is a good defensive practice. Four warnings require attention: one is a silent logic bug (goal badge always shows wrong data), one is a fragile string-parse for the end-of-catalogue message, and two are accessibility gaps that affect keyboard-only and screen-reader users. Three info-level items are noted below.

---

## Warnings

### WR-01: Goal badge always renders as "unknown" — `model.puzzle` is undefined

**File:** `src/main.js:198, 328`
**Issue:** `renderToDom` calls `getGoalBadgeData(model.puzzle)` on line 198, but `model.puzzle` is never defined in the render model. In `renderGameScreen` (line 328) the extModel is assembled as:
```js
puzzle: ui.getState().board ? model.puzzle : null,
```
`model` here is the return value of `buildInteractionRenderModel`, which spreads `baseModel` from `createBoardRenderModel`. That function (in `boardRenderer.js`) returns only `{ width, height, cells }` — no `puzzle` field. So `model.puzzle` is always `undefined`, `extModel.puzzle` is always `undefined`, and `getGoalBadgeData(undefined)` always returns `{ label: 'Solve the puzzle objective.', type: 'unknown' }` — the badge is permanently broken regardless of the actual goal type.

**Fix:** Pass `puzzle` explicitly through the render model by adding it in `buildInteractionRenderModel`:
```js
return {
  ...baseModel,
  puzzle,           // ← add this line
  puzzleTitle: puzzle?.title ?? 'Untitled puzzle',
  ...
}
```
Or read it directly from `state` in `renderGameScreen`:
```js
puzzle: state.puzzle,  // instead of model.puzzle
```
The `state` object in `createGameUiController` already holds `state.puzzle`; it can be exposed via `getState()` or passed directly in `renderGameScreen`.

---

### WR-02: Fragile string parsing to extract total puzzle count

**File:** `src/main.js:258`
**Issue:** The end-of-catalogue win message extracts the total number of puzzles by parsing the formatted position string returned by `getPuzzlePosition`:
```js
const total = model.puzzleId
  ? (getPuzzlePosition(model.puzzleId) ?? '').split('/')[1]?.trim()
  : null
```
`getPuzzlePosition` returns `"N / M"` — a human-readable string, not an API. If the format is ever changed (different spacing, an em-dash, localisation) this silently falls back to the generic `'All puzzles solved! 🎉'` message without the count.

**Fix:** Import and call `catalogue.length` directly, or export a `getCatalogueLength()` helper from `nav.js`:
```js
// in nav.js
export function getCatalogueLength(catalogue = _catalogue) {
  return catalogue.length
}

// in main.js
import { getCatalogueLength } from './puzzles/nav.js'
// ...
const total = getCatalogueLength()
endSpan.textContent = `All ${total} puzzles solved! 🎉`
```

---

### WR-03: Puzzle list items are inaccessible to keyboard users

**File:** `src/ui/puzzleList.js:42-80`
**Issue:** Each puzzle in the list is an `<li>` element with a `pointerdown` event listener. `<li>` elements are not focusable and do not receive keyboard events by default. Keyboard-only users navigating with Tab/Enter cannot select puzzles. The `is-locked` guard is also only applied via CSS `pointer-events: none` and conditional event attachment — a keyboard user who somehow focuses a locked item would have no barrier.

**Fix:** Either use `<button>` elements inside each `<li>` (preferred — semantic, focusable by default), or add `role="button"` and `tabindex="0"` to each interactive `<li>` and handle `keydown` for Enter/Space:
```js
// Option A: button inside li (recommended)
const btn = document.createElement('button')
btn.type = 'button'
btn.className = 'puzzle-list-item-btn'
if (item.status === 'locked') btn.disabled = true
btn.addEventListener('pointerdown', () => onSelect(item.id))
li.append(btn)

// Option B: add to existing li
if (item.status !== 'locked') {
  li.setAttribute('role', 'button')
  li.setAttribute('tabindex', '0')
  li.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(item.id)
    }
  })
}
```

---

### WR-04: Screen reader double-announces puzzle status icons

**File:** `src/ui/puzzleList.js:60-72`
**Issue:** The status span is built as:
```js
statusSpan.textContent = '✓'     // visible to SR: "check mark"
const srLabel = document.createElement('span')
srLabel.className = 'sr-only'
srLabel.textContent = 'Solved'   // SR also reads this
statusSpan.append(srLabel)
```
The visible Unicode character `✓` is not hidden from assistive technology, so screen readers will announce both — e.g., "check mark Solved" or "🔒 Locked". The sr-only span is redundant with the symbol and creates a confusing double announcement.

**Fix:** Hide the symbol from AT using `aria-hidden`, relying solely on the sr-only label:
```js
statusSpan.setAttribute('aria-hidden', 'true')  // hide symbol from SR
// or: statusSpan.textContent = ''  then use only srLabel

// Better: set aria-label on the whole statusSpan
statusSpan.setAttribute('aria-label', item.status === 'solved' ? 'Solved' : 'Locked')
statusSpan.textContent = item.status === 'solved' ? '✓' : '🔒'
// no srLabel needed
```

---

## Info

### IN-01: `DOMParser` instantiated inside a hot render loop

**File:** `src/main.js:283`
**Issue:** `new DOMParser()` is called once per cell on every `rerender()` call. For a 5×5 board this means up to 25 DOMParser constructions per frame. The object is lightweight, but constructing it repeatedly in a tight loop is unnecessary.

**Fix:** Hoist a single DOMParser instance to module scope:
```js
// top of main.js, outside any function
const _domParser = new DOMParser()

// inside the forEach
const svgDoc = _domParser.parseFromString(cell.piece.svg, 'image/svg+xml')
```

---

### IN-02: `.sr-only` utility defined in a component stylesheet

**File:** `src/styles/puzzle-list.css:94-100`
**Issue:** `.sr-only` is a global accessibility utility class defined inside a component-scoped stylesheet. If other components need it in future they must either duplicate it or import this stylesheet as a dependency, which is semantically odd.

**Fix:** Move `.sr-only` to `app.css` alongside other global resets, or create a `utilities.css` imported by `app.css`.

---

### IN-03: `isUnlocked` performs O(n) set lookup after O(n) array build

**File:** `src/puzzles/nav.js:33-35`
**Issue:** `isUnlocked` calls `getUnlockedIds(...)` which builds an array, then calls `.includes()` on it — two O(n) passes. This is fine for 40 puzzles but the intent is a boolean membership test.

**Fix:** Return early from `getUnlockedIds` as a Set, or check directly:
```js
export function isUnlocked(puzzleId, solvedIds, catalogue = _catalogue) {
  const unlocked = new Set(getUnlockedIds(solvedIds, catalogue))
  return unlocked.has(puzzleId)
}
```

---

## Verdict: ISSUES_FOUND

| Severity | Count |
|----------|-------|
| CRITICAL | 0     |
| WARNING  | 4     |
| INFO     | 3     |
| **Total**| **7** |

The most important fix is **WR-01** (goal badge is permanently broken). **WR-03** and **WR-04** should be addressed before the puzzle list is considered accessible. **WR-02** is low risk but worth addressing as a code quality improvement. Info items can be deferred.

---

_Reviewed: 2026-04-17_
_Reviewer: gsd-code-reviewer (claude-sonnet-4.6)_
_Depth: standard_

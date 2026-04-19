# Phase 7 Pattern Map

## Existing Analogs

### 1) Pure navigation helpers
- **Source:** `src/puzzles/nav.js`
- **Pattern:** stateless functions, optional catalogue injection for tests
- **Reuse in Phase 7:** implement track helpers with same signature style and no side effects

### 2) Runtime orchestrator in main
- **Source:** `src/main.js`
- **Pattern:** top-level mount function, internal render-state closures, delegated pointer handlers
- **Reuse in Phase 7:** extend to multi-screen state machine (`start`, `track-browser`, `play`) without introducing framework/state library

### 3) Pure UI renderers
- **Source:** `src/ui/puzzleList.js`
- **Pattern:** input data + callbacks in, DOM subtree out, no global side effects
- **Reuse in Phase 7:** implement `startScreen` and `trackBrowser` in same style

### 4) CSS tokenized hierarchy
- **Source:** `src/styles/app.css`, `src/styles/puzzle-list.css`
- **Pattern:** spacing/typography/custom properties central in app.css; screen-specific overrides in separate css file
- **Reuse in Phase 7:** `start-screen.css` and `track-browser.css` use shared tokens (no hardcoded random scales)

## Contract Excerpts

From `src/puzzles/nav.js`:

```js
export function getUnlockedIds(solvedIds, catalogue = _catalogue)
export function isUnlocked(puzzleId, solvedIds, catalogue = _catalogue)
export function getPuzzlePosition(puzzleId, catalogue = _catalogue)
export function getPuzzleList(solvedIds, catalogue = _catalogue)
export function getPrevId(puzzleId, catalogue = _catalogue)
export function getNextId(puzzleId, catalogue = _catalogue)
```

From `src/ui/puzzleList.js`:

```js
export function renderPuzzleList({ list, currentId, onSelect, onClose })
```

From `src/main.js`:

```js
export function mountGameUi(root = document.querySelector('#app'))
```

## Phase 7 Conventions to Keep

1. `pointerdown` for tap-first interactions
2. no `innerHTML` with untrusted strings; use `textContent`
3. testability via pure helper/render modules before integration wiring
4. keep navigation/persistence logic out of UI renderers

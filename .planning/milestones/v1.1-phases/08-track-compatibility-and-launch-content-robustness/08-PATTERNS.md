# Phase 08 Pattern Map

## Target Files and Closest Analogs

| Target | Role | Closest Analog | Pattern to Reuse |
|--------|------|----------------|------------------|
| `src/puzzles/nav.js` | Pure content/navigation helper | `src/puzzles/nav.js` (existing track helpers) | Safe returns (`[]`/`null`) for unknown IDs; no localStorage/DOM |
| `src/store/store.js` | Persistence sanitization | `src/store/store.js` (`_sanitizeStore`, `_sanitizeActiveState`) | Type guards + dedupe + fail-safe defaults |
| `src/controller.js` | Rehydration and launch compatibility | `src/controller.js` `loadPuzzle` rehydration try/catch | Keep runtime resilient: fallback to parsed puzzle on malformed persisted snapshots |
| `src/puzzles/tracks.js` | Static metadata contract | `src/puzzles/tracks.js` current shape | Plain object arrays, static IDs, no dynamic fetch |
| `src/*/*.test.js` | Contract tests | `src/puzzles/nav.test.js`, `src/store/store.test.js`, `src/controller.test.js` | Branch-complete deterministic assertions with injected/mock data |

## Concrete Excerpts to Mirror

### Safe fallback pattern (`nav.js`)

```js
const track = tracks.find(entry => entry.id === trackId)
if (!track) return []
```

```js
if (!track || track.puzzleIds.length === 0) return null
```

### Sanitization pattern (`store.js`)

```js
const solvedIds = Array.isArray(parsed?.solvedIds)
  ? [...new Set(parsed.solvedIds.filter(id => typeof id === 'string'))]
  : []
```

```js
if (!activeState || typeof activeState !== 'object') return null
const puzzleId = typeof activeState.puzzleId === 'string' ? activeState.puzzleId : null
if (!puzzleId) return null
```

### Rehydration resilience (`controller.js`)

```js
if (store.activeState && store.activeState.puzzleId === puzzleId) {
  try {
    board = new Map(store.activeState.boardEntries)
    undoStack = store.activeState.undoEntries.map(entries => new Map(entries))
  } catch {
    board = parsed.board
    undoStack = []
  }
}
```

## Phase-Specific Pattern Guidance

1. Keep all content integrity checks in pure helper functions; controller/store should consume sanitized outputs, not parse raw structures repeatedly.
2. Preserve existing exports and contracts in `nav.js`/`store.js`/`controller.js`; extend behavior in backward-compatible fashion.
3. For warnings, prefer deterministic `console.warn` messages with stable prefixes (no thrown errors in user path).
4. Do not introduce any network I/O or async fetch path for catalogue/tracks.

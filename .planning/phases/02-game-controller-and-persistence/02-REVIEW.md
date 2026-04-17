---
phase: 02-game-controller-and-persistence
reviewed: 2026-04-17T08:12:59Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/store/store.js
  - src/puzzles/nav.js
  - src/controller.js
  - src/store/store.test.js
  - src/puzzles/nav.test.js
  - src/controller.test.js
findings:
  critical: 0
  warning: 2
  info: 0
  total: 2
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-17T08:12:59Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed controller, persistence, puzzle navigation, and the corresponding tests for plans 02-01 through 02-03. The overall structure is solid and tests cover key behavior, but there are two robustness issues in production code that can lead to runtime failures or corrupted state when storage is malformed or when controller methods are called out of expected order.

## Warnings

### WR-01: `reset()` can throw before any puzzle is loaded

**File:** `src/controller.js:157`
**Issue:** `reset()` dereferences `state.puzzle.id` without checking whether a puzzle has been loaded. If a caller invokes `reset()` before `loadPuzzle()`, this throws (`Cannot read properties of null`).
**Fix:** Add a guard consistent with `makeMove()`/`selectPiece()` behavior.

```js
reset() {
  if (!state.puzzle) return { error: 'no_puzzle' }
  const fresh = parsePuzzle(_rawEntry(state.puzzle.id))
  state.board = fresh.board
  state.undoStack = []
  state.won = false
  clearActiveState()
  return { board: state.board }
}
```

### WR-02: `loadStore()` trusts parsed storage shape without validation

**File:** `src/store/store.js:37`
**Issue:** After JSON parse and schema check, `loadStore()` returns `parsed` as-is. `localStorage` is user-modifiable; malformed but schema-matching data (e.g., non-array `solvedIds`, missing/invalid `activeState` fields) can propagate and later cause crashes or incorrect behavior.
**Fix:** Sanitize parsed data before returning. Validate types and fall back to safe defaults for invalid fields.

```js
function _sanitizeStore(parsed) {
  const solvedIds = Array.isArray(parsed?.solvedIds)
    ? parsed.solvedIds.filter(id => typeof id === 'string')
    : []

  const activeState = parsed?.activeState && typeof parsed.activeState === 'object'
    ? parsed.activeState
    : null

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    solvedIds,
    activeState,
  }
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return _defaultStore()
    const parsed = JSON.parse(raw)
    if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) return _defaultStore()
    return _sanitizeStore(parsed)
  } catch {
    return _defaultStore()
  }
}
```

---

_Reviewed: 2026-04-17T08:12:59Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_

---
phase: 01-puzzle-format-and-engine
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 29
files_reviewed_list:
  - .gitignore
  - index.html
  - package.json
  - src/engine/apply.js
  - src/engine/apply.test.js
  - src/engine/index.js
  - src/engine/index.test.js
  - src/engine/moves/bishop.js
  - src/engine/moves/bishop.test.js
  - src/engine/moves/index.js
  - src/engine/moves/index.test.js
  - src/engine/moves/king.js
  - src/engine/moves/king.test.js
  - src/engine/moves/knight.js
  - src/engine/moves/knight.test.js
  - src/engine/moves/pawn.js
  - src/engine/moves/pawn.test.js
  - src/engine/moves/queen.js
  - src/engine/moves/queen.test.js
  - src/engine/moves/rook.js
  - src/engine/moves/rook.test.js
  - src/engine/win.js
  - src/engine/win.test.js
  - src/main.js
  - src/puzzles/catalogue.js
  - src/puzzles/catalogue.test.js
  - src/puzzles/loader.js
  - src/puzzles/loader.test.js
  - vite.config.js
  - vitest.config.js
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 29
**Status:** issues_found

## Summary

The engine core is well-structured: piece movement generators are cleanly separated, immutable board updates via `structuredClone` are correct, and the win-condition logic is readable. Test coverage is thorough across all piece types and both goal modes.

Three warnings stand out. The most impactful is a crash path in `applyMove` when `to` is not in the board map — the function assumes valid input but produces an unguarded `TypeError`. The second is a `Math.max()` with no arguments in `parsePuzzle` that returns `-Infinity` for all-non-string grids. Third, the `reach-all-goal-squares` win condition returns `true` immediately on any board with zero goal squares, which is a silent auto-win if a puzzle is misconfigured.

The info-level items are: a meaningless test assertion in `loader.test.js`, a missing `vite-plugin-pwa` dependency relative to the stated tech stack, and a placeholder favicon reference in `index.html`.

## Warnings

### WR-01: `applyMove` crashes with `TypeError` when `to` key is not in the board

**File:** `src/engine/apply.js:29`
**Issue:** `newBoard.get(to)` returns `undefined` when `to` is not a key in the board map. The immediately following `toCell.piece` access throws `TypeError: Cannot read properties of undefined (reading 'piece')`. The doc comment says callers must validate `to` is legal before calling, but there is no defensive guard. A single call with a stale or incorrectly computed key crashes the engine silently at runtime.
**Fix:**
```js
function applyMove(board, from, to, puzzle) {
  const newBoard = structuredClone(board)
  const fromCell = newBoard.get(from)
  const toCell = newBoard.get(to)
  if (!fromCell || !toCell) {
    throw new Error(`applyMove: invalid key — from="${from}" to="${to}"`)
  }
  const captured = toCell.piece ?? null
  newBoard.set(to, { ...toCell, piece: fromCell.piece })
  newBoard.set(from, { ...fromCell, piece: null })
  return { board: newBoard, captured, won: checkWin(newBoard, puzzle) }
}
```
A thrown error surfaces the problem immediately rather than producing a confusing downstream crash.

---

### WR-02: `parsePuzzle` computes `-Infinity` width when no rows are valid strings

**File:** `src/puzzles/loader.js:53`
**Issue:** `Math.max(...[])` returns `-Infinity` when the spread array is empty. If `raw.grid` is entirely composed of non-string values (the guard on line 25 skips them), the filtered map produces an empty array and `width` becomes `-Infinity`. This propagates silently into any code that uses `puzzle.width`.
**Fix:**
```js
const stringRows = rows.filter(r => typeof r === 'string')
return {
  // ...
  width: stringRows.length > 0 ? Math.max(...stringRows.map(r => r.length)) : 0,
  height: rows.length,
}
```

---

### WR-03: `reach-all-goal-squares` win condition returns `true` immediately for boards with no goal squares

**File:** `src/engine/win.js:20-28`
**Issue:** The for-loop never executes when no cell has `isGoal: true`, so the function falls through and returns `true`. This is documented in a code comment ("A3: zero goal squares = vacuously true") and covered by a test, but it means any `reach-all-goal-squares` puzzle where all `G` characters were accidentally omitted auto-wins on the first move. There is no validation in `parsePuzzle` or `catalogue` that enforces at least one goal square for this goal type.
**Fix:** Add a guard in `parsePuzzle` or in a separate puzzle validation function:
```js
// in parsePuzzle, after building the board:
if (raw.goalType === 'reach-all-goal-squares') {
  const goalCount = [...board.values()].filter(c => c.isGoal).length
  if (goalCount === 0) throw new Error(`Puzzle "${raw.id}": reach-all-goal-squares requires at least one G square`)
}
```
Alternatively, add this check to `catalogue.test.js` so misconfigured puzzles are caught at test time without changing the runtime semantics.

---

## Info

### IN-01: Meaningless test assertion in `loader.test.js`

**File:** `src/puzzles/loader.test.js:152`
**Issue:** The assertion `expect(puzzle => puzzle).toBeDefined()` tests a function literal — not any puzzle value — and always passes regardless of what `parsePuzzle` returns. This was likely intended to assert that the returned puzzle is defined, but it does not do so.
**Fix:**
```js
it('guards against rows that are not strings (T-01-03 mitigation)', () => {
  const raw = { /* ... */ grid: ['-', null, '-'] }
  let result
  expect(() => { result = parsePuzzle(raw) }).not.toThrow()
  expect(result).toBeDefined()
  expect(result.board.has('0,0')).toBe(true)
  expect(result.board.has('0,2')).toBe(true)
})
```

---

### IN-02: `vite-plugin-pwa` not listed in `package.json` devDependencies

**File:** `package.json:12-15`
**Issue:** The project's tech stack (documented in `CLAUDE.md`) specifies `vite-plugin-pwa` as a required dependency for PWA / service-worker support, but it is absent from `devDependencies`. This is expected for Phase 1 (the engine phase), but should be tracked so it is not overlooked when PWA setup begins.
**Fix:** Add when beginning PWA work:
```json
"devDependencies": {
  "vite": "^8.0.8",
  "vite-plugin-pwa": "^0.21.x",
  "vitest": "^4.1.4"
}
```
No action required in Phase 1 — log as a Phase 2/3 prerequisite.

---

### IN-03: Placeholder favicon reference in `index.html`

**File:** `index.html:5`
**Issue:** `<link rel="icon" href="/vite.svg" />` references the default Vite scaffold favicon. This will 404 after any asset cleanup and is not part of Xess branding.
**Fix:** Replace with a project icon or remove the line until one is available:
```html
<!-- Replace with actual icon once available -->
<link rel="icon" type="image/svg+xml" href="/icon.svg" />
```

---

_Reviewed: 2026-04-16T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

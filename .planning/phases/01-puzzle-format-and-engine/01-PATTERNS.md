# Phase 1: Puzzle Format and Engine - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 16 (new files — greenfield project)
**Analogs found:** 0 / 16 — no src/ exists yet

## Greenfield Notice

The project contains only `CLAUDE.md` at the root. No `src/` directory, no prior source files, no tests exist. There are no in-codebase analogs to extract. All patterns below are derived from:
- CONTEXT.md locked decisions (D-01 through D-13)
- RESEARCH.md Architecture Patterns (Patterns 1–8) and Code Examples
- CLAUDE.md board representation and module API guidance

These are the founding patterns. Every subsequent phase will inherit from what Phase 1 establishes.

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `vitest.config.js` | config | — | none | no analog |
| `src/puzzles/catalogue.js` | static data | — | none | no analog |
| `src/puzzles/loader.js` | utility / transform | transform | none | no analog |
| `src/engine/index.js` | public API / utility | request-response | none | no analog |
| `src/engine/apply.js` | utility | transform | none | no analog |
| `src/engine/win.js` | utility | request-response | none | no analog |
| `src/engine/moves/pawn.js` | utility | request-response | none | no analog |
| `src/engine/moves/knight.js` | utility | request-response | none | no analog |
| `src/engine/moves/bishop.js` | utility | request-response | none | no analog |
| `src/engine/moves/rook.js` | utility | request-response | none | no analog |
| `src/engine/moves/queen.js` | utility | request-response | none | no analog |
| `src/engine/moves/king.js` | utility | request-response | none | no analog |
| `src/puzzles/loader.test.js` | test | — | none | no analog |
| `src/puzzles/catalogue.test.js` | test | — | none | no analog |
| `src/engine/apply.test.js` | test | — | none | no analog |
| `src/engine/win.test.js` | test | — | none | no analog |
| `src/engine/moves/pawn.test.js` | test | — | none | no analog |
| `src/engine/moves/knight.test.js` | test | — | none | no analog |
| `src/engine/moves/bishop.test.js` | test | — | none | no analog |
| `src/engine/moves/rook.test.js` | test | — | none | no analog |
| `src/engine/moves/queen.test.js` | test | — | none | no analog |
| `src/engine/moves/king.test.js` | test | — | none | no analog |

---

## Pattern Assignments

All patterns below are sourced from RESEARCH.md and are the canonical templates for this phase. Line references point to RESEARCH.md.

---

### `vitest.config.js` (config)

**Source:** RESEARCH.md — Code Examples: "Vitest Setup"

**Pattern:**
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',   // engine is pure logic, no DOM needed
    include: ['src/**/*.test.js'],
    globals: false,        // explicit imports preferred for vanilla JS
  },
})
```

**Key decisions:**
- `environment: 'node'` — no jsdom; engine has zero DOM dependencies (ENG-07)
- `globals: false` — all test functions (`describe`, `it`, `expect`) are imported explicitly
- `include` glob covers both `src/engine/moves/*.test.js` and `src/puzzles/*.test.js`

---

### `src/puzzles/catalogue.js` (static data)

**Source:** RESEARCH.md — Pattern 3: Puzzle Catalogue Format

**Pattern (complete file shape):**
```javascript
// src/puzzles/catalogue.js
// D-01: single file for all puzzles
// D-02: default export is a plain array

export default [
  {
    schemaVersion: 1,               // FMT-05: versioning field
    id: 'xk3m9pq2',                // FMT-04: stable 8-char alphanumeric, hand-assigned
    title: 'Corner Trap',
    goalType: 'capture-all-targets', // FMT-03: 'capture-all-targets' | 'reach-all-goal-squares'
    targetColor: 'black',           // required when goalType === 'capture-all-targets'
    // FMT-01: text grid — each string is one row
    // x=impassable, -=empty, G=goal square
    // lowercase=white piece, uppercase=black piece (D-03, D-04)
    grid: [
      'x-P',
      '-p-',
      'n-x',
    ],
    // FMT-02: per-pawn direction vectors, keyed by "col,row"
    // [dc, dr]: [0,-1]=up, [0,1]=down, [1,0]=right, [-1,0]=left
    pawnDirections: {
      '1,1': [0, -1],
    },
  },
]
```

**Rules for puzzle authors:**
- `id` is hand-assigned once and never changed — it is the localStorage key
- `id` must be unique across the entire catalogue (enforced by `catalogue.test.js`)
- `targetColor` is required when `goalType === 'capture-all-targets'`; omit for `reach-all-goal-squares`
- `pawnDirections` keys use `"col,row"` format matching the board Map key convention (D-10)
- Grid rows need not be the same length — ragged boards are valid (shorter rows simply have fewer cells)

---

### `src/puzzles/loader.js` (utility / transform)

**Source:** RESEARCH.md — Pattern 1 (data model) and Pattern 2 (text-grid parsing)

**Shared constants pattern (copy into loader.js):**
```javascript
// src/puzzles/loader.js

// D-04: FEN-style character set
const PIECE_CHARS = new Set(['p','P','n','N','b','B','r','R','q','Q','k','K'])

// Coordinate helpers — used by engine too; export from a shared util or duplicate
const posKey = (col, row) => `${col},${row}`
const parseKey = (key) => key.split(',').map(Number)
```

**Core parse function pattern:**
```javascript
/**
 * Parse a raw catalogue entry into a runtime Puzzle object.
 * Called at import time — the engine never sees raw strings.
 * @param {Object} raw - Object from catalogue.js
 * @returns {Puzzle}
 */
function parsePuzzle(raw) {
  if (raw.schemaVersion !== 1) throw new Error(`Unknown schema version: ${raw.schemaVersion}`)

  const board = new Map()   // D-10: Map<"col,row", Cell>
  const rows = raw.grid

  rows.forEach((rowStr, row) => {
    [...rowStr].forEach((char, col) => {
      if (char === 'x') return  // D-11: impassable excluded from map entirely
      if (char === '-') {
        board.set(posKey(col, row), { piece: null, isGoal: false })
      } else if (char === 'G') {
        board.set(posKey(col, row), { piece: null, isGoal: true })
      } else if (PIECE_CHARS.has(char)) {
        const color = char === char.toLowerCase() ? 'white' : 'black'  // D-03
        const type = char.toLowerCase()  // D-04
        const piece = { type, color }
        if (type === 'p' && raw.pawnDirections) {
          piece.direction = raw.pawnDirections[posKey(col, row)] ?? [0, -1]
        }
        board.set(posKey(col, row), { piece, isGoal: false })
      }
    })
  })

  return {
    id: raw.id,
    schemaVersion: raw.schemaVersion,
    title: raw.title ?? '',
    goalType: raw.goalType,
    targetColor: raw.targetColor ?? null,
    board,
    width: Math.max(...rows.map(r => r.length)),
    height: rows.length,
  }
}

export { parsePuzzle, posKey, parseKey }
```

**Critical: do not store impassable squares.** `char === 'x'` returns early — no `board.set()` call. Any `!board.has(key)` check in the engine means "cannot enter" for ALL reasons (wall, off-board edge). Never add a separate `isImpassable` cell property.

---

### `src/engine/index.js` (public API)

**Source:** RESEARCH.md — Architecture Diagram and Pattern 7

**Pattern (barrel re-export with optional applyMove wrapper):**
```javascript
// src/engine/index.js
// Public surface for all engine consumers (Phase 2 game controller, tests)

export { getLegalMoves } from './moves/index.js'
export { applyMove } from './apply.js'
export { checkWin } from './win.js'

// posKey/parseKey may also be re-exported if callers need coordinate helpers
export { posKey, parseKey } from '../puzzles/loader.js'
```

Alternatively, if `applyMove` is defined to call `checkWin` internally and return `{ board, won, captured }`, document that contract here in a JSDoc comment so all callers use the same interface.

---

### `src/engine/apply.js` (utility / transform)

**Source:** RESEARCH.md — Pattern 7: applyMove and Snapshot Undo

**Core pattern:**
```javascript
// src/engine/apply.js
import { checkWin } from './win.js'

/**
 * Apply a move. Returns a new independent board (immutable — original untouched).
 * Caller pushes the PREVIOUS board onto the undo stack before assigning the new one.
 *
 * @param {Map} board - current board state
 * @param {string} from - posKey of the moving piece
 * @param {string} to   - posKey of the destination
 * @param {Object} puzzle - puzzle metadata (for win check)
 * @returns {{ board: Map, captured: Piece|null, won: boolean }}
 */
function applyMove(board, from, to, puzzle) {
  const newBoard = structuredClone(board)  // ENG-08: deep clone — Map is cloneable
  const fromCell = newBoard.get(from)
  const toCell = newBoard.get(to)
  const captured = toCell.piece ?? null
  newBoard.set(to, { ...toCell, piece: fromCell.piece })
  newBoard.set(from, { ...fromCell, piece: null })
  return {
    board: newBoard,
    captured,
    won: checkWin(newBoard, puzzle),
  }
}

export { applyMove }
```

**Undo usage pattern (for Phase 2 game controller):**
```javascript
// Caller owns the undo stack — engine does not hold state
const history = []  // array of Map snapshots

// Make a move:
const prev = currentBoard
const { board: next, won, captured } = applyMove(currentBoard, from, to, puzzle)
history.push(prev)
currentBoard = next

// Undo:
if (history.length > 0) {
  currentBoard = history.pop()
}
```

**Do not use** `JSON.stringify/parse` for cloning — it silently converts a Map to `{}`. `structuredClone` is the correct tool.

---

### `src/engine/win.js` (utility / predicate)

**Source:** RESEARCH.md — Pattern 8: Win Condition Detection

**Pattern:**
```javascript
// src/engine/win.js

/**
 * Check if the win condition has been met.
 * Called after every applyMove.
 *
 * @param {Map} board - board state after the move
 * @param {Object} puzzle - { goalType, targetColor }
 * @returns {boolean}
 */
function checkWin(board, puzzle) {
  if (puzzle.goalType === 'capture-all-targets') {
    // D-09: win when NO pieces of targetColor remain
    for (const cell of board.values()) {
      if (cell.piece && cell.piece.color === puzzle.targetColor) return false
    }
    return true
  }

  if (puzzle.goalType === 'reach-all-goal-squares') {
    // Win when every goal square is occupied by any piece
    for (const cell of board.values()) {
      if (cell.isGoal && !cell.piece) return false
    }
    return true
  }

  return false
}

export { checkWin }
```

---

### `src/engine/moves/pawn.js` (utility / move generator)

**Source:** RESEARCH.md — Pattern 6: Pawn Move Generation

**Pattern:**
```javascript
// src/engine/moves/pawn.js
import { posKey } from '../../puzzles/loader.js'

/**
 * Pawn move generation.
 * Direction is per-piece (D-12, ENG-03) — NEVER inferred from color or row.
 * No double-advance, no en passant, no promotion.
 *
 * @param {Map} board
 * @param {number} col
 * @param {number} row
 * @param {Piece} piece - must have piece.direction = [dc, dr]
 * @returns {Array<[number, number]>}
 */
function getPawnMoves(board, col, row, piece) {
  const [dc, dr] = piece.direction
  const moves = []

  // Forward advance — must be an empty square
  const fwdKey = posKey(col + dc, row + dr)
  if (board.has(fwdKey) && !board.get(fwdKey).piece) {
    moves.push([col + dc, row + dr])
  }

  // Diagonal captures — rotate direction 90° both ways
  // For direction [dc, dr], capture offsets are [dr, dc] and [-dr, -dc]
  const captureOffsets = [[dr, dc], [-dr, -dc]]
  for (const [cdc, cdr] of captureOffsets) {
    const capKey = posKey(col + dc + cdc, row + dr + cdr)
    if (board.has(capKey)) {
      const cell = board.get(capKey)
      if (cell.piece && cell.piece.color !== piece.color) {
        moves.push([col + dc + cdc, row + dr + cdr])
      }
    }
  }

  return moves
}

export { getPawnMoves }
```

**Pitfall:** Capture offsets are a 90-degree rotation of `[dc, dr]`, not fixed `[±1, ±1]`. For `[0,-1]` (up): captures at `[-1,-1]` and `[1,-1]`. For `[1,0]` (right): captures at `[0,1]` and `[0,-1]`.

---

### `src/engine/moves/knight.js` (utility / move generator)

**Source:** RESEARCH.md — Pattern 5: Knight Move Generation

**Pattern:**
```javascript
// src/engine/moves/knight.js
import { posKey } from '../../puzzles/loader.js'

const KNIGHT_OFFSETS = [
  [2,1],[2,-1],[-2,1],[-2,-1],
  [1,2],[1,-2],[-1,2],[-1,-2],
]

/**
 * Knight jumps — path cells are never checked (D-13).
 * Target must be in the board map (D-11) and either empty or occupied by an enemy.
 *
 * @param {Map} board
 * @param {number} col
 * @param {number} row
 * @param {string} pieceColor - 'white' | 'black'
 * @returns {Array<[number, number]>}
 */
function getKnightMoves(board, col, row, pieceColor) {
  return KNIGHT_OFFSETS
    .map(([dc, dr]) => [col + dc, row + dr])
    .filter(([c, r]) => {
      const key = posKey(c, r)
      if (!board.has(key)) return false   // off-board or impassable — cannot land
      const cell = board.get(key)
      if (!cell.piece) return true        // empty square — valid
      return cell.piece.color !== pieceColor  // enemy piece — valid capture
    })
}

export { getKnightMoves }
```

---

### `src/engine/moves/rook.js` (utility / move generator)

**Source:** RESEARCH.md — Pattern 4: Sliding Piece Ray Generation

**Pattern:**
```javascript
// src/engine/moves/rook.js
import { posKey } from '../../puzzles/loader.js'

const ROOK_DIRS = [[1,0],[-1,0],[0,1],[0,-1]]

function walkRay(board, col, row, dc, dr, pieceColor) {
  const moves = []
  let c = col + dc
  let r = row + dr
  while (true) {
    const key = posKey(c, r)
    if (!board.has(key)) break        // ENG-02: off-board or impassable — stop
    const cell = board.get(key)
    if (cell.piece) {
      if (cell.piece.color !== pieceColor) moves.push([c, r])  // capture
      break                           // blocked by any piece — stop ray
    }
    moves.push([c, r])
    c += dc
    r += dr
  }
  return moves
}

function getRookMoves(board, col, row, pieceColor) {
  return ROOK_DIRS.flatMap(([dc, dr]) => walkRay(board, col, row, dc, dr, pieceColor))
}

export { getRookMoves, walkRay }
```

Export `walkRay` so `bishop.js` and `queen.js` can import it rather than duplicating.

---

### `src/engine/moves/bishop.js` (utility / move generator)

**Source:** RESEARCH.md — Pattern 4 (same walkRay, diagonal directions)

**Pattern:**
```javascript
// src/engine/moves/bishop.js
import { walkRay } from './rook.js'

const BISHOP_DIRS = [[1,1],[1,-1],[-1,1],[-1,-1]]

function getBishopMoves(board, col, row, pieceColor) {
  return BISHOP_DIRS.flatMap(([dc, dr]) => walkRay(board, col, row, dc, dr, pieceColor))
}

export { getBishopMoves }
```

---

### `src/engine/moves/queen.js` (utility / move generator)

**Source:** RESEARCH.md — Pattern 4 (delegates to rook + bishop directions)

**Pattern:**
```javascript
// src/engine/moves/queen.js
import { walkRay } from './rook.js'

const QUEEN_DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]

function getQueenMoves(board, col, row, pieceColor) {
  return QUEEN_DIRS.flatMap(([dc, dr]) => walkRay(board, col, row, dc, dr, pieceColor))
}

export { getQueenMoves }
```

---

### `src/engine/moves/king.js` (utility / move generator)

**Source:** RESEARCH.md — Open Question 3 and ENG-01 (king is never on puzzle boards but engine should be spec-complete)

**Pattern:**
```javascript
// src/engine/moves/king.js
import { posKey } from '../../puzzles/loader.js'

// King moves 1 square in any of 8 directions — same as queen but no ray walking
const KING_DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]

function getKingMoves(board, col, row, pieceColor) {
  return KING_DIRS
    .map(([dc, dr]) => [col + dc, row + dr])
    .filter(([c, r]) => {
      const key = posKey(c, r)
      if (!board.has(key)) return false
      const cell = board.get(key)
      if (!cell.piece) return true
      return cell.piece.color !== pieceColor
    })
}

export { getKingMoves }
// Note: ENG-04 — no check detection. King presence on board is a puzzle-design
// decision only; engine does not enforce king-safety rules.
```

---

### `src/engine/moves/index.js` (coordinator — optional)

**Pattern:**
```javascript
// src/engine/moves/index.js
// Dispatch getMoves to the correct piece-type function

import { getPawnMoves } from './pawn.js'
import { getKnightMoves } from './knight.js'
import { getBishopMoves } from './bishop.js'
import { getRookMoves } from './rook.js'
import { getQueenMoves } from './queen.js'
import { getKingMoves } from './king.js'

/**
 * Get all legal moves for the piece at the given position.
 * @param {Map} board
 * @param {string} positionKey - "col,row" key of the piece
 * @returns {Array<[number, number]>}
 */
function getLegalMoves(board, positionKey) {
  const cell = board.get(positionKey)
  if (!cell || !cell.piece) return []
  const [col, row] = positionKey.split(',').map(Number)
  const { piece } = cell

  switch (piece.type) {
    case 'p': return getPawnMoves(board, col, row, piece)
    case 'n': return getKnightMoves(board, col, row, piece.color)
    case 'b': return getBishopMoves(board, col, row, piece.color)
    case 'r': return getRookMoves(board, col, row, piece.color)
    case 'q': return getQueenMoves(board, col, row, piece.color)
    case 'k': return getKingMoves(board, col, row, piece.color)
    default:  return []
  }
}

export { getLegalMoves }
```

---

## Shared Patterns

### Data Model (apply to ALL engine and loader files)

**Source:** RESEARCH.md — Pattern 1

```javascript
// Shared type contracts — use JSDoc throughout

/** @typedef {{ piece: Piece | null, isGoal: boolean }} Cell */
/** @typedef {{ type: string, color: 'white' | 'black', direction?: [number, number] }} Piece */
// direction is ONLY present on pawns

// Board key convention (D-10)
const posKey = (col, row) => `${col},${row}`
// col = left-to-right (x), row = top-to-bottom (y), both 0-indexed
// "0,0" is top-left of the text-grid

// Impassable squares are absent from the Map (D-11)
// board.has(key) === false means "cannot enter" for ANY reason (wall, off-board)
```

### Import Convention (apply to ALL src files)

**Source:** RESEARCH.md — recommended module structure

- Use ES module `import`/`export` syntax throughout (Vite native)
- No CommonJS (`require`/`module.exports`)
- Relative imports with explicit `.js` extension (e.g. `import { posKey } from '../../puzzles/loader.js'`)
- No barrel `index.js` that imports everything — each file imports only what it uses

### Pure Function Rule (apply to ALL engine files — ENG-07)

Every function in `src/engine/` must:
- Accept only plain JS arguments (Map, object, string, number)
- Return a plain JS value
- Have NO `import` of `document`, `window`, `localStorage`, `fetch`, or any browser-only API
- Have NO side effects (mutation only on the cloned board returned from `applyMove`)

### Test Structure (apply to ALL `*.test.js` files)

**Source:** RESEARCH.md — Code Examples: Vitest Setup, rook.test.js, parameterized pawn tests

```javascript
// Template for any *.test.js file
import { describe, it, test, expect } from 'vitest'
// Import only the specific function under test
import { getXxxMoves } from './xxx.js'

describe('getXxxMoves', () => {
  it('brief description of the happy path', () => {
    const board = new Map([
      ['col,row', { piece: { type: 'x', color: 'white' }, isGoal: false }],
      // ...minimal board for the case
    ])
    const moves = getXxxMoves(board, col, row, pieceColor)
    expect(moves).toContainEqual([expectedCol, expectedRow])
  })

  it('does not return moves to impassable squares (absent from map)', () => {
    // key is absent — never call board.set for impassable positions
    // ...
  })
})
```

Use `test.each` for parameterized cases (pawn direction variants, sliding piece directions).

---

## Test Pattern Assignments

### `src/puzzles/loader.test.js` (FMT-01, FMT-02)

```javascript
import { describe, it, expect } from 'vitest'
import { parsePuzzle } from './loader.js'

describe('parsePuzzle', () => {
  it('creates board Map with correct keys for each non-impassable cell', () => { /* ... */ })
  it('excludes impassable (x) squares from the Map', () => { /* ... */ })
  it('sets isGoal: true for G squares', () => { /* ... */ })
  it('parses lowercase chars as white pieces', () => { /* ... */ })
  it('parses uppercase chars as black pieces', () => { /* ... */ })
  it('attaches direction to pawn pieces from pawnDirections', () => { /* ... */ })
  it('throws on unknown schemaVersion', () => { /* ... */ })
})
```

### `src/puzzles/catalogue.test.js` (FMT-03, FMT-04, FMT-05)

```javascript
import { describe, it, expect } from 'vitest'
import catalogue from './catalogue.js'

describe('catalogue', () => {
  it('all puzzle IDs are unique', () => {
    const ids = catalogue.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('all puzzles have schemaVersion 1', () => {
    catalogue.forEach(p => expect(p.schemaVersion).toBe(1))
  })
  it('all puzzles have a valid goalType', () => {
    const valid = new Set(['capture-all-targets', 'reach-all-goal-squares'])
    catalogue.forEach(p => expect(valid.has(p.goalType)).toBe(true))
  })
})
```

### `src/engine/apply.test.js` (ENG-08)

Critical tests: verify that `structuredClone` produces an independent snapshot — mutating `newBoard` must not mutate `oldBoard`. Run before and after an `applyMove` call.

### `src/engine/win.test.js` (ENG-05, ENG-06)

Test both goal types. For `capture-all-targets`: board with remaining target pieces returns false; board with none returns true. For `reach-all-goal-squares`: board with empty goal cell returns false; all goal cells occupied returns true.

### `src/engine/moves/*.test.js` (ENG-01, ENG-02, ENG-03)

- **pawn.test.js**: use `test.each` over all 4 cardinal directions; verify forward advance blocked by any piece; verify capture requires enemy
- **knight.test.js**: verify all 8 offsets; verify cannot land on impassable (absent key); verify can "jump" (intermediate cells not checked)
- **rook.test.js / bishop.test.js**: verify ray stops at impassable, stops at friendly, captures enemy and stops
- **queen.test.js**: verify all 8 ray directions; can delegate to rook + bishop logic

---

## No Analog Found

All 22 files have no in-codebase analog. This is the founding phase. The table below records the reason and the authoritative pattern source for each.

| File | Role | Data Flow | Pattern Source |
|------|------|-----------|----------------|
| `vitest.config.js` | config | — | RESEARCH.md Code Examples |
| `src/puzzles/catalogue.js` | static data | — | RESEARCH.md Pattern 3 |
| `src/puzzles/loader.js` | utility | transform | RESEARCH.md Patterns 1 & 2 |
| `src/engine/index.js` | public API | request-response | RESEARCH.md Architecture Diagram |
| `src/engine/apply.js` | utility | transform | RESEARCH.md Pattern 7 |
| `src/engine/win.js` | utility | request-response | RESEARCH.md Pattern 8 |
| `src/engine/moves/pawn.js` | utility | request-response | RESEARCH.md Pattern 6 |
| `src/engine/moves/knight.js` | utility | request-response | RESEARCH.md Pattern 5 |
| `src/engine/moves/bishop.js` | utility | request-response | RESEARCH.md Pattern 4 |
| `src/engine/moves/rook.js` | utility | request-response | RESEARCH.md Pattern 4 |
| `src/engine/moves/queen.js` | utility | request-response | RESEARCH.md Pattern 4 |
| `src/engine/moves/king.js` | utility | request-response | CLAUDE.md + ENG-01 |
| `src/engine/moves/index.js` | coordinator | request-response | RESEARCH.md Architecture Diagram |
| All `*.test.js` files | test | — | RESEARCH.md Code Examples |

---

## Metadata

**Analog search scope:** Entire repository (`/Users/tilman.schieber@fhnw.ch/src/xess/`)
**Files scanned:** 1 (only `CLAUDE.md` exists — project not yet scaffolded)
**Pattern extraction date:** 2026-04-16
**All patterns sourced from:** CONTEXT.md decisions D-01 through D-13, RESEARCH.md Patterns 1–8 and Code Examples
**Board key convention:** `"col,row"` string, col=left-right 0-indexed, row=top-bottom 0-indexed
**Impassable convention:** absent from Map — `!board.has(key)` means "cannot enter" for all pieces

// src/puzzles/loader.js
// D-04: FEN-style character set
const PIECE_CHARS = new Set(['p', 'P', 'n', 'N', 'b', 'B', 'r', 'R', 'q', 'Q', 'k', 'K'])

// Coordinate helpers — exported for use by engine modules
export const posKey = (col, row) => `${col},${row}`
export const parseKey = (key) => key.split(',').map(Number)

/**
 * Parse a raw catalogue entry into a runtime Puzzle object.
 * Called at import time — the engine never sees raw strings.
 *
 * @param {Object} raw - Object from catalogue.js
 * @returns {{ id: string, schemaVersion: number, title: string, goalType: string,
 *             targetColor: string|null, board: Map<string, {piece: Object|null, isGoal: boolean}>,
 *             width: number, height: number }}
 */
export function parsePuzzle(raw) {
  if (raw.schemaVersion !== 1) throw new Error(`Unknown schema version: ${raw.schemaVersion}`)

  const board = new Map()   // D-10: Map<"col,row", Cell>
  const rows = raw.grid

  rows.forEach((rowStr, row) => {
    if (typeof rowStr !== 'string') return  // T-01-03: guard against non-string rows

    ;[...rowStr].forEach((char, col) => {
      if (char === 'x') return  // D-11: impassable excluded from map entirely

      if (char === '-') {
        board.set(posKey(col, row), { piece: null, isGoal: false })
      } else if (char === 'G') {
        board.set(posKey(col, row), { piece: null, isGoal: true })
      } else if (PIECE_CHARS.has(char)) {
        const color = char === char.toLowerCase() ? 'white' : 'black'  // D-03
        const type = char.toLowerCase()  // D-04: piece type is always lowercase
        const piece = { type, color }
        if (type === 'p') {
          piece.direction = raw.pawnDirections?.[posKey(col, row)] ?? [0, -1]
        }
        board.set(posKey(col, row), { piece, isGoal: false })
      }
    })
  })

  const stringRows = rows.filter(r => typeof r === 'string')
  const width = stringRows.length > 0 ? Math.max(...stringRows.map(r => r.length)) : 0

  return {
    id: raw.id,
    schemaVersion: raw.schemaVersion,
    title: raw.title ?? '',
    goalType: raw.goalType,
    targetColor: raw.targetColor ?? null,
    board,
    width,
    height: rows.length,
  }
}

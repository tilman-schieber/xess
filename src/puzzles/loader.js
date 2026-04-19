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
 *             goalTargets: Map<string, {type: string, color: string}>,
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
        const color = char === char.toUpperCase() ? 'white' : 'black'
        const type = char.toLowerCase()  // D-04: piece type is always lowercase
        const piece = { type, color }
        board.set(posKey(col, row), { piece, isGoal: false })
      }
    })
  })

  const stringRows = rows.filter(r => typeof r === 'string')
  const width = stringRows.length > 0 ? Math.max(...stringRows.map(r => r.length)) : 0

  const goalTargets = new Map()
  if (raw.goalTargets && typeof raw.goalTargets === 'object') {
    for (const [key, pieceChar] of Object.entries(raw.goalTargets)) {
      if (!board.has(key) || !board.get(key)?.isGoal) {
        throw new Error(`Puzzle "${raw.id}": goalTargets key "${key}" must reference a G square`)
      }
      if (!PIECE_CHARS.has(pieceChar)) {
        throw new Error(`Puzzle "${raw.id}": goalTargets key "${key}" has invalid piece "${pieceChar}"`)
      }

      const color = pieceChar === pieceChar.toUpperCase() ? 'white' : 'black'
      goalTargets.set(key, {
        type: pieceChar.toLowerCase(),
        color,
      })
    }
  }

  if (raw.goalType === 'reach-all-goal-squares') {
    const goalCount = [...board.values()].filter(c => c.isGoal).length
    if (goalCount === 0) throw new Error(`Puzzle "${raw.id}": reach-all-goal-squares requires at least one G square`)
  }

  return {
    id: raw.id,
    schemaVersion: raw.schemaVersion,
    title: raw.title ?? '',
    descriptionHtml: typeof raw.descriptionHtml === 'string' ? raw.descriptionHtml : '',
    goalType: raw.goalType,
    targetColor: raw.targetColor ?? null,
    controllableColors: Array.isArray(raw.controllableColors) && raw.controllableColors.length > 0
      ? [...new Set(raw.controllableColors.filter(color => color === 'white' || color === 'black'))]
      : ['white'],
    capturableByColor: {
      white: Array.isArray(raw.capturableByColor?.white)
        ? [...new Set(raw.capturableByColor.white.filter(color => color === 'white' || color === 'black'))]
        : ['black'],
      black: Array.isArray(raw.capturableByColor?.black)
        ? [...new Set(raw.capturableByColor.black.filter(color => color === 'white' || color === 'black'))]
        : ['white'],
    },
    promote: raw.promote === true,
    board,
    goalTargets,
    width,
    height: rows.length,
  }
}

import { posKey } from '../../puzzles/loader.js'

const KNIGHT_OFFSETS = [
  [2, 1], [2, -1], [-2, 1], [-2, -1],
  [1, 2], [1, -2], [-1, 2], [-1, -2],
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

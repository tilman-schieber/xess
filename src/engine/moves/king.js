import { posKey } from '../../puzzles/loader.js'

// King moves 1 square in any of 8 directions — same as queen but no ray walking
const KING_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]

/**
 * @param {Map} board
 * @param {number} col
 * @param {number} row
 * @param {string} pieceColor - 'white' | 'black'
 * @returns {Array<[number, number]>}
 */
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

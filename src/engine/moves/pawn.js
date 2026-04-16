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

  // Diagonal captures — rotate direction 90° both ways to get capture squares
  // For [dc, dr]: capture offsets are [dr, dc] and [-dr, -dc]
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

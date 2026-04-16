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

import { walkRay } from './rook.js'

const BISHOP_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]]

function getBishopMoves(board, col, row, pieceColor) {
  return BISHOP_DIRS.flatMap(([dc, dr]) => walkRay(board, col, row, dc, dr, pieceColor))
}

export { getBishopMoves }

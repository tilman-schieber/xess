import { walkRay } from './rook.js'

const QUEEN_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]

function getQueenMoves(board, col, row, pieceColor) {
  return QUEEN_DIRS.flatMap(([dc, dr]) => walkRay(board, col, row, dc, dr, pieceColor))
}

export { getQueenMoves }

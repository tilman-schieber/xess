import { posKey } from '../../puzzles/loader.js'

const ROOK_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

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

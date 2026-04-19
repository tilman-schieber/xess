import { posKey } from '../puzzles/loader.js'

// ---------------------------------------------------------------------------
// Pawn
// ---------------------------------------------------------------------------

/**
 * Pawn move generation.
 * Pawns always move upward (row - 1) and capture on upward diagonals.
 * No double-advance, no en passant.
 *
 * @param {Map} board
 * @param {number} col
 * @param {number} row
 * @param {Piece} piece
 * @returns {Array<[number, number]>}
 */
function getPawnMoves(board, col, row, piece) {
  const moves = []

  // Forward advance — one row upward
  const fwdKey = posKey(col, row - 1)
  if (board.has(fwdKey) && !board.get(fwdKey).piece) {
    moves.push([col, row - 1])
  }

  // Diagonal captures — upward left and upward right
  const captureOffsets = [[-1, -1], [1, -1]]
  for (const [dc, dr] of captureOffsets) {
    const capKey = posKey(col + dc, row + dr)
    if (board.has(capKey)) {
      const cell = board.get(capKey)
      if (cell.piece && cell.piece.color !== piece.color) {
        moves.push([col + dc, row + dr])
      }
    }
  }

  return moves
}

// ---------------------------------------------------------------------------
// Knight
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Ray walker (shared by rook, bishop, queen)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Rook
// ---------------------------------------------------------------------------

const ROOK_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

function getRookMoves(board, col, row, pieceColor) {
  return ROOK_DIRS.flatMap(([dc, dr]) => walkRay(board, col, row, dc, dr, pieceColor))
}

// ---------------------------------------------------------------------------
// Bishop
// ---------------------------------------------------------------------------

const BISHOP_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]]

function getBishopMoves(board, col, row, pieceColor) {
  return BISHOP_DIRS.flatMap(([dc, dr]) => walkRay(board, col, row, dc, dr, pieceColor))
}

// ---------------------------------------------------------------------------
// Queen
// ---------------------------------------------------------------------------

const QUEEN_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]

function getQueenMoves(board, col, row, pieceColor) {
  return QUEEN_DIRS.flatMap(([dc, dr]) => walkRay(board, col, row, dc, dr, pieceColor))
}

// ---------------------------------------------------------------------------
// King
// ---------------------------------------------------------------------------

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
// Note: ENG-04 — no check detection. King presence on board is a puzzle-design
// decision only; engine does not enforce king-safety rules.

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

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

export { getLegalMoves, getPawnMoves, getKnightMoves, getBishopMoves, getRookMoves, getQueenMoves, getKingMoves, walkRay }

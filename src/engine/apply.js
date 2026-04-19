// src/engine/apply.js
import { checkWin } from './win.js'

/**
 * Apply a move. Returns a new independent board (immutable — original untouched).
 * Caller pushes the PREVIOUS board onto the undo stack before assigning the new one.
 *
 * UNDO PATTERN (for Phase 2 game controller):
 *   const history = []
 *   const prev = currentBoard
 *   const { board: next, won, captured } = applyMove(currentBoard, from, to, puzzle)
 *   history.push(prev)
 *   currentBoard = next
 *   // Undo:
 *   if (history.length > 0) currentBoard = history.pop()
 *
 * NOTE (T-03-01): applyMove trusts the caller to validate that `to` is in
 * getLegalMoves(board, from) before calling this function. No internal validation.
 *
 * @param {Map} board   - current board state (NOT mutated)
 * @param {string} from - posKey of the moving piece
 * @param {string} to   - posKey of the destination
 * @param {Object} puzzle - { goalType, targetColor }
 * @returns {{ board: Map, captured: Piece|null, won: boolean }}
 */
function applyMove(board, from, to, puzzle) {
  const newBoard = structuredClone(board)  // ENG-08: deep clone — Map<string,Cell> is cloneable
  const fromCell = newBoard.get(from)
  const toCell = newBoard.get(to)
  if (!fromCell || !toCell) {
    throw new Error(`applyMove: invalid key — from="${from}" to="${to}"`)
  }
  const captured = toCell.piece ?? null
  newBoard.set(to, { ...toCell, piece: fromCell.piece })
  newBoard.set(from, { ...fromCell, piece: null })

  const movedPiece = newBoard.get(to)?.piece
  const [, toRow] = to.split(',').map(Number)
  if (
    movedPiece
    && movedPiece.type === 'p'
    && toRow === 0
    && puzzle?.promote === true
  ) {
    newBoard.set(to, {
      ...newBoard.get(to),
      piece: {
        ...movedPiece,
        type: 'q',
      },
    })
  }

  return {
    board: newBoard,
    captured,
    won: checkWin(newBoard, puzzle),
  }
}

export { applyMove }

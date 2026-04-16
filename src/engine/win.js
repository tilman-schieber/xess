// src/engine/win.js

/**
 * Check if the win condition has been met.
 * Called after every applyMove.
 *
 * @param {Map} board - board state after the move
 * @param {{ goalType: string, targetColor: string|null }} puzzle
 * @returns {boolean}
 */
function checkWin(board, puzzle) {
  if (puzzle.goalType === 'capture-all-targets') {
    // D-09: win when NO pieces of targetColor remain on the board
    for (const cell of board.values()) {
      if (cell.piece && cell.piece.color === puzzle.targetColor) return false
    }
    return true
  }

  if (puzzle.goalType === 'reach-all-goal-squares') {
    // Win when every goal square is occupied by any piece (A3: zero goal squares = vacuously true)
    for (const cell of board.values()) {
      if (cell.isGoal && !cell.piece) return false
    }
    return true
  }

  return false
}

export { checkWin }

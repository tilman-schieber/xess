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
    if (puzzle.goalTargets instanceof Map && puzzle.goalTargets.size > 0) {
      for (const [goalKey, target] of puzzle.goalTargets.entries()) {
        const piece = board.get(goalKey)?.piece
        if (!piece) return false
        if (piece.type !== target.type || piece.color !== target.color) return false
      }
      return true
    }

    // Win when every goal square is occupied by any piece (A3: zero goal squares = vacuously true)
    for (const cell of board.values()) {
      if (cell.isGoal && !cell.piece) return false
    }
    return true
  }

  return false
}

export { checkWin }

// src/puzzles/hints.js
// Pure hint lookup along a puzzle's stored shortest solution.
// While the player's position is on that line, the next move is known instantly;
// off the line the caller falls back to the BFS solver (solver.worker.js).

import solutions from './solutions.js'
import { stateKey } from './solver.js'
import { applyMove } from '../engine/apply.js'

/**
 * Replay the stored solution and index every position on it.
 *
 * @param {Object} puzzle - parsed puzzle
 * @param {Array<{from: string, to: string}>} [moves]
 * @returns {{ moves: Array<{from: string, to: string}>, stepByState: Map<string, number> }}
 */
export function createSolutionLine(puzzle, moves = solutions[puzzle?.id]) {
  const line = { moves: [], stepByState: new Map() }
  if (!puzzle?.board || !Array.isArray(moves)) return line

  let board = puzzle.board
  try {
    moves.forEach((move, step) => {
      line.stepByState.set(stateKey(board), step)
      board = applyMove(board, move.from, move.to, puzzle).board
    })
    line.moves = moves
  } catch {
    // Stale solution for an edited grid — behave as if there were none
    return { moves: [], stepByState: new Map() }
  }
  return line
}

/**
 * @param {{ moves: Array, stepByState: Map<string, number> }} line
 * @param {Map} board - current position
 * @returns {{ from: string, to: string, step: number }|null} next move, or null when off the line
 */
export function findHintOnLine(line, board) {
  if (!line || !(board instanceof Map)) return null
  const step = line.stepByState.get(stateKey(board))
  if (step === undefined) return null
  return { ...line.moves[step], step }
}

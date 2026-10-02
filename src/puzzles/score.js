// src/puzzles/score.js
// Pure scoring rules. Every puzzle is worth up to 100 points.

export const MAX_SCORE = 100
export const MIN_SCORE = 10
export const EXTRA_MOVE_PENALTY = 5
export const MAX_MOVE_PENALTY = 50
export const HINT_PENALTY = 20
export const MAX_HINT_PENALTY = 40

/**
 * Score for one solve. Extra moves over par and requested hints cost points;
 * undo, reset and tutorial coaching are free.
 *
 * @param {{ moveCount: number, par?: number|null, hintsUsed?: number }} solve
 * @returns {{ score: number, stars: number, movePenalty: number, hintPenalty: number }}
 */
export function computeScore({ moveCount, par = null, hintsUsed = 0 } = {}) {
  const extraMoves = Number.isInteger(par) && par > 0 && Number.isInteger(moveCount)
    ? Math.max(0, moveCount - par)
    : 0
  const hints = Number.isInteger(hintsUsed) && hintsUsed > 0 ? hintsUsed : 0

  const movePenalty = Math.min(MAX_MOVE_PENALTY, extraMoves * EXTRA_MOVE_PENALTY)
  const hintPenalty = Math.min(MAX_HINT_PENALTY, hints * HINT_PENALTY)
  const score = Math.max(MIN_SCORE, MAX_SCORE - movePenalty - hintPenalty)

  return { score, stars: starsForScore(score), movePenalty, hintPenalty }
}

/** 3 stars for a perfect solve, 2 for a decent one, 1 for any solve. */
export function starsForScore(score) {
  if (!Number.isFinite(score) || score <= 0) return 0
  if (score >= MAX_SCORE) return 3
  if (score >= 60) return 2
  return 1
}

export function formatStars(stars) {
  const filled = Math.max(0, Math.min(3, Number.isInteger(stars) ? stars : 0))
  return '★'.repeat(filled) + '☆'.repeat(3 - filled)
}

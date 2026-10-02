// src/puzzles/achievements.js
// Pure achievement and rank rules, derived entirely from solved puzzles and best scores.
// Nothing here is stored: unlocking is recomputed from progress every time.

import { starsForScore } from './score.js'

const TRACK_ACHIEVEMENTS = {
  tutorial: { title: 'Graduate', description: 'Finish the tutorial', piece: 'p', points: 50 },
  'warm-up': { title: 'Warmed Up', description: 'Solve every Warm-up puzzle', piece: 'n', points: 100 },
  tricky: { title: 'Untangled', description: 'Solve every Tricky puzzle', piece: 'b', points: 150 },
  fiendish: { title: 'Fiendish Mind', description: 'Solve every Fiendish puzzle', piece: 'q', points: 250 },
}

/**
 * @param {{
 *   tracks: { id: string, title: string, puzzleIds: string[] }[],
 *   catalogue: object[],
 *   solvedIds: string[],
 *   scores: Record<string, number>,
 * }} progress
 * @returns {{ id: string, title: string, description: string, piece: string, points: number,
 *            unlocked: boolean, value: number, target: number }[]}
 */
export function evaluateAchievements({ tracks = [], catalogue = [], solvedIds = [], scores = {} } = {}) {
  const trackPuzzleIds = tracks.flatMap(track => track.puzzleIds)
  const inTracks = new Set(trackPuzzleIds)
  const solved = new Set(solvedIds.filter(id => inTracks.has(id)))
  const byId = new Map(catalogue.map(entry => [entry.id, entry]))

  const countSolved = ids => ids.filter(id => solved.has(id)).length
  const isPerfect = id => solved.has(id) && starsForScore(scores[id]) === 3
  const perfectCount = trackPuzzleIds.filter(isPerfect).length
  const points = trackPuzzleIds.reduce((sum, id) => sum + (solved.has(id) ? (scores[id] ?? 0) : 0), 0)

  const captureIds = trackPuzzleIds.filter(id => byId.get(id)?.goalType === 'capture-all-targets')
  const reachIds = trackPuzzleIds.filter(id => byId.get(id)?.goalType === 'reach-all-goal-squares')
  const promoteIds = trackPuzzleIds.filter(id => byId.get(id)?.promote === true)
  const flawlessTracks = tracks.filter(track => track.puzzleIds.length > 0 && track.puzzleIds.every(isPerfect)).length

  const list = [
    { id: 'first-solve', points: 25, title: 'First Move', description: 'Solve your first puzzle', piece: 'p', value: solved.size, target: 1 },
    ...tracks
      .filter(track => track.puzzleIds.length > 0)
      .map((track) => {
        const meta = TRACK_ACHIEVEMENTS[track.id]
          ?? { title: `${track.title} Complete`, description: `Solve every ${track.title} puzzle`, piece: 'r', points: 100 }
        return { id: `track-${track.id}`, ...meta, value: countSolved(track.puzzleIds), target: track.puzzleIds.length }
      }),
    { id: 'hunter', points: 100, title: 'Hunter', description: 'Solve every capture puzzle', piece: 'n', value: countSolved(captureIds), target: captureIds.length },
    { id: 'pathfinder', points: 150, title: 'Pathfinder', description: 'Solve every reach puzzle', piece: 'r', value: countSolved(reachIds), target: reachIds.length },
    { id: 'crowned', points: 50, title: 'Crowned', description: 'Solve three promotion puzzles', piece: 'q', value: countSolved(promoteIds), target: Math.min(3, promoteIds.length) },
    { id: 'sharp', points: 50, title: 'Sharp', description: 'Earn three stars on five puzzles', piece: 'b', value: perfectCount, target: Math.min(5, trackPuzzleIds.length) },
    { id: 'flawless-track', points: 100, title: 'Clean Sheet', description: 'Earn three stars on every puzzle of one track', piece: 'r', value: flawlessTracks, target: 1 },
    { id: 'points-1000', points: 50, title: 'Four Figures', description: 'Earn 1,000 points from puzzles', piece: 'n', value: points, target: 1000 },
    { id: 'points-2000', points: 100, title: 'High Scorer', description: 'Earn 2,000 points from puzzles', piece: 'q', value: points, target: 2000 },
    { id: 'completionist', points: 250, title: 'Completionist', description: 'Solve every puzzle', piece: 'q', value: solved.size, target: trackPuzzleIds.length },
    { id: 'perfect-game', points: 500, title: 'Perfect Game', description: 'Earn three stars on every puzzle', piece: 'q', value: perfectCount, target: trackPuzzleIds.length },
  ]

  return list
    // A target of 0 would be "unlocked" by an empty catalogue; such achievements don't apply
    .filter(entry => entry.target > 0 && (entry.id !== 'points-1000' || trackPuzzleIds.length * 100 >= 1000)
      && (entry.id !== 'points-2000' || trackPuzzleIds.length * 100 >= 2000))
    .map(entry => ({ ...entry, value: Math.min(entry.value, entry.target), unlocked: entry.value >= entry.target }))
}

/**
 * Bonus points from achievements: what the player has earned and what is available in total.
 * The two point-milestone achievements count puzzle points only, so bonuses never feed themselves.
 *
 * @param {{ points: number, unlocked: boolean }[]} achievements
 * @returns {{ earned: number, available: number }}
 */
export function getAchievementPoints(achievements = []) {
  return achievements.reduce((sum, entry) => ({
    earned: sum.earned + (entry.unlocked ? entry.points : 0),
    available: sum.available + entry.points,
  }), { earned: 0, available: 0 })
}

const RANKS = [
  { title: 'Pawn', piece: 'p', share: 0 },
  { title: 'Knight', piece: 'n', share: 0.15 },
  { title: 'Bishop', piece: 'b', share: 0.35 },
  { title: 'Rook', piece: 'r', share: 0.6 },
  { title: 'Queen', piece: 'q', share: 0.85 },
]

/**
 * Chess-piece rank for a point total.
 *
 * @param {number} points
 * @param {number} maxPoints
 * @returns {{ title: string, piece: string, next: { title: string, at: number, missing: number }|null, progress: number }}
 */
export function getRank(points, maxPoints) {
  const safeMax = Number.isFinite(maxPoints) && maxPoints > 0 ? maxPoints : 0
  const safePoints = Number.isFinite(points) && points > 0 ? points : 0
  const thresholds = RANKS.map(rank => ({ ...rank, at: Math.ceil(rank.share * safeMax) }))

  let index = 0
  thresholds.forEach((rank, i) => {
    if (safePoints >= rank.at) index = i
  })
  const current = thresholds[index]
  const upcoming = thresholds[index + 1] ?? null
  const span = upcoming ? upcoming.at - current.at : 0

  return {
    title: current.title,
    piece: current.piece,
    next: upcoming ? { title: upcoming.title, at: upcoming.at, missing: upcoming.at - safePoints } : null,
    progress: upcoming && span > 0 ? (safePoints - current.at) / span : 1,
  }
}

// src/puzzles/nav.js
// Pure catalogue navigation helpers — no localStorage, no DOM, no side effects.
// All functions accept an optional catalogue parameter (defaults to imported catalogue)
// so tests can inject a controlled mock without vi.mock.

import _catalogue from './catalogue.js'

/**
 * Returns string[] of all currently unlocked puzzle IDs.
 * - Index 0 is always included.
 * - Index i is included iff catalogue[i-1].id is in solvedIds.
 *
 * @param {Set<string>|string[]} solvedIds
 * @param {object[]} [catalogue]
 * @returns {string[]}
 */
export function getUnlockedIds(solvedIds, catalogue = _catalogue) {
  const solved = new Set(solvedIds)
  return catalogue
    .filter((entry, i) => i === 0 || solved.has(catalogue[i - 1].id))
    .map(e => e.id)
}

/**
 * Returns true iff puzzleId is currently unlocked.
 * Returns false for IDs not in the catalogue.
 *
 * @param {string} puzzleId
 * @param {Set<string>|string[]} solvedIds
 * @param {object[]} [catalogue]
 * @returns {boolean}
 */
export function isUnlocked(puzzleId, solvedIds, catalogue = _catalogue) {
  return getUnlockedIds(solvedIds, catalogue).includes(puzzleId)
}

/**
 * Returns the 1-based position string "N / M" for a puzzle.
 * Returns null if puzzleId is not in the catalogue.
 *
 * @param {string} puzzleId
 * @param {object[]} [catalogue]
 * @returns {string|null}
 */
export function getPuzzlePosition(puzzleId, catalogue = _catalogue) {
  const idx = catalogue.findIndex(e => e.id === puzzleId)
  return idx === -1 ? null : `${idx + 1} / ${catalogue.length}`
}

/**
 * Returns the catalogue as an array with a computed status field for each entry.
 * Status: 'solved' if in solvedIds, 'unlocked' if unlocked but not solved, 'locked' otherwise.
 * Preserves catalogue order (NAV-05).
 *
 * @param {Set<string>|string[]} solvedIds
 * @param {object[]} [catalogue]
 * @returns {{ id: string, title: string, status: 'solved'|'unlocked'|'locked' }[]}
 */
export function getPuzzleList(solvedIds, catalogue = _catalogue) {
  const solved = new Set(solvedIds)
  const unlocked = new Set(getUnlockedIds(solvedIds, catalogue))
  return catalogue.map(e => ({
    id: e.id,
    title: e.title,
    status: solved.has(e.id) ? 'solved' : unlocked.has(e.id) ? 'unlocked' : 'locked',
  }))
}

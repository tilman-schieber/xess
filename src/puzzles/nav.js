// src/puzzles/nav.js
// Pure catalogue navigation helpers — no localStorage, no DOM, no side effects.
// All functions accept an optional catalogue parameter (defaults to imported catalogue)
// so tests can inject a controlled mock without vi.mock.

import _catalogue from './catalogue.js'
import _tracks from './tracks.js'
import { validateTrackCatalogueIntegrity } from './contentIntegrity.js'

function getIntegritySafeTracks(tracks = _tracks, catalogue = _catalogue) {
  const { tracks: sanitizedTracks } = validateTrackCatalogueIntegrity({ tracks, catalogue })
  return sanitizedTracks
}

/**
 * Returns string[] of all selectable puzzle IDs.
 * Progress gating is disabled for now, so every catalogue entry is unlocked.
 *
 * @param {Set<string>|string[]} solvedIds
 * @param {object[]} [catalogue]
 * @returns {string[]}
 */
export function getUnlockedIds(solvedIds, catalogue = _catalogue) {
  return catalogue.map(e => e.id)
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
 * Status: 'solved' if in solvedIds, otherwise 'unlocked'.
 * Preserves catalogue order (NAV-05).
 *
 * @param {Set<string>|string[]} solvedIds
 * @param {object[]} [catalogue]
 * @returns {{ id: string, title: string, status: 'solved'|'unlocked' }[]}
 */
export function getPuzzleList(solvedIds, catalogue = _catalogue) {
  const solved = new Set(solvedIds)
  return catalogue.map(e => ({
    id: e.id,
    title: e.title,
    status: solved.has(e.id) ? 'solved' : 'unlocked',
  }))
}

/**
 * Returns static track metadata used by the track browser UI.
 *
 * @param {object[]} [tracks]
 * @returns {{ id: string, title: string, subtitle?: string, modes?: object, puzzleIds: string[] }[]}
 */
export function getTracks(tracks = _tracks) {
  return getIntegritySafeTracks(tracks).map(track => ({
    id: track.id,
    title: track.title,
    subtitle: track.subtitle,
    modes: track.modes,
    puzzleIds: [...track.puzzleIds],
  }))
}

/**
 * Returns puzzle entries scoped to a single track with within-track numbering.
 * Unknown track IDs return [] and never throw.
 *
 * @param {string} trackId
 * @param {Set<string>|string[]} solvedIds
 * @param {object[]} [tracks]
 * @param {object[]} [catalogue]
 * @returns {{ id: string, title: string, status: 'solved'|'unlocked', position: string }[]}
 */
export function getTrackPuzzleList(trackId, solvedIds, tracks = _tracks, catalogue = _catalogue) {
  const integritySafeTracks = getIntegritySafeTracks(tracks, catalogue)
  const track = integritySafeTracks.find(entry => entry.id === trackId)
  if (!track) return []

  const solved = new Set(solvedIds)
  const byId = new Map(catalogue.map(entry => [entry.id, entry]))
  const total = track.puzzleIds.length

  return track.puzzleIds
    .map((id, idx) => {
      const puzzle = byId.get(id)
      if (!puzzle) return null

      return {
        id,
        title: puzzle.title,
        status: solved.has(id) ? 'solved' : 'unlocked',
        position: `${idx + 1} / ${total}`,
      }
    })
    .filter(Boolean)
}

/**
 * Resolve deterministic launch/resume puzzle ID for a track.
 * Fallback order: active-in-track → first unsolved-in-track → first track puzzle → null.
 * Unknown or empty tracks return null and never throw.
 *
 * @param {{ trackId: string, solvedIds: Set<string>|string[], activePuzzleId?: string|null }} params
 * @param {object[]} [tracks]
 * @returns {string|null}
 */
export function getTrackLaunchPuzzleId({ trackId, solvedIds, activePuzzleId }, tracks = _tracks) {
  const integritySafeTracks = getIntegritySafeTracks(tracks)
  const track = integritySafeTracks.find(entry => entry.id === trackId)
  if (!track || track.puzzleIds.length === 0) return null

  if (typeof activePuzzleId === 'string' && track.puzzleIds.includes(activePuzzleId)) {
    return activePuzzleId
  }

  const solved = new Set(solvedIds)
  const firstUnsolved = track.puzzleIds.find(id => !solved.has(id))
  if (firstUnsolved) return firstUnsolved

  return track.puzzleIds[0] ?? null
}

export function findTrackIdForPuzzleId(puzzleId, tracks = _tracks) {
  if (typeof puzzleId !== 'string' || puzzleId.length === 0) return null
  const integritySafeTracks = getIntegritySafeTracks(tracks)
  const match = integritySafeTracks.find(track => track.puzzleIds.includes(puzzleId))
  return match?.id ?? null
}

export function resolveLandingContinueAction(
  { lastTrackId = null, solvedIds = [], activePuzzleId = null } = {},
  tracks = _tracks,
) {
  const integritySafeTracks = getIntegritySafeTracks(tracks)
  if (integritySafeTracks.length === 0) return { kind: 'tracks' }

  const activeTrackId = findTrackIdForPuzzleId(activePuzzleId, integritySafeTracks)
  const preferredTrackIds = [lastTrackId, activeTrackId, ...integritySafeTracks.map(track => track.id)]
  const uniqueTrackIds = [...new Set(preferredTrackIds.filter(id => typeof id === 'string' && id.length > 0))]

  for (const trackId of uniqueTrackIds) {
    const puzzleId = getTrackLaunchPuzzleId({ trackId, solvedIds, activePuzzleId }, integritySafeTracks)
    if (typeof puzzleId === 'string' && puzzleId.length > 0) {
      return { kind: 'play', trackId, puzzleId }
    }
  }

  return { kind: 'tracks' }
}

/**
 * Returns the id of the puzzle immediately before puzzleId in catalogue order.
 * Returns null if puzzleId is first or not found.
 *
 * @param {string} puzzleId
 * @param {object[]} [catalogue]
 * @returns {string|null}
 */
export function getPrevId(puzzleId, catalogue = _catalogue) {
  const idx = catalogue.findIndex(e => e.id === puzzleId)
  return idx <= 0 ? null : catalogue[idx - 1].id
}

/**
 * Returns the id of the puzzle immediately after puzzleId in catalogue order.
 * Returns null if puzzleId is last or not found.
 *
 * @param {string} puzzleId
 * @param {object[]} [catalogue]
 * @returns {string|null}
 */
export function getNextId(puzzleId, catalogue = _catalogue) {
  const idx = catalogue.findIndex(e => e.id === puzzleId)
  return idx === -1 || idx === catalogue.length - 1 ? null : catalogue[idx + 1].id
}

/**
 * Returns the id of the puzzle immediately before puzzleId within the given track.
 * Falls back to catalogue order if trackId is null or puzzle is not in that track.
 */
export function getPrevIdInTrack(puzzleId, trackId, tracks = _tracks, catalogue = _catalogue) {
  if (trackId) {
    const track = getIntegritySafeTracks(tracks).find(t => t.id === trackId)
    if (track) {
      const idx = track.puzzleIds.indexOf(puzzleId)
      if (idx > 0) return track.puzzleIds[idx - 1]
      if (idx === 0) return null
    }
  }
  return getPrevId(puzzleId, catalogue)
}

/**
 * Returns the id of the puzzle immediately after puzzleId within the given track.
 * Falls back to catalogue order if trackId is null or puzzle is not in that track.
 */
export function getNextIdInTrack(puzzleId, trackId, tracks = _tracks, catalogue = _catalogue) {
  if (trackId) {
    const track = getIntegritySafeTracks(tracks).find(t => t.id === trackId)
    if (track) {
      const idx = track.puzzleIds.indexOf(puzzleId)
      if (idx !== -1 && idx < track.puzzleIds.length - 1) return track.puzzleIds[idx + 1]
      if (idx === track.puzzleIds.length - 1) return null
    }
  }
  return getNextId(puzzleId, catalogue)
}

/**
 * Returns the 1-based position string "N / M" scoped to a track.
 * Returns null if trackId is null or puzzleId is not in that track.
 *
 * @param {string} puzzleId
 * @param {string|null} trackId
 * @param {object[]} [tracks]
 * @returns {string|null}
 */
export function getTrackPuzzlePosition(puzzleId, trackId, tracks = _tracks) {
  if (!trackId) return null
  const track = getIntegritySafeTracks(tracks).find(t => t.id === trackId)
  if (!track) return null
  const idx = track.puzzleIds.indexOf(puzzleId)
  if (idx === -1) return null
  return `${idx + 1} / ${track.puzzleIds.length}`
}

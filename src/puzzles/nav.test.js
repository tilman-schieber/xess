// src/puzzles/nav.test.js
import { describe, it, expect, vi } from 'vitest'
import {
  getUnlockedIds,
  isUnlocked,
  getPuzzlePosition,
  getPuzzleList,
  getTracks,
  getTrackPuzzleList,
  getTrackLaunchPuzzleId,
  resolveLandingContinueAction,
} from './nav.js'
import catalogue from './catalogue.js'

const mockCatalogue = [
  { id: 'p1', title: 'Puzzle 1', schemaVersion: 1, goalType: 'capture-all-targets', grid: [] },
  { id: 'p2', title: 'Puzzle 2', schemaVersion: 1, goalType: 'capture-all-targets', grid: [] },
  { id: 'p3', title: 'Puzzle 3', schemaVersion: 1, goalType: 'reach-all-goal-squares', grid: [] },
]

describe('getUnlockedIds', () => {
  it('with empty solvedIds: returns all puzzle ids', () => {
    const result = getUnlockedIds([], mockCatalogue)
    expect(result).toEqual(['p1', 'p2', 'p3'])
  })

  it('with first puzzle solved: still returns all ids', () => {
    const result = getUnlockedIds(['p1'], mockCatalogue)
    expect(result).toEqual(['p1', 'p2', 'p3'])
  })

  it('with first two solved: still returns all ids', () => {
    const result = getUnlockedIds(['p1', 'p2'], mockCatalogue)
    expect(result).toEqual(['p1', 'p2', 'p3'])
  })

  it('with all solved: returns all ids', () => {
    const result = getUnlockedIds(['p1', 'p2', 'p3'], mockCatalogue)
    expect(result).toEqual(['p1', 'p2', 'p3'])
  })

  it('empty catalogue: returns []', () => {
    const result = getUnlockedIds([], [])
    expect(result).toEqual([])
  })
})

describe('isUnlocked', () => {
  it('first puzzle is unlocked with empty solvedIds', () => {
    expect(isUnlocked('p1', [], mockCatalogue)).toBe(true)
  })

  it('second puzzle is unlocked with empty solvedIds', () => {
    expect(isUnlocked('p2', [], mockCatalogue)).toBe(true)
  })

  it('second puzzle is still unlocked after first is solved', () => {
    expect(isUnlocked('p2', ['p1'], mockCatalogue)).toBe(true)
  })

  it('unknown id returns false', () => {
    expect(isUnlocked('unknown-id', [], mockCatalogue)).toBe(false)
  })
})

describe('getPuzzlePosition', () => {
  it('first puzzle returns "1 / N"', () => {
    expect(getPuzzlePosition('p1', mockCatalogue)).toBe('1 / 3')
  })

  it('last puzzle returns "N / N"', () => {
    expect(getPuzzlePosition('p3', mockCatalogue)).toBe('3 / 3')
  })

  it('returns null for unknown id', () => {
    expect(getPuzzlePosition('unknown-id', mockCatalogue)).toBeNull()
  })
})

describe('getPuzzleList', () => {
  it('entry for solved puzzle has status "solved"', () => {
    const list = getPuzzleList(['p1'], mockCatalogue)
    const entry = list.find(e => e.id === 'p1')
    expect(entry.status).toBe('solved')
  })

  it('entry for unlocked-but-unsolved puzzle has status "unlocked"', () => {
    const list = getPuzzleList(['p1'], mockCatalogue)
    const entry = list.find(e => e.id === 'p2')
    expect(entry.status).toBe('unlocked')
  })

  it('entry for unsolved puzzle has status "unlocked"', () => {
    const list = getPuzzleList([], mockCatalogue)
    const entry = list.find(e => e.id === 'p2')
    expect(entry.status).toBe('unlocked')
  })

  it('all entries have id and title fields', () => {
    const list = getPuzzleList([], mockCatalogue)
    for (const entry of list) {
      expect(entry).toHaveProperty('id')
      expect(entry).toHaveProperty('title')
    }
  })

  it('order matches catalogue order', () => {
    const list = getPuzzleList([], mockCatalogue)
    expect(list.map(e => e.id)).toEqual(['p1', 'p2', 'p3'])
  })
})

describe('track navigation contracts', () => {
  it('getTracks returns stable track metadata with valid puzzle ids', () => {
    const tracks = getTracks()
    const catalogueIds = new Set(catalogue.map(entry => entry.id))
    const allTrackIds = []

    expect(Array.isArray(tracks)).toBe(true)
    expect(tracks.length).toBeGreaterThanOrEqual(2)

    tracks.forEach((track) => {
      expect(typeof track.id).toBe('string')
      expect(track.id.length).toBeGreaterThan(0)
      expect(typeof track.title).toBe('string')
      expect(track.title.length).toBeGreaterThan(0)
      expect(Array.isArray(track.puzzleIds)).toBe(true)
      expect(track.puzzleIds.length).toBeGreaterThan(0)

      track.puzzleIds.forEach((puzzleId) => {
        expect(catalogueIds.has(puzzleId)).toBe(true)
        allTrackIds.push(puzzleId)
      })
    })

    expect(new Set(allTrackIds).size).toBe(allTrackIds.length)
  })

  it('getTrackPuzzleList keeps track order and uses within-track numbering', () => {
    const tracks = getTracks()
    const firstTrack = tracks[0]
    const list = getTrackPuzzleList(firstTrack.id, [])

    expect(list).toHaveLength(firstTrack.puzzleIds.length)
    expect(list.map(entry => entry.id)).toEqual(firstTrack.puzzleIds)
    expect(list[0].position).toBe(`1 / ${firstTrack.puzzleIds.length}`)
    expect(list.at(-1).position).toBe(`${firstTrack.puzzleIds.length} / ${firstTrack.puzzleIds.length}`)
  })

  it('getTrackPuzzleList returns safe empty value for unknown track', () => {
    expect(getTrackPuzzleList('unknown-track', [])).toEqual([])
  })

  it('getTrackLaunchPuzzleId prefers active puzzle when active belongs to selected track', () => {
    const launchId = getTrackLaunchPuzzleId({
      trackId: 'puzzle-master',
      solvedIds: [],
      activePuzzleId: 'knight-relay',
    })

    expect(launchId).toBe('knight-relay')
  })

  it('getTrackLaunchPuzzleId falls back to first unsolved puzzle when active is outside track', () => {
    const launchId = getTrackLaunchPuzzleId({
      trackId: 'puzzle-master',
      solvedIds: ['knight-relay'],
      activePuzzleId: 'rook-gauntl',
    })

    expect(launchId).toBe('crown-the-ro')
  })

  it('getTrackLaunchPuzzleId falls back to first puzzle when track is fully solved', () => {
    const track = getTracks().find(entry => entry.id === 'puzzle-master')
    const launchId = getTrackLaunchPuzzleId({
      trackId: 'puzzle-master',
      solvedIds: [...track.puzzleIds],
      activePuzzleId: null,
    })

    expect(launchId).toBe(track.puzzleIds[0])
  })

  it('getTrackLaunchPuzzleId returns null for unknown or empty tracks', () => {
    expect(getTrackLaunchPuzzleId({ trackId: 'unknown', solvedIds: [], activePuzzleId: null })).toBeNull()
    expect(getTrackLaunchPuzzleId({ trackId: 'any', solvedIds: [], activePuzzleId: null }, [{
      id: 'any', title: 'Any', subtitle: 'Any', puzzleIds: [],
    }])).toBeNull()
  })

  it('getTracks keeps optional mode metadata and ignores unknown mode values', () => {
    const realPuzzleId = catalogue[0].id
    const tracks = getTracks([
      {
        id: 'alpha',
        title: 'Alpha',
        subtitle: 'A',
        puzzleIds: [realPuzzleId],
        modes: { random: { enabled: true }, guided: { enabled: true }, tutorial: { enabled: false }, unknown: { enabled: true } },
      },
    ])

    expect(tracks).toEqual([
      {
        id: 'alpha',
        title: 'Alpha',
        subtitle: 'A',
        puzzleIds: [realPuzzleId],
        modes: {
          random: { enabled: true },
          guided: { enabled: true },
          tutorial: { enabled: false },
        },
      },
    ])
  })

  it('track helpers use integrity-safe filtering for malformed references', () => {
    const playableId = catalogue[0].id
    const listTracks = [
      { id: 'alpha', title: 'Alpha', puzzleIds: ['p1'] },
      { id: 'beta', title: 'Beta', puzzleIds: ['p1', 'p2'] },
    ]
    const launchTracks = [{ id: 'alpha', title: 'Alpha', puzzleIds: [playableId, 'missing'] }]

    const list = getTrackPuzzleList('beta', ['p1'], listTracks, mockCatalogue)
    const launch = getTrackLaunchPuzzleId({ trackId: 'alpha', solvedIds: [], activePuzzleId: null }, launchTracks)

    expect(list.map(entry => entry.id)).toEqual(['p2'])
    expect(launch).toBe(playableId)
  })

  it('track helpers stay pure/local and never call fetch', () => {
    const fetchSpy = globalThis.fetch ? vi.spyOn(globalThis, 'fetch') : null

    getTracks()
    getTrackPuzzleList('unknown-track', [])
    getTrackLaunchPuzzleId({ trackId: 'unknown-track', solvedIds: [], activePuzzleId: null })

    if (fetchSpy) {
      expect(fetchSpy).not.toHaveBeenCalled()
      fetchSpy.mockRestore()
    }
  })

  it('resolveLandingContinueAction falls back from stale active puzzle to first unsolved in last track', () => {
    const action = resolveLandingContinueAction({
      lastTrackId: 'puzzle-master',
      solvedIds: ['knight-relay'],
      activePuzzleId: 'stale-id',
    })

    expect(action).toEqual({
      kind: 'play',
      trackId: 'puzzle-master',
      puzzleId: 'crown-the-ro',
    })
  })

  it('resolveLandingContinueAction routes to track browser when no launchable puzzle exists', () => {
    const action = resolveLandingContinueAction({
      lastTrackId: 'unknown-track',
      solvedIds: [],
      activePuzzleId: 'stale-id',
    }, [{ id: 'empty', title: 'Empty', puzzleIds: [] }])

    expect(action).toEqual({ kind: 'tracks' })
  })

  it('getTracks exposes a dedicated tutorial track with launchable puzzles', () => {
    const tracks = getTracks()
    const tutorial = tracks.find(track => track.id === 'tutorial')

    expect(tutorial).toBeDefined()
    expect(Array.isArray(tutorial?.puzzleIds)).toBe(true)
    expect(tutorial?.puzzleIds.length).toBeGreaterThan(0)
  })
})

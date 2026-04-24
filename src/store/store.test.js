// src/store/store.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  loadStore,
  saveProgress,
  saveActiveState,
  clearActiveState,
  flushSync,
  saveTutorialOnboarding,
} from './store.js'

// --- localStorage mock setup ---
let _storage = {}
vi.stubGlobal('localStorage', {
  getItem: (k) => _storage[k] ?? null,
  setItem: (k, v) => { _storage[k] = v },
  removeItem: (k) => { delete _storage[k] },
})

beforeEach(() => {
  _storage = {}
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// --- Helper: build a minimal board Map ---
function makeBoard(entries) {
  return new Map(entries)
}

const VALID_ID_A = 'knight-relay'
const VALID_ID_B = 'crown-the-ro'

// ─── Group: loadStore ────────────────────────────────────────────────────────

describe('loadStore', () => {
  it('returns default when localStorage is empty', () => {
    const store = loadStore()
    expect(store).toEqual({
      schemaVersion: 1,
      solvedIds: [],
      solvedMoveCounts: {},
      activeState: null,
      tutorialDismissed: false,
      tutorialCompleted: false,
    })
  })

  it('returns parsed data when key exists and schemaVersion matches', () => {
    const data = { schemaVersion: 1, solvedIds: [VALID_ID_A, VALID_ID_B], activeState: null }
    _storage['xess_v1'] = JSON.stringify(data)
    const store = loadStore()
    expect(store.schemaVersion).toBe(1)
    expect(store.solvedIds).toEqual([VALID_ID_A, VALID_ID_B])
  })

  it('returns default when schemaVersion is wrong (stored version 99)', () => {
    const data = { schemaVersion: 99, solvedIds: ['p1'], activeState: null }
    _storage['xess_v1'] = JSON.stringify(data)
    const store = loadStore()
    expect(store).toEqual({
      schemaVersion: 1,
      solvedIds: [],
      solvedMoveCounts: {},
      activeState: null,
      tutorialDismissed: false,
      tutorialCompleted: false,
    })
  })

  it('returns default on malformed JSON', () => {
    _storage['xess_v1'] = 'not-json'
    const store = loadStore()
    expect(store).toEqual({
      schemaVersion: 1,
      solvedIds: [],
      solvedMoveCounts: {},
      activeState: null,
      tutorialDismissed: false,
      tutorialCompleted: false,
    })
  })

  it('retains valid solved IDs and removes stale solved IDs', () => {
    const data = {
      schemaVersion: 1,
      solvedIds: [VALID_ID_A, 'stale-id', VALID_ID_B, 'stale-id'],
      activeState: null,
    }

    _storage['xess_v1'] = JSON.stringify(data)
    const store = loadStore()

    expect(store.solvedIds).toEqual([VALID_ID_A, VALID_ID_B])
  })

  it('drops stale activeState puzzleId and keeps valid activeState', () => {
    const stale = {
      schemaVersion: 1,
      solvedIds: [],
      activeState: {
        puzzleId: 'stale-id',
        boardEntries: [['0,0', { piece: null, isGoal: false }]],
        undoEntries: [],
      },
    }
    _storage['xess_v1'] = JSON.stringify(stale)
    expect(loadStore().activeState).toBeNull()

    const valid = {
      schemaVersion: 1,
      solvedIds: [],
      activeState: {
        puzzleId: VALID_ID_A,
        boardEntries: [['0,0', { piece: null, isGoal: false }]],
        undoEntries: [],
      },
    }
    _storage['xess_v1'] = JSON.stringify(valid)
    expect(loadStore().activeState?.puzzleId).toBe(VALID_ID_A)
  })

  it('sanitizes mixed malformed payloads to playable default shape without throwing', () => {
    _storage['xess_v1'] = JSON.stringify({
      schemaVersion: 1,
      solvedIds: [null, {}, 42, VALID_ID_A, 'stale-id'],
      activeState: {
        puzzleId: null,
        boardEntries: 'nope',
        undoEntries: {},
      },
    })

    expect(() => loadStore()).not.toThrow()
    expect(loadStore()).toEqual({
      schemaVersion: 1,
      solvedIds: [VALID_ID_A],
      solvedMoveCounts: {},
      activeState: null,
      tutorialDismissed: false,
      tutorialCompleted: false,
    })
  })

  it('sanitizes tutorial onboarding flags to strict booleans', () => {
    _storage['xess_v1'] = JSON.stringify({
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
      tutorialDismissed: 'yes',
      tutorialCompleted: 1,
    })

    expect(loadStore()).toMatchObject({
      tutorialDismissed: false,
      tutorialCompleted: false,
    })

    _storage['xess_v1'] = JSON.stringify({
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
      tutorialDismissed: true,
      tutorialCompleted: true,
    })

    expect(loadStore()).toMatchObject({
      tutorialDismissed: true,
      tutorialCompleted: true,
    })
  })
})

// ─── Group: saveProgress ─────────────────────────────────────────────────────

describe('saveProgress', () => {
  it('adds solved IDs and loadStore reflects them', () => {
    saveProgress([VALID_ID_A, VALID_ID_B])
    const store = loadStore()
    expect(store.solvedIds).toContain(VALID_ID_A)
    expect(store.solvedIds).toContain(VALID_ID_B)
  })

  it('deduplicates duplicate IDs', () => {
    saveProgress([VALID_ID_A, VALID_ID_A, VALID_ID_B])
    const store = loadStore()
    const count = store.solvedIds.filter(id => id === VALID_ID_A).length
    expect(count).toBe(1)
  })

  it('persists solved move-count metadata per puzzle across reload', () => {
    saveProgress([VALID_ID_A, VALID_ID_B], { [VALID_ID_A]: 7, [VALID_ID_B]: 12 })
    const store = loadStore()
    expect(store.solvedMoveCounts).toEqual({ [VALID_ID_A]: 7, [VALID_ID_B]: 12 })
  })

  it('sanitizes malformed solved metadata without dropping valid solved IDs', () => {
    _storage['xess_v1'] = JSON.stringify({
      schemaVersion: 1,
      solvedIds: [VALID_ID_A, 'stale-id'],
      solvedMoveCounts: { [VALID_ID_A]: 'bad', 'stale-id': 9, [VALID_ID_B]: 3 },
      activeState: null,
    })

    const store = loadStore()
    expect(store.solvedIds).toEqual([VALID_ID_A])
    expect(store.solvedMoveCounts).toEqual({ [VALID_ID_B]: 3 })
  })

  it('persists tutorial onboarding patch values without resetting unspecified flags', () => {
    saveTutorialOnboarding({ tutorialDismissed: true })
    expect(loadStore()).toMatchObject({ tutorialDismissed: true, tutorialCompleted: false })

    saveTutorialOnboarding({ tutorialCompleted: true })
    expect(loadStore()).toMatchObject({ tutorialDismissed: true, tutorialCompleted: true })
  })
})

// ─── Group: saveActiveState / round-trip ─────────────────────────────────────

describe('saveActiveState / round-trip', () => {
  it('after advancing timers by 300ms, loadStore returns activeState with correct puzzleId', () => {
    const board = makeBoard([['0,0', { piece: { type: 'p', color: 'white' }, isGoal: false }]])
    saveActiveState(VALID_ID_A, board, [])
    vi.advanceTimersByTime(300)
    const store = loadStore()
    expect(store.activeState).not.toBeNull()
    expect(store.activeState.puzzleId).toBe(VALID_ID_A)
  })

  it('board Map entries survive serialize/deserialize round-trip (3 cells with piece and isGoal)', () => {
    const board = makeBoard([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: null, isGoal: true }],
      ['2,0', { piece: { type: 'n', color: 'black' }, isGoal: false }],
    ])
    saveActiveState(VALID_ID_A, board, [])
    vi.advanceTimersByTime(300)
    const store = loadStore()
    const rehydrated = new Map(store.activeState.boardEntries)
    expect(rehydrated.get('0,0')).toEqual({ piece: { type: 'r', color: 'white' }, isGoal: false })
    expect(rehydrated.get('1,0')).toEqual({ piece: null, isGoal: true })
    expect(rehydrated.get('2,0')).toEqual({ piece: { type: 'n', color: 'black' }, isGoal: false })
  })

  it('undoStack array of board snapshots survives round-trip (2 snapshots, 2 cells each)', () => {
    const board = makeBoard([['0,0', { piece: { type: 'p', color: 'white' }, isGoal: false }]])
    const snap1 = makeBoard([
      ['0,0', { piece: { type: 'p', color: 'white' }, isGoal: false }],
      ['1,0', { piece: null, isGoal: false }],
    ])
    const snap2 = makeBoard([
      ['0,0', { piece: null, isGoal: false }],
      ['1,0', { piece: { type: 'p', color: 'white' }, isGoal: false }],
    ])
    saveActiveState(VALID_ID_A, board, [snap1, snap2])
    vi.advanceTimersByTime(300)
    const store = loadStore()
    expect(store.activeState.undoEntries).toHaveLength(2)
    const r1 = new Map(store.activeState.undoEntries[0])
    const r2 = new Map(store.activeState.undoEntries[1])
    expect(r1.get('0,0')).toEqual({ piece: { type: 'p', color: 'white' }, isGoal: false })
    expect(r2.get('1,0')).toEqual({ piece: { type: 'p', color: 'white' }, isGoal: false })
  })

  it('rapid calls (3 saveActiveState in quick succession) result in exactly 1 localStorage.setItem call after 300ms', () => {
    const spy = vi.spyOn(localStorage, 'setItem')
    const board = makeBoard([['0,0', { piece: null, isGoal: false }]])
    // Count only activeState writes (saveProgress also calls setItem)
    const setItemCallsBefore = spy.mock.calls.length
    saveActiveState(VALID_ID_A, board, [])
    saveActiveState(VALID_ID_A, board, [])
    saveActiveState(VALID_ID_A, board, [])
    vi.advanceTimersByTime(300)
    const setItemCallsAfter = spy.mock.calls.length
    // Exactly 1 write for all 3 rapid calls
    expect(setItemCallsAfter - setItemCallsBefore).toBe(1)
    spy.mockRestore()
  })

  it('sanitized load keeps valid tracking fields and drops malformed tracking payloads', () => {
    _storage['xess_v1'] = JSON.stringify({
      schemaVersion: 1,
      solvedIds: [],
      activeState: {
        puzzleId: VALID_ID_A,
        boardEntries: [['0,0', { piece: null, isGoal: false }]],
        undoEntries: [],
        moveEvents: [{ from: '0,0', to: '0,1', captured: null }],
        redoEntries: [[['0,0', { piece: null, isGoal: false }]]],
        moveCount: 1,
      },
    })

    expect(loadStore().activeState).toMatchObject({
      moveEvents: [{ from: '0,0', to: '0,1', captured: null }],
      redoEntries: [[['0,0', { piece: null, isGoal: false }]]],
      moveCount: 1,
    })

    _storage['xess_v1'] = JSON.stringify({
      schemaVersion: 1,
      solvedIds: [],
      activeState: {
        puzzleId: VALID_ID_A,
        boardEntries: [['0,0', { piece: null, isGoal: false }]],
        undoEntries: [],
        moveEvents: 'bad',
        redoEntries: {},
        moveCount: -1,
      },
    })

    expect(loadStore().activeState).toMatchObject({
      moveEvents: [],
      redoEntries: [],
      moveCount: 0,
    })
  })

  it('save/load round-trip preserves active-state tracking fields without type drift', () => {
    const board = makeBoard([['0,0', { piece: { type: 'p', color: 'white' }, isGoal: false }]])
    const undo = [makeBoard([['0,0', { piece: null, isGoal: false }]])]
    const moveEvents = [{ from: '0,0', to: '0,1', captured: null }]
    const redoEntries = [
      [[
        '0,0',
        { piece: { type: 'p', color: 'white' }, isGoal: false },
      ]],
    ]

    saveActiveState(VALID_ID_A, board, undo, { moveEvents, redoEntries, moveCount: 1 })
    vi.advanceTimersByTime(300)

    const state = loadStore().activeState
    expect(state.moveEvents).toEqual(moveEvents)
    expect(state.redoEntries).toEqual(redoEntries)
    expect(state.moveCount).toBe(1)
  })

  it('legacy payloads without tracking fields load with playable tracking defaults', () => {
    _storage['xess_v1'] = JSON.stringify({
      schemaVersion: 1,
      solvedIds: [VALID_ID_A],
      activeState: {
        puzzleId: VALID_ID_A,
        boardEntries: [['0,0', { piece: null, isGoal: false }]],
        undoEntries: [],
      },
    })

    expect(loadStore().activeState).toMatchObject({
      puzzleId: VALID_ID_A,
      moveEvents: [],
      redoEntries: [],
      moveCount: 0,
    })
  })
})

// ─── Group: flushSync ─────────────────────────────────────────────────────────

describe('flushSync', () => {
  it('flushSync() before timer fires writes to localStorage immediately', () => {
    const board = makeBoard([['0,0', { piece: null, isGoal: false }]])
    saveActiveState(VALID_ID_A, board, [])
    // Timer has NOT fired yet
    flushSync()
    const store = loadStore()
    expect(store.activeState).not.toBeNull()
    expect(store.activeState.puzzleId).toBe(VALID_ID_A)
  })

  it('after flushSync(), loadStore returns the flushed activeState', () => {
    const board = makeBoard([['1,1', { piece: { type: 'q', color: 'white' }, isGoal: true }]])
    saveActiveState(VALID_ID_A, board, [])
    flushSync()
    const store = loadStore()
    const rehydrated = new Map(store.activeState.boardEntries)
    expect(rehydrated.get('1,1')).toEqual({ piece: { type: 'q', color: 'white' }, isGoal: true })
  })

  it('flushSync() with no pending write is a no-op (no throw)', () => {
    expect(() => flushSync()).not.toThrow()
  })
})

// ─── Group: clearActiveState ─────────────────────────────────────────────────

describe('clearActiveState', () => {
  it('after saveActiveState and flushSync, clearActiveState sets activeState to null in storage', () => {
    const board = makeBoard([['0,0', { piece: null, isGoal: false }]])
    saveActiveState(VALID_ID_A, board, [])
    flushSync()
    clearActiveState()
    const store = loadStore()
    expect(store.activeState).toBeNull()
  })
})

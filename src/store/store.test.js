// src/store/store.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadStore, saveProgress, saveActiveState, clearActiveState, flushSync } from './store.js'

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

// ─── Group: loadStore ────────────────────────────────────────────────────────

describe('loadStore', () => {
  it('returns default when localStorage is empty', () => {
    const store = loadStore()
    expect(store).toEqual({
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
    })
  })

  it('returns parsed data when key exists and schemaVersion matches', () => {
    const data = { schemaVersion: 1, solvedIds: ['p1', 'p2'], activeState: null }
    _storage['xess_v1'] = JSON.stringify(data)
    const store = loadStore()
    expect(store.schemaVersion).toBe(1)
    expect(store.solvedIds).toEqual(['p1', 'p2'])
  })

  it('returns default when schemaVersion is wrong (stored version 99)', () => {
    const data = { schemaVersion: 99, solvedIds: ['p1'], activeState: null }
    _storage['xess_v1'] = JSON.stringify(data)
    const store = loadStore()
    expect(store).toEqual({
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
    })
  })

  it('returns default on malformed JSON', () => {
    _storage['xess_v1'] = 'not-json'
    const store = loadStore()
    expect(store).toEqual({
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
    })
  })
})

// ─── Group: saveProgress ─────────────────────────────────────────────────────

describe('saveProgress', () => {
  it('adds solved IDs and loadStore reflects them', () => {
    saveProgress(['puzzle-1', 'puzzle-2'])
    const store = loadStore()
    expect(store.solvedIds).toContain('puzzle-1')
    expect(store.solvedIds).toContain('puzzle-2')
  })

  it('deduplicates duplicate IDs', () => {
    saveProgress(['puzzle-1', 'puzzle-1', 'puzzle-2'])
    const store = loadStore()
    const count = store.solvedIds.filter(id => id === 'puzzle-1').length
    expect(count).toBe(1)
  })
})

// ─── Group: saveActiveState / round-trip ─────────────────────────────────────

describe('saveActiveState / round-trip', () => {
  it('after advancing timers by 300ms, loadStore returns activeState with correct puzzleId', () => {
    const board = makeBoard([['0,0', { piece: { type: 'p', color: 'white' }, isGoal: false }]])
    saveActiveState('puzzle-abc', board, [])
    vi.advanceTimersByTime(300)
    const store = loadStore()
    expect(store.activeState).not.toBeNull()
    expect(store.activeState.puzzleId).toBe('puzzle-abc')
  })

  it('board Map entries survive serialize/deserialize round-trip (3 cells with piece and isGoal)', () => {
    const board = makeBoard([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: null, isGoal: true }],
      ['2,0', { piece: { type: 'n', color: 'black' }, isGoal: false }],
    ])
    saveActiveState('puzzle-rt', board, [])
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
    saveActiveState('puzzle-undo', board, [snap1, snap2])
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
    saveActiveState('puzzle-debounce', board, [])
    saveActiveState('puzzle-debounce', board, [])
    saveActiveState('puzzle-debounce', board, [])
    vi.advanceTimersByTime(300)
    const setItemCallsAfter = spy.mock.calls.length
    // Exactly 1 write for all 3 rapid calls
    expect(setItemCallsAfter - setItemCallsBefore).toBe(1)
    spy.mockRestore()
  })
})

// ─── Group: flushSync ─────────────────────────────────────────────────────────

describe('flushSync', () => {
  it('flushSync() before timer fires writes to localStorage immediately', () => {
    const board = makeBoard([['0,0', { piece: null, isGoal: false }]])
    saveActiveState('puzzle-flush', board, [])
    // Timer has NOT fired yet
    flushSync()
    const store = loadStore()
    expect(store.activeState).not.toBeNull()
    expect(store.activeState.puzzleId).toBe('puzzle-flush')
  })

  it('after flushSync(), loadStore returns the flushed activeState', () => {
    const board = makeBoard([['1,1', { piece: { type: 'q', color: 'white' }, isGoal: true }]])
    saveActiveState('puzzle-flushed', board, [])
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
    saveActiveState('puzzle-clear', board, [])
    flushSync()
    clearActiveState()
    const store = loadStore()
    expect(store.activeState).toBeNull()
  })
})

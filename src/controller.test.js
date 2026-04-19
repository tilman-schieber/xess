import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createController } from './controller.js'
import catalogue from './puzzles/catalogue.js'

vi.mock('./store/store.js', () => ({
  loadStore: vi.fn(() => ({ schemaVersion: 1, solvedIds: [], activeState: null })),
  saveProgress: vi.fn(),
  saveActiveState: vi.fn(),
  clearActiveState: vi.fn(),
  flushSync: vi.fn(),
}))

vi.mock('./puzzles/nav.js', () => ({
  isUnlocked: vi.fn(() => true),
  getPuzzlePosition: vi.fn(() => '1 / 2'),
  getPuzzleList: vi.fn(() => []),
  getTrackLaunchPuzzleId: vi.fn(() => null),
}))

import { loadStore, saveProgress, saveActiveState, clearActiveState } from './store/store.js'
import { isUnlocked, getPuzzlePosition, getPuzzleList, getTrackLaunchPuzzleId } from './puzzles/nav.js'

function getRawPuzzle(id) {
  return catalogue.find((entry) => entry.id === id)
}

beforeEach(() => {
  vi.clearAllMocks()
  loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: [], activeState: null })
})

describe('loadPuzzle', () => {
  it('loads parsed puzzle state with board map and defaults', () => {
    const ctrl = createController()
    const result = ctrl.loadPuzzle('g3h4i5j6')

    expect(result.puzzle.id).toBe('g3h4i5j6')
    expect(result.board).toBeInstanceOf(Map)
    expect(result.undoStack).toEqual([])
    expect(result.won).toBe(false)
  })

  it('uses canonical case mapping from loader (lowercase piece is black)', () => {
    const ctrl = createController()
    const { board } = ctrl.loadPuzzle('xk3m9pq2')
    expect(board.get('1,1').piece).toEqual({ type: 'p', color: 'black' })
  })
})

describe('selectPiece policy', () => {
  it('allows default white control and rejects black piece selection', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('g3h4i5j6')

    expect(ctrl.selectPiece('0,0').length).toBeGreaterThan(0)
    expect(ctrl.selectPiece('1,2')).toEqual([])
  })

  it('respects puzzle-level controllableColors override', () => {
    const raw = getRawPuzzle('g3h4i5j6')
    const prev = raw.controllableColors
    raw.controllableColors = ['black']

    try {
      const ctrl = createController()
      ctrl.loadPuzzle('g3h4i5j6')
      expect(ctrl.selectPiece('0,0')).toEqual([])
      expect(ctrl.selectPiece('1,2').length).toBeGreaterThan(0)
    } finally {
      if (prev === undefined) delete raw.controllableColors
      else raw.controllableColors = prev
    }
  })
})

describe('makeMove policy and invariants', () => {
  it('legal non-winning move mutates board and persists active state', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('g3h4i5j6')

    const result = ctrl.makeMove('0,0', '2,1')
    expect(result.error).toBeUndefined()
    expect(result.won).toBe(false)
    expect(result.board.get('0,0').piece).toBeNull()
    expect(saveActiveState).toHaveBeenCalledTimes(1)
    expect(saveProgress).not.toHaveBeenCalled()
    expect(clearActiveState).not.toHaveBeenCalled()
  })

  it('disallowed capture by capturableByColor policy is rejected as illegal_move', () => {
    const raw = getRawPuzzle('g3h4i5j6')
    const prev = raw.capturableByColor
    raw.capturableByColor = { white: [], black: ['white'] }

    try {
      const ctrl = createController()
      ctrl.loadPuzzle('g3h4i5j6')

      const result = ctrl.makeMove('0,0', '1,2')
      expect(result).toEqual({ error: 'illegal_move' })
      expect(saveActiveState).not.toHaveBeenCalled()
      expect(saveProgress).not.toHaveBeenCalled()
      expect(clearActiveState).not.toHaveBeenCalled()
    } finally {
      if (prev === undefined) delete raw.capturableByColor
      else raw.capturableByColor = prev
    }
  })

  it('selectPiece does not surface non-capturable destinations', () => {
    const raw = getRawPuzzle('g3h4i5j6')
    const prev = raw.capturableByColor
    raw.capturableByColor = { white: [], black: ['white'] }

    try {
      const ctrl = createController()
      ctrl.loadPuzzle('g3h4i5j6')
      const legal = ctrl.selectPiece('0,0')
      expect(legal).not.toContain('1,2')
    } finally {
      if (prev === undefined) delete raw.capturableByColor
      else raw.capturableByColor = prev
    }
  })

  it('winning capture writes solved progress and clears active state', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('g3h4i5j6')

    const result = ctrl.makeMove('0,0', '1,2')
    expect(result.won).toBe(true)
    expect(saveProgress).toHaveBeenCalledWith(expect.arrayContaining(['g3h4i5j6']))
    expect(clearActiveState).toHaveBeenCalledTimes(1)
    expect(saveActiveState).not.toHaveBeenCalled()
  })

  it('rejected moves are fully non-mutating (board, undo stack, persistence)', () => {
    const ctrl = createController()
    const { board: initialBoard } = ctrl.loadPuzzle('g3h4i5j6')

    const beforeSelection = ctrl.selectPiece('0,0')
    expect(beforeSelection.length).toBeGreaterThan(0)

    const result = ctrl.makeMove('0,0', '9,9')
    expect(result).toEqual({ error: 'illegal_move' })

    const afterSelection = ctrl.selectPiece('0,0')
    expect(afterSelection).toEqual(beforeSelection)

    const undoState = ctrl.undo()
    expect(undoState.board).toBe(initialBoard)
    expect(undoState.undoStack).toEqual([])

    expect(saveActiveState).not.toHaveBeenCalled()
    expect(saveProgress).not.toHaveBeenCalled()
    expect(clearActiveState).not.toHaveBeenCalled()
  })
})

describe('undo/reset and nav delegation', () => {
  it('undo restores previous snapshot after one legal move', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('g3h4i5j6')
    ctrl.makeMove('0,0', '2,1')

    const restored = ctrl.undo()
    expect(restored.board.get('0,0').piece).toEqual({ type: 'n', color: 'white' })
    expect(restored.undoStack).toEqual([])
    expect(saveActiveState).toHaveBeenCalled()
  })

  it('reset clears active state and restores initial board', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('g3h4i5j6')
    ctrl.makeMove('0,0', '2,1')

    vi.clearAllMocks()
    const { board } = ctrl.reset()
    expect(board.get('0,0').piece).toEqual({ type: 'n', color: 'white' })
    expect(clearActiveState).toHaveBeenCalledTimes(1)
  })

  it('delegates navigation helpers with current solved state', () => {
    loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: ['xk3m9pq2'], activeState: null })
    getPuzzleList.mockReturnValue([{ id: 'xk3m9pq2', status: 'solved' }])

    const ctrl = createController()
    ctrl.loadPuzzle('g3h4i5j6')

    expect(ctrl.getPuzzleList()).toEqual([{ id: 'xk3m9pq2', status: 'solved' }])
    expect(getPuzzleList).toHaveBeenCalledWith(['xk3m9pq2'])

    ctrl.getPuzzlePosition('g3h4i5j6')
    expect(getPuzzlePosition).toHaveBeenCalledWith('g3h4i5j6')

    ctrl.isUnlocked('g3h4i5j6')
    expect(isUnlocked).toHaveBeenCalledWith('g3h4i5j6', ['xk3m9pq2'])
  })

  it('getTrackLaunchPuzzleId passes sanitized solved and active IDs', () => {
    loadStore.mockReturnValue({
      schemaVersion: 1,
      solvedIds: ['xk3m9pq2', 'stale-id'],
      activeState: { puzzleId: 'g3h4i5j6', boardEntries: [], undoEntries: [] },
    })

    const ctrl = createController()
    ctrl.getTrackLaunchPuzzleId('foundations')

    expect(getTrackLaunchPuzzleId).toHaveBeenCalledWith({
      trackId: 'foundations',
      solvedIds: ['xk3m9pq2'],
      activePuzzleId: 'g3h4i5j6',
    })
  })
})

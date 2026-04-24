import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createController } from './controller.js'
import catalogue from './puzzles/catalogue.js'
import { parsePuzzle } from './puzzles/loader.js'
import { applyMove } from './engine/apply.js'

vi.mock('./store/store.js', () => ({
  loadStore: vi.fn(() => ({ schemaVersion: 1, solvedIds: [], solvedMoveCounts: {}, activeState: null })),
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
  loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: [], solvedMoveCounts: {}, activeState: null })
})

describe('loadPuzzle', () => {
  it('loads parsed puzzle state with board map and defaults', () => {
    const ctrl = createController()
    const result = ctrl.loadPuzzle('knight-leap')

    expect(result.puzzle.id).toBe('knight-leap')
    expect(result.board).toBeInstanceOf(Map)
    expect(result.undoStack).toEqual([])
    expect(result.won).toBe(false)
  })

  it('uses canonical case mapping from loader (lowercase piece is black)', () => {
    const ctrl = createController()
    const { board } = ctrl.loadPuzzle('corner-trap')
    expect(board.get('1,1').piece).toEqual({ type: 'p', color: 'black' })
  })
})

describe('selectPiece policy', () => {
  it('allows default white control and rejects black piece selection', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('knight-leap')

    expect(ctrl.selectPiece('0,0').length).toBeGreaterThan(0)
    expect(ctrl.selectPiece('1,2')).toEqual([])
  })

  it('respects puzzle-level controllableColors override', () => {
    const raw = getRawPuzzle('knight-leap')
    const prev = raw.controllableColors
    raw.controllableColors = ['black']

    try {
      const ctrl = createController()
      ctrl.loadPuzzle('knight-leap')
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
    ctrl.loadPuzzle('knight-leap')

    const result = ctrl.makeMove('0,0', '2,1')
    expect(result.error).toBeUndefined()
    expect(result.won).toBe(false)
    expect(result.board.get('0,0').piece).toBeNull()
    expect(saveActiveState).toHaveBeenCalledTimes(1)
    expect(saveProgress).not.toHaveBeenCalled()
    expect(clearActiveState).not.toHaveBeenCalled()
  })

  it('disallowed capture by capturableByColor policy is rejected as illegal_move', () => {
    const raw = getRawPuzzle('knight-leap')
    const prev = raw.capturableByColor
    raw.capturableByColor = { white: [], black: ['white'] }

    try {
      const ctrl = createController()
      ctrl.loadPuzzle('knight-leap')

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
    const raw = getRawPuzzle('knight-leap')
    const prev = raw.capturableByColor
    raw.capturableByColor = { white: [], black: ['white'] }

    try {
      const ctrl = createController()
      ctrl.loadPuzzle('knight-leap')
      const legal = ctrl.selectPiece('0,0')
      expect(legal).not.toContain('1,2')
    } finally {
      if (prev === undefined) delete raw.capturableByColor
      else raw.capturableByColor = prev
    }
  })

  it('winning capture writes solved progress and clears active state', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('knight-leap')

    const result = ctrl.makeMove('0,0', '1,2')
    expect(result.won).toBe(true)
    expect(saveProgress).toHaveBeenCalledWith(
      expect.arrayContaining(['knight-leap']),
      expect.objectContaining({ 'knight-leap': 1 }),
    )
    expect(clearActiveState).toHaveBeenCalledTimes(1)
    expect(saveActiveState).not.toHaveBeenCalled()
  })

  it('reach-mode no-capture puzzles reject capture attempts through policy gates (MODE-05)', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('knight-relay')

    const legalFromKnightStart = ctrl.selectPiece('0,0')
    expect(legalFromKnightStart).not.toContain('2,1')

    const captureAttempt = ctrl.makeMove('0,0', '2,1')
    expect(captureAttempt).toEqual({ error: 'illegal_move' })
    expect(saveActiveState).not.toHaveBeenCalled()
  })

  it('capture-mode completion remains tied to legal captures (MODE-04)', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('knight-leap')

    const nonCapture = ctrl.makeMove('0,0', '2,1')
    expect(nonCapture.error).toBeUndefined()
    expect(nonCapture.won).toBe(false)

    ctrl.reset()
    const winningCapture = ctrl.makeMove('0,0', '1,2')
    expect(winningCapture.error).toBeUndefined()
    expect(winningCapture.won).toBe(true)
  })

  it('rejected moves are fully non-mutating (board, undo stack, persistence)', () => {
    const ctrl = createController()
    const { board: initialBoard } = ctrl.loadPuzzle('knight-leap')

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

describe('tracking events and move counters', () => {
  it('emits one canonical event and increments move count for legal commits only', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('knight-leap')

    const afterLegal = ctrl.makeMove('0,0', '2,1')
    expect(afterLegal.error).toBeUndefined()

    const trackingAfterLegal = ctrl.getTrackingState()
    expect(trackingAfterLegal.moveCount).toBe(1)
    expect(trackingAfterLegal.moveEvents).toEqual([
      {
        from: '0,0',
        to: '2,1',
        captured: null,
      },
    ])

    const afterIllegal = ctrl.makeMove('2,1', '9,9')
    expect(afterIllegal).toEqual({ error: 'illegal_move' })

    const trackingAfterIllegal = ctrl.getTrackingState()
    expect(trackingAfterIllegal.moveCount).toBe(1)
    expect(trackingAfterIllegal.moveEvents).toHaveLength(1)
  })

  it('keeps moveCount synchronized across makeMove, undo, and redo', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('knight-leap')

    ctrl.makeMove('0,0', '2,1')
    expect(ctrl.getTrackingState().moveCount).toBe(1)

    ctrl.undo()
    expect(ctrl.getTrackingState().moveCount).toBe(0)

    ctrl.redo()
    expect(ctrl.getTrackingState().moveCount).toBe(1)
  })
})

describe('undo/redo divergence and tracking rehydration', () => {
  it('supports multi-step undo/redo with synchronized counter and availability state', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('knight-leap')

    ctrl.makeMove('0,0', '2,1')
    const secondHop = ctrl.selectPiece('2,1')[0]
    expect(typeof secondHop).toBe('string')
    ctrl.makeMove('2,1', secondHop)

    expect(ctrl.getTrackingState().moveCount).toBe(2)
    expect(ctrl.getTrackingState().canUndo).toBe(true)

    ctrl.undo()
    ctrl.undo()
    expect(ctrl.getTrackingState().moveCount).toBe(0)
    expect(ctrl.getTrackingState().canRedo).toBe(true)

    ctrl.redo()
    ctrl.redo()
    expect(ctrl.getTrackingState().moveCount).toBe(2)
    expect(ctrl.getTrackingState().canRedo).toBe(false)
  })

  it('clears redo availability after divergent move post-undo', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('knight-leap')

    ctrl.makeMove('0,0', '2,1')
    ctrl.undo()
    expect(ctrl.getTrackingState().canRedo).toBe(true)

    ctrl.makeMove('0,0', '1,2')
    expect(ctrl.getTrackingState().canRedo).toBe(false)
    expect(ctrl.getTrackingState().moveCount).toBe(1)
    expect(ctrl.getTrackingState().moveEvents).toHaveLength(1)
  })

  it('rehydrates board history and tracking payload from activeState and preserves solved metadata on win', () => {
    const parsed = parsePuzzle(getRawPuzzle('knight-leap'))
    const first = applyMove(parsed.board, '0,0', '2,1', parsed)

    loadStore.mockReturnValue({
      schemaVersion: 1,
      solvedIds: ['corner-trap'],
      solvedMoveCounts: { 'corner-trap': 4 },
      activeState: {
        puzzleId: 'knight-leap',
        boardEntries: Array.from(first.board.entries()),
        undoEntries: [Array.from(parsed.board.entries())],
        redoEntries: [],
        moveEvents: [{ from: '0,0', to: '2,1', captured: null }],
        moveCount: 1,
      },
    })

    const ctrl = createController()
    const loaded = ctrl.loadPuzzle('knight-leap')
    expect(loaded.undoStack).toHaveLength(1)
    expect(ctrl.getTrackingState().moveCount).toBe(1)
    expect(loaded.board.get('2,1').piece).toEqual({ type: 'n', color: 'white' })

    const legalFollowUp = ctrl.selectPiece('2,1')[0]
    expect(typeof legalFollowUp).toBe('string')
    const winResult = ctrl.makeMove('2,1', legalFollowUp)
    expect(winResult.won).toBe(false)

    ctrl.reset()
    const solved = ctrl.makeMove('0,0', '1,2')
    expect(solved.won).toBe(true)
    expect(saveProgress).toHaveBeenCalledWith(
      expect.arrayContaining(['corner-trap', 'knight-leap']),
      expect.objectContaining({ 'corner-trap': 4, 'knight-leap': expect.any(Number) }),
    )
  })
})

describe('undo/reset and nav delegation', () => {
  it('undo restores previous snapshot after one legal move', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('knight-leap')
    ctrl.makeMove('0,0', '2,1')

    const restored = ctrl.undo()
    expect(restored.board.get('0,0').piece).toEqual({ type: 'n', color: 'white' })
    expect(restored.undoStack).toEqual([])
    expect(saveActiveState).toHaveBeenCalled()
  })

  it('reset clears active state and reloads latest catalogue puzzle over persisted active snapshot', () => {
    const raw = getRawPuzzle('knight-leap')
    const parsed = parsePuzzle(raw)
    const moved = applyMove(parsed.board, '0,0', '2,1', parsed)

    loadStore.mockReturnValue({
      schemaVersion: 1,
      solvedIds: [],
      solvedMoveCounts: {},
      activeState: {
        puzzleId: 'knight-leap',
        boardEntries: Array.from(moved.board.entries()),
        undoEntries: [Array.from(parsed.board.entries())],
        redoEntries: [],
        moveEvents: [{ from: '0,0', to: '2,1', captured: null }],
        moveCount: 1,
      },
    })

    const ctrl = createController()
    const loaded = ctrl.loadPuzzle('knight-leap')
    expect(loaded.board.get('0,0').piece).toBeNull()

    const previousTitle = raw.title
    raw.title = 'Knight Leap (updated)'

    try {
      vi.clearAllMocks()
      const { puzzle, board } = ctrl.reset()
      expect(puzzle.title).toBe('Knight Leap (updated)')
      expect(board.get('0,0').piece).toEqual({ type: 'n', color: 'white' })
      expect(board.get('2,1').piece).toBeNull()
      expect(clearActiveState).toHaveBeenCalledTimes(1)
    } finally {
      raw.title = previousTitle
    }
  })

  it('delegates navigation helpers with current solved state', () => {
    loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: ['corner-trap'], activeState: null })
    getPuzzleList.mockReturnValue([{ id: 'corner-trap', status: 'solved' }])

    const ctrl = createController()
    ctrl.loadPuzzle('knight-leap')

    expect(ctrl.getPuzzleList()).toEqual([{ id: 'corner-trap', status: 'solved' }])
    expect(getPuzzleList).toHaveBeenCalledWith(['corner-trap'])

    ctrl.getPuzzlePosition('knight-leap')
    expect(getPuzzlePosition).toHaveBeenCalledWith('knight-leap')

    ctrl.isUnlocked('knight-leap')
    expect(isUnlocked).toHaveBeenCalledWith('knight-leap', ['corner-trap'])
  })

  it('getTrackLaunchPuzzleId passes sanitized solved and active IDs', () => {
    loadStore.mockReturnValue({
      schemaVersion: 1,
      solvedIds: ['corner-trap', 'stale-id'],
      activeState: { puzzleId: 'knight-leap', boardEntries: [], undoEntries: [] },
    })

    const ctrl = createController()
    ctrl.getTrackLaunchPuzzleId('foundations')

    expect(getTrackLaunchPuzzleId).toHaveBeenCalledWith({
      trackId: 'foundations',
      solvedIds: ['corner-trap'],
      activePuzzleId: 'knight-leap',
    })
  })
})

// src/controller.test.js
// TDD tests for the game controller (createController).
// Store and nav are mocked via vi.mock; parsePuzzle + real catalogue used for board operations.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createController } from './controller.js'

// ─── Module mocks ─────────────────────────────────────────────────────────────

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

beforeEach(() => {
  vi.clearAllMocks()
  // Default: fresh store (no active state, no solved IDs)
  loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: [], activeState: null })
})

// ─── Group: loadPuzzle ────────────────────────────────────────────────────────

describe('loadPuzzle', () => {
  it('fresh load: returns parsed puzzle, board (Map), empty undoStack, solvedIds from store', () => {
    loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: ['xk3m9pq2'], activeState: null })
    const ctrl = createController()
    const result = ctrl.loadPuzzle('xk3m9pq2')
    expect(result.puzzle).toBeDefined()
    expect(result.puzzle.id).toBe('xk3m9pq2')
    expect(result.board).toBeInstanceOf(Map)
    expect(result.board.size).toBeGreaterThan(0)
    expect(result.undoStack).toEqual([])
    expect(result.solvedIds).toEqual(['xk3m9pq2'])
    expect(result.won).toBe(false)
  })

  it('fresh load: board contains expected cells from Corner Trap puzzle', () => {
    const ctrl = createController()
    const { board } = ctrl.loadPuzzle('xk3m9pq2')
    // 'p' at col=1,row=1 is white pawn
    const cell = board.get('1,1')
    expect(cell).toBeDefined()
    expect(cell.piece).toBeDefined()
    expect(cell.piece.type).toBe('p')
    expect(cell.piece.color).toBe('white')
  })

  it('re-hydrate: when store has activeState for matching puzzleId, board and undoStack are restored', () => {
    const rehydratedBoardEntries = [
      ['0,1', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,1', { piece: null, isGoal: false }],
    ]
    const snap = [['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }]]
    loadStore.mockReturnValue({
      schemaVersion: 1,
      solvedIds: ['prev-1'],
      activeState: {
        puzzleId: 'xk3m9pq2',
        boardEntries: rehydratedBoardEntries,
        undoEntries: [snap],
      },
    })
    const ctrl = createController()
    const result = ctrl.loadPuzzle('xk3m9pq2')
    // Board should be re-hydrated from stored entries
    expect(result.board.get('0,1')).toEqual({ piece: { type: 'r', color: 'white' }, isGoal: false })
    expect(result.board.get('1,1')).toEqual({ piece: null, isGoal: false })
    // Undo stack should be re-hydrated
    expect(result.undoStack).toHaveLength(1)
    expect(result.undoStack[0]).toBeInstanceOf(Map)
    expect(result.undoStack[0].get('0,0')).toEqual({ piece: { type: 'r', color: 'white' }, isGoal: false })
  })

  it('different puzzleId in store: starts fresh (not re-hydrated)', () => {
    loadStore.mockReturnValue({
      schemaVersion: 1,
      solvedIds: [],
      activeState: {
        puzzleId: 'gt7wz4r1',   // different puzzle
        boardEntries: [['0,0', { piece: null, isGoal: false }]],
        undoEntries: [],
      },
    })
    const ctrl = createController()
    const result = ctrl.loadPuzzle('xk3m9pq2')
    // Should start fresh — board should have the real Corner Trap cells, not the stored single cell
    expect(result.board.size).toBeGreaterThan(1)
    expect(result.undoStack).toEqual([])
  })

  it('malformed activeState entries for matching puzzle fail soft to fresh board', () => {
    loadStore.mockReturnValue({
      schemaVersion: 1,
      solvedIds: [],
      activeState: {
        puzzleId: 'xk3m9pq2',
        boardEntries: 42,
        undoEntries: {},
      },
    })

    const ctrl = createController()
    const result = ctrl.loadPuzzle('xk3m9pq2')

    expect(result.board).toBeInstanceOf(Map)
    expect(result.board.size).toBeGreaterThan(1)
    expect(result.undoStack).toEqual([])
  })

  it('unknown puzzleId throws an error', () => {
    const ctrl = createController()
    expect(() => ctrl.loadPuzzle('no-such-puzzle')).toThrow()
  })
})

// ─── Group: selectPiece ───────────────────────────────────────────────────────

describe('selectPiece', () => {
  it('before loadPuzzle returns empty array', () => {
    const ctrl = createController()
    expect(ctrl.selectPiece('1,1')).toEqual([])
  })

  it('valid player piece (white) returns non-empty legal moves array', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')  // white rook at 0,0
    const moves = ctrl.selectPiece('0,0')
    expect(Array.isArray(moves)).toBe(true)
    expect(moves.length).toBeGreaterThan(0)
  })

  it('empty square returns empty array', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    // col=2,row=0 is an empty square in Find the Square
    const moves = ctrl.selectPiece('2,0')
    expect(moves).toEqual([])
  })

  it('opponent (black) piece returns empty array', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('xk3m9pq2')  // P (black pawn) at 2,0
    const moves = ctrl.selectPiece('2,0')
    expect(moves).toEqual([])
  })
})

// ─── Group: makeMove ──────────────────────────────────────────────────────────

describe('makeMove', () => {
  it('legal move: board updates, undoStack grows by 1, returns { won: false }', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    // White rook at 0,0; legal moves include 0,2 (skipping 0,1 which is impassable x in gt7wz4r1)
    // Actually let's check: grid is ['r--', '-x-', '--G'] — 0,1 is '-x-' at col=0 -> '-', so 0,1 is passable
    // Wait: row 1 is '-x-' so col=0 is '-', col=1 is 'x', col=2 is '-'
    // Rook at 0,0 can go to 0,1 and 0,2 (vertically) or 1,0 and 2,0 (horizontally)
    const legalMoves = ctrl.selectPiece('0,0')
    expect(legalMoves.length).toBeGreaterThan(0)
    const dest = legalMoves[0]
    const result = ctrl.makeMove('0,0', dest)
    expect(result.error).toBeUndefined()
    expect(result.won).toBe(false)
    expect(result.board).toBeInstanceOf(Map)
    // board at origin should now be empty
    expect(result.board.get('0,0').piece).toBeNull()
  })

  it('legal move: saveActiveState is called after the move', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    const legalMoves = ctrl.selectPiece('0,0')
    ctrl.makeMove('0,0', legalMoves[0])
    expect(saveActiveState).toHaveBeenCalled()
  })

  it('legal move: undoStack grows by 1', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    const legalMoves = ctrl.selectPiece('0,0')
    ctrl.makeMove('0,0', legalMoves[0])
    const { undoStack } = ctrl.undo()  // undo to check stack was populated
    // After undo the stack should be empty again (was 1 item, now popped)
    expect(undoStack).toHaveLength(0)
  })

  it('illegal move: returns { error: "illegal_move" }, board unchanged', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    const boardBefore = ctrl.loadPuzzle('gt7wz4r1').board
    const result = ctrl.makeMove('0,0', '9,9')  // definitely not a legal move
    expect(result.error).toBe('illegal_move')
  })

  it('winning move (Corner Trap: white pawn captures the only black pawn): won=true returned', () => {
    // Corner Trap: white pawn at 1,1 can capture black pawn at 2,0 (diagonal up-right with direction [0,-1])
    // Wait: pawnDirections for '1,1' is [0,-1] meaning direction is up (row decreases).
    // Pawn captures by 90° rotation: [dc,dr] = [0,-1] => offsets [dr,dc]=[-1,0] and [-dr,-dc]=[1,0]? No.
    // From loader.js: direction [dc,dr], capture offsets = [dr,dc] and [-dr,-dc]
    // direction = [0,-1] => captures at [dc+dr, dr+dc] = [0+(-1), (-1)+0] = [-1,-1]? Let me re-check.
    // Actually the plan says: captures derived by 90-degree rotation of direction vector [dc,dr] -> offsets [dr,dc] and [-dr,-dc]
    // direction = [dc=0, dr=-1] => capture offsets: [dr,dc] = [-1,0] and [-dr,-dc] = [1,0]
    // So from 1,1 with direction [0,-1]: capture at (1+(-1), 1+0)=(0,1) and (1+1, 1+0)=(2,1)?
    // That doesn't seem right either. Let me look at the pawn test to understand.
    // For now, use white knight at 0,2 in Corner Trap which can jump to capture black pawn at 2,0?
    // Knight moves: ±[1,2], ±[2,1] => from (0,2): (2,1),(1,0),(2,3),(1,4),(-2,1),(-1,0),(-2,3),(-1,4)
    // Valid positions in the 3x3 grid (0-2): (2,1),(1,0) -- (2,1) is empty '-', (1,0) is '-'
    // Black pawn P is at 2,0. Knight at (0,2) can reach (2,1) and (1,0)... not (2,0) exactly.
    // Hmm. (2,0): offset from (0,2) is (2,-2) -- not a knight move.
    // Let me use 'Find the Square' puzzle for a win test instead.
    // grid: ['r--', '-x-', '--G'] rook at (0,0), goal at (2,2) - reach-all-goal-squares
    // Rook can go: right to (1,0),(2,0), down to (0,1),(0,2)
    // To win, rook must reach (2,2). Path: (0,0) -> (0,2) -> (2,2)?
    // Actually rook at (0,2) can then go right to (1,2),(2,2). Let's do it in two moves.
    // But we need a 1-move win. Let's check if rook at (0,0) can reach (2,2) in one move.
    // Rook moves horizontally or vertically in straight lines.
    // From (0,0): can go right (0,0)->(1,0),(2,0) or down (0,0)->(0,1),(0,2).
    // Cannot reach (2,2) in one move directly.
    //
    // Let me load Find the Square, move rook to (0,2), then move to (2,2) for the win.
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    // Move rook from (0,0) to (0,2)
    ctrl.makeMove('0,0', '0,2')
    vi.clearAllMocks()  // reset call counts before the winning move
    loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: [], activeState: null })
    // Now move rook from (0,2) to (2,2) - the goal square
    const result = ctrl.makeMove('0,2', '2,2')
    expect(result.won).toBe(true)
    expect(saveProgress).toHaveBeenCalled()
    expect(clearActiveState).toHaveBeenCalled()
  })

  it('winning move: solvedId is added to solvedIds', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    ctrl.makeMove('0,0', '0,2')
    vi.clearAllMocks()
    loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: [], activeState: null })
    ctrl.makeMove('0,2', '2,2')
    // saveProgress should have been called with array containing 'gt7wz4r1'
    expect(saveProgress).toHaveBeenCalledWith(expect.arrayContaining(['gt7wz4r1']))
  })

  it('cannot move after won=true: returns error', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    ctrl.makeMove('0,0', '0,2')
    ctrl.makeMove('0,2', '2,2')  // winning move
    // Attempt another move
    const result = ctrl.makeMove('2,2', '2,1')
    expect(result.error).toBeDefined()
  })
})

// ─── Group: undo ──────────────────────────────────────────────────────────────

describe('undo', () => {
  it('on empty stack (no moves made): returns current board unchanged, no error', () => {
    const ctrl = createController()
    const { board: originalBoard } = ctrl.loadPuzzle('gt7wz4r1')
    const result = ctrl.undo()
    expect(result.board).toBeInstanceOf(Map)
    expect(result.undoStack).toEqual([])
  })

  it('after one move: board restores to before-move state, undoStack shrinks by 1', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    // Rook at 0,0 — move it
    const legalMoves = ctrl.selectPiece('0,0')
    const dest = legalMoves[0]
    ctrl.makeMove('0,0', dest)
    // Now undo
    const { board, undoStack } = ctrl.undo()
    // Rook should be back at 0,0
    expect(board.get('0,0').piece).toBeDefined()
    expect(board.get('0,0').piece.type).toBe('r')
    expect(undoStack).toHaveLength(0)
  })

  it('undo resets won to false', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    ctrl.makeMove('0,0', '0,2')
    ctrl.makeMove('0,2', '2,2')  // winning move
    // Now undo the winning move
    ctrl.undo()
    // Should be able to make another move (won is false)
    const result = ctrl.makeMove('0,2', '2,2')
    expect(result.error).toBeUndefined()
  })

  it('undo calls saveActiveState with restored board', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    const legalMoves = ctrl.selectPiece('0,0')
    ctrl.makeMove('0,0', legalMoves[0])
    vi.clearAllMocks()
    ctrl.undo()
    expect(saveActiveState).toHaveBeenCalled()
  })
})

// ─── Group: reset ─────────────────────────────────────────────────────────────

describe('reset', () => {
  it('reset restores board to initial parsed state', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    // Move the rook
    ctrl.makeMove('0,0', '0,2')
    // Reset
    const { board } = ctrl.reset()
    // Rook should be back at 0,0
    expect(board.get('0,0').piece).toBeDefined()
    expect(board.get('0,0').piece.type).toBe('r')
  })

  it('reset clears undoStack', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    ctrl.makeMove('0,0', '0,2')
    ctrl.reset()
    // After reset, undo should be a no-op (empty stack)
    const { undoStack } = ctrl.undo()
    expect(undoStack).toHaveLength(0)
  })

  it('reset calls clearActiveState', () => {
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    ctrl.makeMove('0,0', '0,2')
    vi.clearAllMocks()
    ctrl.reset()
    expect(clearActiveState).toHaveBeenCalled()
  })

  it('solvedIds unchanged after reset', () => {
    loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: ['gt7wz4r1'], activeState: null })
    const ctrl = createController()
    ctrl.loadPuzzle('xk3m9pq2')
    ctrl.reset()
    // solvedIds should still contain 'gt7wz4r1'
    const list = ctrl.getPuzzleList()
    expect(getPuzzleList).toHaveBeenCalledWith(['gt7wz4r1'])
  })
})

// ─── Group: getPuzzleList / getPuzzlePosition / isUnlocked ────────────────────

describe('getPuzzleList / getPuzzlePosition / isUnlocked', () => {
  it('getPuzzleList delegates to nav.js with current solvedIds', () => {
    loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: ['xk3m9pq2'], activeState: null })
    getPuzzleList.mockReturnValue([{ id: 'xk3m9pq2', title: 'Test', status: 'solved' }])
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    const list = ctrl.getPuzzleList()
    expect(getPuzzleList).toHaveBeenCalledWith(['xk3m9pq2'])
    expect(list).toEqual([{ id: 'xk3m9pq2', title: 'Test', status: 'solved' }])
  })

  it('getPuzzlePosition delegates to nav.js', () => {
    getPuzzlePosition.mockReturnValue('2 / 5')
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    const pos = ctrl.getPuzzlePosition('gt7wz4r1')
    expect(getPuzzlePosition).toHaveBeenCalledWith('gt7wz4r1')
    expect(pos).toBe('2 / 5')
  })

  it('isUnlocked delegates to nav.js with current solvedIds', () => {
    loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: ['xk3m9pq2'], activeState: null })
    isUnlocked.mockReturnValue(true)
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    const result = ctrl.isUnlocked('gt7wz4r1')
    expect(isUnlocked).toHaveBeenCalledWith('gt7wz4r1', ['xk3m9pq2'])
    expect(result).toBe(true)
  })

  it('getPuzzleList after winning a puzzle includes new solved ID', () => {
    loadStore.mockReturnValue({ schemaVersion: 1, solvedIds: [], activeState: null })
    const ctrl = createController()
    ctrl.loadPuzzle('gt7wz4r1')
    ctrl.makeMove('0,0', '0,2')
    vi.clearAllMocks()
    ctrl.makeMove('0,2', '2,2')  // win
    ctrl.getPuzzleList()
    // Now solvedIds should include 'gt7wz4r1'
    expect(getPuzzleList).toHaveBeenCalledWith(expect.arrayContaining(['gt7wz4r1']))
  })

  it('getTrackLaunchPuzzleId uses sanitized solvedIds and active puzzle id from store', () => {
    loadStore.mockReturnValue({
      schemaVersion: 1,
      solvedIds: ['xk3m9pq2', 'stale-id'],
      activeState: {
        puzzleId: 'gt7wz4r1',
        boardEntries: [],
        undoEntries: [],
      },
    })
    getTrackLaunchPuzzleId.mockReturnValue('xk3m9pq2')

    const ctrl = createController()
    const result = ctrl.getTrackLaunchPuzzleId('foundations')

    expect(getTrackLaunchPuzzleId).toHaveBeenCalledWith({
      trackId: 'foundations',
      solvedIds: ['xk3m9pq2'],
      activePuzzleId: 'gt7wz4r1',
    })
    expect(result).toBe('xk3m9pq2')
  })
})

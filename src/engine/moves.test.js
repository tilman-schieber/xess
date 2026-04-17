import { describe, it, test, expect } from 'vitest'
import {
  getPawnMoves,
  getKnightMoves,
  getBishopMoves,
  getRookMoves,
  getQueenMoves,
  getKingMoves,
  getLegalMoves,
} from './moves.js'

// ---------------------------------------------------------------------------
// Pawn
// ---------------------------------------------------------------------------

// All 4 cardinal directions for parameterized tests
// capture offsets derived by 90° rotation of [dc, dr]:
//   [dc, dr] -> capture offsets [dr, dc] and [-dr, -dc], applied at [col+dc+cdc, row+dr+cdr]
const DIRECTIONS = [
  { dc: 0, dr: -1, captureOffsets: [[-1, -1], [1, -1]] },
  { dc: 0, dr:  1, captureOffsets: [[ 1,  1], [-1,  1]] },
  { dc: 1, dr:  0, captureOffsets: [[ 1, -1], [1,  1]] },
  { dc: -1, dr: 0, captureOffsets: [[-1,  1], [-1, -1]] },
]

test.each(DIRECTIONS)(
  'pawn advances one square forward for direction [$dc,$dr]',
  ({ dc, dr }) => {
    const direction = [dc, dr]
    const board = new Map([
      ['2,2', { piece: { type: 'p', color: 'white', direction }, isGoal: false }],
      [`${2 + dc},${2 + dr}`, { piece: null, isGoal: false }],
    ])
    const moves = getPawnMoves(board, 2, 2, board.get('2,2').piece)
    expect(moves).toContainEqual([2 + dc, 2 + dr])
  }
)

test.each(DIRECTIONS)(
  'pawn does NOT advance when forward square is occupied — direction [$dc,$dr]',
  ({ dc, dr }) => {
    const direction = [dc, dr]
    const board = new Map([
      ['2,2', { piece: { type: 'p', color: 'white', direction }, isGoal: false }],
      [`${2 + dc},${2 + dr}`, { piece: { type: 'p', color: 'black' }, isGoal: false }],
    ])
    const moves = getPawnMoves(board, 2, 2, board.get('2,2').piece)
    expect(moves).not.toContainEqual([2 + dc, 2 + dr])
  }
)

test.each(DIRECTIONS)(
  'pawn does NOT advance when forward square is occupied by friendly — direction [$dc,$dr]',
  ({ dc, dr }) => {
    const direction = [dc, dr]
    const board = new Map([
      ['2,2', { piece: { type: 'p', color: 'white', direction }, isGoal: false }],
      [`${2 + dc},${2 + dr}`, { piece: { type: 'p', color: 'white' }, isGoal: false }],
    ])
    const moves = getPawnMoves(board, 2, 2, board.get('2,2').piece)
    expect(moves).not.toContainEqual([2 + dc, 2 + dr])
  }
)

describe('pawn captures', () => {
  it('captures enemy on diagonal squares (direction [0,-1])', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'p', color: 'white', direction: [0, -1] }, isGoal: false }],
      ['2,1', { piece: null, isGoal: false }],       // forward — empty
      ['1,1', { piece: { type: 'p', color: 'black' }, isGoal: false }],  // diagonal left
      ['3,1', { piece: { type: 'p', color: 'black' }, isGoal: false }],  // diagonal right
    ])
    const moves = getPawnMoves(board, 2, 2, board.get('2,2').piece)
    expect(moves).toContainEqual([1, 1])
    expect(moves).toContainEqual([3, 1])
  })

  it('does NOT capture friendly piece on diagonal', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'p', color: 'white', direction: [0, -1] }, isGoal: false }],
      ['2,1', { piece: null, isGoal: false }],
      ['1,1', { piece: { type: 'p', color: 'white' }, isGoal: false }],  // friendly
    ])
    const moves = getPawnMoves(board, 2, 2, board.get('2,2').piece)
    expect(moves).not.toContainEqual([1, 1])
  })

  it('does NOT capture an empty diagonal square', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'p', color: 'white', direction: [0, -1] }, isGoal: false }],
      ['2,1', { piece: null, isGoal: false }],
      ['1,1', { piece: null, isGoal: false }],  // empty diagonal
    ])
    const moves = getPawnMoves(board, 2, 2, board.get('2,2').piece)
    expect(moves).not.toContainEqual([1, 1])
  })

  it('captures diagonally for rightward direction [1,0]', () => {
    // For [1,0]: captureOffsets are [0,1] and [0,-1], applied at [col+1+cdc, row+0+cdr]
    // = [3,3] and [3,1]
    const board = new Map([
      ['2,2', { piece: { type: 'p', color: 'white', direction: [1, 0] }, isGoal: false }],
      ['3,2', { piece: null, isGoal: false }],       // forward
      ['3,3', { piece: { type: 'p', color: 'black' }, isGoal: false }],
      ['3,1', { piece: { type: 'p', color: 'black' }, isGoal: false }],
    ])
    const moves = getPawnMoves(board, 2, 2, board.get('2,2').piece)
    expect(moves).toContainEqual([3, 3])
    expect(moves).toContainEqual([3, 1])
  })

  it('does NOT double-advance from starting position', () => {
    // No two-step move — pawns always advance exactly one square
    const board = new Map([
      ['2,6', { piece: { type: 'p', color: 'white', direction: [0, -1] }, isGoal: false }],
      ['2,5', { piece: null, isGoal: false }],
      ['2,4', { piece: null, isGoal: false }],
    ])
    const moves = getPawnMoves(board, 2, 6, board.get('2,6').piece)
    expect(moves).toContainEqual([2, 5])
    expect(moves).not.toContainEqual([2, 4])
  })
})

// ---------------------------------------------------------------------------
// Knight
// ---------------------------------------------------------------------------

describe('getKnightMoves', () => {
  it('generates all 8 offset targets on an open board', () => {
    const board = new Map([
      ['4,4', { piece: { type: 'n', color: 'white' }, isGoal: false }],
      ['6,5', { piece: null, isGoal: false }],
      ['6,3', { piece: null, isGoal: false }],
      ['2,5', { piece: null, isGoal: false }],
      ['2,3', { piece: null, isGoal: false }],
      ['5,6', { piece: null, isGoal: false }],
      ['5,2', { piece: null, isGoal: false }],
      ['3,6', { piece: null, isGoal: false }],
      ['3,2', { piece: null, isGoal: false }],
    ])
    const moves = getKnightMoves(board, 4, 4, 'white')
    expect(moves).toContainEqual([6, 5])
    expect(moves).toContainEqual([6, 3])
    expect(moves).toContainEqual([2, 5])
    expect(moves).toContainEqual([2, 3])
    expect(moves).toContainEqual([5, 6])
    expect(moves).toContainEqual([5, 2])
    expect(moves).toContainEqual([3, 6])
    expect(moves).toContainEqual([3, 2])
    expect(moves).toHaveLength(8)
  })

  it('cannot land on impassable square (target key absent from map)', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'n', color: 'white' }, isGoal: false }],
      // all 8 knight target squares absent — impassable
    ])
    const moves = getKnightMoves(board, 0, 0, 'white')
    expect(moves).toHaveLength(0)
  })

  it('cannot land on friendly piece', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'n', color: 'white' }, isGoal: false }],
      ['2,1', { piece: { type: 'p', color: 'white' }, isGoal: false }],  // friendly
    ])
    const moves = getKnightMoves(board, 0, 0, 'white')
    expect(moves).not.toContainEqual([2, 1])
  })

  it('CAN land on enemy piece (capture)', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'n', color: 'white' }, isGoal: false }],
      ['2,1', { piece: { type: 'p', color: 'black' }, isGoal: false }],  // enemy
    ])
    const moves = getKnightMoves(board, 0, 0, 'white')
    expect(moves).toContainEqual([2, 1])
  })

  it('DOES jump over impassable squares (intermediate cells irrelevant)', () => {
    // Knight at [0,0] jumping to [2,1] — the squares [1,0] and [0,1] are absent (impassable)
    // but knight ignores path cells — target [2,1] is in the board, so the move is valid
    const board = new Map([
      ['0,0', { piece: { type: 'n', color: 'white' }, isGoal: false }],
      // intermediate squares [1,0] and [0,1] NOT in map (impassable)
      ['2,1', { piece: null, isGoal: false }],  // landing square — valid
    ])
    const moves = getKnightMoves(board, 0, 0, 'white')
    expect(moves).toContainEqual([2, 1])
  })
})

// ---------------------------------------------------------------------------
// Bishop
// ---------------------------------------------------------------------------

describe('getBishopMoves', () => {
  it('slides diagonally to all 4 corners', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'b', color: 'white' }, isGoal: false }],
      ['3,3', { piece: null, isGoal: false }],
      ['1,1', { piece: null, isGoal: false }],
      ['3,1', { piece: null, isGoal: false }],
      ['1,3', { piece: null, isGoal: false }],
    ])
    const moves = getBishopMoves(board, 2, 2, 'white')
    expect(moves).toContainEqual([3, 3])
    expect(moves).toContainEqual([1, 1])
    expect(moves).toContainEqual([3, 1])
    expect(moves).toContainEqual([1, 3])
  })

  it('stops before impassable square on diagonal', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'b', color: 'white' }, isGoal: false }],
      // '1,1' is absent — impassable
      ['2,2', { piece: null, isGoal: false }],
    ])
    const moves = getBishopMoves(board, 0, 0, 'white')
    expect(moves).not.toContainEqual([1, 1])
    expect(moves).not.toContainEqual([2, 2])
  })

  it('captures enemy on diagonal and does not pass through', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'b', color: 'white' }, isGoal: false }],
      ['1,1', { piece: { type: 'p', color: 'black' }, isGoal: false }],
      ['2,2', { piece: null, isGoal: false }],
    ])
    const moves = getBishopMoves(board, 0, 0, 'white')
    expect(moves).toContainEqual([1, 1])      // enemy capture — included
    expect(moves).not.toContainEqual([2, 2])  // behind enemy — blocked
  })

  it('does not capture friendly piece on diagonal', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'b', color: 'white' }, isGoal: false }],
      ['1,1', { piece: { type: 'p', color: 'white' }, isGoal: false }],
    ])
    const moves = getBishopMoves(board, 0, 0, 'white')
    expect(moves).not.toContainEqual([1, 1])
  })

  it('generates 0 moves when cornered by friendly pieces', () => {
    const board = new Map([
      ['1,1', { piece: { type: 'b', color: 'white' }, isGoal: false }],
      ['0,0', { piece: { type: 'p', color: 'white' }, isGoal: false }],
      ['2,0', { piece: { type: 'p', color: 'white' }, isGoal: false }],
      ['0,2', { piece: { type: 'p', color: 'white' }, isGoal: false }],
      ['2,2', { piece: { type: 'p', color: 'white' }, isGoal: false }],
    ])
    const moves = getBishopMoves(board, 1, 1, 'white')
    expect(moves).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Rook
// ---------------------------------------------------------------------------

describe('getRookMoves', () => {
  it('slides right until board edge', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: null, isGoal: false }],
      ['2,0', { piece: null, isGoal: false }],
    ])
    const moves = getRookMoves(board, 0, 0, 'white')
    expect(moves).toContainEqual([1, 0])
    expect(moves).toContainEqual([2, 0])
  })

  it('stops before impassable square (absent from map)', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      // '1,0' is absent — impassable
      ['2,0', { piece: null, isGoal: false }],
    ])
    const moves = getRookMoves(board, 0, 0, 'white')
    expect(moves).not.toContainEqual([1, 0])
    expect(moves).not.toContainEqual([2, 0])
  })

  it('stops at friendly piece without including it', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: { type: 'n', color: 'white' }, isGoal: false }],
    ])
    const moves = getRookMoves(board, 0, 0, 'white')
    expect(moves).not.toContainEqual([1, 0])
  })

  it('captures enemy piece and stops', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: { type: 'p', color: 'black' }, isGoal: false }],
      ['2,0', { piece: null, isGoal: false }],
    ])
    const moves = getRookMoves(board, 0, 0, 'white')
    expect(moves).toContainEqual([1, 0])      // capture square — included
    expect(moves).not.toContainEqual([2, 0])  // behind enemy — blocked
  })

  it('slides in all 4 orthogonal directions', () => {
    const board = new Map([
      ['1,1', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['0,1', { piece: null, isGoal: false }],
      ['2,1', { piece: null, isGoal: false }],
      ['1,0', { piece: null, isGoal: false }],
      ['1,2', { piece: null, isGoal: false }],
    ])
    const moves = getRookMoves(board, 1, 1, 'white')
    expect(moves).toContainEqual([0, 1])
    expect(moves).toContainEqual([2, 1])
    expect(moves).toContainEqual([1, 0])
    expect(moves).toContainEqual([1, 2])
  })

  it('generates no moves when all adjacent squares are impassable', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      // All 4 adjacent squares absent (impassable)
    ])
    const moves = getRookMoves(board, 2, 2, 'white')
    expect(moves).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Queen
// ---------------------------------------------------------------------------

describe('getQueenMoves', () => {
  it('combines orthogonal and diagonal moves (all 8 directions)', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'q', color: 'white' }, isGoal: false }],
      // orthogonal
      ['3,2', { piece: null, isGoal: false }],
      ['1,2', { piece: null, isGoal: false }],
      ['2,3', { piece: null, isGoal: false }],
      ['2,1', { piece: null, isGoal: false }],
      // diagonal
      ['3,3', { piece: null, isGoal: false }],
      ['3,1', { piece: null, isGoal: false }],
      ['1,3', { piece: null, isGoal: false }],
      ['1,1', { piece: null, isGoal: false }],
    ])
    const moves = getQueenMoves(board, 2, 2, 'white')
    expect(moves).toContainEqual([3, 2])
    expect(moves).toContainEqual([1, 2])
    expect(moves).toContainEqual([2, 3])
    expect(moves).toContainEqual([2, 1])
    expect(moves).toContainEqual([3, 3])
    expect(moves).toContainEqual([3, 1])
    expect(moves).toContainEqual([1, 3])
    expect(moves).toContainEqual([1, 1])
  })

  it('stops at impassable in each of the 8 ray directions', () => {
    // Queen at center, all 8 adjacent squares absent (impassable)
    const board = new Map([
      ['4,4', { piece: { type: 'q', color: 'white' }, isGoal: false }],
      // Far squares — reachable only if adjacent passable
      ['6,4', { piece: null, isGoal: false }],
      ['2,4', { piece: null, isGoal: false }],
      ['4,6', { piece: null, isGoal: false }],
      ['4,2', { piece: null, isGoal: false }],
      ['6,6', { piece: null, isGoal: false }],
      ['6,2', { piece: null, isGoal: false }],
      ['2,6', { piece: null, isGoal: false }],
      ['2,2', { piece: null, isGoal: false }],
    ])
    const moves = getQueenMoves(board, 4, 4, 'white')
    // None of the far squares are reachable because adjacent cells are absent
    expect(moves).not.toContainEqual([6, 4])
    expect(moves).not.toContainEqual([2, 4])
    expect(moves).not.toContainEqual([4, 6])
    expect(moves).not.toContainEqual([4, 2])
    expect(moves).not.toContainEqual([6, 6])
    expect(moves).not.toContainEqual([6, 2])
    expect(moves).not.toContainEqual([2, 6])
    expect(moves).not.toContainEqual([2, 2])
    expect(moves).toHaveLength(0)
  })

  it('captures enemy and stops ray', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'q', color: 'white' }, isGoal: false }],
      ['1,0', { piece: { type: 'p', color: 'black' }, isGoal: false }],
      ['2,0', { piece: null, isGoal: false }],
    ])
    const moves = getQueenMoves(board, 0, 0, 'white')
    expect(moves).toContainEqual([1, 0])      // capture — included
    expect(moves).not.toContainEqual([2, 0])  // beyond enemy — blocked
  })
})

// ---------------------------------------------------------------------------
// King
// ---------------------------------------------------------------------------

describe('getKingMoves', () => {
  it('moves 1 square in all 8 directions', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'k', color: 'white' }, isGoal: false }],
      ['3,2', { piece: null, isGoal: false }],
      ['1,2', { piece: null, isGoal: false }],
      ['2,3', { piece: null, isGoal: false }],
      ['2,1', { piece: null, isGoal: false }],
      ['3,3', { piece: null, isGoal: false }],
      ['3,1', { piece: null, isGoal: false }],
      ['1,3', { piece: null, isGoal: false }],
      ['1,1', { piece: null, isGoal: false }],
    ])
    const moves = getKingMoves(board, 2, 2, 'white')
    expect(moves).toContainEqual([3, 2])
    expect(moves).toContainEqual([1, 2])
    expect(moves).toContainEqual([2, 3])
    expect(moves).toContainEqual([2, 1])
    expect(moves).toContainEqual([3, 3])
    expect(moves).toContainEqual([3, 1])
    expect(moves).toContainEqual([1, 3])
    expect(moves).toContainEqual([1, 1])
    expect(moves).toHaveLength(8)
  })

  it('cannot move to friendly-occupied square', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'k', color: 'white' }, isGoal: false }],
      ['3,2', { piece: { type: 'r', color: 'white' }, isGoal: false }],  // friendly
    ])
    const moves = getKingMoves(board, 2, 2, 'white')
    expect(moves).not.toContainEqual([3, 2])
  })

  it('cannot move to impassable square (absent from map)', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'k', color: 'white' }, isGoal: false }],
      // adjacent squares absent — impassable
    ])
    const moves = getKingMoves(board, 0, 0, 'white')
    expect(moves).toHaveLength(0)
  })

  it('captures enemy piece', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'k', color: 'white' }, isGoal: false }],
      ['3,2', { piece: { type: 'q', color: 'black' }, isGoal: false }],  // enemy
    ])
    const moves = getKingMoves(board, 2, 2, 'white')
    expect(moves).toContainEqual([3, 2])
  })
})

// ---------------------------------------------------------------------------
// getLegalMoves dispatcher
// ---------------------------------------------------------------------------

describe('getLegalMoves dispatcher', () => {
  it('returns non-empty array for a rook with open squares', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['3,2', { piece: null, isGoal: false }],
      ['2,3', { piece: null, isGoal: false }],
    ])
    const moves = getLegalMoves(board, '2,2')
    expect(moves.length).toBeGreaterThan(0)
  })

  it('returns empty array when no piece at position', () => {
    const board = new Map([
      ['2,2', { piece: null, isGoal: false }],
    ])
    const moves = getLegalMoves(board, '2,2')
    expect(moves).toEqual([])
  })

  it('returns empty array when position key not in board', () => {
    const board = new Map()
    const moves = getLegalMoves(board, '5,5')
    expect(moves).toEqual([])
  })

  it('dispatches correctly to pawn logic', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'p', color: 'white', direction: [0, -1] }, isGoal: false }],
      ['2,1', { piece: null, isGoal: false }],
    ])
    const moves = getLegalMoves(board, '2,2')
    expect(moves).toContainEqual([2, 1])
  })

  it('dispatches correctly to knight logic', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'n', color: 'white' }, isGoal: false }],
      ['2,1', { piece: null, isGoal: false }],
    ])
    const moves = getLegalMoves(board, '0,0')
    expect(moves).toContainEqual([2, 1])
  })

  it('dispatches correctly to bishop logic', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'b', color: 'white' }, isGoal: false }],
      ['1,1', { piece: null, isGoal: false }],
    ])
    const moves = getLegalMoves(board, '0,0')
    expect(moves).toContainEqual([1, 1])
  })

  it('dispatches correctly to queen logic', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'q', color: 'white' }, isGoal: false }],
      ['1,0', { piece: null, isGoal: false }],
      ['1,1', { piece: null, isGoal: false }],
    ])
    const moves = getLegalMoves(board, '0,0')
    expect(moves).toContainEqual([1, 0])
    expect(moves).toContainEqual([1, 1])
  })

  it('dispatches correctly to king logic', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'k', color: 'white' }, isGoal: false }],
      ['3,2', { piece: null, isGoal: false }],
    ])
    const moves = getLegalMoves(board, '2,2')
    expect(moves).toContainEqual([3, 2])
  })

  it('returns empty array for unknown piece type', () => {
    const board = new Map([
      ['2,2', { piece: { type: 'x', color: 'white' }, isGoal: false }],
    ])
    const moves = getLegalMoves(board, '2,2')
    expect(moves).toEqual([])
  })
})

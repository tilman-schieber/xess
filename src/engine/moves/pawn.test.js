import { describe, it, test, expect } from 'vitest'
import { getPawnMoves } from './pawn.js'

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

import { describe, it, expect } from 'vitest'
import { applyMove } from './apply.js'

// Helper: minimal board with a rook and an empty destination
function makeBoard() {
  return new Map([
    ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
    ['2,0', { piece: null, isGoal: false }],
    ['2,2', { piece: null, isGoal: true }],   // goal square
    ['3,0', { piece: { type: 'p', color: 'black' }, isGoal: false }],  // enemy
  ])
}

const puzzle = { goalType: 'capture-all-targets', targetColor: 'black' }
const puzzleGoal = { goalType: 'reach-all-goal-squares', targetColor: null }

describe('applyMove', () => {
  it('moves piece to destination and clears source', () => {
    const { board } = applyMove(makeBoard(), '0,0', '2,0', puzzle)
    expect(board.get('2,0').piece).toEqual({ type: 'r', color: 'white' })
    expect(board.get('0,0').piece).toBeNull()
  })

  it('returns captured: null for empty destination', () => {
    const { captured } = applyMove(makeBoard(), '0,0', '2,0', puzzle)
    expect(captured).toBeNull()
  })

  it('returns captured piece when capturing enemy', () => {
    const { captured } = applyMove(makeBoard(), '0,0', '3,0', puzzle)
    expect(captured).toEqual({ type: 'p', color: 'black' })
  })

  it('returns a different board Map reference than the input', () => {
    const original = makeBoard()
    const { board: next } = applyMove(original, '0,0', '2,0', puzzle)
    expect(next).not.toBe(original)
  })

  it('snapshot isolation: mutating returned board does not affect original', () => {
    const original = makeBoard()
    const { board: next } = applyMove(original, '0,0', '2,0', puzzle)
    // Mutate the returned board
    next.get('2,0').piece.type = 'q'
    // Original must be unchanged
    expect(original.get('0,0').piece.type).toBe('r')
  })

  it('undo: popping snapshot restores prior piece positions', () => {
    const original = makeBoard()
    const history = []
    history.push(original)
    const { board: next } = applyMove(original, '0,0', '2,0', puzzle)
    const restored = history.pop()
    expect(restored.get('0,0').piece).toEqual({ type: 'r', color: 'white' })
    expect(restored.get('2,0').piece).toBeNull()
  })

  it('preserves isGoal flag on destination cell', () => {
    // Move rook to goal square '2,2'
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['0,2', { piece: null, isGoal: false }],
      ['2,2', { piece: null, isGoal: true }],
    ])
    const { board: next } = applyMove(board, '0,0', '2,2', puzzleGoal)
    expect(next.get('2,2').isGoal).toBe(true)
    expect(next.get('2,2').piece).toEqual({ type: 'r', color: 'white' })
  })

  it('returns won: true when last target is captured', () => {
    // Board has exactly one black piece — capturing it wins
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: { type: 'p', color: 'black' }, isGoal: false }],
    ])
    const { won } = applyMove(board, '0,0', '1,0', { goalType: 'capture-all-targets', targetColor: 'black' })
    expect(won).toBe(true)
  })
})

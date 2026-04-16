import { describe, it, expect } from 'vitest'
import { getKnightMoves } from './knight.js'

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

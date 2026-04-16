import { describe, it, expect } from 'vitest'
import { getKingMoves } from './king.js'

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

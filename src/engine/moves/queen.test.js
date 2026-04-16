import { describe, it, expect } from 'vitest'
import { getQueenMoves } from './queen.js'

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

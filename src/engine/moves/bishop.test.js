import { describe, it, expect } from 'vitest'
import { getBishopMoves } from './bishop.js'

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

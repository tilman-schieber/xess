import { describe, it, expect } from 'vitest'
import { getRookMoves } from './rook.js'

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

import { describe, it, expect } from 'vitest'
import { getLegalMoves } from './index.js'

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

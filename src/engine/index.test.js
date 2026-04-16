import { describe, it, expect } from 'vitest'
import { getLegalMoves, applyMove, checkWin, posKey } from './index.js'
import { parsePuzzle } from '../puzzles/loader.js'

// Sample raw puzzle — capture-all-targets: white rook must capture the black pawn
const rawCapture = {
  schemaVersion: 1,
  id: 'test0001',
  title: 'Test: Capture',
  goalType: 'capture-all-targets',
  targetColor: 'black',
  grid: [
    'r--',
    '---',
    '--P',
  ],
}

// Sample raw puzzle — reach-all-goal-squares: white rook must reach the G square
const rawGoal = {
  schemaVersion: 1,
  id: 'test0002',
  title: 'Test: Goal',
  goalType: 'reach-all-goal-squares',
  targetColor: null,
  grid: [
    'r--',
    '---',
    '--G',
  ],
}

describe('Engine integration — full move cycle', () => {
  it('getLegalMoves returns legal destinations for rook at [0,0]', () => {
    const puzzle = parsePuzzle(rawCapture)
    const moves = getLegalMoves(puzzle.board, '0,0')
    expect(moves.length).toBeGreaterThan(0)
    expect(moves).toContainEqual([1, 0])  // rook can move right
    expect(moves).toContainEqual([0, 1])  // rook can move down
  })

  it('applyMove updates board: piece moved, source cleared', () => {
    const puzzle = parsePuzzle(rawCapture)
    const { board } = applyMove(puzzle.board, '0,0', '1,0', puzzle)
    expect(board.get('1,0').piece).toEqual({ type: 'r', color: 'white' })
    expect(board.get('0,0').piece).toBeNull()
  })

  it('win detected via applyMove: capturing last target returns won: true', () => {
    // Board has exactly one black piece — capturing it wins
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['0,1', { piece: { type: 'p', color: 'black' }, isGoal: false }],
    ])
    const { won } = applyMove(board, '0,0', '0,1', { goalType: 'capture-all-targets', targetColor: 'black' })
    expect(won).toBe(true)
  })

  it('win detected: reach-all-goal-squares returns won: true on last goal fill', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['0,1', { piece: null, isGoal: true }],
    ])
    const { won } = applyMove(board, '0,0', '0,1', { goalType: 'reach-all-goal-squares', targetColor: null })
    expect(won).toBe(true)
  })

  it('undo restores exact prior board state', () => {
    const puzzle = parsePuzzle(rawCapture)
    const history = []
    history.push(puzzle.board)
    const { board: next } = applyMove(puzzle.board, '0,0', '1,0', puzzle)
    const restored = history.pop()
    expect(restored.get('0,0').piece).toEqual({ type: 'r', color: 'white' })
    expect(restored.get('1,0').piece).toBeNull()
  })

  it('getLegalMoves returns [] for empty square', () => {
    const puzzle = parsePuzzle(rawCapture)
    expect(getLegalMoves(puzzle.board, '1,0')).toEqual([])
  })

  it('getLegalMoves returns [] for key not in board', () => {
    const puzzle = parsePuzzle(rawCapture)
    expect(getLegalMoves(puzzle.board, '99,99')).toEqual([])
  })
})

describe('Engine API exports', () => {
  it('exports getLegalMoves, applyMove, checkWin as functions', () => {
    expect(typeof getLegalMoves).toBe('function')
    expect(typeof applyMove).toBe('function')
    expect(typeof checkWin).toBe('function')
  })

  it('exports posKey utility', () => {
    expect(typeof posKey).toBe('function')
    expect(posKey(3, 7)).toBe('3,7')
  })
})

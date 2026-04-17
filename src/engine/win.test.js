import { describe, it, expect } from 'vitest'
import { checkWin } from './win.js'

describe('checkWin — capture-all-targets', () => {
  const puzzle = { goalType: 'capture-all-targets', targetColor: 'black' }

  it('returns false when a black piece remains', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: { type: 'p', color: 'black' }, isGoal: false }],
    ])
    expect(checkWin(board, puzzle)).toBe(false)
  })

  it('returns true when no black pieces remain', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: null, isGoal: false }],
    ])
    expect(checkWin(board, puzzle)).toBe(true)
  })

  it('returns true when targetColor has zero pieces from the start', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
    ])
    expect(checkWin(board, puzzle)).toBe(true)
  })
})

describe('checkWin — reach-all-goal-squares', () => {
  const puzzle = { goalType: 'reach-all-goal-squares', targetColor: null }

  it('returns false when a goal square is empty', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: null, isGoal: true }],   // goal — empty
    ])
    expect(checkWin(board, puzzle)).toBe(false)
  })

  it('returns true when all goal squares are occupied', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: { type: 'n', color: 'white' }, isGoal: true }],  // goal — occupied
    ])
    expect(checkWin(board, puzzle)).toBe(true)
  })

  it('returns true when board has NO goal squares (vacuously true — A3)', () => {
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
    ])
    expect(checkWin(board, puzzle)).toBe(true)
  })

  it('requires matching piece when goalTargets mapping is provided', () => {
    const targetedPuzzle = {
      goalType: 'reach-all-goal-squares',
      targetColor: null,
      goalTargets: new Map([['1,0', { type: 'r', color: 'white' }]]),
    }
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: { type: 'n', color: 'white' }, isGoal: true }],
    ])

    expect(checkWin(board, targetedPuzzle)).toBe(false)
  })

  it('returns true when goalTargets squares contain matching pieces', () => {
    const targetedPuzzle = {
      goalType: 'reach-all-goal-squares',
      targetColor: null,
      goalTargets: new Map([['1,0', { type: 'r', color: 'white' }]]),
    }
    const board = new Map([
      ['0,0', { piece: null, isGoal: false }],
      ['1,0', { piece: { type: 'r', color: 'white' }, isGoal: true }],
    ])

    expect(checkWin(board, targetedPuzzle)).toBe(true)
  })
})

describe('checkWin — unknown goalType', () => {
  it('returns false for unrecognized goalType', () => {
    const board = new Map([['0,0', { piece: null, isGoal: false }]])
    expect(checkWin(board, { goalType: 'unknown', targetColor: null })).toBe(false)
  })
})

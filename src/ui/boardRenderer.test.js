import { describe, it, expect } from 'vitest'
import { createBoardRenderModel } from './boardRenderer.js'
import { getPieceSvg, getPieceSvgKey } from './pieces.js'

const makePuzzle = (overrides = {}) => ({
  id: 'render-test',
  width: 4,
  height: 3,
  ...overrides,
})

describe('createBoardRenderModel', () => {
  it('marks coordinates missing from board Map as cell--void', () => {
    const puzzle = makePuzzle({ width: 3, height: 2 })
    const board = new Map([
      ['0,0', { piece: null, isGoal: false }],
      ['2,0', { piece: null, isGoal: false }],
      ['1,1', { piece: null, isGoal: false }],
    ])

    const { cells } = createBoardRenderModel({ puzzle, board })

    expect(cells).toHaveLength(6)

    const voidCells = cells.filter(cell => cell.isVoid)
    expect(voidCells.map(cell => cell.key).sort()).toEqual(['0,1', '1,0', '2,1'])
    voidCells.forEach(cell => {
      expect(cell.isPlayable).toBe(false)
      expect(cell.classes).toContain('cell--void')
    })
  })

  it('applies goal-state class and keeps playable squares uniform (no parity classes)', () => {
    const puzzle = makePuzzle({ width: 2, height: 2 })
    const board = new Map([
      ['0,0', { piece: null, isGoal: false }],
      ['1,0', { piece: null, isGoal: true }],
      ['0,1', { piece: null, isGoal: false }],
      ['1,1', { piece: null, isGoal: false }],
    ])

    const { cells } = createBoardRenderModel({ puzzle, board })
    const goalCell = cells.find(cell => cell.key === '1,0')
    const nonGoalCell = cells.find(cell => cell.key === '0,0')

    expect(goalCell.classes).toContain('cell--goal')
    expect(nonGoalCell.classes).toContain('cell--playable')

    cells
      .filter(cell => cell.isPlayable)
      .forEach(cell => {
        expect(cell.classes).toContain('cell--playable')
        expect(cell.classes).not.toContain('cell--light')
        expect(cell.classes).not.toContain('cell--dark')
      })
  })

  it('includes SVG piece metadata from the mapper for playable piece cells', () => {
    const puzzle = makePuzzle({ width: 2, height: 1 })
    const board = new Map([
      ['0,0', { piece: { type: 'q', color: 'white' }, isGoal: false }],
      ['1,0', { piece: null, isGoal: false }],
    ])

    const selectedKey = '0,0'
    const legalMoves = ['1,0']
    const illegalKey = '0,0'

    const { cells } = createBoardRenderModel({
      puzzle,
      board,
      selectedKey,
      legalMoves,
      illegalKey,
    })

    const pieceCell = cells.find(cell => cell.key === '0,0')
    const legalCell = cells.find(cell => cell.key === '1,0')
    const expectedSvgKey = getPieceSvgKey({ type: 'q', color: 'white' })

    expect(pieceCell.classes).toEqual(
      expect.arrayContaining(['cell--playable', 'cell--selected', 'cell--illegal'])
    )
    expect(legalCell.classes).toContain('cell--legal')

    expect(pieceCell.piece).toEqual({
      type: 'q',
      color: 'white',
      svgKey: expectedSvgKey,
      svg: getPieceSvg({ type: 'q', color: 'white' }),
    })
  })

  it('adds goal ghost piece metadata for empty goal squares with explicit targets', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 1,
      goalTargets: new Map([['1,0', { type: 'r', color: 'white' }]]),
    })
    const board = new Map([
      ['0,0', { piece: { type: 'r', color: 'white' }, isGoal: false }],
      ['1,0', { piece: null, isGoal: true }],
    ])

    const { cells } = createBoardRenderModel({ puzzle, board })
    const goalCell = cells.find(cell => cell.key === '1,0')

    expect(goalCell.goalGhost).toEqual({
      type: 'r',
      color: 'white',
      svgKey: getPieceSvgKey({ type: 'r', color: 'white' }),
      svg: getPieceSvg({ type: 'r', color: 'white' }),
    })
  })
})

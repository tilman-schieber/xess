// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import {
  applyToolToCell,
  boardToCreatorCells,
  cellMatchesTool,
  createEmptyCreatorCells,
  creatorCellsToGrid,
  creatorStateFromRawPuzzle,
  resizeCreatorEdge,
  suggestTrack,
  toCatalogueSnippet,
  toRawPuzzle,
} from './puzzleCreator.js'
import catalogue from '../puzzles/catalogue.js'
import { parsePuzzle } from '../puzzles/loader.js'

const tool = (placementMode, pieceType) => ({ editMode: 'place', placementMode, pieceType })

describe('creator tools', () => {
  it('places the selected piece on a square', () => {
    const cells = createEmptyCreatorCells(2, 1)
    const next = applyToolToCell({
      cells, goalTargets: {}, cellKey: '0,0', goalType: 'reach-all-goal-squares', ...tool('red-piece', 'q'),
    })
    expect(next.cells.get('0,0').pieceChar).toBe('q')
  })

  it('cellMatchesTool detects when the tool would change nothing', () => {
    const cell = { isVoid: false, isGoal: false, pieceChar: 'R' }
    expect(cellMatchesTool({ cell, ...tool('white-piece', 'r') })).toBe(true)
    expect(cellMatchesTool({ cell, ...tool('red-piece', 'r') })).toBe(false)
    expect(cellMatchesTool({ cell: { isVoid: true }, editMode: 'void' })).toBe(true)
    expect(cellMatchesTool({
      cell: { isVoid: false, isGoal: true, pieceChar: null }, goalTarget: 'q', ...tool('red-target', 'q'),
    })).toBe(true)
  })
})

describe('resizeCreatorEdge', () => {
  const base = creatorStateFromRawPuzzle({ grid: ['r-', 'xG'], goalTargets: { '1,1': 'r' } })

  it('adding a top row shifts pieces and goal targets down', () => {
    const next = resizeCreatorEdge({ ...base, side: 'top', delta: 1 })
    expect(creatorCellsToGrid(next)).toEqual(['--', 'r-', 'xG'])
    expect(next.goalTargets).toEqual({ '1,2': 'r' })
  })

  it('removing the left column drops it and shifts the rest', () => {
    const next = resizeCreatorEdge({ ...base, side: 'left', delta: -1 })
    expect(creatorCellsToGrid(next)).toEqual(['-', 'G'])
    expect(next.goalTargets).toEqual({ '0,1': 'r' })
  })

  it('adding on the right or bottom leaves existing coordinates alone', () => {
    const next = resizeCreatorEdge({ ...base, side: 'right', delta: 1 })
    expect(creatorCellsToGrid(next)).toEqual(['r--', 'xG-'])
    expect(next.goalTargets).toEqual({ '1,1': 'r' })
  })
})

describe('export', () => {
  it('round-trips every catalogue puzzle through the creator unchanged', () => {
    catalogue.forEach((raw) => {
      const exported = toRawPuzzle(creatorStateFromRawPuzzle(raw))
      expect(exported.grid, raw.id).toEqual(raw.grid)
      expect(exported.goalTargets ?? {}, raw.id).toEqual(raw.goalTargets ?? {})
      expect(exported.promote === true, raw.id).toBe(raw.promote === true)
    })
  })

  it('formats a catalogue.js entry that evaluates back to the same puzzle', () => {
    const raw = {
      schemaVersion: 1,
      id: 'kings-x',
      title: "King's Test",
      descriptionHtml: '<p>It\'s a "test".</p>',
      goalType: 'reach-all-goal-squares',
      grid: ['k-G'],
      goalTargets: { '2,0': 'k' },
      promote: true,
    }
    const snippet = toCatalogueSnippet(raw)
    expect(snippet).toContain("    id: 'kings-x',")
    // eslint-disable-next-line no-new-func
    const evaluated = new Function(`return [${snippet}][0]`)()
    expect(evaluated).toEqual(raw)
  })
})

describe('boardToCreatorCells', () => {
  it('maps an engine board back to display cells with holes', () => {
    const puzzle = parsePuzzle({ schemaVersion: 1, id: 't', goalType: 'reach-all-goal-squares', grid: ['rxG', 'N--'] })
    const cells = boardToCreatorCells(puzzle.board, 3, 2)
    expect(cells.get('0,0').pieceChar).toBe('r')
    expect(cells.get('1,0').isVoid).toBe(true)
    expect(cells.get('2,0').isGoal).toBe(true)
    expect(cells.get('0,1').pieceChar).toBe('N')
  })
})

describe('suggestTrack', () => {
  it('ranks by par and search size', () => {
    expect(suggestTrack({ par: 2, statesExplored: 9 })).toBe('Tutorial')
    expect(suggestTrack({ par: 9, statesExplored: 91 })).toBe('Warm-up')
    expect(suggestTrack({ par: 16, statesExplored: 2460 })).toBe('Tricky')
    expect(suggestTrack({ par: 22, statesExplored: 594382 })).toBe('Fiendish')
  })
})

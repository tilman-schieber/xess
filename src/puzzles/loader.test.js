import { describe, it, expect } from 'vitest'
import { parsePuzzle, posKey, parseKey } from './loader.js'

// Minimal raw puzzle fixture for loader tests — do NOT use catalogue entries here
const makeRaw = (grid, opts = {}) => ({
  schemaVersion: 1,
  id: 'test0001',
  title: 'Test Puzzle',
  goalType: 'capture-all-targets',
  targetColor: 'black',
  grid,
  ...opts,
})

describe('posKey', () => {
  it('returns col,row string', () => {
    expect(posKey(2, 3)).toBe('2,3')
    expect(posKey(0, 0)).toBe('0,0')
  })
})

describe('parseKey', () => {
  it('parses col,row string to [col, row] numbers', () => {
    expect(parseKey('2,3')).toEqual([2, 3])
    expect(parseKey('0,0')).toEqual([0, 0])
  })
})

describe('parsePuzzle', () => {
  it('creates board Map with correct "col,row" keys for each non-impassable cell', () => {
    const raw = makeRaw(['-r-', '---'])
    const puzzle = parsePuzzle(raw)
    expect(puzzle.board).toBeInstanceOf(Map)
    // Row 0: cols 0,1,2; Row 1: cols 0,1,2 — all 6 non-impassable
    expect(puzzle.board.has('0,0')).toBe(true)
    expect(puzzle.board.has('1,0')).toBe(true)
    expect(puzzle.board.has('2,0')).toBe(true)
    expect(puzzle.board.has('0,1')).toBe(true)
    expect(puzzle.board.has('1,1')).toBe(true)
    expect(puzzle.board.has('2,1')).toBe(true)
  })

  it('excludes impassable (x) squares from the Map entirely', () => {
    const raw = makeRaw(['x-x', '-x-'])
    const puzzle = parsePuzzle(raw)
    expect(puzzle.board.has('0,0')).toBe(false)
    expect(puzzle.board.has('2,0')).toBe(false)
    expect(puzzle.board.has('1,1')).toBe(false)
    // Non-impassable cells should be present
    expect(puzzle.board.has('1,0')).toBe(true)
    expect(puzzle.board.has('0,1')).toBe(true)
    expect(puzzle.board.has('2,1')).toBe(true)
  })

  it('sets isGoal: true for G squares and isGoal: false for other cells', () => {
    const raw = makeRaw(['-G-'])
    const puzzle = parsePuzzle(raw)
    expect(puzzle.board.get('0,0').isGoal).toBe(false)
    expect(puzzle.board.get('1,0').isGoal).toBe(true)
    expect(puzzle.board.get('2,0').isGoal).toBe(false)
  })

  it('parses lowercase chars as white pieces', () => {
    const raw = makeRaw(['p'])
    const puzzle = parsePuzzle(raw)
    const cell = puzzle.board.get('0,0')
    expect(cell.piece).not.toBeNull()
    expect(cell.piece.color).toBe('white')
  })

  it('parses uppercase chars as black pieces', () => {
    const raw = makeRaw(['P'])
    const puzzle = parsePuzzle(raw)
    const cell = puzzle.board.get('0,0')
    expect(cell.piece).not.toBeNull()
    expect(cell.piece.color).toBe('black')
  })

  it('sets piece.type to the lowercase character', () => {
    const raw = makeRaw(['pNbRqK'])
    const puzzle = parsePuzzle(raw)
    expect(puzzle.board.get('0,0').piece.type).toBe('p')
    expect(puzzle.board.get('1,0').piece.type).toBe('n')
    expect(puzzle.board.get('2,0').piece.type).toBe('b')
    expect(puzzle.board.get('3,0').piece.type).toBe('r')
    expect(puzzle.board.get('4,0').piece.type).toBe('q')
    expect(puzzle.board.get('5,0').piece.type).toBe('k')
  })

  it('attaches direction from pawnDirections to pawn pieces', () => {
    const raw = makeRaw(['p'], {
      pawnDirections: { '0,0': [1, 0] },
    })
    const puzzle = parsePuzzle(raw)
    expect(puzzle.board.get('0,0').piece.direction).toEqual([1, 0])
  })

  it('defaults pawn direction to [0,-1] when pawnDirections key is missing', () => {
    const raw = makeRaw(['p'])
    const puzzle = parsePuzzle(raw)
    expect(puzzle.board.get('0,0').piece.direction).toEqual([0, -1])
  })

  it('does not add direction property to non-pawn pieces', () => {
    const raw = makeRaw(['n'])
    const puzzle = parsePuzzle(raw)
    expect(puzzle.board.get('0,0').piece.direction).toBeUndefined()
  })

  it('returns the correct width (max row length) and height (row count)', () => {
    const raw = makeRaw(['--', '---', '-'])
    const puzzle = parsePuzzle(raw)
    expect(puzzle.width).toBe(3)
    expect(puzzle.height).toBe(3)
  })

  it('throws Error when schemaVersion !== 1', () => {
    const raw = makeRaw(['-'], { schemaVersion: 2 })
    expect(() => parsePuzzle(raw)).toThrow('Unknown schema version: 2')
  })

  it('handles ragged rows (rows of different lengths)', () => {
    // Row 0 has 3 cols, row 1 has 1 col — shorter row just has fewer cells
    const raw = makeRaw(['---', '-'])
    const puzzle = parsePuzzle(raw)
    expect(puzzle.board.has('0,0')).toBe(true)
    expect(puzzle.board.has('2,0')).toBe(true)
    expect(puzzle.board.has('0,1')).toBe(true)
    expect(puzzle.board.has('1,1')).toBe(false) // not present in shorter row
    expect(puzzle.board.has('2,1')).toBe(false)
  })

  it('returns non-null piece on piece squares and null piece on empty squares', () => {
    const raw = makeRaw(['-r'])
    const puzzle = parsePuzzle(raw)
    expect(puzzle.board.get('0,0').piece).toBeNull()
    expect(puzzle.board.get('1,0').piece).not.toBeNull()
  })

  it('guards against rows that are not strings (T-01-03 mitigation)', () => {
    const raw = {
      schemaVersion: 1,
      id: 'guard01',
      title: 'Guard Test',
      goalType: 'capture-all-targets',
      targetColor: 'black',
      grid: ['-', null, '-'],
    }
    // Should not throw — null rows are skipped
    let result
    expect(() => { result = parsePuzzle(raw) }).not.toThrow()
    expect(result).toBeDefined()
    // Row 0 and row 2 are valid strings — their cells should be present
    expect(result.board.has('0,0')).toBe(true)
    expect(result.board.has('0,2')).toBe(true)
  })

  it('parses goalTargets mapping into piece requirements keyed by goal position', () => {
    const raw = makeRaw(['r-G'], {
      goalType: 'reach-all-goal-squares',
      targetColor: null,
      goalTargets: { '2,0': 'r' },
    })

    const puzzle = parsePuzzle(raw)
    expect(puzzle.goalTargets.get('2,0')).toEqual({ type: 'r', color: 'white' })
  })

  it('throws when goalTargets points to a non-goal square', () => {
    const raw = makeRaw(['r--'], {
      goalType: 'reach-all-goal-squares',
      targetColor: null,
      goalTargets: { '0,0': 'r' },
    })

    expect(() => parsePuzzle(raw)).toThrow('goalTargets key "0,0" must reference a G square')
  })

  it('throws when goalTargets uses an unknown piece character', () => {
    const raw = makeRaw(['--G'], {
      goalType: 'reach-all-goal-squares',
      targetColor: null,
      goalTargets: { '2,0': 'z' },
    })

    expect(() => parsePuzzle(raw)).toThrow('goalTargets key "2,0" has invalid piece "z"')
  })
})

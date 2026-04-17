// src/puzzles/nav.test.js
import { describe, it, expect } from 'vitest'
import { getUnlockedIds, isUnlocked, getPuzzlePosition, getPuzzleList } from './nav.js'

const mockCatalogue = [
  { id: 'p1', title: 'Puzzle 1', schemaVersion: 1, goalType: 'capture-all-targets', grid: [] },
  { id: 'p2', title: 'Puzzle 2', schemaVersion: 1, goalType: 'capture-all-targets', grid: [] },
  { id: 'p3', title: 'Puzzle 3', schemaVersion: 1, goalType: 'reach-all-goal-squares', grid: [] },
]

describe('getUnlockedIds', () => {
  it('with empty solvedIds: returns all puzzle ids', () => {
    const result = getUnlockedIds([], mockCatalogue)
    expect(result).toEqual(['p1', 'p2', 'p3'])
  })

  it('with first puzzle solved: still returns all ids', () => {
    const result = getUnlockedIds(['p1'], mockCatalogue)
    expect(result).toEqual(['p1', 'p2', 'p3'])
  })

  it('with first two solved: still returns all ids', () => {
    const result = getUnlockedIds(['p1', 'p2'], mockCatalogue)
    expect(result).toEqual(['p1', 'p2', 'p3'])
  })

  it('with all solved: returns all ids', () => {
    const result = getUnlockedIds(['p1', 'p2', 'p3'], mockCatalogue)
    expect(result).toEqual(['p1', 'p2', 'p3'])
  })

  it('empty catalogue: returns []', () => {
    const result = getUnlockedIds([], [])
    expect(result).toEqual([])
  })
})

describe('isUnlocked', () => {
  it('first puzzle is unlocked with empty solvedIds', () => {
    expect(isUnlocked('p1', [], mockCatalogue)).toBe(true)
  })

  it('second puzzle is unlocked with empty solvedIds', () => {
    expect(isUnlocked('p2', [], mockCatalogue)).toBe(true)
  })

  it('second puzzle is still unlocked after first is solved', () => {
    expect(isUnlocked('p2', ['p1'], mockCatalogue)).toBe(true)
  })

  it('unknown id returns false', () => {
    expect(isUnlocked('unknown-id', [], mockCatalogue)).toBe(false)
  })
})

describe('getPuzzlePosition', () => {
  it('first puzzle returns "1 / N"', () => {
    expect(getPuzzlePosition('p1', mockCatalogue)).toBe('1 / 3')
  })

  it('last puzzle returns "N / N"', () => {
    expect(getPuzzlePosition('p3', mockCatalogue)).toBe('3 / 3')
  })

  it('returns null for unknown id', () => {
    expect(getPuzzlePosition('unknown-id', mockCatalogue)).toBeNull()
  })
})

describe('getPuzzleList', () => {
  it('entry for solved puzzle has status "solved"', () => {
    const list = getPuzzleList(['p1'], mockCatalogue)
    const entry = list.find(e => e.id === 'p1')
    expect(entry.status).toBe('solved')
  })

  it('entry for unlocked-but-unsolved puzzle has status "unlocked"', () => {
    const list = getPuzzleList(['p1'], mockCatalogue)
    const entry = list.find(e => e.id === 'p2')
    expect(entry.status).toBe('unlocked')
  })

  it('entry for unsolved puzzle has status "unlocked"', () => {
    const list = getPuzzleList([], mockCatalogue)
    const entry = list.find(e => e.id === 'p2')
    expect(entry.status).toBe('unlocked')
  })

  it('all entries have id and title fields', () => {
    const list = getPuzzleList([], mockCatalogue)
    for (const entry of list) {
      expect(entry).toHaveProperty('id')
      expect(entry).toHaveProperty('title')
    }
  })

  it('order matches catalogue order', () => {
    const list = getPuzzleList([], mockCatalogue)
    expect(list.map(e => e.id)).toEqual(['p1', 'p2', 'p3'])
  })
})

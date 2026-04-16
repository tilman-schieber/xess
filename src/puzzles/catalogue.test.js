import { describe, it, expect } from 'vitest'
import catalogue from './catalogue.js'

describe('catalogue', () => {
  it('all puzzle IDs are unique', () => {
    const ids = catalogue.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all puzzles have schemaVersion 1', () => {
    catalogue.forEach(p => expect(p.schemaVersion).toBe(1))
  })

  it('all puzzles have a valid goalType', () => {
    const valid = new Set(['capture-all-targets', 'reach-all-goal-squares'])
    catalogue.forEach(p => expect(valid.has(p.goalType)).toBe(true))
  })

  it('puzzles with goalType capture-all-targets have a non-null targetColor', () => {
    catalogue
      .filter(p => p.goalType === 'capture-all-targets')
      .forEach(p => expect(p.targetColor).not.toBeNull())
  })
})

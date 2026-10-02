import { describe, expect, it } from 'vitest'
import { computeScore, formatStars, starsForScore } from './score.js'

describe('computeScore', () => {
  it('gives 100 points and three stars for a par solve without hints', () => {
    expect(computeScore({ moveCount: 8, par: 8, hintsUsed: 0 })).toEqual({
      score: 100, stars: 3, movePenalty: 0, hintPenalty: 0,
    })
  })

  it('deducts 5 points per extra move, capped at 50', () => {
    expect(computeScore({ moveCount: 10, par: 8 }).score).toBe(90)
    expect(computeScore({ moveCount: 80, par: 8 }).score).toBe(50)
  })

  it('deducts 20 points per hint, capped at 40', () => {
    expect(computeScore({ moveCount: 8, par: 8, hintsUsed: 1 }).score).toBe(80)
    expect(computeScore({ moveCount: 8, par: 8, hintsUsed: 5 }).score).toBe(60)
  })

  it('never drops below 10 and ignores par when it is unknown', () => {
    expect(computeScore({ moveCount: 99, par: 8, hintsUsed: 9 }).score).toBe(10)
    expect(computeScore({ moveCount: 99, par: null }).score).toBe(100)
  })
})

describe('stars', () => {
  it('maps scores to stars', () => {
    expect(starsForScore(100)).toBe(3)
    expect(starsForScore(95)).toBe(2)
    expect(starsForScore(60)).toBe(2)
    expect(starsForScore(55)).toBe(1)
    expect(starsForScore(0)).toBe(0)
  })

  it('formats a three-slot star string', () => {
    expect(formatStars(2)).toBe('★★☆')
    expect(formatStars(0)).toBe('☆☆☆')
  })
})

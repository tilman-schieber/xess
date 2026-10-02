import { describe, expect, it } from 'vitest'
import catalogue from './catalogue.js'
import tracks from './tracks.js'
import { evaluateAchievements, getAchievementPoints, getRank } from './achievements.js'

const all = tracks.flatMap(track => track.puzzleIds)
const find = (list, id) => list.find(entry => entry.id === id)

describe('evaluateAchievements', () => {
  it('unlocks nothing for a new player and reports progress targets', () => {
    const list = evaluateAchievements({ tracks, catalogue, solvedIds: [], scores: {} })
    expect(list.every(entry => entry.unlocked === false)).toBe(true)
    expect(find(list, 'track-tutorial').target).toBe(tracks[0].puzzleIds.length)
    expect(new Set(list.map(entry => entry.id)).size).toBe(list.length)
  })

  it('unlocks first-solve and the tutorial badge from solved puzzles', () => {
    const tutorial = tracks[0].puzzleIds
    const list = evaluateAchievements({
      tracks, catalogue, solvedIds: tutorial, scores: Object.fromEntries(tutorial.map(id => [id, 80])),
    })
    expect(find(list, 'first-solve').unlocked).toBe(true)
    expect(find(list, 'track-tutorial').unlocked).toBe(true)
    expect(find(list, 'sharp').unlocked).toBe(false)
    expect(find(list, 'completionist').value).toBe(tutorial.length)
  })

  it('counts three-star solves and points', () => {
    const list = evaluateAchievements({
      tracks, catalogue, solvedIds: all, scores: Object.fromEntries(all.map(id => [id, 100])),
    })
    expect(list.every(entry => entry.unlocked)).toBe(true)
  })

  it('ignores scores of puzzles that are not solved or not in a track', () => {
    const list = evaluateAchievements({ tracks, catalogue, solvedIds: ['knight-leap'], scores: { 'knight-leap': 100, leap: 100 } })
    expect(find(list, 'first-solve').unlocked).toBe(false)
    expect(find(list, 'points-1000').value).toBe(0)
  })
})

describe('getAchievementPoints', () => {
  it('gives every achievement a bonus and sums only the unlocked ones', () => {
    const tutorial = tracks[0].puzzleIds
    const list = evaluateAchievements({
      tracks, catalogue, solvedIds: tutorial, scores: Object.fromEntries(tutorial.map(id => [id, 80])),
    })
    expect(list.every(entry => Number.isInteger(entry.points) && entry.points > 0)).toBe(true)

    const { earned, available } = getAchievementPoints(list)
    const expected = list.filter(entry => entry.unlocked).reduce((sum, entry) => sum + entry.points, 0)
    expect(earned).toBe(expected)
    expect(earned).toBeGreaterThan(0)
    expect(available).toBeGreaterThan(earned)
  })
})

describe('getRank', () => {
  it('starts as Pawn and names the next rank', () => {
    expect(getRank(0, 2700)).toMatchObject({ title: 'Pawn', next: { title: 'Knight', at: 405, missing: 405 }, progress: 0 })
  })

  it('advances with points and tops out at Queen', () => {
    expect(getRank(405, 2700).title).toBe('Knight')
    expect(getRank(1700, 2700).title).toBe('Rook')
    expect(getRank(2700, 2700)).toMatchObject({ title: 'Queen', next: null, progress: 1 })
  })
})

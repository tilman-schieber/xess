import { describe, expect, it } from 'vitest'
import catalogue from './catalogue.js'
import tracks from './tracks.js'
import solutions from './solutions.js'
import { parsePuzzle } from './loader.js'
import { createSolutionLine, findHintOnLine } from './hints.js'
import { getLegalMoves, applyMove } from '../engine/index.js'
import { posKey } from './loader.js'

const trackPuzzleIds = tracks.flatMap(track => track.puzzleIds)

describe('stored solutions', () => {
  it('exist for every track puzzle (run scripts/generate-solutions.js after editing puzzles)', () => {
    trackPuzzleIds.forEach(id => expect(solutions[id], id).toBeDefined())
  })

  it('replay legally from the start position and end in a win', () => {
    trackPuzzleIds.forEach((id) => {
      const puzzle = parsePuzzle(catalogue.find(entry => entry.id === id))
      let board = puzzle.board
      let won = false
      solutions[id].forEach(({ from, to }) => {
        const mover = board.get(from)?.piece
        expect(mover, `${id}: no piece on ${from}`).toBeTruthy()
        expect(puzzle.controllableColors, id).toContain(mover.color)
        const legal = getLegalMoves(board, from).map(([c, r]) => posKey(c, r))
        expect(legal, `${id}: ${from}>${to}`).toContain(to)
        const target = board.get(to)?.piece
        if (target) expect(puzzle.capturableByColor[mover.color], id).toContain(target.color)
        const next = applyMove(board, from, to, puzzle)
        board = next.board
        won = next.won
      })
      expect(won, id).toBe(true)
      expect(puzzle.par, id).toBe(solutions[id].length)
    })
  })

  it('coach lines never outnumber the solution moves', () => {
    catalogue.filter(entry => Array.isArray(entry.coach)).forEach((entry) => {
      expect(entry.coach.length, entry.id).toBeLessThanOrEqual(solutions[entry.id].length)
    })
  })
})

describe('findHintOnLine', () => {
  const puzzle = parsePuzzle(catalogue.find(entry => entry.id === 'first-steps'))
  const line = createSolutionLine(puzzle)

  it('returns the first solution move at the start position', () => {
    expect(findHintOnLine(line, puzzle.board)).toEqual({ ...solutions['first-steps'][0], step: 0 })
  })

  it('follows the line after a solution move and returns null off the line', () => {
    const { from, to } = solutions['first-steps'][0]
    const onLine = applyMove(puzzle.board, from, to, puzzle).board
    expect(findHintOnLine(line, onLine)?.step).toBe(1)

    const offLine = applyMove(puzzle.board, '0,0', '1,0', puzzle).board
    expect(findHintOnLine(line, offLine)).toBeNull()
  })
})

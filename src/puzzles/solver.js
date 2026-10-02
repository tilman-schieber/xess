// src/puzzles/solver.js
// Breadth-first puzzle solver in a miniKanren spirit:
// defines the board-transition *relation* moveo and the win *relation* wino,
// then runs BFS to find the shortest derivation (proof of solvability).
//
// Grid color convention (loader.js D-03):
//   lowercase char -> black piece
//   uppercase char -> white piece
//
// Run all puzzles:  node src/puzzles/solver.js
// Import:          import { solve } from './solver.js'

import catalogue from './catalogue.js'
import { parsePuzzle, posKey } from './loader.js'
import { getLegalMoves } from '../engine/moves.js'
import { applyMove } from '../engine/apply.js'
import { checkWin } from '../engine/win.js'

const DEFAULT_MAX_DEPTH = 10

function isControllable(puzzle, color) {
  return Array.isArray(puzzle.controllableColors) && puzzle.controllableColors.includes(color)
}

function canCapture(puzzle, moverColor, targetColor) {
  const allowed = puzzle.capturableByColor?.[moverColor]
  return Array.isArray(allowed) && allowed.includes(targetColor)
}

/**
 * Compact serialisation of piece positions for visited-state deduplication.
 * Goal squares and impassable cells are fixed and excluded.
 */
export function stateKey(board) {
  const parts = []
  for (const [key, cell] of board) {
    if (cell.piece) {
      parts.push(`${key}:${cell.piece.color[0]}${cell.piece.type}`)
    }
  }
  parts.sort()
  return parts.join('|')
}

// ── Solver ────────────────────────────────────────────────────────────────────

/**
 * BFS solver for a single puzzle.
 *
 * Enumerates all reachable board states level by level (= all states reachable
 * in k moves before trying k+1). Returns as soon as wino holds — guaranteeing
 * the minimum move count. Visited-state pruning prevents cycles.
 *
 * @param {Object} rawPuzzle   - entry from catalogue.js
 * @param {number} maxDepth    - give up after this many moves
 * @returns {{ solvable: boolean, minMoves: number|null, statesExplored: number, moves: Array<{from: string, to: string}> }}
 */
export function solveWithPath(rawPuzzle, maxDepth = DEFAULT_MAX_DEPTH) {
  const puzzle = parsePuzzle(rawPuzzle)
  return solveFromBoard(puzzle, puzzle.board, maxDepth)
}

/**
 * BFS from an arbitrary position of an already parsed puzzle (used for hints).
 *
 * @param {Object} puzzle      - parsed puzzle (parsePuzzle output)
 * @param {Map} startBoard     - position to solve from
 * @param {number} maxDepth    - give up after this many moves
 * @returns {{ solvable: boolean, minMoves: number|null, statesExplored: number, moves: Array<{from: string, to: string}> }}
 */
export function solveFromBoard(puzzle, startBoard, maxDepth = DEFAULT_MAX_DEPTH) {
  // Depth-0 check: already won (degenerate puzzle)
  if (checkWin(startBoard, puzzle)) {
    return { solvable: true, minMoves: 0, statesExplored: 1, moves: [] }
  }

  // BFS frontier: each entry is { board, depth, path }. Read with a moving
  // head index: Array.shift() is O(n) and dominates on large searches.
  const queue   = [{ board: startBoard, depth: 0, path: [] }]
  const visited = new Set([stateKey(startBoard)])
  let statesExplored = 1
  let head = 0

  while (head < queue.length) {
    const { board, depth, path } = queue[head]
    queue[head] = null
    head += 1
    if (depth >= maxDepth) continue

    // moveo — the move relation: enumerate all successor states
    for (const [fromKey, cell] of board) {
      if (!cell.piece || !isControllable(puzzle, cell.piece.color)) continue
      const moverColor = cell.piece.color

      for (const [tc, tr] of getLegalMoves(board, fromKey)) {
        const toKey = posKey(tc, tr)
        const destination = board.get(toKey)
        if (destination?.piece && !canCapture(puzzle, moverColor, destination.piece.color)) continue

        const next = applyMove(board, fromKey, toKey, puzzle).board
        const nextPath = [...path, { from: fromKey, to: toKey }]
        statesExplored++

        if (checkWin(next, puzzle)) {
          return { solvable: true, minMoves: depth + 1, statesExplored, moves: nextPath }
        }

        const sk = stateKey(next)
        if (!visited.has(sk)) {
          visited.add(sk)
          queue.push({ board: next, depth: depth + 1, path: nextPath })
        }
      }
    }
  }

  return { solvable: false, minMoves: null, statesExplored, moves: [] }
}

export function solve(rawPuzzle, maxDepth = DEFAULT_MAX_DEPTH) {
  const result = solveWithPath(rawPuzzle, maxDepth)
  return {
    solvable: result.solvable,
    minMoves: result.minMoves,
    statesExplored: result.statesExplored,
  }
}

// ── CLI runner ────────────────────────────────────────────────────────────────

function runAll(maxDepth = DEFAULT_MAX_DEPTH) {
  const W = [5, 22, 28, 20, 14]
  const p = (s, w) => String(s).padEnd(w)
  const hr = '─'.repeat(W.reduce((a, b) => a + b, 0))

  console.log(`\nXess Puzzle Solver  (max depth: ${maxDepth})\n`)
  console.log([p('No.', W[0]), p('Title', W[1]), p('Goal type', W[2]), p('Result', W[3]), p('States', W[4])].join(''))
  console.log(hr)

  let solved = 0
  const unsolvable = []

  for (let i = 0; i < catalogue.length; i++) {
    const raw = catalogue[i]
    const { solvable, minMoves, statesExplored } = solve(raw, maxDepth)
    if (solvable) solved++
    else unsolvable.push(i + 1)

    const result = solvable
      ? `✓ ${minMoves} move${minMoves === 1 ? '' : 's'}`
      : `✗ unsolvable (>${maxDepth})`

    console.log([
      p(i + 1,              W[0]),
      p(raw.title,          W[1]),
      p(raw.goalType,       W[2]),
      p(result,             W[3]),
      p(statesExplored.toLocaleString(), W[4]),
    ].join(''))
  }

  console.log(hr)
  console.log(`\n${solved}/${catalogue.length} solvable within ${maxDepth} moves`)
  if (unsolvable.length > 0) {
    console.log(`Unsolvable puzzle numbers: ${unsolvable.join(', ')}`)
  }
  console.log()
}

function isDirectCliInvocation() {
  if (typeof process === 'undefined' || !Array.isArray(process.argv) || process.argv.length < 2) {
    return false
  }

  try {
    const path = decodeURIComponent(new URL(import.meta.url).pathname)
    return process.argv[1] === path
  } catch {
    return false
  }
}

// Only run when invoked directly via Node CLI (not in browser/tests)
if (isDirectCliInvocation()) {
  const maxDepth = parseInt(process.argv[2], 10) || DEFAULT_MAX_DEPTH
  runAll(maxDepth)
}

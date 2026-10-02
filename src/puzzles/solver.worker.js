// src/puzzles/solver.worker.js
// Runs the BFS solver off the main thread so a long search cannot freeze the page.
// With `boardEntries` it solves from that position (hints); otherwise from the start.

import { solveWithPath, solveFromBoard } from './solver.js'
import { parsePuzzle } from './loader.js'

self.onmessage = ({ data }) => {
  try {
    const result = Array.isArray(data.boardEntries)
      ? solveFromBoard(parsePuzzle(data.raw), new Map(data.boardEntries), data.maxDepth)
      : solveWithPath(data.raw, data.maxDepth)
    self.postMessage({ type: 'result', result })
  } catch (err) {
    self.postMessage({ type: 'error', message: err?.message ?? 'solver error' })
  }
}

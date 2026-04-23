// src/puzzles/solver.worker.js
// Runs solveWithPath off the main thread so a long BFS cannot freeze the page.

import { solveWithPath } from './solver.js'

self.onmessage = ({ data }) => {
  try {
    const result = solveWithPath(data.raw, data.maxDepth)
    self.postMessage({ type: 'result', result })
  } catch (err) {
    self.postMessage({ type: 'error', message: err?.message ?? 'solver error' })
  }
}

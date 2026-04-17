// src/engine/index.js
// Public API for all engine consumers (Phase 2 game controller, tests)

export { getLegalMoves } from './moves.js'
export { applyMove } from './apply.js'
export { checkWin } from './win.js'

// Coordinate helpers re-exported for callers that need to build position keys
export { posKey, parseKey } from '../puzzles/loader.js'

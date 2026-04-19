// src/controller.js
// Stateful game controller — wires engine, persistence, and navigation helpers.
// Runtime-agnostic controller: no direct browser API access.

import { getLegalMoves, applyMove } from './engine/index.js'
import { parsePuzzle, posKey } from './puzzles/loader.js'
import catalogue from './puzzles/catalogue.js'
import { loadStore, saveProgress, saveActiveState, clearActiveState } from './store/store.js'
import { isUnlocked, getPuzzlePosition, getPuzzleList, getTrackLaunchPuzzleId as resolveTrackLaunchPuzzleId } from './puzzles/nav.js'

const CATALOGUE_IDS = new Set(catalogue.map(entry => entry.id))

function sanitizeSolvedIds(solvedIds) {
  if (!Array.isArray(solvedIds)) return []
  return solvedIds.filter(id => typeof id === 'string' && CATALOGUE_IDS.has(id))
}

function sanitizeActivePuzzleId(activePuzzleId) {
  if (typeof activePuzzleId !== 'string') return null
  return CATALOGUE_IDS.has(activePuzzleId) ? activePuzzleId : null
}

/**
 * Create a stateful game controller instance.
 *
 * @returns {Object} controller
 */
export function createController() {
  const state = {
    puzzle: null,       // parsed puzzle object (id, goalType, targetColor, board, …)
    board: null,        // current board Map (mutable pointer; each move creates new Map)
    undoStack: [],      // array of board Maps (pre-move snapshots)
    solvedIds: [],      // array of solved puzzle IDs (loaded from store on loadPuzzle)
    won: false,         // true after a winning move until next loadPuzzle
  }

  /** Find raw catalogue entry by id; throws if not found (T-02-09). */
  function _rawEntry(puzzleId) {
    const raw = catalogue.find(e => e.id === puzzleId)
    if (!raw) throw new Error(`Unknown puzzle id: ${puzzleId}`)
    return raw
  }

  /**
   * Convert getLegalMoves result (Array<[col, row]>) to an array of posKey strings.
   * @param {Array<[number,number]>} moves
   * @returns {string[]}
   */
  function _movesToKeys(moves) {
    return moves.map(([c, r]) => posKey(c, r))
  }

  function _isControllable(color) {
    return state.puzzle?.controllableColors?.includes(color) === true
  }

  function _canCapture(moverColor, targetColor) {
    const allowed = state.puzzle?.capturableByColor?.[moverColor]
    if (!Array.isArray(allowed)) return false
    return allowed.includes(targetColor)
  }

  return {
    /**
     * Load a puzzle by id. Re-hydrates from persisted active state if puzzle ID matches.
     * Returns the full initial state snapshot.
     *
     * @param {string} puzzleId
     * @returns {{ puzzle, board, undoStack, solvedIds, won }}
     */
    loadPuzzle(puzzleId) {
      const raw = _rawEntry(puzzleId)            // T-02-09: throws if unknown
      const parsed = parsePuzzle(raw)
      const store = loadStore()
      state.solvedIds = sanitizeSolvedIds(store.solvedIds)

      // Re-hydration: only if store has activeState for exactly this puzzle (T-02-10)
      let board = parsed.board
      let undoStack = []
      if (store.activeState && store.activeState.puzzleId === puzzleId) {
        try {
          board = new Map(store.activeState.boardEntries)
          undoStack = store.activeState.undoEntries.map(entries => new Map(entries))
        } catch {
          // T-02-10: malformed entries — fall back to fresh start
          board = parsed.board
          undoStack = []
        }
      }

      state.puzzle = parsed
      state.board = board
      state.undoStack = undoStack
      state.won = false

      return {
        puzzle: state.puzzle,
        board: state.board,
        undoStack: state.undoStack,
        solvedIds: state.solvedIds,
        won: false,
      }
    },

    /**
     * Return legal destination posKeys for the piece at posKey.
     * Returns [] if no puzzle loaded, empty square, or opponent piece.
     *
     * @param {string} positionKey
     * @returns {string[]}
     */
    selectPiece(positionKey) {
      if (!state.puzzle) return []
      const cell = state.board.get(positionKey)
      if (!cell || !cell.piece) return []
      if (!_isControllable(cell.piece.color)) return []

      const moverColor = cell.piece.color
      return _movesToKeys(getLegalMoves(state.board, positionKey)).filter((destKey) => {
        const destination = state.board.get(destKey)
        if (!destination?.piece) return true
        return _canCapture(moverColor, destination.piece.color)
      })
    },

    /**
     * Apply a move from `from` to `to`.
     * Validates legality before calling applyMove (T-02-08).
     * On win: persists solved ID, clears active state.
     *
     * @param {string} from - posKey of the piece to move
     * @param {string} to   - posKey of destination
     * @returns {{ board, won, captured } | { error: string }}
     */
    makeMove(from, to) {
      if (!state.puzzle) return { error: 'no_puzzle' }
      // T-02-11: prevent moves after game is won
      if (state.won) return { error: 'game_over' }

      const fromCell = state.board.get(from)
      if (!fromCell?.piece) return { error: 'illegal_move' }
      if (!_isControllable(fromCell.piece.color)) return { error: 'illegal_move' }

      // Validate destination by geometry first, then enforce capture policy.
      const legal = _movesToKeys(getLegalMoves(state.board, from)).filter((destKey) => {
        const destination = state.board.get(destKey)
        if (!destination?.piece) return true
        return _canCapture(fromCell.piece.color, destination.piece.color)
      })
      if (!legal.includes(to)) return { error: 'illegal_move' }

      const prev = state.board
      const { board: next, won, captured } = applyMove(state.board, from, to, state.puzzle)

      state.undoStack.push(prev)
      state.board = next
      state.won = won

      if (won) {
        // Unlock the next puzzle by recording this one as solved
        state.solvedIds = [...new Set([...state.solvedIds, state.puzzle.id])]
        saveProgress(state.solvedIds)
        clearActiveState()
      } else {
        saveActiveState(state.puzzle.id, state.board, state.undoStack)
      }

      return { board: state.board, won, captured }
    },

    /**
     * Undo the last move. No-op on empty stack.
     *
     * @returns {{ board, undoStack }}
     */
    undo() {
      if (state.undoStack.length === 0) {
        return { board: state.board, undoStack: [] }
      }
      state.board = state.undoStack.pop()
      state.won = false  // undoing a winning move un-wins it
      saveActiveState(state.puzzle.id, state.board, state.undoStack)
      return { board: state.board, undoStack: state.undoStack }
    },

    /**
     * Reset to the puzzle's initial board state. Clears undo stack.
     *
     * @returns {{ board }}
     */
    reset() {
      if (!state.puzzle) return { error: 'no_puzzle' }
      const fresh = parsePuzzle(_rawEntry(state.puzzle.id))
      state.board = fresh.board
      state.undoStack = []
      state.won = false
      clearActiveState()
      return { board: state.board }
    },

    /**
     * Return puzzle list with status fields (delegates to nav.js).
     *
     * @returns {{ id, title, status }[]}
     */
    getPuzzleList() {
      return getPuzzleList(state.solvedIds)
    },

    /**
     * Return "N / M" position string for a puzzle (delegates to nav.js).
     *
     * @param {string} puzzleId
     * @returns {string|null}
     */
    getPuzzlePosition(puzzleId) {
      return getPuzzlePosition(puzzleId)
    },

    /**
     * Return whether puzzleId is currently unlocked (delegates to nav.js).
     *
     * @param {string} puzzleId
     * @returns {boolean}
     */
    isUnlocked(puzzleId) {
      return isUnlocked(puzzleId, state.solvedIds)
    },

    /**
     * Resolve launch/resume puzzle for a selected track using persisted progress state.
     *
     * @param {string} trackId
     * @returns {string|null}
     */
    getTrackLaunchPuzzleId(trackId) {
      const store = loadStore()
      const solvedIds = sanitizeSolvedIds(store.solvedIds)
      const activePuzzleId = sanitizeActivePuzzleId(store.activeState?.puzzleId)

      return resolveTrackLaunchPuzzleId({
        trackId,
        solvedIds,
        activePuzzleId,
      })
    },
  }
}

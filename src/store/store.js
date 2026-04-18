// src/store/store.js
// localStorage persistence layer for Xess puzzle game.

import catalogue from '../puzzles/catalogue.js'

const STORAGE_KEY = 'xess_v1'
const CURRENT_SCHEMA_VERSION = 1
const DEBOUNCE_MS = 300

// Module-level debounce state
let debounceTimer = null
let pendingWrite = null

/**
 * Default store shape when localStorage is empty or invalid.
 */
function _defaultStore() {
  return { schemaVersion: CURRENT_SCHEMA_VERSION, solvedIds: [], activeState: null }
}

const VALID_PUZZLE_IDS = new Set(catalogue.map(entry => entry.id))

/**
 * Load and parse the store from localStorage.
 *
 * Returns a sanitized object. Callers that need Map objects must re-hydrate:
 *   - Board: new Map(activeState.boardEntries)
 *   - Undo stack: activeState.undoEntries.map(e => new Map(e))
 *
 * @returns {{ schemaVersion: number, solvedIds: string[], activeState: Object|null }}
 */
function _sanitizeActiveState(activeState) {
  if (!activeState || typeof activeState !== 'object') return null

  const puzzleId = typeof activeState.puzzleId === 'string' ? activeState.puzzleId : null
  if (!puzzleId || !VALID_PUZZLE_IDS.has(puzzleId)) return null

  const boardEntries = Array.isArray(activeState.boardEntries) ? activeState.boardEntries : []
  const undoEntries = Array.isArray(activeState.undoEntries) ? activeState.undoEntries : []

  return { puzzleId, boardEntries, undoEntries }
}

function _sanitizeStore(parsed) {
  const solvedIds = Array.isArray(parsed?.solvedIds)
    ? [...new Set(parsed.solvedIds.filter(id => typeof id === 'string' && VALID_PUZZLE_IDS.has(id)))]
    : []

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    solvedIds,
    activeState: _sanitizeActiveState(parsed?.activeState),
  }
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return _defaultStore()
    const parsed = JSON.parse(raw)
    if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      // T-02-02: schema version mismatch — wipe stale data
      return _defaultStore()
    }
    return _sanitizeStore(parsed)
  } catch {
    // T-02-01: malformed JSON — return safe default
    return _defaultStore()
  }
}

/**
 * Internal: read current store, merge patch, write back to localStorage.
 * T-02-03: QuotaExceededError is logged and swallowed (puzzle data is ~5KB max).
 */
function _write(patch) {
  const current = loadStore()
  const next = { ...current, ...patch }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (err) {
    // T-02-03: accept QuotaExceededError — log and continue
    console.error('xess: localStorage write failed', err)
  }
}

/**
 * Persist the list of solved puzzle IDs.
 * Deduplicates before writing.
 *
 * @param {string[]} solvedIds
 */
export function saveProgress(solvedIds) {
  _write({ solvedIds: [...new Set(solvedIds)] })
}

/**
 * Internal: flush the pendingWrite to localStorage immediately.
 */
function _writeActive(state) {
  _write({ activeState: state })
}

/**
 * Persist the current active puzzle state with debouncing (300ms).
 * Rapid calls produce exactly one write after DEBOUNCE_MS.
 *
 * @param {string} puzzleId
 * @param {Map<string, Cell>} board
 * @param {Map<string, Cell>[]} undoStack
 */
export function saveActiveState(puzzleId, board, undoStack) {
  const boardEntries = Array.from(board.entries())
  const undoEntries = undoStack.map(b => Array.from(b.entries()))
  pendingWrite = { puzzleId, boardEntries, undoEntries }
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    _writeActive(pendingWrite)
    pendingWrite = null
    debounceTimer = null
  }, DEBOUNCE_MS)
}

/**
 * Cancel any pending debounced write and flush to localStorage immediately.
 * When nothing is pending, this is a no-op.
 */
export function flushSync() {
  if (!debounceTimer && !pendingWrite) return
  clearTimeout(debounceTimer)
  debounceTimer = null
  if (pendingWrite) {
    _writeActive(pendingWrite)
    pendingWrite = null
  }
}

/**
 * Clear the active puzzle state from localStorage.
 * Flushes any pending debounced write first to avoid races.
 */
export function clearActiveState() {
  flushSync()
  _write({ activeState: null })
}

// PRS-04: Register visibilitychange listener once at module load.
// The typeof guard prevents crashes in Node/Vitest environments.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSync()
  })
}

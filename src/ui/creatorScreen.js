// src/ui/creatorScreen.js
// State and behaviour of the puzzle creator: editing with undo, auto-solving,
// test play, solution replay and export. Rendering lives in puzzleCreator.js.

import catalogue from '../puzzles/catalogue.js'
import { parsePuzzle, posKey } from '../puzzles/loader.js'
import { getLegalMoves, applyMove } from '../engine/index.js'
import { loadCreatorDraft, saveCreatorDraft } from '../store/creatorDraft.js'
import {
  applyMovesToBoard,
  applyToolToCell,
  boardToCreatorCells,
  cellMatchesTool,
  creatorStateFromRawPuzzle,
  createEmptyCreatorCells,
  renderPuzzleCreator,
  resizeCreatorEdge,
  suggestTrack,
  toCatalogueSnippet,
  toRawPuzzle,
} from './puzzleCreator.js'

const SOLVE_DEBOUNCE_MS = 350
const SOLVE_TIMEOUT_MS = 30000
const MAX_EDIT_HISTORY = 100

export function generateSlugId(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 12)
    .replace(/-+$/, '')
}

function clampSolverDepth(value) {
  if (!Number.isFinite(value)) return 60
  return Math.max(1, Math.min(200, value))
}

function blankState() {
  const width = 5
  const height = 5
  return {
    id: 'new-puzzle',
    title: 'New Puzzle',
    idFollowsTitle: true,
    descriptionHtml: '',
    goalType: 'reach-all-goal-squares',
    targetColor: 'black',
    promote: false,
    width,
    height,
    cells: createEmptyCreatorCells(width, height),
    goalTargets: {},
    editMode: 'place',
    placementMode: 'red-piece',
    pieceType: 'r',
    viewMode: 'edit',
    copyStatus: '',
    solverMaxDepth: 60,
  }
}

/**
 * @param {{ onChange: () => void }} options - onChange is called whenever the screen must re-render
 */
export function createCreatorScreen({ onChange }) {
  let state = blankState()
  let loaded = false
  let past = []     // edit undo snapshots
  let future = []   // edit redo snapshots
  let strokeErases = false

  // Solver result for the current board
  let solve = { kind: 'idle', text: '', moves: [], boards: [] }
  let replayIndex = 0
  let solveTimer = null
  let solveDeadline = null
  let solveWorker = null

  // Test play
  let play = null

  const presetOptions = catalogue.map(entry => ({
    id: entry.id,
    label: `${entry.title || entry.id} (${entry.id})`,
  }))

  function rawPuzzle() {
    return toRawPuzzle(state)
  }

  /** @returns {{ raw: object, parsed: object|null, error: string }} */
  function validate() {
    const raw = rawPuzzle()
    try {
      if (raw.id.length === 0) throw new Error('The puzzle needs an id')
      const parsed = parsePuzzle(raw)
      const pieces = [...parsed.board.values()].filter(cell => cell.piece)
      if (!pieces.some(cell => parsed.controllableColors.includes(cell.piece.color))) {
        throw new Error('Place at least one piece the player can move')
      }
      if (raw.goalType === 'capture-all-targets' && !pieces.some(cell => cell.piece.color === raw.targetColor)) {
        throw new Error('Place at least one black piece to capture')
      }
      return { raw, parsed, error: '' }
    } catch (error) {
      const message = (error?.message ?? 'Invalid puzzle').replace(/^Puzzle "[^"]*": /, '')
      return {
        raw,
        parsed: null,
        error: message.includes('requires at least one G square')
          ? 'Add a goal square: pick a piece from "Goal square for" and place it on the board'
          : message,
      }
    }
  }

  function snapshot() {
    return {
      cells: state.cells,
      goalTargets: state.goalTargets,
      width: state.width,
      height: state.height,
      goalType: state.goalType,
      promote: state.promote,
    }
  }

  function pushHistory() {
    past = [...past.slice(-(MAX_EDIT_HISTORY - 1)), snapshot()]
    future = []
  }

  function stopSolver() {
    clearTimeout(solveTimer)
    clearTimeout(solveDeadline)
    solveTimer = null
    solveDeadline = null
    if (solveWorker) {
      solveWorker.terminate()
      solveWorker = null
    }
  }

  /** Called after anything that changes the puzzle itself (not just the selected tool). */
  function puzzleChanged() {
    play = null
    replayIndex = 0
    state = { ...state, copyStatus: '', viewMode: 'edit' }
    saveCreatorDraft(rawPuzzle())
    scheduleSolve()
    onChange()
  }

  function scheduleSolve() {
    stopSolver()
    const { raw, parsed, error } = validate()
    if (!parsed) {
      solve = { kind: 'invalid', text: error, moves: [], boards: [] }
      return
    }
    if (typeof Worker === 'undefined') {
      solve = { kind: 'idle', text: 'Solver unavailable in this browser.', moves: [], boards: [] }
      return
    }

    solve = { kind: 'solving', text: 'Checking solvability…', moves: [], boards: [] }
    const maxDepth = clampSolverDepth(state.solverMaxDepth)

    solveTimer = setTimeout(() => {
      const worker = new Worker(
        new URL('../puzzles/solver.worker.js', import.meta.url),
        { type: 'module' },
      )
      solveWorker = worker

      solveDeadline = setTimeout(() => {
        if (worker !== solveWorker) return
        stopSolver()
        solve = {
          kind: 'timeout',
          text: `No answer after ${SOLVE_TIMEOUT_MS / 1000} s. The position is too open to search; add holes or blockers, or lower the move limit.`,
          moves: [],
          boards: [],
        }
        onChange()
      }, SOLVE_TIMEOUT_MS)

      worker.onmessage = ({ data }) => {
        if (worker !== solveWorker) return
        stopSolver()
        if (data.type === 'error') {
          solve = { kind: 'invalid', text: `Solver error: ${data.message}`, moves: [], boards: [] }
        } else if (!data.result.solvable) {
          solve = {
            kind: 'unsolvable',
            text: `Not solvable within ${maxDepth} moves (${data.result.statesExplored.toLocaleString()} positions searched).`,
            moves: [],
            boards: [],
          }
        } else {
          const { minMoves, statesExplored, moves } = data.result
          solve = {
            kind: 'solved',
            text: minMoves === 0
              ? 'Already solved at the start. Move a piece off its goal.'
              : `Solvable · par ${minMoves} · ${statesExplored.toLocaleString()} positions searched · fits ${suggestTrack({ par: minMoves, statesExplored })}`,
            moves,
            boards: applyMovesToBoard({ board: parsed.board, puzzle: parsed, moves }),
          }
        }
        onChange()
      }
      worker.onerror = (err) => {
        if (worker !== solveWorker) return
        stopSolver()
        solve = { kind: 'invalid', text: `Solver error: ${err?.message ?? 'worker failed'}`, moves: [], boards: [] }
        onChange()
      }
      worker.postMessage({ raw, maxDepth })
    }, SOLVE_DEBOUNCE_MS)
  }

  function ensureLoaded() {
    if (loaded) return
    loaded = true
    const draft = loadCreatorDraft()
    if (draft) {
      const restored = creatorStateFromRawPuzzle(draft)
      state = {
        ...state,
        ...restored,
        idFollowsTitle: restored.id === generateSlugId(restored.title),
        placementMode: restored.goalType === 'capture-all-targets' ? 'white-piece' : 'red-piece',
      }
    }
    scheduleSolve()
  }

  // ── Test play ──

  function playLegalMoves(key) {
    const cell = play.board.get(key)
    if (!cell?.piece || !play.puzzle.controllableColors.includes(cell.piece.color)) return []
    return getLegalMoves(play.board, key)
      .map(([col, row]) => posKey(col, row))
      .filter((destKey) => {
        const target = play.board.get(destKey)?.piece
        return !target || play.puzzle.capturableByColor[cell.piece.color]?.includes(target.color)
      })
  }

  function startPlay() {
    const { parsed } = validate()
    if (!parsed) return false
    play = { puzzle: parsed, board: parsed.board, selected: null, legal: [], past: [], won: false }
    return true
  }

  function playTap(key) {
    if (!play || play.won) return
    if (play.selected && play.legal.includes(key)) {
      const result = applyMove(play.board, play.selected, key, play.puzzle)
      play = {
        ...play,
        past: [...play.past, play.board],
        board: result.board,
        won: result.won,
        selected: null,
        legal: [],
      }
      return
    }
    const legal = key === play.selected ? [] : playLegalMoves(key)
    play = legal.length > 0 ? { ...play, selected: key, legal } : { ...play, selected: null, legal: [] }
  }

  function playText() {
    const moves = play.past.length
    const par = solve.kind === 'solved' ? solve.moves.length : null
    if (play.won) {
      return par !== null && moves > par
        ? `Solved in ${moves} moves. Par is ${par}.`
        : `Solved in ${moves} moves${par !== null ? ', the fewest possible' : ''}.`
    }
    return `${moves} ${moves === 1 ? 'move' : 'moves'}${par !== null ? ` · par ${par}` : ''}`
  }

  // ── Editing ──

  function paintCell(key, { drag }) {
    const cell = state.cells.get(key)
    if (!cell) return
    const tool = { editMode: state.editMode, placementMode: state.placementMode, pieceType: state.pieceType }

    if (!drag) {
      // A stroke that starts on a square already holding the tool clears instead
      strokeErases = state.editMode !== 'empty'
        && cellMatchesTool({ cell, goalTarget: state.goalTargets[key], ...tool })
      pushHistory()
    }

    const next = applyToolToCell({
      cells: state.cells,
      goalTargets: state.goalTargets,
      cellKey: key,
      goalType: state.goalType,
      ...tool,
      ...(strokeErases ? { editMode: 'empty' } : {}),
    })
    state = { ...state, cells: next.cells, goalTargets: next.goalTargets }
    puzzleChanged()
  }

  function restoreSnapshot(snap) {
    state = { ...state, ...snap }
    puzzleChanged()
  }

  function undoEdit() {
    if (past.length === 0) return
    future = [...future, snapshot()]
    const snap = past[past.length - 1]
    past = past.slice(0, -1)
    restoreSnapshot(snap)
  }

  function redoEdit() {
    if (future.length === 0) return
    past = [...past, snapshot()]
    const snap = future[future.length - 1]
    future = future.slice(0, -1)
    restoreSnapshot(snap)
  }

  function setViewMode(viewMode) {
    if (viewMode === 'play' && !startPlay()) return
    if (viewMode === 'replay' && solve.boards.length === 0) return
    if (viewMode !== 'play') play = null
    replayIndex = 0
    state = { ...state, viewMode }
    onChange()
  }

  function stepReplay(delta) {
    const next = Math.max(0, Math.min(solve.boards.length - 1, replayIndex + delta))
    if (next === replayIndex) return
    replayIndex = next
    onChange()
  }

  async function copyExport() {
    const { raw, parsed } = validate()
    if (!parsed) return
    let copyStatus = 'failed'
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
        await navigator.clipboard.writeText(toCatalogueSnippet(raw))
        copyStatus = 'copied'
      }
    } catch {
      copyStatus = 'failed'
    }
    state = { ...state, copyStatus }
    onChange()
  }

  function buildModel() {
    const { raw, parsed, error } = validate()
    const viewMode = state.viewMode

    let displayCells = state.cells
    let highlight = null
    if (viewMode === 'play' && play) {
      displayCells = boardToCreatorCells(play.board, state.width, state.height)
    } else if (viewMode === 'replay' && solve.boards.length > 0) {
      displayCells = boardToCreatorCells(solve.boards[replayIndex], state.width, state.height)
      highlight = solve.moves[replayIndex] ?? null
    }

    return {
      ...state,
      presetOptions,
      displayCells,
      highlight,
      isValid: parsed !== null,
      status: { kind: solve.kind, text: solve.text },
      replayIndex,
      replayCount: solve.boards.length,
      playSelected: viewMode === 'play' ? play?.selected ?? null : null,
      playLegal: viewMode === 'play' ? play?.legal ?? [] : [],
      play: play ? { moves: play.past.length, canUndo: play.past.length > 0, text: playText() } : null,
      canUndoEdit: past.length > 0,
      canRedoEdit: future.length > 0,
      exportText: parsed ? toCatalogueSnippet(raw) : `// Not exportable yet: ${error}`,
    }
  }

  function render() {
    ensureLoaded()

    return renderPuzzleCreator({
      model: buildModel(),
      onChangeField(field, value) {
        if (field === 'title') {
          state = { ...state, title: value, ...(state.idFollowsTitle ? { id: generateSlugId(value) } : {}) }
          puzzleChanged()
          return
        }
        if (field === 'id') {
          state = { ...state, id: value.trim(), idFollowsTitle: value.trim().length === 0 }
          if (state.idFollowsTitle) state = { ...state, id: generateSlugId(state.title) }
          puzzleChanged()
          return
        }
        if (field === 'descriptionHtml') {
          state = { ...state, descriptionHtml: value }
          puzzleChanged()
          return
        }

        // Goal type and promotion change how the puzzle plays: undoable
        pushHistory()
        const patch = { [field]: value }
        if (field === 'goalType') {
          if (value === 'capture-all-targets') {
            // Goal squares mean nothing in capture puzzles
            const cells = new Map()
            state.cells.forEach((cell, key) => cells.set(key, cell.isGoal ? { ...cell, isGoal: false } : cell))
            patch.cells = cells
            patch.goalTargets = {}
            patch.placementMode = 'white-piece'
          } else {
            patch.placementMode = 'red-piece'
          }
          patch.editMode = 'place'
        }
        state = { ...state, ...patch }
        puzzleChanged()
      },
      onLoadPreset(presetId) {
        const raw = catalogue.find(entry => entry.id === presetId)
        if (!raw) return
        pushHistory()
        const restored = creatorStateFromRawPuzzle(raw)
        state = {
          ...state,
          ...restored,
          idFollowsTitle: false,
          editMode: 'place',
          placementMode: restored.goalType === 'capture-all-targets' ? 'white-piece' : 'red-piece',
        }
        puzzleChanged()
      },
      onNewPuzzle() {
        pushHistory()
        const fresh = blankState()
        state = { ...fresh, solverMaxDepth: state.solverMaxDepth }
        puzzleChanged()
      },
      onSelectTool(tool) {
        state = { ...state, ...tool, viewMode: 'edit' }
        play = null
        onChange()
      },
      onCellAction(key, info = { drag: false }) {
        if (state.viewMode === 'play') {
          if (!info.drag) {
            playTap(key)
            onChange()
          }
          return
        }
        if (state.viewMode === 'replay') return
        paintCell(key, info)
      },
      onResizeEdge(side, delta) {
        const resized = resizeCreatorEdge({
          cells: state.cells,
          goalTargets: state.goalTargets,
          width: state.width,
          height: state.height,
          side,
          delta,
        })
        if (resized.width === state.width && resized.height === state.height) return
        pushHistory()
        state = { ...state, ...resized }
        puzzleChanged()
      },
      onUndoEdit: undoEdit,
      onRedoEdit: redoEdit,
      onSetViewMode: setViewMode,
      onReplayStep: stepReplay,
      onPlayUndo() {
        if (!play || play.past.length === 0) return
        play = {
          ...play,
          board: play.past[play.past.length - 1],
          past: play.past.slice(0, -1),
          won: false,
          selected: null,
          legal: [],
        }
        onChange()
      },
      onPlayReset() {
        if (startPlay()) onChange()
      },
      onCopyExport: copyExport,
      onChangeSolverDepth(depth) {
        state = { ...state, solverMaxDepth: clampSolverDepth(depth) }
        scheduleSolve()
        onChange()
      },
    })
  }

  /** @returns {boolean} true when the key was handled */
  function handleKeydown(event) {
    const mod = event.ctrlKey || event.metaKey
    if (state.viewMode === 'replay') {
      if (event.key === 'ArrowLeft' || event.key === '[') { stepReplay(-1); return true }
      if (event.key === 'ArrowRight' || event.key === ']') { stepReplay(1); return true }
    }
    if (state.viewMode === 'edit' && mod && event.key.toLowerCase() === 'z') {
      if (event.shiftKey) redoEdit()
      else undoEdit()
      return true
    }
    if (state.viewMode === 'edit' && mod && event.key.toLowerCase() === 'y') {
      redoEdit()
      return true
    }
    return false
  }

  return { render, handleKeydown }
}

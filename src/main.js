import { createController } from './controller.js'
import { createBoardRenderModel } from './ui/boardRenderer.js'
import { renderStartScreen } from './ui/startScreen.js'
import { renderTrackBrowser } from './ui/trackBrowser.js'
import { renderAppShell } from './ui/appShell.js'
import {
  applyMovesToBoard,
  applyToolToCell,
  creatorStateFromRawPuzzle,
  createEmptyCreatorCells,
  renderPuzzleCreator,
  resizeCreatorCells,
  toBoardMapFromCells,
  toRawPuzzle,
} from './ui/puzzleCreator.js'
import './styles/app.css'
import './styles/puzzle-list.css'
import './styles/puzzle-creator.css'
import {
  MOVE_TRANSITION_MS,
  createInteractionFeedback,
  getBoardInteractionClasses,
  getCellInteractionClasses,
  getPieceInteractionClasses,
} from './ui/interactionFeedback.js'
import {
  getPrevId,
  getNextId,
  getPrevIdInTrack,
  getNextIdInTrack,
  getPuzzlePosition,
  getTrackPuzzlePosition,
  getTracks,
  getTrackPuzzleList,
  resolveLandingContinueAction,
} from './puzzles/nav.js'
import catalogue from './puzzles/catalogue.js'
import { parsePuzzle } from './puzzles/loader.js'
import { loadStore, saveTutorialOnboarding } from './store/store.js'
import { initSound, playMove, playSolve, isSoundEnabled, toggleSound } from './sound.js'
import { initDragDrop } from './ui/dragDrop.js'
import { initPwaPrompts } from './ui/pwaPrompts.js'
import { sanitizePuzzleDescription } from './ui/puzzleDescriptionSanitizer.js'

if (typeof window !== 'undefined') {
  initPwaPrompts()
}
initSound()

// Material Design icon SVG paths (viewBox 0 0 24 24)
const ICONS = {
  chevronLeft:  'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  chevronRight: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  restart:      'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  undo:         'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z',
  redo:         'M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z',
  menu:         'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  volumeUp:     'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  volumeOff:    'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
}

function btnLabel(text) {
  const span = document.createElement('span')
  span.setAttribute('class', 'nav-btn-label')
  span.textContent = text
  return span
}

function svgIcon(path) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('class', 'icon')
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  p.setAttribute('d', path)
  svg.appendChild(p)
  return svg
}

let _domParser = null
function getDomParser() {
  if (!_domParser) _domParser = new DOMParser()
  return _domParser
}

function chooseInitialPuzzleId(controller, preferredId) {
  if (preferredId) return preferredId

  const list = controller.getPuzzleList()
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('No puzzles available')
  }

  return list.find(item => item.status === 'unlocked')?.id ?? list[0].id
}

function buildInteractionRenderModel({ puzzle, board, renderBoardView, feedback }) {
  const snapshot = feedback.snapshot()
  const baseModel = renderBoardView({
    puzzle,
    board,
    selectedKey: snapshot.selectedKey,
    legalMoves: snapshot.legalKeys,
    illegalKey: snapshot.illegalKey,
    won: snapshot.won,
  })

  return {
    ...baseModel,
    puzzle,
    puzzleTitle: puzzle?.title ?? 'Untitled puzzle',
    objectiveText: getPuzzleObjectiveText(puzzle),
    boardClasses: getBoardInteractionClasses(snapshot),
    animationMs: MOVE_TRANSITION_MS,
    cells: baseModel.cells.map(cell => ({
      ...cell,
      interactionClasses: getCellInteractionClasses(snapshot, cell.key),
      pieceClasses: cell.piece ? getPieceInteractionClasses(snapshot, cell.key) : [],
    })),
  }
}

function getTrackingSnapshot(controller) {
  if (!controller || typeof controller.getTrackingState !== 'function') {
    return { moveEvents: [], moveCount: 0, canUndo: false, canRedo: false }
  }

  const snapshot = controller.getTrackingState()
  return {
    moveEvents: Array.isArray(snapshot?.moveEvents) ? snapshot.moveEvents : [],
    moveCount: Number.isInteger(snapshot?.moveCount) ? snapshot.moveCount : 0,
    canUndo: snapshot?.canUndo === true,
    canRedo: snapshot?.canRedo === true,
  }
}

export function getPuzzleObjectiveText(puzzle) {
  if (!puzzle || typeof puzzle !== 'object') {
    return 'Solve the puzzle objective.'
  }

  if (puzzle.goalType === 'capture-all-targets') {
    const targetColor = typeof puzzle.targetColor === 'string' && puzzle.targetColor.length > 0
      ? puzzle.targetColor
      : 'target'
    return `Capture all ${targetColor} targets.`
  }

  if (puzzle.goalType === 'reach-all-goal-squares') {
    return 'The red pieces have to reach their goal squares.'
  }

  return 'Solve the puzzle objective.'
}

export function getGoalBadgeData(puzzle) {
  if (!puzzle) return { label: 'Solve the puzzle objective.', type: 'unknown' }
  if (puzzle.goalType === 'capture-all-targets') return { label: 'Capture all targets', type: 'capture' }
  if (puzzle.goalType === 'reach-all-goal-squares') return { label: 'Reach the goal squares', type: 'reach' }
  return { label: 'Solve the puzzle objective.', type: 'unknown' }
}

export function getPuzzleDescriptionHtml(puzzle) {
  const authoredHtml = typeof puzzle?.descriptionHtml === 'string' ? puzzle.descriptionHtml : ''
  const sanitized = sanitizePuzzleDescription(authoredHtml)
  return sanitized.trim()
}

function clampBoardSize(value) {
  if (!Number.isFinite(value)) return 6
  return Math.max(2, Math.min(12, value))
}

function clampSolverDepth(value) {
  if (!Number.isFinite(value)) return 60
  return Math.max(1, Math.min(200, value))
}

function createInitialCreatorState() {
  const width = 6
  const height = 6
  return {
    id: 'draft-puzzle',
    title: 'Draft Puzzle',
    descriptionHtml: '',
    goalType: 'reach-all-goal-squares',
    targetColor: 'black',
    promote: false,
    width,
    height,
    selectedPresetId: catalogue[0]?.id ?? '',
    presetOptions: catalogue.map(entry => ({
      id: entry.id,
      label: `${entry.title || entry.id} (${entry.id})`,
    })),
    cells: createEmptyCreatorCells(width, height),
    goalTargets: {},
    editMode: 'place',
    placementMode: 'red-piece',
    pieceType: 'r',
    exportJson: '',
    copyStatus: '',
    solverMaxDepth: 60,
    solving: false,
    collapsibleOpen: { settings: true, editor: true, solver: false },
    message: 'Tip: set board size, paint cells, then export JSON.',
    replayBoards: [],
    replayIndex: 0,
  }
}

function generateSlugId(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 12)
    .replace(/-+$/, '')
}

function isCreatorRoute() {
  if (typeof window === 'undefined') return false
  return window.location.hash === '#creator' || window.location.pathname.endsWith('/creator.html')
}

/**
 * Runtime-agnostic orchestrator for select->highlight->move gameplay loop.
 * This is intentionally testable without a browser DOM.
 */
export function createGameUiController({
  controller = createController(),
  renderBoardView = createBoardRenderModel,
  feedback = createInteractionFeedback(),
  puzzleId,
} = {}) {
  const currentPuzzleId = chooseInitialPuzzleId(controller, puzzleId)
  const loaded = controller.loadPuzzle(currentPuzzleId)

  const state = {
    puzzleId: currentPuzzleId,
    puzzle: loaded.puzzle,
    board: loaded.board,
  }

  let _lastMoveResult = null

  const getRenderModel = () => {
    const tracking = getTrackingSnapshot(controller)
    const model = buildInteractionRenderModel({
      puzzle: state.puzzle,
      board: state.board,
      renderBoardView,
      feedback,
    })

    return {
      ...model,
      moveEvents: tracking.moveEvents,
      moveCount: tracking.moveCount,
      moveCounterText: `${tracking.moveCount}`,
      canUndo: tracking.canUndo,
      canRedo: tracking.canRedo,
      historyListRendered: false,
    }
  }

  const tapCell = (positionKey) => {
    if (typeof positionKey !== 'string' || positionKey.length === 0) {
      _lastMoveResult = null
      return getRenderModel()
    }

    const snapshot = feedback.snapshot()
    if (snapshot.won) {
      _lastMoveResult = null
      return getRenderModel()
    }

    if (!snapshot.selectedKey) {
      const legal = controller.selectPiece(positionKey)
      if (legal.length > 0) {
        feedback.select(positionKey, legal)
      }
      _lastMoveResult = null
      return getRenderModel()
    }

    if (positionKey === snapshot.selectedKey) {
      feedback.clearSelection()
      _lastMoveResult = null
      return getRenderModel()
    }

    // T-03-04 mitigation: UI gates move attempts by legal key membership
    if (snapshot.legalKeys.includes(positionKey)) {
      const result = controller.makeMove(snapshot.selectedKey, positionKey)
      if (result.error) {
        feedback.triggerIllegal(positionKey)
        _lastMoveResult = null
        return getRenderModel()
      }

      state.board = result.board
      feedback.applyMove(positionKey, result.won)
      _lastMoveResult = result.won ? 'win' : 'move_made'
      return getRenderModel()
    }

    const legal = controller.selectPiece(positionKey)
    if (legal.length > 0) {
      feedback.select(positionKey, legal)
    } else {
      feedback.triggerIllegal(positionKey)
    }
    _lastMoveResult = null

    return getRenderModel()
  }

  return {
    tapCell,
    undo() {
      if (typeof controller.undo !== 'function') return getRenderModel()
      const result = controller.undo()
      if (result?.board) {
        state.board = result.board
      }
      feedback.applyMove(null, false)
      _lastMoveResult = null
      return getRenderModel()
    },
    redo() {
      if (typeof controller.redo !== 'function') return getRenderModel()
      const result = controller.redo()
      if (result?.board) {
        state.board = result.board
      }
      feedback.applyMove(null, false)
      _lastMoveResult = null
      return getRenderModel()
    },
    restart() {
      const result = controller.reset()
      if (result.error) return getRenderModel()
      if (result.puzzle) {
        state.puzzle = result.puzzle
      }
      state.board = result.board
      feedback.applyMove(null, false)
      _lastMoveResult = null
      return getRenderModel()
    },
    getRenderModel,
    getLastMoveResult() {
      return _lastMoveResult
    },
    getState() {
      const snapshot = feedback.snapshot()
      const tracking = getTrackingSnapshot(controller)
      return {
        ...snapshot,
        puzzleId: state.puzzleId,
        board: state.board,
        puzzleList: controller.getPuzzleList(),
        moveEvents: tracking.moveEvents,
        moveCount: tracking.moveCount,
        canUndo: tracking.canUndo,
        canRedo: tracking.canRedo,
        historyListRendered: false,
      }
    },
  }
}

function renderSoundToggle() {
  const btn = document.createElement('button')
  btn.className = 'sound-toggle'
  btn.setAttribute('type', 'button')
  btn.setAttribute('aria-label', isSoundEnabled() ? 'Mute sounds' : 'Unmute sounds')
  btn.setAttribute('title', isSoundEnabled() ? 'Sound on' : 'Sound off')
  btn.appendChild(svgIcon(isSoundEnabled() ? ICONS.volumeUp : ICONS.volumeOff))

  const handleToggle = () => {
    const enabled = toggleSound()
    btn.innerHTML = ''
    btn.appendChild(svgIcon(enabled ? ICONS.volumeUp : ICONS.volumeOff))
    btn.setAttribute('aria-label', enabled ? 'Mute sounds' : 'Unmute sounds')
    btn.setAttribute('title', enabled ? 'Sound on' : 'Sound off')
  }

  btn.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    handleToggle()
  })

  btn.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  })

  return btn
}

/**
 * Animate a piece sliding from its old screen position to its new one.
 * Uses the FLIP technique: capture old rect before render, then animate
 * the new element from the old position to its natural (new) position.
 *
 * @param {HTMLElement} root    — mount root (for querying before/after)
 * @param {string|null} fromKey — cell key the piece moved FROM
 * @param {string|null} toKey   — cell key the piece moved TO
 * @param {function}    renderFn — zero-arg function that rebuilds the DOM
 */
function animatePieceMove(root, fromKey, toKey, renderFn) {
  // Capture old rect of the moving piece before re-render
  let fromRect = null
  if (fromKey) {
    const fromPiece = root.querySelector(`[data-cell-key="${CSS.escape(fromKey)}"] .piece`)
    if (fromPiece) fromRect = fromPiece.getBoundingClientRect()
  }

  renderFn()

  if (!fromRect || !toKey) return

  const toPiece = root.querySelector(`[data-cell-key="${CSS.escape(toKey)}"] .piece`)
  if (!toPiece) return

  const toRect = toPiece.getBoundingClientRect()
  const dx = fromRect.left - toRect.left
  const dy = fromRect.top - toRect.top
  if (dx === 0 && dy === 0) return

  toPiece.animate(
    [
      { transform: `translate(${dx}px, ${dy}px)`, offset: 0 },
      { transform: 'translate(0, 0)', offset: 1 },
    ],
    { duration: 180, easing: 'ease-out', fill: 'none' },
  )

  // Elevate the piece above sibling cells for the duration of the animation
  // so it isn't clipped or occluded by adjacent cells during the FLIP.
  toPiece.style.position = 'relative'
  toPiece.style.zIndex = '10'
  setTimeout(() => {
    toPiece.style.position = ''
    toPiece.style.zIndex = ''
  }, 180)
}

export function renderToDom(root, model) {
  root.innerHTML = ''

  const app = document.createElement('section')
  app.className = 'xess-ui'

  // ── Topbar: title + info button (mobile) + sound toggle ──
  const topbar = document.createElement('header')
  topbar.className = 'puzzle-topbar'
  topbar.setAttribute('data-puzzle-meta', 'true')

  const title = document.createElement('h1')
  title.className = 'puzzle-title'
  title.setAttribute('data-puzzle-title', 'true')
  title.textContent = model.puzzleTitle

  const topbarControls = document.createElement('div')
  topbarControls.className = 'puzzle-topbar-controls'

  const infoBtn = document.createElement('button')
  infoBtn.type = 'button'
  infoBtn.className = 'nav-btn puzzle-info-btn'
  infoBtn.setAttribute('data-puzzle-info-toggle', 'true')
  infoBtn.setAttribute('aria-label', 'Puzzle info')
  infoBtn.textContent = 'i'

  topbarControls.append(infoBtn, renderSoundToggle())
  topbar.append(title, topbarControls)

  // ── Inline puzzle info (visible on desktop, hidden on mobile) ──
  const descriptionHtml = getPuzzleDescriptionHtml(model.puzzle)
  const badge = getGoalBadgeData(model.puzzle)
  const rawPosition = model.trackPosition ?? (model.puzzleId ? getPuzzlePosition(model.puzzleId) : null)
  const position = rawPosition && model.trackTitle ? `${rawPosition} · ${model.trackTitle}` : rawPosition

  const inlineInfo = document.createElement('div')
  inlineInfo.className = 'puzzle-inline-info'

  const objective = document.createElement('p')
  objective.className = 'puzzle-objective'
  objective.setAttribute('data-puzzle-objective', 'true')
  objective.textContent = model.objectiveText
  inlineInfo.append(objective)

  if (descriptionHtml.length > 0) {
    const desc = document.createElement('div')
    desc.className = 'puzzle-description'
    desc.setAttribute('data-puzzle-description', 'true')
    desc.innerHTML = descriptionHtml
    inlineInfo.append(desc)
  }

  const goalBadgeInline = document.createElement('div')
  goalBadgeInline.className = 'goal-badge'
  goalBadgeInline.setAttribute('data-goal-type', badge.type)
  const badgeLabelInline = document.createElement('span')
  badgeLabelInline.className = 'goal-badge-label'
  badgeLabelInline.textContent = badge.label
  goalBadgeInline.append(badgeLabelInline)
  inlineInfo.append(goalBadgeInline)

  if (position) {
    const posInline = document.createElement('span')
    posInline.className = 'puzzle-position'
    posInline.setAttribute('data-puzzle-position', 'true')
    posInline.textContent = position
    inlineInfo.append(posInline)
  }

  topbar.append(inlineInfo)
  app.append(topbar)

  // ── Board ──
  const boardGoalType = typeof model?.puzzle?.goalType === 'string' ? model.puzzle.goalType : 'unknown'
  const boardModeClass = boardGoalType === 'capture-all-targets'
    ? 'board--mode-capture'
    : boardGoalType === 'reach-all-goal-squares'
      ? 'board--mode-reach'
      : 'board--mode-unknown'

  const board = document.createElement('div')
  board.className = ['board', boardModeClass, ...model.boardClasses].join(' ').trim()
  board.setAttribute('data-board', 'true')
  board.setAttribute('data-goal-type', boardGoalType)
  board.setAttribute('data-board-mode', boardModeClass.replace('board--mode-', ''))
  board.setAttribute('data-promotion-enabled', model?.puzzle?.promote === true ? 'true' : 'false')
  board.style.setProperty('--cols', String(model.width))
  board.style.setProperty('--rows', String(model.height))
  board.style.setProperty('--piece-move-ms', `${model.animationMs}ms`)

  model.cells.forEach(cell => {
    const cellEl = document.createElement('button')
    cellEl.type = 'button'
    cellEl.setAttribute('data-cell-key', cell.key)
    cellEl.className = [...cell.classes, ...cell.interactionClasses].join(' ')

    if (cell.piece) {
      const pieceEl = document.createElement('span')
      pieceEl.className = ['piece', ...cell.pieceClasses].join(' ').trim()
      pieceEl.setAttribute('data-piece-key', cell.piece.svgKey)
      const svgDoc = getDomParser().parseFromString(cell.piece.svg, 'image/svg+xml')
      const svgEl = svgDoc.documentElement
      svgEl.querySelectorAll('script, foreignObject').forEach(n => n.remove())
      pieceEl.append(svgEl)
      cellEl.append(pieceEl)
    } else if (cell.goalGhost) {
      const ghostEl = document.createElement('span')
      ghostEl.className = 'piece piece--ghost'
      ghostEl.setAttribute('aria-hidden', 'true')
      ghostEl.setAttribute('data-goal-ghost-key', cell.goalGhost.svgKey)
      const svgDoc = getDomParser().parseFromString(cell.goalGhost.svg, 'image/svg+xml')
      const svgEl = svgDoc.documentElement
      svgEl.querySelectorAll('script, foreignObject').forEach(n => n.remove())
      ghostEl.append(svgEl)
      cellEl.append(ghostEl)
    }

    board.append(cellEl)
  })

  app.append(board)

  // ── Controls bar: prev | undo | counter | redo | next ──
  const controls = document.createElement('div')
  controls.className = 'puzzle-controls'

  const undoBtn = document.createElement('button')
  undoBtn.type = 'button'
  undoBtn.className = 'nav-btn tracking-btn'
  undoBtn.setAttribute('data-undo-move', 'true')
  undoBtn.setAttribute('aria-label', 'Undo move')
  undoBtn.disabled = !model.canUndo
  undoBtn.appendChild(svgIcon(ICONS.undo))
  undoBtn.appendChild(btnLabel('Undo'))

  const counter = document.createElement('span')
  counter.className = 'tracking-counter'
  counter.setAttribute('data-move-counter', 'true')
  counter.textContent = model.moveCounterText ?? `${model.moveCount ?? 0}`

  const redoBtn = document.createElement('button')
  redoBtn.type = 'button'
  redoBtn.className = 'nav-btn tracking-btn'
  redoBtn.setAttribute('data-redo-move', 'true')
  redoBtn.setAttribute('aria-label', 'Redo move')
  redoBtn.disabled = !model.canRedo
  redoBtn.appendChild(svgIcon(ICONS.redo))
  redoBtn.appendChild(btnLabel('Redo'))

  const restartBtn = document.createElement('button')
  restartBtn.type = 'button'
  restartBtn.className = 'nav-btn'
  restartBtn.setAttribute('data-restart-puzzle', 'true')
  restartBtn.setAttribute('aria-label', 'Restart puzzle')
  restartBtn.appendChild(svgIcon(ICONS.restart))
  restartBtn.appendChild(btnLabel('Reset'))

  controls.append(undoBtn, counter, redoBtn, restartBtn)
  app.append(controls)

  // ── Win modal overlay (only when won) ──
  const isWon = model.boardClasses.includes('is-won')
  if (isWon) {
    const winOverlay = document.createElement('div')
    winOverlay.className = 'win-modal'
    winOverlay.setAttribute('data-win-banner', 'true')
    winOverlay.setAttribute('data-win-dismiss', 'true')

    const winContent = document.createElement('div')
    winContent.className = 'win-modal-content'

    if (model.nextId) {
      winOverlay.setAttribute('data-win-state', 'puzzle-solved')

      const headline = document.createElement('p')
      headline.className = 'win-modal-headline'
      headline.setAttribute('data-win-headline', 'true')
      headline.textContent = 'Puzzle solved!'

      const nextPuzzleBtn = document.createElement('button')
      nextPuzzleBtn.type = 'button'
      nextPuzzleBtn.className = 'btn-next-puzzle'
      nextPuzzleBtn.setAttribute('data-win-next-puzzle', 'true')
      nextPuzzleBtn.textContent = 'Next Puzzle'

      winContent.append(headline, nextPuzzleBtn)
    } else if (model.trackId) {
      winOverlay.setAttribute('data-win-state', 'track-complete')

      const headline = document.createElement('p')
      headline.className = 'win-modal-headline'
      headline.setAttribute('data-win-headline', 'true')
      const label = model.trackTitle ? `${model.trackTitle} complete!` : 'Track complete!'
      headline.textContent = label

      const backBtn = document.createElement('button')
      backBtn.type = 'button'
      backBtn.className = 'btn-next-puzzle'
      backBtn.setAttribute('data-win-back-to-tracks', 'true')
      backBtn.textContent = 'Back to Tracks'

      winContent.append(headline, backBtn)
    } else {
      winOverlay.setAttribute('data-win-state', 'all-solved')

      const total = catalogue.length
      const headline = document.createElement('p')
      headline.className = 'win-modal-headline'
      headline.setAttribute('data-win-headline', 'true')
      headline.setAttribute('data-win-all-solved', 'true')
      headline.textContent = total ? `All ${total} puzzles solved!` : 'All puzzles solved!'

      winContent.append(headline)
    }

    winOverlay.append(winContent)
    app.append(winOverlay)
  }

  // ── Info modal (mobile only — toggled by info button) ──
  const infoOverlay = document.createElement('div')
  infoOverlay.className = 'info-modal'
  infoOverlay.setAttribute('data-info-modal', 'true')
  infoOverlay.setAttribute('data-info-dismiss', 'true')
  infoOverlay.hidden = true

  const infoContent = document.createElement('div')
  infoContent.className = 'info-modal-content'

  const infoTitle = document.createElement('h2')
  infoTitle.className = 'info-modal-title'
  infoTitle.textContent = model.puzzleTitle

  const infoObjective = document.createElement('p')
  infoObjective.className = 'info-modal-objective'
  infoObjective.textContent = model.objectiveText

  infoContent.append(infoTitle, infoObjective)

  if (descriptionHtml.length > 0) {
    const infoDesc = document.createElement('div')
    infoDesc.className = 'info-modal-description'
    infoDesc.innerHTML = descriptionHtml
    infoContent.append(infoDesc)
  }

  const goalBadgeModal = document.createElement('div')
  goalBadgeModal.className = 'goal-badge'
  goalBadgeModal.setAttribute('data-goal-type', badge.type)
  const badgeLabelModal = document.createElement('span')
  badgeLabelModal.className = 'goal-badge-label'
  badgeLabelModal.textContent = badge.label
  goalBadgeModal.append(badgeLabelModal)
  infoContent.append(goalBadgeModal)

  if (position) {
    const posModal = document.createElement('span')
    posModal.className = 'puzzle-position'
    posModal.textContent = position
    infoContent.append(posModal)
  }

  infoOverlay.append(infoContent)
  app.append(infoOverlay)

  root.append(app)
}

export function mountGameUi(root = document.querySelector('#app')) {
  if (!root) {
    throw new Error('Missing #app mount node')
  }

  const controller = createController()

  // Navigation state
  let screenMode = isCreatorRoute() ? 'creator' : 'start'
  let currentPuzzleId = null
  let selectedTrackId = null
  let ui = null
  let creatorState = createInitialCreatorState()
  let _solverWorker = null   // active solver Web Worker, or null
  let _dragCleanup = null    // cleanup fn returned by initDragDrop
  let _isDragging = false    // true once drag threshold exceeded this pointer sequence
  let _suppressTapPointerId = null
  let _isInfoModalOpen = false

  function bindPrimaryAction(element, onActivate) {
    if (!element) return

    element.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      event.preventDefault()
      onActivate()
    })

    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onActivate()
      }
    })
  }

  function loadPuzzle(puzzleId, options = {}) {
    ui = createGameUiController({ controller, puzzleId })
    currentPuzzleId = puzzleId

    if (options.trackId) {
      selectedTrackId = options.trackId
    }
    screenMode = 'play'
    rerender()
  }

  function markTutorialCompleted() {
    if (selectedTrackId !== 'tutorial') return
    saveTutorialOnboarding({ tutorialCompleted: true })
  }

  function buildTrackViewModels() {
    const solvedIds = controller
      .getPuzzleList()
      .filter(item => item.status === 'solved')
      .map(item => item.id)

    return getTracks().map(track => {
      const puzzles = getTrackPuzzleList(track.id, solvedIds)
      return {
        ...track,
        puzzles,
        totalCount: puzzles.length,
        solvedCount: puzzles.filter(entry => entry.status === 'solved').length,
      }
    })
  }

  function goToTrackBrowser(trackId = null) {
    selectedTrackId = trackId
    screenMode = 'tracks'

    rerender()
  }

  function renderShellView({ mode, title, content, prevId = null, nextId = null }) {
    const shell = renderAppShell({
      mode,
      title,
      content,
      showTracks: mode !== 'creator',
      hasPrevPuzzle: mode === 'play' ? !!prevId : false,
      hasNextPuzzle: mode === 'play' ? !!nextId : false,
      onNavigateHome() {
        if (typeof window !== 'undefined' && window.location.pathname.endsWith('/creator.html')) {
          window.location.href = '/'
          return
        }
        selectedTrackId = null
        screenMode = 'start'
        rerender()
      },
      onNavigateTracks() {
        goToTrackBrowser(selectedTrackId)
      },
    })

    root.innerHTML = ''
    root.setAttribute('data-screen-mode', mode ?? 'unknown')
    root.append(shell)
  }


  function rerender() {
    if (screenMode === 'play') {
      renderGameScreen()
      return
    }

    if (screenMode === 'creator') {
      renderCreatorScreen()
      return
    }

    if (screenMode === 'tracks') {
      renderTrackBrowserScreen()
      return
    }

    renderStartScreenView()
  }

  function updateCreator(patch) {
    creatorState = { ...creatorState, ...patch }
    rerender()
  }

  function buildCreatorRawPuzzle() {
    return toRawPuzzle(creatorState)
  }

  function buildValidatedCreatorExport() {
    const raw = buildCreatorRawPuzzle()
    parsePuzzle(raw)
    return `${JSON.stringify(raw, null, 2)}\n`
  }

  function exportCreatorPuzzle() {
    try {
      const exportJson = buildValidatedCreatorExport()
      updateCreator({
        exportJson,
        copyStatus: '',
        message: 'Export successful. JSON is valid against loader rules.',
      })
    } catch (error) {
      updateCreator({
        copyStatus: '',
        message: `Export failed: ${error?.message ?? 'invalid puzzle data'}`,
      })
    }
  }

  async function copyCreatorExportJson() {
    try {
      const exportJson = buildValidatedCreatorExport()
      if (typeof navigator === 'undefined' || typeof navigator.clipboard?.writeText !== 'function') {
        updateCreator({
          exportJson,
          copyStatus: 'failed',
          message: 'Clipboard unavailable in this browser context.',
        })
        return
      }

      await navigator.clipboard.writeText(exportJson)
      updateCreator({
        exportJson,
        copyStatus: 'copied',
        message: 'Copied JSON to clipboard.',
      })
    } catch (error) {
      updateCreator({
        copyStatus: 'failed',
        message: `Copy failed: ${error?.message ?? 'clipboard error'}`,
      })
    }
  }

  function cancelSolverWorker() {
    if (_solverWorker) {
      _solverWorker.terminate()
      _solverWorker = null
    }
  }

  function solveCreatorPuzzle() {
    cancelSolverWorker()

    let raw
    try {
      raw = buildCreatorRawPuzzle()
      parsePuzzle(raw) // validate before dispatching
    } catch (error) {
      updateCreator({ message: `Solve failed: ${error?.message ?? 'invalid puzzle data'}` })
      return
    }

    updateCreator({ solving: true, message: 'Solving…' })

    const worker = new Worker(
      new URL('./puzzles/solver.worker.js', import.meta.url),
      { type: 'module' },
    )
    _solverWorker = worker

    worker.onmessage = ({ data }) => {
      if (worker !== _solverWorker) return // stale
      _solverWorker = null

      if (data.type === 'error') {
        updateCreator({ solving: false, message: `Solve failed: ${data.message}` })
        return
      }

      const solved = data.result
      if (!solved.solvable) {
        updateCreator({
          solving: false,
          replayBoards: [],
          replayIndex: 0,
          message: `No solution found within ${clampSolverDepth(creatorState.solverMaxDepth)} moves (explored ${solved.statesExplored} states).`,
        })
        return
      }

      const parsed = parsePuzzle(raw)
      const snapshots = applyMovesToBoard({ board: parsed.board, puzzle: parsed, moves: solved.moves })
      updateCreator({
        solving: false,
        replayBoards: snapshots,
        replayIndex: 0,
        copyStatus: '',
        message: `Solved in ${solved.minMoves} moves. Use Undo/Redo step to inspect sequence.`,
      })
    }

    worker.onerror = (err) => {
      if (worker !== _solverWorker) return
      _solverWorker = null
      updateCreator({ solving: false, message: `Solve failed: ${err?.message ?? 'worker error'}` })
    }

    worker.postMessage({ raw, maxDepth: clampSolverDepth(creatorState.solverMaxDepth) })
  }

  function cancelSolve() {
    cancelSolverWorker()
    updateCreator({ solving: false, message: 'Solve cancelled.' })
  }

  function renderCreatorScreen() {
    const boardForRender = creatorState.replayBoards.length > 0
      ? creatorState.replayBoards[creatorState.replayIndex]
      : toBoardMapFromCells(creatorState.cells)

    const creatorEl = renderPuzzleCreator({
      model: {
        ...creatorState,
        cells: (() => {
          if (creatorState.replayBoards.length === 0) return creatorState.cells
          const replayCells = new Map()
          for (let row = 0; row < creatorState.height; row += 1) {
            for (let col = 0; col < creatorState.width; col += 1) {
              const key = `${col},${row}`
              const src = creatorState.cells.get(key)
              const replay = boardForRender.get(key)
              replayCells.set(key, {
                isVoid: !src || src.isVoid,
                isGoal: !!replay?.isGoal,
                pieceChar: replay?.piece
                  ? (replay.piece.color === 'white' ? replay.piece.type.toUpperCase() : replay.piece.type)
                  : null,
              })
            }
          }
          return replayCells
        })(),
      },
      onChangeField(field, value) {
        if (field === 'selectedPresetId') {
          updateCreator({ selectedPresetId: value })
          return
        }

        const patch = { [field]: value }
        if (field === 'goalType' && value === 'capture-all-targets') {
          patch.goalTargets = {}
          if (creatorState.placementMode === 'red-piece' || creatorState.placementMode === 'red-target') {
            patch.placementMode = 'black-piece'
          }
        }
        if (field === 'goalType' && value === 'reach-all-goal-squares') {
          if (creatorState.placementMode === 'black-piece') {
            patch.placementMode = 'red-piece'
          }
        }
        updateCreator({
          ...patch,
          copyStatus: '',
          replayBoards: [],
          replayIndex: 0,
        })
      },
      onGenerateId() {
        updateCreator({ id: generateSlugId(creatorState.title), copyStatus: '' })
      },
      onLoadPreset() {
        const raw = catalogue.find(entry => entry.id === creatorState.selectedPresetId)
        if (!raw) {
          updateCreator({ message: 'Preset not found.' })
          return
        }

        const loaded = creatorStateFromRawPuzzle(raw)
        updateCreator({
          ...loaded,
          selectedPresetId: raw.id,
          presetOptions: creatorState.presetOptions,
          editMode: 'place',
          placementMode: loaded.goalType === 'capture-all-targets' ? 'black-piece' : 'red-piece',
          pieceType: 'r',
          exportJson: '',
          copyStatus: '',
          message: `Loaded preset: ${loaded.title || loaded.id}`,
          replayBoards: [],
          replayIndex: 0,
        })
      },
      onNewPuzzle() {
        const fresh = createInitialCreatorState()
        const nextWidth = creatorState.width
        const nextHeight = creatorState.height
        const nextCells = createEmptyCreatorCells(nextWidth, nextHeight)
        updateCreator({
          ...fresh,
          width: nextWidth,
          height: nextHeight,
          cells: nextCells,
          selectedPresetId: creatorState.selectedPresetId,
          presetOptions: creatorState.presetOptions,
          message: 'Started a fresh draft puzzle.',
        })
      },
      onCopyExport() {
        copyCreatorExportJson()
      },
      onResize({ width, height }) {
        const nextWidth = clampBoardSize(width)
        const nextHeight = clampBoardSize(height)
        const resizedCells = resizeCreatorCells(creatorState.cells, nextWidth, nextHeight)
        const nextGoalTargets = {}
        Object.entries(creatorState.goalTargets).forEach(([key, char]) => {
          const cell = resizedCells.get(key)
          if (cell?.isGoal) nextGoalTargets[key] = char
        })
        updateCreator({
          width: nextWidth,
          height: nextHeight,
          cells: resizedCells,
          goalTargets: nextGoalTargets,
          copyStatus: '',
          replayBoards: [],
          replayIndex: 0,
        })
      },
      onChangeSolverDepth(depth) {
        updateCreator({ solverMaxDepth: clampSolverDepth(depth) })
      },
      onSelectEditMode(editMode) {
        updateCreator({ editMode })
      },
      onSelectPlacementMode(placementMode) {
        updateCreator({ placementMode })
      },
      onSelectPieceType(pieceType) {
        updateCreator({ pieceType })
      },
      onCellAction(cellKey) {
        if (creatorState.replayBoards.length > 0) {
          updateCreator({
            replayBoards: [],
            replayIndex: 0,
            message: 'Replay cleared after board edit.',
          })
        }
        const next = applyToolToCell({
          cells: creatorState.cells,
          goalTargets: creatorState.goalTargets,
          cellKey,
          editMode: creatorState.editMode,
          placementMode: creatorState.placementMode,
          pieceType: creatorState.pieceType,
          goalType: creatorState.goalType,
        })
        updateCreator({ cells: next.cells, goalTargets: next.goalTargets })
      },
      onExport: exportCreatorPuzzle,
      onSolve: solveCreatorPuzzle,
      onCancelSolve: cancelSolve,
      onUndoStep() {
        if (creatorState.replayIndex <= 0) return
        updateCreator({ replayIndex: creatorState.replayIndex - 1 })
      },
      onRedoStep() {
        if (creatorState.replayIndex >= creatorState.replayBoards.length - 1) return
        updateCreator({ replayIndex: creatorState.replayIndex + 1 })
      },
      onResetReplay() {
        updateCreator({ replayBoards: [], replayIndex: 0 })
      },
      onToggleCollapsible(section, isOpen) {
        creatorState = {
          ...creatorState,
          collapsibleOpen: { ...creatorState.collapsibleOpen, [section]: isOpen },
        }
        // No full rerender — just persist the state change silently
      },
    })

    renderShellView({
      mode: 'creator',
      title: 'Puzzle Creator',
      content: creatorEl,
    })
  }

  function renderStartScreenView() {
    const trackModels = buildTrackViewModels()
    const persisted = loadStore()
    const solvedIds = Array.isArray(persisted?.solvedIds) ? persisted.solvedIds : []
    const activePuzzleId = typeof persisted?.activeState?.puzzleId === 'string'
      ? persisted.activeState.puzzleId
      : null
    const tutorialDismissed = persisted?.tutorialDismissed === true
    const tutorialCompleted = persisted?.tutorialCompleted === true

    const continueAction = resolveLandingContinueAction({
      lastTrackId: selectedTrackId,
      solvedIds,
      activePuzzleId,
    })

    const highlightedTrack = trackModels.find(track => track.id === continueAction.trackId) ?? null
    const totalPuzzleCount = trackModels.reduce((sum, track) => sum + track.totalCount, 0)
    const solvedPuzzleCount = trackModels.reduce((sum, track) => sum + track.solvedCount, 0)

    const chips = [
      highlightedTrack ? `Track: ${highlightedTrack.title}` : 'Track: All tracks',
      `Solved ${solvedPuzzleCount}/${totalPuzzleCount}`,
    ]

    const showTutorialCard = !(tutorialDismissed || tutorialCompleted)

    // Build continue label for CTA button
    let continueLabel = 'Continue'
    let continueTrackTitle = null
    if (continueAction.kind === 'play' && highlightedTrack) {
      continueTrackTitle = highlightedTrack.title
      const pos = getTrackPuzzlePosition(continueAction.puzzleId, continueAction.trackId)
      if (pos) continueLabel = `Continue ${pos}`
    }

    const startEl = renderStartScreen({
      chips,
      continueLabel,
      continueTrackTitle,
      totalPuzzleCount,
      solvedPuzzleCount,
      onContinue() {
        if (continueAction.kind === 'play') {
          loadPuzzle(continueAction.puzzleId, { trackId: continueAction.trackId })
          return
        }
        goToTrackBrowser(null)
      },
      onTutorial() {
        const tutorialLaunchId = controller.getTrackLaunchPuzzleId('tutorial')
        if (tutorialLaunchId) {
          loadPuzzle(tutorialLaunchId, { trackId: 'tutorial' })
          return
        }
        goToTrackBrowser('tutorial')
      },
      onDismissTutorial() {
        saveTutorialOnboarding({ tutorialDismissed: true })
        rerender()
      },
      onBrowseTracks() {
        goToTrackBrowser(null)
      },
      showTutorialCard,
    })

    renderShellView({
      mode: 'start',
      title: 'Xess',
      content: startEl,
    })
  }

  function renderGameScreen() {
    if (!ui || !currentPuzzleId) {
      goToTrackBrowser(selectedTrackId)
      return
    }

    const model = ui.getRenderModel()
    const trackData = selectedTrackId ? getTracks().find(t => t.id === selectedTrackId) : null
    const extModel = {
      ...model,
      puzzleId: currentPuzzleId,
      prevId: getPrevIdInTrack(currentPuzzleId, selectedTrackId),
      nextId: getNextIdInTrack(currentPuzzleId, selectedTrackId),
      trackId: selectedTrackId,
      trackTitle: trackData?.title ?? null,
      trackPosition: getTrackPuzzlePosition(currentPuzzleId, selectedTrackId),
    }
    const playContent = document.createElement('div')
    renderToDom(playContent, extModel)
    renderShellView({
      mode: 'play',
      title: extModel.puzzleTitle,
      content: playContent.firstElementChild,
      prevId: extModel.prevId,
      nextId: extModel.nextId,
    })

    // Tear down previous drag listener if board was re-rendered
    if (_dragCleanup) { _dragCleanup(); _dragCleanup = null }

    // Info button → toggle info modal (mobile only, button hidden on desktop via CSS)
    const infoBtnEl = root.querySelector('[data-puzzle-info-toggle]')
    if (infoBtnEl) {
      bindPrimaryAction(infoBtnEl, () => {
        const modal = root.querySelector('[data-info-modal]')
        if (modal) modal.hidden = !modal.hidden
      })
    }

    // Info modal dismiss on backdrop click
    const infoModal = root.querySelector('[data-info-dismiss]')
    if (infoModal) {
      infoModal.addEventListener('pointerdown', (e) => {
        if (e.target === infoModal) {
          e.preventDefault()
          infoModal.hidden = true
        }
      })
    }

    // Win modal dismiss on backdrop click
    const winModal = root.querySelector('[data-win-dismiss]')
    if (winModal) {
      winModal.addEventListener('pointerdown', (e) => {
        if (e.target === winModal) {
          e.preventDefault()
          winModal.remove()
        }
      })
    }

    const boardEl = root.querySelector('[data-board]')

    if (boardEl) {
      _dragCleanup = initDragDrop(boardEl, {
        onDragStart(fromKey) {
          _isDragging = true
          ui.tapCell(fromKey)
          const snapshot = ui.getState()
          boardEl.querySelectorAll('[data-cell-key]').forEach(cellEl => {
            const key = cellEl.dataset.cellKey
            const classes = getCellInteractionClasses(snapshot, key)
            cellEl.classList.toggle('is-selected', classes.includes('is-selected'))
            cellEl.classList.toggle('is-legal', classes.includes('is-legal'))
            cellEl.classList.toggle('is-illegal-feedback', classes.includes('is-illegal-feedback'))
          })
        },
        onDrop(fromKey, toKey, pointerId) {
          _isDragging = false
          _suppressTapPointerId = pointerId
          animatePieceMove(root, fromKey, toKey, () => {
            ui.tapCell(toKey)
            const moveResult = ui.getLastMoveResult()
            if (moveResult === 'win') {
              markTutorialCompleted()
              playSolve()
            }
            else if (moveResult === 'move_made') playMove()
            rerender()
          })
        },
        onCancel(fromKey, pointerId) {
          _isDragging = false
          _suppressTapPointerId = pointerId
          const snapshot = ui.getState()
          if (snapshot.selectedKey === fromKey) {
            ui.tapCell(fromKey)
          }
          rerender()
        },
      })
    }

    bindPrimaryAction(root.querySelector('[data-prev-puzzle]'), () => {
      if (extModel.prevId) loadPuzzle(extModel.prevId, { trackId: selectedTrackId })
    })
    bindPrimaryAction(root.querySelector('[data-next-puzzle]'), () => {
      if (extModel.nextId) loadPuzzle(extModel.nextId, { trackId: selectedTrackId })
    })
    bindPrimaryAction(root.querySelector('[data-restart-puzzle]'), () => {
      ui.restart()
      rerender()
    })
    bindPrimaryAction(root.querySelector('[data-undo-move]'), () => {
      ui.undo()
      rerender()
    })
    bindPrimaryAction(root.querySelector('[data-redo-move]'), () => {
      ui.redo()
      rerender()
    })
    bindPrimaryAction(root.querySelector('[data-win-next-puzzle]'), () => {
      if (extModel.nextId) loadPuzzle(extModel.nextId, { trackId: selectedTrackId })
    })
    bindPrimaryAction(root.querySelector('[data-win-back-to-tracks]'), () => {
      goToTrackBrowser(selectedTrackId)
    })
  }

  function renderTrackBrowserScreen() {
    const trackEl = renderTrackBrowser({
      tracks: buildTrackViewModels(),
      selectedTrackId,
      onOpenTrack(trackId) {
        goToTrackBrowser(trackId)
      },
      onResumeTrack(trackId) {
        const launchId = controller.getTrackLaunchPuzzleId(trackId)
        if (launchId) {
          loadPuzzle(launchId, { trackId })
          return
        }
        goToTrackBrowser(trackId)
      },
      onSelectPuzzle({ trackId, puzzleId }) {
        loadPuzzle(puzzleId, { trackId })
      },
      onBack() {
        goToTrackBrowser(null)
      },
    })

    renderShellView({
      mode: 'tracks',
      title: selectedTrackId ? 'Track details' : 'Tracks',
      content: trackEl,
    })
  }

  rerender()

  if (typeof window !== 'undefined') {

    window.addEventListener('hashchange', () => {
      if (isCreatorRoute()) {
        screenMode = 'creator'
        rerender()
        return
      }

      if (screenMode === 'creator') {
        screenMode = 'start'
        rerender()
      }
    })
  }

  let _pointerDownInPlay = false  // true only if pointerdown originated in play mode

  root.addEventListener('pointerdown', (event) => {
    _pointerDownInPlay = (screenMode === 'play')
    if (!_pointerDownInPlay) return
    _isDragging = false  // reset for this pointer sequence
    if (_suppressTapPointerId === event.pointerId) {
      _suppressTapPointerId = null
    }
  })

  root.addEventListener('pointerup', (event) => {
    if (!_pointerDownInPlay) return  // pointerdown was outside play mode
    if (screenMode !== 'play') return
    if (event.target.closest?.('[data-shell-topbar]')) return
    if (_suppressTapPointerId === event.pointerId) {
      _suppressTapPointerId = null
      return
    }
    if (_isDragging) return  // drag handled it; skip tap
    const cell = event.target.closest?.('[data-cell-key]')
    if (!cell) return
    const tapKey = cell.dataset.cellKey
    // Capture selected key before tapCell mutates state (for FLIP animation)
    const prevSelected = ui.getState().selectedKey
    ui.tapCell(tapKey)
    const moveResult = ui.getLastMoveResult()
    if (moveResult === 'win' || moveResult === 'move_made') {
      if (moveResult === 'win') {
        markTutorialCompleted()
        playSolve()
      }
      else playMove()
      animatePieceMove(root, prevSelected, tapKey, rerender)
    } else {
      rerender()
    }
  })

  return { loadPuzzle, rerender }
}

if (typeof document !== 'undefined') {
  const autoMountRoot = document.querySelector('#app')
  if (autoMountRoot) {
    mountGameUi(autoMountRoot)
  }
}

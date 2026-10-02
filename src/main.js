import { createController } from './controller.js'
import { createBoardRenderModel } from './ui/boardRenderer.js'
import { renderStartScreen } from './ui/startScreen.js'
import { renderTrackBrowser } from './ui/trackBrowser.js'
import { renderAppShell } from './ui/appShell.js'
import { createCreatorScreen } from './ui/creatorScreen.js'
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
  getNextUnfinishedTrack,
  resolveLandingContinueAction,
} from './puzzles/nav.js'
import catalogue from './puzzles/catalogue.js'
import { createSolutionLine, findHintOnLine } from './puzzles/hints.js'
import { parsePuzzle } from './puzzles/loader.js'
import { evaluateAchievements, getAchievementPoints, getRank } from './puzzles/achievements.js'
import { showAchievementToasts } from './ui/achievementToast.js'
import { renderMiniBoard } from './ui/miniBoard.js'
import { computeScore, formatStars, starsForScore, HINT_PENALTY } from './puzzles/score.js'
import { loadStore, saveTutorialOnboarding, saveSeenAchievements } from './store/store.js'
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
  hint:         'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z',
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
    rulesText: getPuzzleRulesText(puzzle),
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
    return { moveEvents: [], moveCount: 0, canUndo: false, canRedo: false, hintsUsed: 0, lastSolve: null }
  }

  const snapshot = controller.getTrackingState()
  return {
    moveEvents: Array.isArray(snapshot?.moveEvents) ? snapshot.moveEvents : [],
    moveCount: Number.isInteger(snapshot?.moveCount) ? snapshot.moveCount : 0,
    canUndo: snapshot?.canUndo === true,
    canRedo: snapshot?.canRedo === true,
    hintsUsed: Number.isInteger(snapshot?.hintsUsed) ? snapshot.hintsUsed : 0,
    lastSolve: snapshot?.lastSolve ?? null,
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
    return `Capture every ${targetColor} piece.`
  }

  if (puzzle.goalType === 'reach-all-goal-squares') {
    return 'The red pieces have to reach their goal squares.'
  }

  return 'Solve the puzzle objective.'
}

/**
 * One-line reminder of who moves and what can be captured, derived from the
 * puzzle's move/capture policy so authored descriptions don't have to repeat it.
 */
export function getPuzzleRulesText(puzzle) {
  if (!puzzle || typeof puzzle !== 'object') return ''

  const parts = []
  const controllable = Array.isArray(puzzle.controllableColors) ? puzzle.controllableColors : null
  const isReach = puzzle.goalType === 'reach-all-goal-squares'
  const movesBoth = controllable ? controllable.length > 1 : isReach
  const captures = puzzle.capturableByColor
  const canCapture = captures
    ? Object.values(captures).some(list => Array.isArray(list) && list.length > 0)
    : !isReach

  if (movesBoth) {
    parts.push(isReach ? 'You can move every piece, white and red.' : 'You can move every piece.')
  } else if (controllable?.[0] === 'black') {
    parts.push('You move the black pieces.')
  } else {
    parts.push('You move the white pieces.')
  }
  if (!canCapture) parts.push('Nothing can be captured.')
  if (puzzle.promote === true) parts.push('Pawns become queens when they reach the red line at the top.')

  return parts.join(' ')
}

function pluralMoves(count) {
  return `${count} ${count === 1 ? 'move' : 'moves'}`
}

export function getWinStatsText({ moveCount, par }) {
  if (!Number.isInteger(moveCount) || moveCount <= 0) return ''
  const base = `Solved in ${pluralMoves(moveCount)}`
  if (!Number.isInteger(par) || par <= 0) return `${base}.`
  if (moveCount <= par) return `${base} — the fewest possible!`
  return `${base}. It can be done in ${par}.`
}

/**
 * Score summary for the win dialog, e.g. "★★☆ 80 points" plus what was deducted.
 */
export function getWinScoreText(solve) {
  if (!solve || !Number.isInteger(solve.score)) return { headline: '', detail: '' }

  const deductions = []
  if (solve.movePenalty > 0) deductions.push(`−${solve.movePenalty} extra moves`)
  if (solve.hintPenalty > 0) {
    deductions.push(`−${solve.hintPenalty} ${solve.hintsUsed === 1 ? 'hint' : 'hints'}`)
  }
  const notes = [...deductions]
  if (Number.isInteger(solve.bestScore) && solve.bestScore > solve.score) {
    notes.push(`your best is ${solve.bestScore}`)
  }

  return {
    headline: `${formatStars(solve.stars)} ${solve.score} points`,
    detail: notes.join(' · '),
  }
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
      hintsUsed: tracking.hintsUsed,
      lastSolve: tracking.lastSolve,
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

// Measures the non-board chrome inside .xess-ui (topbar + controls + grid gaps)
// and sets --play-inner-chrome so the container query can size the board precisely.
function measurePlayChrome(xessUi) {
  if (!xessUi) return
  const topbar = xessUi.querySelector('.puzzle-topbar')
  const controls = xessUi.querySelector('.puzzle-controls')
  if (!topbar || !controls) return
  const rowGap = parseFloat(getComputedStyle(xessUi).rowGap) || 0
  const chrome = topbar.offsetHeight + controls.offsetHeight + rowGap * 2
  xessUi.style.setProperty('--play-inner-chrome', `${Math.ceil(chrome)}px`)
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
  const par = Number.isInteger(model?.puzzle?.par) ? model.puzzle.par : null
  const position = [
    rawPosition && model.trackTitle ? `${rawPosition} · ${model.trackTitle}` : rawPosition,
    par ? `Par ${pluralMoves(par)}` : null,
    Number.isInteger(model.bestScore) ? `Best ${formatStars(starsForScore(model.bestScore))} ${model.bestScore}` : null,
  ].filter(Boolean).join(' · ')
  const rulesText = typeof model.rulesText === 'string' ? model.rulesText : ''

  const inlineInfo = document.createElement('div')
  inlineInfo.className = 'puzzle-inline-info'

  const objective = document.createElement('p')
  objective.className = 'puzzle-objective'
  objective.setAttribute('data-puzzle-objective', 'true')
  objective.textContent = model.objectiveText
  inlineInfo.append(objective)

  if (rulesText.length > 0) {
    const rules = document.createElement('p')
    rules.className = 'puzzle-rules'
    rules.setAttribute('data-puzzle-rules', 'true')
    rules.textContent = rulesText
    inlineInfo.append(rules)
  }

  if (descriptionHtml.length > 0) {
    const desc = document.createElement('div')
    desc.className = 'puzzle-description'
    desc.setAttribute('data-puzzle-description', 'true')
    desc.innerHTML = descriptionHtml
    inlineInfo.append(desc)
  }

  if (position) {
    const posInline = document.createElement('span')
    posInline.className = 'puzzle-position'
    posInline.setAttribute('data-puzzle-position', 'true')
    posInline.textContent = position
    inlineInfo.append(posInline)
  }

  topbar.append(inlineInfo)

  // Coach line: tutorial guidance, hint feedback, or a stuck warning
  if (typeof model.coachText === 'string' && model.coachText.length > 0) {
    const coach = document.createElement('p')
    coach.className = 'coach-line'
    coach.setAttribute('data-coach', model.coachKind ?? 'coach')
    coach.setAttribute('role', 'status')
    coach.textContent = model.coachText
    topbar.append(coach)
  }

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
    if (model.hintMove?.from === cell.key) cellEl.classList.add('is-hint-from')
    if (model.hintMove?.to === cell.key) cellEl.classList.add('is-hint-to')

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

  const hintBtn = document.createElement('button')
  hintBtn.type = 'button'
  hintBtn.className = 'nav-btn hint-btn'
  hintBtn.setAttribute('data-hint', 'true')
  hintBtn.setAttribute('aria-label', `Show a hint (costs ${HINT_PENALTY} points)`)
  hintBtn.setAttribute('title', `Shows the next move. Costs ${HINT_PENALTY} points.`)
  hintBtn.disabled = model.hintBusy === true || model.boardClasses.includes('is-won')
  if (model.hintBusy === true) hintBtn.classList.add('is-busy')
  hintBtn.appendChild(svgIcon(ICONS.hint))
  hintBtn.appendChild(btnLabel('Hint'))
  if (model.hintsUsed > 0) {
    const used = document.createElement('span')
    used.className = 'hint-btn-count'
    used.setAttribute('data-hints-used', String(model.hintsUsed))
    used.textContent = String(model.hintsUsed)
    hintBtn.appendChild(used)
  }

  controls.append(undoBtn, counter, redoBtn, restartBtn, hintBtn)
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

    const headline = document.createElement('p')
    headline.className = 'win-modal-headline'
    headline.setAttribute('data-win-headline', 'true')
    winContent.append(headline)

    const statsText = getWinStatsText({ moveCount: model.moveCount, par })
    if (statsText.length > 0) {
      const stats = document.createElement('p')
      stats.className = 'win-modal-stats'
      stats.setAttribute('data-win-stats', 'true')
      stats.textContent = statsText
      winContent.append(stats)
    }

    const scoreText = getWinScoreText(model.lastSolve)
    if (scoreText.headline.length > 0) {
      const score = document.createElement('p')
      score.className = 'win-modal-score'
      score.setAttribute('data-win-score', 'true')
      score.textContent = scoreText.headline
      winContent.append(score)
      if (scoreText.detail.length > 0) {
        const detail = document.createElement('p')
        detail.className = 'win-modal-stats'
        detail.setAttribute('data-win-score-detail', 'true')
        detail.textContent = scoreText.detail
        winContent.append(detail)
      }
    }

    if (Array.isArray(model.newAchievements) && model.newAchievements.length > 0) {
      const unlockedList = document.createElement('ul')
      unlockedList.className = 'win-modal-achievements'
      unlockedList.setAttribute('data-win-achievements', 'true')
      model.newAchievements.forEach((entry) => {
        const item = document.createElement('li')
        const label = document.createElement('span')
        label.className = 'win-modal-achievement-label'
        label.textContent = 'Achievement unlocked'
        const name = document.createElement('strong')
        name.textContent = entry.title
        const copy = document.createElement('span')
        copy.textContent = Number.isInteger(entry.points)
          ? `${entry.description} · +${entry.points} points`
          : entry.description
        item.append(label, name, copy)
        unlockedList.append(item)
      })
      winContent.append(unlockedList)
    }

    const actions = document.createElement('div')
    actions.className = 'win-modal-actions'

    const addAction = (attr, text, primary) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = primary ? 'btn-next-puzzle' : 'btn-next-puzzle btn-next-puzzle--ghost'
      btn.setAttribute(attr, 'true')
      btn.textContent = text
      actions.append(btn)
    }

    if (model.nextId) {
      winOverlay.setAttribute('data-win-state', 'puzzle-solved')
      headline.textContent = 'Puzzle solved!'
      addAction('data-win-next-puzzle', 'Next Puzzle', true)
    } else if (model.trackId && model.nextTrack) {
      winOverlay.setAttribute('data-win-state', 'track-complete')
      headline.textContent = model.trackTitle ? `${model.trackTitle} complete!` : 'Track complete!'
      addAction('data-win-next-track', `Next: ${model.nextTrack.title}`, true)
      addAction('data-win-back-to-tracks', 'All tracks', false)
    } else if (model.trackId && model.hasUnsolvedInTrack) {
      winOverlay.setAttribute('data-win-state', 'track-end')
      headline.textContent = 'Puzzle solved!'
      addAction('data-win-back-to-tracks', 'Back to puzzles', true)
    } else {
      winOverlay.setAttribute('data-win-state', 'all-solved')
      headline.setAttribute('data-win-all-solved', 'true')
      const total = Number.isInteger(model.totalPuzzleCount) ? model.totalPuzzleCount : 0
      headline.textContent = total ? `All ${total} puzzles solved!` : 'All puzzles solved!'
      if (model.trackId) addAction('data-win-back-to-tracks', 'All tracks', true)
    }

    // Offer a retry only when there are points left on the table
    const solveScore = model.lastSolve?.score
    if (Number.isInteger(solveScore) ? solveScore < 100 : (par && model.moveCount > par)) {
      addAction('data-win-replay', model.lastSolve?.hintPenalty > 0 ? 'Try again' : 'Try for fewer moves', false)
    }

    if (actions.children.length > 0) winContent.append(actions)

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

  const goalBadgeModal = document.createElement('div')
  goalBadgeModal.className = 'goal-badge'
  goalBadgeModal.setAttribute('data-goal-type', badge.type)
  const badgeLabelModal = document.createElement('span')
  badgeLabelModal.className = 'goal-badge-label'
  badgeLabelModal.textContent = badge.label
  goalBadgeModal.append(badgeLabelModal)

  const infoTitle = document.createElement('h2')
  infoTitle.className = 'info-modal-title'
  infoTitle.textContent = model.puzzleTitle

  const infoObjective = document.createElement('p')
  infoObjective.className = 'info-modal-objective'
  infoObjective.textContent = model.objectiveText

  infoContent.append(goalBadgeModal, infoTitle, infoObjective)

  if (rulesText.length > 0) {
    const infoRules = document.createElement('p')
    infoRules.className = 'info-modal-objective'
    infoRules.textContent = rulesText
    infoContent.append(infoRules)
  }

  if (descriptionHtml.length > 0) {
    const infoDesc = document.createElement('div')
    infoDesc.className = 'info-modal-description'
    infoDesc.innerHTML = descriptionHtml
    infoContent.append(infoDesc)
  }

  if (position) {
    const posModal = document.createElement('span')
    posModal.className = 'puzzle-position'
    posModal.textContent = position
    infoContent.append(posModal)
  }

  const infoClose = document.createElement('button')
  infoClose.type = 'button'
  infoClose.className = 'btn-next-puzzle'
  infoClose.setAttribute('data-info-close', 'true')
  infoClose.textContent = 'Got it'
  infoContent.append(infoClose)

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
  const creator = createCreatorScreen({ onChange: () => rerender() })
  let _dragCleanup = null    // cleanup fn returned by initDragDrop
  let _chromeObserver = null // ResizeObserver for --play-inner-chrome measurement
  let _isDragging = false    // true once drag threshold exceeded this pointer sequence
  let _suppressTapPointerId = null
  let _isInfoModalOpen = false
  // Hint shown for one exact position; any board change invalidates it
  let hintState = { board: null, move: null, message: '', busy: false }
  let _hintWorker = null
  let _hintTimer = null
  let _solutionLine = { puzzleId: null, line: null }
  // Achievements unlocked by the current win, announced once in the win dialog
  let winAchievements = { board: null, list: [] }

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
    // Only once the whole tutorial is done, not after its first puzzle
    const tutorial = getTracks().find(track => track.id === 'tutorial')
    const { solvedIds } = getProgress()
    if (tutorial && !tutorial.puzzleIds.every(id => solvedIds.includes(id))) return
    saveTutorialOnboarding({ tutorialCompleted: true })
  }

  function getProgress() {
    const persisted = loadStore()
    return {
      persisted,
      solvedIds: Array.isArray(persisted?.solvedIds) ? persisted.solvedIds : [],
      bestMoveCounts: persisted?.solvedMoveCounts && typeof persisted.solvedMoveCounts === 'object'
        ? persisted.solvedMoveCounts
        : {},
      bestScores: persisted?.solvedScores && typeof persisted.solvedScores === 'object'
        ? persisted.solvedScores
        : {},
    }
  }

  function getSolutionLine(puzzle) {
    if (_solutionLine.puzzleId !== puzzle?.id || !_solutionLine.line) {
      _solutionLine = { puzzleId: puzzle?.id ?? null, line: createSolutionLine(puzzle) }
    }
    return _solutionLine.line
  }

  function stopHintSearch() {
    if (_hintWorker) {
      _hintWorker.terminate()
      _hintWorker = null
    }
    if (_hintTimer) {
      clearTimeout(_hintTimer)
      _hintTimer = null
    }
  }

  function hasAnyLegalMove(board) {
    for (const [key, cell] of board) {
      if (cell.piece && controller.selectPiece(key).length > 0) return true
    }
    return false
  }

  /**
   * Decide what the coach line says and which move (if any) is highlighted:
   * a requested hint, free tutorial coaching, or a dead-end warning.
   */
  function resolveGuidance(model) {
    const { board, won } = ui.getState()
    if (hintState.board !== board) {
      stopHintSearch()
      hintState = { board, move: null, message: '', busy: false }
    }
    if (won) return { coachText: '', hintMove: null, hintBusy: false, coachedMove: null }

    const onLine = findHintOnLine(getSolutionLine(model.puzzle), board)
    const coachLines = Array.isArray(model.puzzle?.coach) ? model.puzzle.coach : []
    const coachEntry = onLine ? coachLines[onLine.step] : null
    const coachLine = coachEntry?.text || null
    const coachedMove = coachLine && coachEntry.show ? onLine : null

    let coachText = ''
    let coachKind = 'coach'
    if (hintState.busy) {
      coachText = 'Looking for a way through…'
      coachKind = 'hint'
    } else if (hintState.message) {
      coachText = hintState.message
      coachKind = 'hint'
    } else if (!hasAnyLegalMove(board)) {
      coachText = 'No moves left. Undo or reset to try another way.'
      coachKind = 'stuck'
    } else if (coachLine) {
      coachText = coachLine
    } else if (coachLines.length > 0 && !onLine && model.moveCount > 0) {
      coachText = 'That is a different route. Carry on, use Undo, or tap Hint.'
    }

    return {
      coachText,
      coachKind,
      hintMove: hintState.move ?? coachedMove,
      hintBusy: hintState.busy,
      coachedMove,
    }
  }

  function showHint(board, move) {
    if (hintState.board !== board) return
    controller.useHint()
    hintState = {
      board,
      move: { from: move.from, to: move.to },
      message: `Hint: move the highlighted piece to the marked square. (−${HINT_PENALTY} points)`,
      busy: false,
    }
    rerender()
  }

  function setHintMessage(board, message) {
    if (hintState.board !== board) return
    hintState = { board, move: null, message, busy: false }
    rerender()
  }

  function requestHint() {
    if (!ui || !currentPuzzleId) return
    const { board, won } = ui.getState()
    if (won || hintState.busy) return
    if (hintState.board === board && hintState.move) return

    const puzzle = ui.getRenderModel().puzzle
    const onLine = findHintOnLine(getSolutionLine(puzzle), board)
    if (onLine) {
      // Tutorial coaching already highlights this move for free
      const coachEntry = Array.isArray(puzzle?.coach) ? puzzle.coach[onLine.step] : null
      if (coachEntry?.text && coachEntry.show) return
      hintState = { board, move: null, message: '', busy: false }
      showHint(board, onLine)
      return
    }

    const raw = catalogue.find(entry => entry.id === currentPuzzleId)
    if (typeof Worker === 'undefined' || !raw) {
      hintState = { board, move: null, message: '', busy: false }
      setHintMessage(board, 'No hint from this position. Undo a few moves and ask again.')
      return
    }

    // Off the known solution: search from the current position in the background
    stopHintSearch()
    hintState = { board, move: null, message: '', busy: true }
    rerender()

    const worker = new Worker(
      new URL('./puzzles/solver.worker.js', import.meta.url),
      { type: 'module' },
    )
    _hintWorker = worker
    _hintTimer = setTimeout(() => {
      if (worker !== _hintWorker) return
      stopHintSearch()
      setHintMessage(board, 'This position is too tangled for a hint. Undo a few moves and ask again.')
    }, 8000)

    worker.onmessage = ({ data }) => {
      if (worker !== _hintWorker) return
      stopHintSearch()
      const next = data?.type === 'result' && data.result?.solvable ? data.result.moves[0] : null
      if (next) showHint(board, next)
      else setHintMessage(board, 'There is no way to win from here. Undo or reset.')
    }
    worker.onerror = () => {
      if (worker !== _hintWorker) return
      stopHintSearch()
      setHintMessage(board, 'No hint from this position. Undo a few moves and ask again.')
    }
    worker.postMessage({ raw, boardEntries: Array.from(board.entries()), maxDepth: 60 })
  }

  // Mirror screen changes into browser history so the system back button /
  // Android back gesture steps through the app instead of leaving it.
  function syncHistory() {
    if (typeof window === 'undefined' || typeof window.history?.pushState !== 'function') return
    if (screenMode === 'creator') return

    const next = {
      xess: true,
      screen: screenMode,
      trackId: selectedTrackId,
      puzzleId: screenMode === 'play' ? currentPuzzleId : null,
    }
    const current = window.history.state
    const isXessEntry = current && current.xess === true
    if (
      isXessEntry &&
      current.screen === next.screen &&
      current.trackId === next.trackId &&
      current.puzzleId === next.puzzleId
    ) return

    // Stepping puzzle → puzzle replaces the entry, so Back leaves play in one step
    if (!isXessEntry || (current.screen === 'play' && next.screen === 'play')) {
      window.history.replaceState(next, '')
    } else {
      window.history.pushState(next, '')
    }
  }

  function resolveTrackLaunch(trackId, solvedIds, activePuzzleId) {
    const track = getTracks().find(entry => entry.id === trackId)
    if (!track || track.puzzleIds.length === 0) return null
    if (activePuzzleId && track.puzzleIds.includes(activePuzzleId) && !solvedIds.includes(activePuzzleId)) {
      return activePuzzleId
    }
    return track.puzzleIds.find(id => !solvedIds.includes(id)) ?? track.puzzleIds[0]
  }

  /** Thumbnail of a puzzle; shows the saved position when that puzzle is in progress. */
  function renderPuzzlePreview(puzzleId) {
    const raw = catalogue.find(entry => entry.id === puzzleId)
    if (!raw) return null
    try {
      const puzzle = parsePuzzle(raw)
      const active = loadStore()?.activeState
      const board = active?.puzzleId === puzzleId && Array.isArray(active.boardEntries) && active.boardEntries.length > 0
        ? new Map(active.boardEntries)
        : puzzle.board
      return renderMiniBoard({ puzzle, board })
    } catch {
      return null
    }
  }

  function buildAchievements(trackModels) {
    const solvedIds = []
    const scores = {}
    trackModels.forEach(track => track.puzzles.forEach((entry) => {
      if (entry.status !== 'solved') return
      solvedIds.push(entry.id)
      scores[entry.id] = entry.bestScore ?? 0
    }))
    return evaluateAchievements({ tracks: getTracks(), catalogue, solvedIds, scores })
  }

  /** Puzzle points plus achievement bonuses: the player's global score. */
  function getPointTotals(trackModels = buildTrackViewModels(), achievements = buildAchievements(trackModels)) {
    const puzzlePoints = trackModels.reduce((sum, track) => sum + track.score, 0)
    const bonus = getAchievementPoints(achievements)
    return {
      puzzlePoints,
      bonusPoints: bonus.earned,
      points: puzzlePoints + bonus.earned,
      maxPoints: trackModels.reduce((sum, track) => sum + track.maxScore, 0) + bonus.available,
    }
  }

  function buildTrackViewModels() {
    // Read persisted progress directly: the controller only loads it once a puzzle is opened
    const { solvedIds, bestMoveCounts, bestScores, persisted } = getProgress()
    const activePuzzleId = typeof persisted?.activeState?.puzzleId === 'string'
      ? persisted.activeState.puzzleId
      : null

    return getTracks().map(track => {
      const puzzles = getTrackPuzzleList(track.id, solvedIds).map(entry => ({
        ...entry,
        bestMoveCount: Number.isInteger(bestMoveCounts[entry.id]) ? bestMoveCounts[entry.id] : null,
        bestScore: entry.status !== 'solved'
          ? null
          : Number.isInteger(bestScores[entry.id])
            ? bestScores[entry.id]
            // Solved before scoring existed: derive the score from the best move count
            : computeScore({ moveCount: bestMoveCounts[entry.id], par: entry.par }).score,
        inProgress: entry.id === activePuzzleId && entry.status !== 'solved',
      }))
      return {
        ...track,
        puzzles,
        totalCount: puzzles.length,
        solvedCount: puzzles.filter(entry => entry.status === 'solved').length,
        score: puzzles.reduce((sum, entry) => sum + (entry.bestScore ?? 0), 0),
        maxScore: puzzles.length * 100,
        // The board shown on the track card: the puzzle its main button would open
        previewPuzzleId: resolveTrackLaunch(track.id, solvedIds, activePuzzleId),
      }
    })
  }

  function goToTrackBrowser(trackId = null) {
    selectedTrackId = trackId
    screenMode = 'tracks'

    rerender()
  }

  function renderShellView({ mode, title, content, prevId = null, nextId = null, position = null }) {
    const shell = renderAppShell({
      mode,
      title,
      content,
      showTracks: mode !== 'creator',
      hasPrevPuzzle: mode === 'play' ? !!prevId : false,
      hasNextPuzzle: mode === 'play' ? !!nextId : false,
      position: mode === 'play' ? position : null,
      points: mode === 'creator' ? null : getPointTotals().points,
      onNavigateHome() {
        if (typeof window !== 'undefined' && window.location.pathname.endsWith('/creator.html')) {
          window.location.href = './'
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
    renderCurrentScreen()
    syncHistory()
  }

  function renderCurrentScreen() {
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

  function renderCreatorScreen() {
    renderShellView({
      mode: 'creator',
      title: 'Puzzle Creator',
      content: creator.render(),
    })
  }

  function renderStartScreenView() {
    const trackModels = buildTrackViewModels()
    const { persisted, solvedIds } = getProgress()
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

    // The hero eyebrow already names the track; the chip only reports overall progress
    // Progress now lives in the stats strip; no chips needed
    const chips = []

    const showTutorialCard = !(tutorialDismissed || tutorialCompleted)

    // Hero copy depends on where the player is: first visit, mid-way, or done
    const isFirstVisit = solvedPuzzleCount === 0 && !activePuzzleId
    let eyebrowLabel = 'Continue'
    let continueLabel = 'Continue'
    let continueTrackTitle = null
    if (continueAction.kind === 'play' && highlightedTrack) {
      const puzzleEntry = highlightedTrack.puzzles.find(entry => entry.id === continueAction.puzzleId)
      const pos = getTrackPuzzlePosition(continueAction.puzzleId, continueAction.trackId)
      continueTrackTitle = pos ? `${highlightedTrack.title} ${pos}` : highlightedTrack.title
      if (isFirstVisit) {
        eyebrowLabel = 'Start here'
        continueLabel = 'Start playing'
      } else if (puzzleEntry?.title) {
        eyebrowLabel = puzzleEntry.inProgress ? 'In progress' : 'Up next'
        continueLabel = `Continue: ${puzzleEntry.title}`
      }
    } else if (continueAction.allSolved) {
      eyebrowLabel = `All ${totalPuzzleCount} puzzles solved`
      continueLabel = 'Replay puzzles'
    }

    const solvedEntries = trackModels.flatMap(track => track.puzzles).filter(entry => entry.status === 'solved')
    const achievements = buildAchievements(trackModels)
    const totals = getPointTotals(trackModels, achievements)
    const stats = {
      points: totals.points,
      maxPoints: totals.maxPoints,
      bonusPoints: totals.bonusPoints,
      rank: getRank(totals.points, totals.maxPoints),
      stars: solvedEntries.reduce((sum, entry) => sum + starsForScore(entry.bestScore), 0),
      maxStars: totalPuzzleCount * 3,
      solved: solvedPuzzleCount,
      total: totalPuzzleCount,
    }

    const startEl = renderStartScreen({
      stats,
      tracks: trackModels,
      currentTrackId: continueAction.trackId ?? null,
      achievements,
      renderPreview: renderPuzzlePreview,
      onOpenTrack(trackId) {
        goToTrackBrowser(trackId)
      },
      onResumeTrack(trackId) {
        const launchId = controller.getTrackLaunchPuzzleId(trackId)
        if (launchId) loadPuzzle(launchId, { trackId })
        else goToTrackBrowser(trackId)
      },
      chips,
      eyebrowLabel,
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
    const { solvedIds, bestScores } = getProgress()
    const trackPuzzleIds = trackData?.puzzleIds ?? []
    const hasUnsolvedInTrack = trackPuzzleIds.some(id => !solvedIds.includes(id))
    const guidance = resolveGuidance(model)
    const playState = ui.getState()
    if (playState.won && winAchievements.board !== playState.board) {
      const seen = new Set(getProgress().persisted?.seenAchievementIds ?? [])
      const unlocked = buildAchievements(buildTrackViewModels()).filter(entry => entry.unlocked)
      winAchievements = { board: playState.board, list: unlocked.filter(entry => !seen.has(entry.id)) }
      if (winAchievements.list.length > 0) {
        saveSeenAchievements(unlocked.map(entry => entry.id))
        showAchievementToasts(winAchievements.list)
      }
    }
    const extModel = {
      ...model,
      ...guidance,
      newAchievements: playState.won && winAchievements.board === playState.board ? winAchievements.list : [],
      bestScore: Number.isInteger(bestScores[currentPuzzleId]) ? bestScores[currentPuzzleId] : null,
      hasUnsolvedInTrack,
      nextTrack: hasUnsolvedInTrack ? null : getNextUnfinishedTrack(selectedTrackId, solvedIds),
      totalPuzzleCount: getTracks().reduce((sum, track) => sum + track.puzzleIds.length, 0),
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
      title: extModel.trackTitle ?? 'Xess',
      content: playContent.firstElementChild,
      prevId: extModel.prevId,
      nextId: extModel.nextId,
      position: extModel.trackPosition,
    })

    // Measure actual chrome so --play-inner-chrome is accurate for this render
    const xessUiEl = root.querySelector('.xess-ui')
    measurePlayChrome(xessUiEl)
    if (_chromeObserver) _chromeObserver.disconnect()
    _chromeObserver = new ResizeObserver(() => measurePlayChrome(root.querySelector('.xess-ui')))
    _chromeObserver.observe(document.documentElement)

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
      goToTrackBrowser(extModel.hasUnsolvedInTrack ? selectedTrackId : null)
    })
    bindPrimaryAction(root.querySelector('[data-win-next-track]'), () => {
      const nextTrackId = extModel.nextTrack?.id
      const launchId = nextTrackId ? controller.getTrackLaunchPuzzleId(nextTrackId) : null
      if (launchId) loadPuzzle(launchId, { trackId: nextTrackId })
      else goToTrackBrowser(null)
    })
    bindPrimaryAction(root.querySelector('[data-hint]'), requestHint)
    bindPrimaryAction(root.querySelector('[data-win-replay]'), () => {
      ui.restart()
      rerender()
    })
    bindPrimaryAction(root.querySelector('[data-info-close]'), () => {
      const modal = root.querySelector('[data-info-modal]')
      if (modal) modal.hidden = true
    })
  }

  function renderTrackBrowserScreen() {
    const trackEl = renderTrackBrowser({
      renderPreview: renderPuzzlePreview,
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
      title: 'Xess',
      content: trackEl,
    })
  }

  // Progress made before achievements existed: mark what is already unlocked as
  // seen, so the next win announces only what that win actually earned.
  {
    const { persisted } = getProgress()
    if ((persisted?.seenAchievementIds ?? []).length === 0) {
      const alreadyUnlocked = buildAchievements(buildTrackViewModels()).filter(entry => entry.unlocked)
      if (alreadyUnlocked.length > 0) saveSeenAchievements(alreadyUnlocked.map(entry => entry.id))
    }
  }

  rerender()

  if (typeof window !== 'undefined') {

    window.addEventListener('popstate', (event) => {
      const entry = event.state
      if (!entry || entry.xess !== true || isCreatorRoute()) return

      selectedTrackId = typeof entry.trackId === 'string' ? entry.trackId : null
      if (entry.screen === 'play' && catalogue.some(item => item.id === entry.puzzleId)) {
        ui = createGameUiController({ controller, puzzleId: entry.puzzleId })
        currentPuzzleId = entry.puzzleId
        screenMode = 'play'
      } else {
        screenMode = entry.screen === 'tracks' ? 'tracks' : 'start'
      }
      rerender()
    })

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

  document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return

    if (screenMode === 'play' && e.key === 'Escape') {
      const infoModal = root.querySelector('[data-info-modal]')
      if (infoModal && !infoModal.hidden) infoModal.hidden = true
      else root.querySelector('[data-win-dismiss]')?.remove()
    }

    if (screenMode === 'play' && ui) {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        ui.undo()
        rerender()
      } else if (
        (e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
        (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault()
        ui.redo()
        rerender()
      }
    }

    if (screenMode === 'creator' && creator.handleKeydown(e)) {
      e.preventDefault()
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

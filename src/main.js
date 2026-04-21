import { createController } from './controller.js'
import { createBoardRenderModel } from './ui/boardRenderer.js'
import { renderStartScreen } from './ui/startScreen.js'
import { renderTrackBrowser } from './ui/trackBrowser.js'
import { renderAppShell } from './ui/appShell.js'
import './styles/app.css'
import './styles/puzzle-list.css'
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
  getPuzzlePosition,
  getTracks,
  getTrackPuzzleList,
  resolveLandingContinueAction,
} from './puzzles/nav.js'
import catalogue from './puzzles/catalogue.js'
import { loadStore, saveTutorialOnboarding } from './store/store.js'
import { initSound, playMove, playSolve, isSoundEnabled, toggleSound } from './sound.js'
import { initDragDrop } from './ui/dragDrop.js'
import { initPwaPrompts } from './ui/pwaPrompts.js'
import { sanitizePuzzleDescription } from './ui/puzzleDescriptionSanitizer.js'

if (typeof window !== 'undefined') {
  initPwaPrompts()
}
initSound()

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
    return 'Move all white pieces onto goal squares.'
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
      moveCounterText: `Moves: ${tracking.moveCount}`,
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
  btn.textContent = isSoundEnabled() ? '🔊' : '🔇'

  const handleToggle = () => {
    const enabled = toggleSound()
    btn.textContent = enabled ? '🔊' : '🔇'
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

  const meta = document.createElement('header')
  meta.className = 'puzzle-meta'
  meta.setAttribute('data-puzzle-meta', 'true')

  // Meta top row: title + sound toggle
  const metaTop = document.createElement('div')
  metaTop.className = 'puzzle-meta-top'

  const title = document.createElement('h1')
  title.className = 'puzzle-title'
  title.setAttribute('data-puzzle-title', 'true')
  title.textContent = model.puzzleTitle

  metaTop.append(title, renderSoundToggle())

  const objective = document.createElement('p')
  objective.className = 'puzzle-objective'
  objective.setAttribute('data-puzzle-objective', 'true')
  objective.textContent = model.objectiveText

  const descriptionHtml = getPuzzleDescriptionHtml(model.puzzle)
  let description = null
  if (descriptionHtml.length > 0) {
    description = document.createElement('div')
    description.className = 'puzzle-description'
    description.setAttribute('data-puzzle-description', 'true')
    description.innerHTML = descriptionHtml
  }

  // Goal badge
  const badge = getGoalBadgeData(model.puzzle)
  const goalBadge = document.createElement('div')
  goalBadge.className = 'goal-badge'
  goalBadge.setAttribute('data-goal-type', badge.type)
  const badgeLabel = document.createElement('span')
  badgeLabel.className = 'goal-badge-label'
  badgeLabel.textContent = badge.label
  goalBadge.append(badgeLabel)

  // Position indicator
  const position = model.puzzleId ? getPuzzlePosition(model.puzzleId) : null
  const posSpan = document.createElement('span')
  posSpan.className = 'puzzle-position'
  posSpan.setAttribute('data-puzzle-position', 'true')
  posSpan.textContent = position ?? ''

  meta.append(metaTop, objective)
  if (description) {
    meta.append(description)
  }
  meta.append(goalBadge, posSpan)
  app.append(meta)

  // Nav controls
  const nav = document.createElement('div')
  nav.className = 'puzzle-nav'

  const prevBtn = document.createElement('button')
  prevBtn.type = 'button'
  prevBtn.className = 'nav-btn'
  prevBtn.setAttribute('data-prev-puzzle', 'true')
  prevBtn.setAttribute('aria-label', 'Previous puzzle')
  if (!model.prevId) prevBtn.setAttribute('aria-disabled', 'true')
  prevBtn.textContent = '←'

  const nextNavBtn = document.createElement('button')
  nextNavBtn.type = 'button'
  nextNavBtn.className = 'nav-btn'
  nextNavBtn.setAttribute('data-next-puzzle', 'true')
  nextNavBtn.setAttribute('aria-label', 'Next puzzle')
  if (!model.nextId) nextNavBtn.setAttribute('aria-disabled', 'true')
  nextNavBtn.textContent = '→'

  const restartBtn = document.createElement('button')
  restartBtn.type = 'button'
  restartBtn.className = 'nav-btn'
  restartBtn.setAttribute('data-restart-puzzle', 'true')
  restartBtn.setAttribute('aria-label', 'Restart puzzle')
  restartBtn.textContent = '↺'

  nav.append(prevBtn, restartBtn, nextNavBtn)

  const trackingControls = document.createElement('div')
  trackingControls.className = 'tracking-controls'
  trackingControls.setAttribute('data-tracking-controls', 'true')

  const counter = document.createElement('span')
  counter.className = 'tracking-counter'
  counter.setAttribute('data-move-counter', 'true')
  counter.textContent = model.moveCounterText ?? `Moves: ${model.moveCount ?? 0}`

  const undoBtn = document.createElement('button')
  undoBtn.type = 'button'
  undoBtn.className = 'nav-btn tracking-btn'
  undoBtn.setAttribute('data-undo-move', 'true')
  undoBtn.setAttribute('aria-label', 'Undo move')
  if (!model.canUndo) undoBtn.setAttribute('aria-disabled', 'true')
  undoBtn.textContent = '↶'

  const redoBtn = document.createElement('button')
  redoBtn.type = 'button'
  redoBtn.className = 'nav-btn tracking-btn'
  redoBtn.setAttribute('data-redo-move', 'true')
  redoBtn.setAttribute('aria-label', 'Redo move')
  if (!model.canRedo) redoBtn.setAttribute('aria-disabled', 'true')
  redoBtn.textContent = '↷'

  trackingControls.append(counter, undoBtn, redoBtn)
  nav.append(trackingControls)
  app.append(nav)

  // Win banner
  const isWon = model.boardClasses.includes('is-won')
  const winBanner = document.createElement('div')
  winBanner.setAttribute('data-win-banner', 'true')
  winBanner.className = isWon ? 'win-banner is-won' : 'win-banner'

  if (isWon) {
    if (model.nextId) {
      winBanner.setAttribute('data-win-state', 'puzzle-solved')

      const solvedState = document.createElement('div')
      solvedState.className = 'win-banner-state win-banner-state--puzzle-solved'

      const solvedSpan = document.createElement('p')
      solvedSpan.className = 'win-banner-headline'
      solvedSpan.setAttribute('data-win-headline', 'true')
      solvedSpan.textContent = 'Puzzle solved!'

      const actionRow = document.createElement('div')
      actionRow.className = 'win-banner-action'
      actionRow.setAttribute('data-win-action', 'true')

      const nextPuzzleBtn = document.createElement('button')
      nextPuzzleBtn.type = 'button'
      nextPuzzleBtn.className = 'btn-next-puzzle'
      nextPuzzleBtn.setAttribute('data-win-next-puzzle', 'true')
      nextPuzzleBtn.textContent = 'Next Puzzle'

      actionRow.append(nextPuzzleBtn)
      solvedState.append(solvedSpan, actionRow)
      winBanner.append(solvedState)
    } else {
      winBanner.setAttribute('data-win-state', 'all-solved')

      const allSolvedState = document.createElement('div')
      allSolvedState.className = 'win-banner-state win-banner-state--all-solved'

      // End of catalogue — count total puzzles from position string
      const total = catalogue.length
      const endSpan = document.createElement('p')
      endSpan.className = 'win-banner-headline'
      endSpan.setAttribute('data-win-headline', 'true')
      endSpan.setAttribute('data-win-all-solved', 'true')
      endSpan.textContent = total ? `All ${total} puzzles solved! 🎉` : 'All puzzles solved! 🎉'
      allSolvedState.append(endSpan)
      winBanner.append(allSolvedState)
    }
  }

  app.append(winBanner)

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
  root.append(app)
}

export function mountGameUi(root = document.querySelector('#app')) {
  if (!root) {
    throw new Error('Missing #app mount node')
  }

  const controller = createController()

  // Navigation state
  let screenMode = 'start'
  let currentPuzzleId = null
  let selectedTrackId = null
  let ui = null
  let playMenuOpen = false
  let _dragCleanup = null    // cleanup fn returned by initDragDrop
  let _isDragging = false    // true once drag threshold exceeded this pointer sequence
  let _suppressTapPointerId = null

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
    playMenuOpen = false
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
    playMenuOpen = false
    rerender()
  }

  function renderShellView({ mode, title, content }) {
    const shell = renderAppShell({
      mode,
      title,
      content,
      menuOpen: mode === 'play' ? playMenuOpen : false,
      onOpenMenu() {
        playMenuOpen = !playMenuOpen
        rerender()
      },
      onNavigateHome() {
        selectedTrackId = null
        screenMode = 'start'
        playMenuOpen = false
        rerender()
      },
      onNavigateTracks() {
        goToTrackBrowser(selectedTrackId)
      },
    })

    root.innerHTML = ''
    root.append(shell)
  }

  function rerender() {
    if (screenMode === 'play') {
      renderGameScreen()
      return
    }

    if (screenMode === 'tracks') {
      renderTrackBrowserScreen()
      return
    }

    renderStartScreenView()
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

    const startEl = renderStartScreen({
      chips,
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
    const extModel = {
      ...model,
      puzzleId: currentPuzzleId,
      prevId: getPrevId(currentPuzzleId),
      nextId: getNextId(currentPuzzleId),
    }
    const playContent = document.createElement('div')
    renderToDom(playContent, extModel)
    renderShellView({
      mode: 'play',
      title: extModel.puzzleTitle,
      content: playContent.firstElementChild,
    })

    // Tear down previous drag listener if board was re-rendered
    if (_dragCleanup) { _dragCleanup(); _dragCleanup = null }

    const boardEl = root.querySelector('[data-board]')

    if (boardEl) {
      _dragCleanup = initDragDrop(boardEl, {
        onDragStart(fromKey) {
          _isDragging = true
          ui.tapCell(fromKey)   // selects the piece, computes legal move highlights
          // Do NOT rerender here — rebuilding the DOM would destroy the board element
          // and kill the in-flight drag state (ghost + pointer capture).
          // Instead, patch only the interaction CSS classes on existing cell elements.
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
          // Deselect: tapCell with the currently-selected key toggles off
          const snapshot = ui.getState()
          if (snapshot.selectedKey === fromKey) {
            ui.tapCell(fromKey)  // second tap on selected key → clearSelection
          }
          rerender()
        },
      })
    }

    bindPrimaryAction(root.querySelector('[data-prev-puzzle]'), () => {
      if (extModel.prevId) loadPuzzle(extModel.prevId)
    })
    bindPrimaryAction(root.querySelector('[data-next-puzzle]'), () => {
      if (extModel.nextId) loadPuzzle(extModel.nextId)
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
      if (extModel.nextId) loadPuzzle(extModel.nextId)
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

  root.addEventListener('pointerdown', (event) => {
    if (screenMode !== 'play') return
    _isDragging = false  // reset for this pointer sequence
    if (_suppressTapPointerId === event.pointerId) {
      _suppressTapPointerId = null
    }
  })

  root.addEventListener('pointerup', (event) => {
    if (screenMode !== 'play') return
    if (event.target.closest?.('[data-shell-topbar], [data-shell-menu], [data-shell-menu-toggle]')) return
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

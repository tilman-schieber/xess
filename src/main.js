import { createController } from './controller.js'
import { createBoardRenderModel } from './ui/boardRenderer.js'
import { renderPuzzleList } from './ui/puzzleList.js'
import './styles/app.css'
import './styles/puzzle-list.css'
import {
  MOVE_TRANSITION_MS,
  createInteractionFeedback,
  getBoardInteractionClasses,
  getCellInteractionClasses,
  getPieceInteractionClasses,
} from './ui/interactionFeedback.js'
import { getPrevId, getNextId, getPuzzlePosition } from './puzzles/nav.js'
import catalogue from './puzzles/catalogue.js'
import { initSound, playMove, playSolve, isSoundEnabled, toggleSound } from './sound.js'
import { initDragDrop } from './ui/dragDrop.js'
import { initPwaPrompts } from './ui/pwaPrompts.js'

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

  const getRenderModel = () => buildInteractionRenderModel({
    puzzle: state.puzzle,
    board: state.board,
    renderBoardView,
    feedback,
  })

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
      } else {
        feedback.triggerIllegal(positionKey)
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
    restart() {
      const result = controller.reset()
      if (result.error) return getRenderModel()
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
      return {
        ...snapshot,
        puzzleId: state.puzzleId,
        board: state.board,
        puzzleList: controller.getPuzzleList(),
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

  btn.addEventListener('click', () => {
    const enabled = toggleSound()
    btn.textContent = enabled ? '🔊' : '🔇'
    btn.setAttribute('aria-label', enabled ? 'Mute sounds' : 'Unmute sounds')
    btn.setAttribute('title', enabled ? 'Sound on' : 'Sound off')
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

function renderToDom(root, model) {
  root.innerHTML = ''

  const app = document.createElement('section')
  app.className = 'xess-ui'

  const meta = document.createElement('header')
  meta.className = 'puzzle-meta'
  meta.setAttribute('data-puzzle-meta', 'true')

  // Meta top row: title + list button
  const metaTop = document.createElement('div')
  metaTop.className = 'puzzle-meta-top'

  const title = document.createElement('h1')
  title.className = 'puzzle-title'
  title.setAttribute('data-puzzle-title', 'true')
  title.textContent = model.puzzleTitle

  const listBtn = document.createElement('button')
  listBtn.type = 'button'
  listBtn.className = 'nav-btn'
  listBtn.setAttribute('data-open-list', 'true')
  listBtn.setAttribute('aria-label', 'Puzzle list')
  listBtn.textContent = '☰'

  metaTop.append(title, listBtn, renderSoundToggle())

  const objective = document.createElement('p')
  objective.className = 'puzzle-objective'
  objective.setAttribute('data-puzzle-objective', 'true')
  objective.textContent = model.objectiveText

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

  meta.append(metaTop, objective, goalBadge, posSpan)
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
  app.append(nav)

  // Win banner
  const isWon = model.boardClasses.includes('is-won')
  const winBanner = document.createElement('div')
  winBanner.setAttribute('data-win-banner', 'true')
  winBanner.className = isWon ? 'win-banner is-won' : 'win-banner'

  if (isWon) {
    if (model.nextId) {
      const solvedSpan = document.createElement('span')
      solvedSpan.textContent = 'Puzzle solved!'
      const nextPuzzleBtn = document.createElement('button')
      nextPuzzleBtn.type = 'button'
      nextPuzzleBtn.className = 'btn-next-puzzle'
      nextPuzzleBtn.setAttribute('data-win-next-puzzle', 'true')
      nextPuzzleBtn.textContent = 'Next Puzzle'
      winBanner.append(solvedSpan, nextPuzzleBtn)
    } else {
      // End of catalogue — count total puzzles from position string
      const total = catalogue.length
      const endSpan = document.createElement('span')
      endSpan.textContent = total ? `All ${total} puzzles solved! 🎉` : 'All puzzles solved! 🎉'
      winBanner.append(endSpan)
    }
  }

  app.append(winBanner)

  const board = document.createElement('div')
  board.className = ['board', ...model.boardClasses].join(' ').trim()
  board.setAttribute('data-board', 'true')
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
  let currentPuzzleId = null
  let ui = null
  let showingList = false
  let _dragCleanup = null    // cleanup fn returned by initDragDrop
  let _isDragging = false    // true once drag threshold exceeded this pointer sequence

  function loadPuzzle(puzzleId) {
    ui = createGameUiController({ controller, puzzleId })
    currentPuzzleId = puzzleId
    showingList = false
    rerender()
  }

  function rerender() {
    if (showingList) {
      renderListScreen()
    } else {
      renderGameScreen()
    }
  }

  function renderGameScreen() {
    const model = ui.getRenderModel()
    const extModel = {
      ...model,
      puzzleId: currentPuzzleId,
      prevId: getPrevId(currentPuzzleId),
      nextId: getNextId(currentPuzzleId),
    }
    renderToDom(root, extModel)

    // Tear down previous drag listener if board was re-rendered
    if (_dragCleanup) { _dragCleanup(); _dragCleanup = null }

    const boardEl = root.querySelector('[data-board]')
    if (boardEl) {
      _dragCleanup = initDragDrop(boardEl, {
        onDragStart(fromKey) {
          _isDragging = true
          ui.tapCell(fromKey)   // selects the piece, shows legal move highlights
          // Do NOT rerender here — rebuilding the DOM would destroy the board element
          // and kill the in-flight drag state (ghost + pointer capture).
          // Selection highlight is intentionally deferred to onDrop/onCancel.
        },
        onDrop(fromKey, toKey) {
          _isDragging = false
          animatePieceMove(root, fromKey, toKey, () => {
            ui.tapCell(toKey)
            const moveResult = ui.getLastMoveResult()
            if (moveResult === 'win') playSolve()
            else if (moveResult === 'move_made') playMove()
            rerender()
          })
        },
        onCancel(fromKey) {
          _isDragging = false
          // Deselect: tapCell with the currently-selected key toggles off
          const snapshot = ui.getState()
          if (snapshot.selectedKey === fromKey) {
            ui.tapCell(fromKey)  // second tap on selected key → clearSelection
          }
          rerender()
        },
      })
    }

    root.querySelector('[data-prev-puzzle]')?.addEventListener('pointerdown', () => {
      if (extModel.prevId) loadPuzzle(extModel.prevId)
    })
    root.querySelector('[data-next-puzzle]')?.addEventListener('pointerdown', () => {
      if (extModel.nextId) loadPuzzle(extModel.nextId)
    })
    root.querySelector('[data-restart-puzzle]')?.addEventListener('pointerdown', () => {
      ui.restart()
      rerender()
    })
    root.querySelector('[data-open-list]')?.addEventListener('pointerdown', () => {
      showingList = true
      rerender()
    })
    root.querySelector('[data-win-next-puzzle]')?.addEventListener('pointerdown', () => {
      if (extModel.nextId) loadPuzzle(extModel.nextId)
    })
  }

  function renderListScreen() {
    const listData = controller.getPuzzleList()
    const listEl = renderPuzzleList({
      list: listData,
      currentId: currentPuzzleId,
      onSelect(id) { loadPuzzle(id) },
      onClose() { showingList = false; rerender() },
    })
    root.innerHTML = ''
    root.append(listEl)
  }

  loadPuzzle(chooseInitialPuzzleId(controller))

  root.addEventListener('pointerdown', (event) => {
    if (showingList) return
    _isDragging = false  // reset for this pointer sequence
  })

  root.addEventListener('pointerup', (event) => {
    if (showingList) return
    if (_isDragging) return  // drag handled it; skip tap
    const cell = event.target.closest?.('[data-cell-key]')
    if (!cell) return
    const tapKey = cell.dataset.cellKey
    // Capture selected key before tapCell mutates state (for FLIP animation)
    const prevSelected = ui.getState().selectedKey
    ui.tapCell(tapKey)
    const moveResult = ui.getLastMoveResult()
    if (moveResult === 'win' || moveResult === 'move_made') {
      if (moveResult === 'win') playSolve()
      else playMove()
      animatePieceMove(root, prevSelected, tapKey, rerender)
    } else {
      rerender()
    }
  })

  return { loadPuzzle, rerender }
}

if (typeof document !== 'undefined') {
  mountGameUi(document.querySelector('#app'))
}

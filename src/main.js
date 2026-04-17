import { createController } from './controller.js'
import { createBoardRenderModel } from './ui/boardRenderer.js'
import './styles/app.css'
import {
  MOVE_TRANSITION_MS,
  createInteractionFeedback,
  getBoardInteractionClasses,
  getCellInteractionClasses,
  getPieceInteractionClasses,
} from './ui/interactionFeedback.js'

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

  const getRenderModel = () => buildInteractionRenderModel({
    puzzle: state.puzzle,
    board: state.board,
    renderBoardView,
    feedback,
  })

  const tapCell = (positionKey) => {
    if (typeof positionKey !== 'string' || positionKey.length === 0) {
      return getRenderModel()
    }

    const snapshot = feedback.snapshot()
    if (snapshot.won) return getRenderModel()

    if (!snapshot.selectedKey) {
      const legal = controller.selectPiece(positionKey)
      if (legal.length > 0) {
        feedback.select(positionKey, legal)
      } else {
        feedback.triggerIllegal(positionKey)
      }
      return getRenderModel()
    }

    if (positionKey === snapshot.selectedKey) {
      feedback.clearSelection()
      return getRenderModel()
    }

    // T-03-04 mitigation: UI gates move attempts by legal key membership
    if (snapshot.legalKeys.includes(positionKey)) {
      const result = controller.makeMove(snapshot.selectedKey, positionKey)
      if (result.error) {
        feedback.triggerIllegal(positionKey)
        return getRenderModel()
      }

      state.board = result.board
      feedback.applyMove(positionKey, result.won)
      return getRenderModel()
    }

    const legal = controller.selectPiece(positionKey)
    if (legal.length > 0) {
      feedback.select(positionKey, legal)
    } else {
      feedback.triggerIllegal(positionKey)
    }

    return getRenderModel()
  }

  return {
    tapCell,
    getRenderModel,
    getState() {
      const snapshot = feedback.snapshot()
      return {
        ...snapshot,
        puzzleId: state.puzzleId,
        board: state.board,
      }
    },
  }
}

function renderToDom(root, model) {
  root.innerHTML = ''

  const app = document.createElement('section')
  app.className = 'xess-ui'

  const meta = document.createElement('header')
  meta.className = 'puzzle-meta'
  meta.setAttribute('data-puzzle-meta', 'true')

  const title = document.createElement('h1')
  title.className = 'puzzle-title'
  title.setAttribute('data-puzzle-title', 'true')
  title.textContent = model.puzzleTitle

  const objective = document.createElement('p')
  objective.className = 'puzzle-objective'
  objective.setAttribute('data-puzzle-objective', 'true')
  objective.textContent = model.objectiveText

  meta.append(title, objective)
  app.append(meta)

  const status = document.createElement('p')
  status.setAttribute('data-win-banner', 'true')
  status.className = model.boardClasses.includes('is-won') ? 'win-banner is-won' : 'win-banner'
  status.textContent = model.boardClasses.includes('is-won') ? 'Puzzle solved!' : ''
  app.append(status)

  const board = document.createElement('div')
  board.className = ['board', ...model.boardClasses].join(' ').trim()
  board.setAttribute('data-board', 'true')
  board.style.setProperty('--cols', String(model.width))
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
      const svgDoc = new DOMParser().parseFromString(cell.piece.svg, 'image/svg+xml')
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

  const ui = createGameUiController()

  const rerender = () => renderToDom(root, ui.getRenderModel())
  rerender()

  root.addEventListener('pointerdown', (event) => {
    const cell = event.target.closest?.('[data-cell-key]')
    if (!cell) return

    ui.tapCell(cell.dataset.cellKey)
    rerender()
  })

  return ui
}

if (typeof document !== 'undefined') {
  mountGameUi(document.querySelector('#app'))
}

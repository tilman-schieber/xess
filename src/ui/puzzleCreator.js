import { parseKey, posKey } from '../puzzles/loader.js'
import { getPieceSvg } from './pieces.js'

const PIECE_CHARS = ['P', 'N', 'B', 'R', 'Q', 'K', 'p', 'n', 'b', 'r', 'q', 'k']
const PIECE_TYPES = [
  { type: 'r', label: 'Rook' },
  { type: 'n', label: 'Knight' },
  { type: 'q', label: 'Queen' },
  { type: 'p', label: 'Pawn' },
  { type: 'b', label: 'Bishop' },
]

function placementModesForGoalType(goalType) {
  if (goalType === 'capture-all-targets') {
    return [
      { value: 'black-piece', label: 'Black pieces' },
      { value: 'white-piece', label: 'White pieces' },
    ]
  }

  return [
    { value: 'red-piece', label: 'Red pieces' },
    { value: 'red-target', label: 'Red targets' },
    { value: 'white-piece', label: 'White pieces' },
  ]
}

let _domParser = null
function getDomParser() {
  if (!_domParser) _domParser = new DOMParser()
  return _domParser
}

function pieceFromChar(char, isReachGoal) {
  if (typeof char !== 'string' || char.length !== 1) return null
  const isUpper = char === char.toUpperCase()
  const baseColor = isUpper ? 'white' : 'black'
  const color = isReachGoal && baseColor === 'black' ? 'red' : baseColor
  return { type: char.toLowerCase(), color }
}

function bindActivate(el, callback) {
  if (!el || typeof callback !== 'function') return

  el.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    callback(event)
  })

  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback(event)
    }
  })
}

function renderPieceSpan(pieceChar, isReachGoal, className = 'creator-piece') {
  const piece = pieceFromChar(pieceChar, isReachGoal)
  if (!piece) return null

  const span = document.createElement('span')
  span.className = className
  const svgDoc = getDomParser().parseFromString(getPieceSvg(piece), 'image/svg+xml')
  const svgEl = svgDoc.documentElement
  svgEl.querySelectorAll('script, foreignObject').forEach(node => node.remove())
  span.append(svgEl)
  return span
}

function renderToolButton({ value, label, active, onSelect }) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = active ? 'creator-tool is-active' : 'creator-tool'
  button.textContent = label
  button.setAttribute('data-creator-tool', value)
  bindActivate(button, () => onSelect(value))
  return button
}

export function renderPuzzleCreator({
  model,
  onChangeField,
  onGenerateId,
  onLoadPreset,
  onNewPuzzle,
  onCopyExport,
  onResize,
  onSelectEditMode,
  onSelectPlacementMode,
  onSelectPieceType,
  onCellAction,
  onExport,
  onSolve,
  onChangeSolverDepth,
  onUndoStep,
  onRedoStep,
  onResetReplay,
}) {
  const root = document.createElement('section')
  root.className = 'puzzle-creator'

  const controls = document.createElement('section')
  controls.className = 'creator-panel'

  const heading = document.createElement('h2')
  heading.className = 'creator-heading'
  heading.textContent = 'Puzzle Creator'

  const copy = document.createElement('p')
  copy.className = 'creator-copy'
  copy.textContent = 'Draft puzzles visually, export JSON, and verify solvability.'

  const form = document.createElement('div')
  form.className = 'creator-form'

  const idWrap = document.createElement('label')
  idWrap.className = 'creator-field'
  idWrap.textContent = 'ID'
  const idRow = document.createElement('div')
  idRow.className = 'creator-inline-field'
  const idInput = document.createElement('input')
  idInput.type = 'text'
  idInput.value = model.id
  idInput.addEventListener('input', () => onChangeField('id', idInput.value))
  const uuidButton = document.createElement('button')
  uuidButton.type = 'button'
  uuidButton.className = 'creator-action creator-action--compact'
  uuidButton.textContent = 'Generate UUID'
  bindActivate(uuidButton, onGenerateId)
  idRow.append(idInput, uuidButton)
  idWrap.append(idRow)
  form.append(idWrap)

  const titleWrap = document.createElement('label')
  titleWrap.className = 'creator-field'
  titleWrap.textContent = 'Title'
  const titleInput = document.createElement('input')
  titleInput.type = 'text'
  titleInput.value = model.title
  titleInput.addEventListener('input', () => onChangeField('title', titleInput.value))
  titleWrap.append(titleInput)
  form.append(titleWrap)

  const presetWrap = document.createElement('label')
  presetWrap.className = 'creator-field'
  presetWrap.textContent = 'Load existing puzzle'
  const presetRow = document.createElement('div')
  presetRow.className = 'creator-inline-field'
  const presetSelect = document.createElement('select')
  presetSelect.value = model.selectedPresetId
  model.presetOptions.forEach(option => {
    const opt = document.createElement('option')
    opt.value = option.id
    opt.textContent = option.label
    presetSelect.append(opt)
  })
  presetSelect.addEventListener('change', () => onChangeField('selectedPresetId', presetSelect.value))
  const loadButton = document.createElement('button')
  loadButton.type = 'button'
  loadButton.className = 'creator-action creator-action--compact'
  loadButton.textContent = 'Load'
  bindActivate(loadButton, onLoadPreset)
  presetRow.append(presetSelect, loadButton)
  presetWrap.append(presetRow)
  form.append(presetWrap)

  const goalWrap = document.createElement('label')
  goalWrap.className = 'creator-field'
  goalWrap.textContent = 'Goal type'
  const goalSelect = document.createElement('select')
  goalSelect.value = model.goalType
  ;[
    { value: 'reach-all-goal-squares', label: 'Reach all goal squares' },
    { value: 'capture-all-targets', label: 'Capture all targets' },
  ].forEach(option => {
    const opt = document.createElement('option')
    opt.value = option.value
    opt.textContent = option.label
    goalSelect.append(opt)
  })
  goalSelect.addEventListener('change', () => onChangeField('goalType', goalSelect.value))
  goalWrap.append(goalSelect)
  form.append(goalWrap)

  const targetWrap = document.createElement('label')
  targetWrap.className = 'creator-field'
  targetWrap.textContent = 'Capture target color'
  const targetSelect = document.createElement('select')
  targetSelect.value = model.targetColor
  ;[
    { value: 'black', label: 'black' },
    { value: 'white', label: 'white' },
  ].forEach(option => {
    const opt = document.createElement('option')
    opt.value = option.value
    opt.textContent = option.label
    targetSelect.append(opt)
  })
  targetSelect.disabled = model.goalType !== 'capture-all-targets'
  targetSelect.addEventListener('change', () => onChangeField('targetColor', targetSelect.value))
  targetWrap.append(targetSelect)
  form.append(targetWrap)

  const descriptionWrap = document.createElement('label')
  descriptionWrap.className = 'creator-field'
  descriptionWrap.textContent = 'Description HTML'
  const descriptionInput = document.createElement('textarea')
  descriptionInput.className = 'creator-description-input'
  descriptionInput.value = model.descriptionHtml
  descriptionInput.addEventListener('input', () => onChangeField('descriptionHtml', descriptionInput.value))
  descriptionWrap.append(descriptionInput)
  form.append(descriptionWrap)

  const promoWrap = document.createElement('label')
  promoWrap.className = 'creator-checkbox'
  const promoInput = document.createElement('input')
  promoInput.type = 'checkbox'
  promoInput.checked = model.promote
  promoInput.addEventListener('change', () => onChangeField('promote', promoInput.checked))
  const promoLabel = document.createElement('span')
  promoLabel.textContent = 'Enable pawn promotion'
  promoWrap.append(promoInput, promoLabel)
  form.append(promoWrap)

  const sizeRow = document.createElement('div')
  sizeRow.className = 'creator-size'
  const widthInput = document.createElement('input')
  widthInput.type = 'number'
  widthInput.min = '2'
  widthInput.max = '12'
  widthInput.value = String(model.width)
  const heightInput = document.createElement('input')
  heightInput.type = 'number'
  heightInput.min = '2'
  heightInput.max = '12'
  heightInput.value = String(model.height)
  const resizeBtn = document.createElement('button')
  resizeBtn.type = 'button'
  resizeBtn.className = 'creator-action'
  resizeBtn.textContent = 'Resize board'
  bindActivate(resizeBtn, () => {
    onResize({
      width: Number.parseInt(widthInput.value, 10),
      height: Number.parseInt(heightInput.value, 10),
    })
  })
  sizeRow.append(document.createTextNode('Size'), widthInput, document.createTextNode('x'), heightInput, resizeBtn)

  const tools = document.createElement('div')
  tools.className = 'creator-tools'

  const editModeDefs = [
    { value: 'place', label: 'Place' },
    { value: 'goal', label: 'Goal + Ghost' },
    { value: 'empty', label: 'Empty' },
    { value: 'void', label: 'Impassable' },
  ]

  editModeDefs.forEach(tool => {
    tools.append(renderToolButton({
      value: tool.value,
      label: tool.label,
      active: model.editMode === tool.value,
      onSelect: onSelectEditMode,
    }))
  })

  const placementModes = placementModesForGoalType(model.goalType)
  const placementRow = document.createElement('div')
  placementRow.className = 'creator-placement-modes'
  placementModes.forEach(mode => {
    placementRow.append(renderToolButton({
      value: mode.value,
      label: mode.label,
      active: model.placementMode === mode.value,
      onSelect: onSelectPlacementMode,
    }))
  })

  const piecesRow = document.createElement('div')
  piecesRow.className = 'creator-piece-types'
  PIECE_TYPES.forEach(({ type, label }) => {
    piecesRow.append(renderToolButton({
      value: type,
      label,
      active: model.pieceType === type,
      onSelect: onSelectPieceType,
    }))
  })

  const editorActions = document.createElement('div')
  editorActions.className = 'creator-actions'

  const solverActions = document.createElement('div')
  solverActions.className = 'creator-actions'

  const exportBtn = document.createElement('button')
  exportBtn.type = 'button'
  exportBtn.className = 'creator-action'
  exportBtn.textContent = 'Export JSON'
  bindActivate(exportBtn, onExport)

  const copyBtn = document.createElement('button')
  copyBtn.type = 'button'
  copyBtn.className = 'creator-action'
  copyBtn.textContent = model.copyStatus === 'copied' ? 'Copied' : 'Copy JSON'
  bindActivate(copyBtn, onCopyExport)

  const newPuzzleBtn = document.createElement('button')
  newPuzzleBtn.type = 'button'
  newPuzzleBtn.className = 'creator-action'
  newPuzzleBtn.textContent = 'New puzzle'
  bindActivate(newPuzzleBtn, onNewPuzzle)

  const solveBtn = document.createElement('button')
  solveBtn.type = 'button'
  solveBtn.className = 'creator-action'
  solveBtn.textContent = 'Solve'
  bindActivate(solveBtn, onSolve)

  const undoBtn = document.createElement('button')
  undoBtn.type = 'button'
  undoBtn.className = 'creator-action'
  undoBtn.textContent = 'Undo step'
  undoBtn.disabled = model.replayIndex <= 0
  bindActivate(undoBtn, onUndoStep)

  const redoBtn = document.createElement('button')
  redoBtn.type = 'button'
  redoBtn.className = 'creator-action'
  redoBtn.textContent = 'Redo step'
  redoBtn.disabled = model.replayIndex >= (model.replayBoards.length - 1)
  bindActivate(redoBtn, onRedoStep)

  const resetReplayBtn = document.createElement('button')
  resetReplayBtn.type = 'button'
  resetReplayBtn.className = 'creator-action'
  resetReplayBtn.textContent = 'Reset replay'
  resetReplayBtn.disabled = model.replayBoards.length === 0
  bindActivate(resetReplayBtn, onResetReplay)

  editorActions.append(exportBtn, copyBtn, newPuzzleBtn)
  solverActions.append(solveBtn, undoBtn, redoBtn, resetReplayBtn)

  const solverDepthRow = document.createElement('div')
  solverDepthRow.className = 'creator-size creator-size--solver'
  const solverDepthLabel = document.createElement('span')
  solverDepthLabel.textContent = 'Max depth'
  const solverDepthInput = document.createElement('input')
  solverDepthInput.type = 'number'
  solverDepthInput.min = '1'
  solverDepthInput.max = '200'
  solverDepthInput.value = String(model.solverMaxDepth)
  solverDepthInput.addEventListener('input', () => {
    onChangeSolverDepth(Number.parseInt(solverDepthInput.value, 10))
  })
  solverDepthRow.append(solverDepthLabel, solverDepthInput)

  const message = document.createElement('p')
  message.className = 'creator-message'
  message.textContent = model.message

  const exportArea = document.createElement('textarea')
  exportArea.className = 'creator-export'
  exportArea.value = model.exportJson
  exportArea.readOnly = true

  const editorSection = document.createElement('section')
  editorSection.className = 'creator-subsection'
  const editorSectionTitle = document.createElement('h3')
  editorSectionTitle.className = 'creator-subsection-title'
  editorSectionTitle.textContent = 'Board editor'

  editorSection.append(editorSectionTitle, sizeRow, tools)
  if (model.editMode === 'place' || model.editMode === 'goal') {
    editorSection.append(placementRow, piecesRow)
  }
  editorSection.append(editorActions, exportArea)

  const solverSection = document.createElement('section')
  solverSection.className = 'creator-subsection creator-subsection--solver'
  const solverSectionTitle = document.createElement('h3')
  solverSectionTitle.className = 'creator-subsection-title'
  solverSectionTitle.textContent = 'Solver and replay'
  solverSection.append(solverSectionTitle, solverDepthRow, solverActions, message)

  controls.append(heading, copy, form, editorSection, solverSection)

  const boardPanel = document.createElement('section')
  boardPanel.className = 'creator-board-panel'

  const board = document.createElement('div')
  board.className = 'board creator-board'
  board.setAttribute('data-promotion-enabled', model.promote === true ? 'true' : 'false')
  board.style.setProperty('--cols', String(model.width))
  board.style.setProperty('--rows', String(model.height))

  const isReachGoal = model.goalType === 'reach-all-goal-squares'
  for (let row = 0; row < model.height; row += 1) {
    for (let col = 0; col < model.width; col += 1) {
      const key = posKey(col, row)
      const cell = model.cells.get(key)
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('data-creator-cell', key)
      button.className = ['cell', cell?.isVoid ? 'cell--void' : 'cell--playable', cell?.isGoal ? 'cell--goal' : '']
        .filter(Boolean)
        .join(' ')
      button.tabIndex = 0

      if (!cell?.isVoid && cell?.pieceChar) {
        const pieceEl = renderPieceSpan(cell.pieceChar, isReachGoal)
        if (pieceEl) button.append(pieceEl)
      } else if (!cell?.isVoid && cell?.isGoal) {
        const targetChar = model.goalTargets[key]
        if (targetChar) {
          const ghost = renderPieceSpan(targetChar, isReachGoal, 'creator-piece creator-piece--ghost')
          if (ghost) {
            ghost.setAttribute('aria-hidden', 'true')
            button.append(ghost)
          }
        }
      }

      bindActivate(button, () => onCellAction(key))
      board.append(button)
    }
  }

  const replayMeta = document.createElement('p')
  replayMeta.className = 'creator-replay-meta'
  if (model.replayBoards.length > 0) {
    replayMeta.textContent = `Replay step ${model.replayIndex}/${model.replayBoards.length - 1}`
  } else {
    replayMeta.textContent = 'No solver replay loaded.'
  }

  boardPanel.append(board, replayMeta)
  root.append(controls, boardPanel)
  return root
}

export function createEmptyCreatorCells(width, height) {
  const map = new Map()
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      map.set(posKey(col, row), {
        isVoid: false,
        isGoal: false,
        pieceChar: null,
      })
    }
  }
  return map
}

export function resizeCreatorCells(cells, nextWidth, nextHeight) {
  const next = new Map()
  for (let row = 0; row < nextHeight; row += 1) {
    for (let col = 0; col < nextWidth; col += 1) {
      const key = posKey(col, row)
      const current = cells.get(key)
      next.set(key, current ? { ...current } : { isVoid: false, isGoal: false, pieceChar: null })
    }
  }
  return next
}

function isPlacementModeAllowed(goalType, placementMode) {
  return placementModesForGoalType(goalType).some(mode => mode.value === placementMode)
}

function charForPlacement(placementMode, pieceType) {
  const normalized = typeof pieceType === 'string' ? pieceType.toLowerCase() : ''
  if (!['r', 'n', 'q', 'p', 'b'].includes(normalized)) return null
  if (placementMode === 'white-piece') return normalized.toUpperCase()
  if (placementMode === 'black-piece' || placementMode === 'red-piece' || placementMode === 'red-target') {
    return normalized
  }
  return null
}

export function applyToolToCell({ cells, goalTargets, cellKey, editMode, placementMode, pieceType, goalType }) {
  const nextCells = new Map(cells)
  const nextGoalTargets = { ...goalTargets }
  const cell = nextCells.get(cellKey)
  if (!cell) return { cells: nextCells, goalTargets: nextGoalTargets }

  const nextCell = { ...cell }
  if (editMode === 'void') {
    nextCell.isVoid = true
    nextCell.isGoal = false
    nextCell.pieceChar = null
    delete nextGoalTargets[cellKey]
  } else if (editMode === 'empty') {
    nextCell.isVoid = false
    nextCell.isGoal = false
    nextCell.pieceChar = null
    delete nextGoalTargets[cellKey]
  } else if (editMode === 'goal') {
    const goalTargetChar = charForPlacement(placementMode, pieceType)
    nextCell.isVoid = false
    nextCell.isGoal = true
    nextCell.pieceChar = null
    if (goalType === 'reach-all-goal-squares' && goalTargetChar) {
      nextGoalTargets[cellKey] = goalTargetChar
    } else {
      delete nextGoalTargets[cellKey]
    }
  } else if (editMode === 'place' && isPlacementModeAllowed(goalType, placementMode)) {
    const pieceChar = charForPlacement(placementMode, pieceType)
    if (!pieceChar) return { cells: nextCells, goalTargets: nextGoalTargets }

    if (placementMode === 'red-target') {
      nextCell.isVoid = false
      nextCell.isGoal = true
      nextCell.pieceChar = null
      nextGoalTargets[cellKey] = pieceChar
      nextCells.set(cellKey, nextCell)
      return { cells: nextCells, goalTargets: nextGoalTargets }
    }

    nextCell.isVoid = false
    nextCell.isGoal = false
    nextCell.pieceChar = PIECE_CHARS.includes(pieceChar) ? pieceChar : null
    delete nextGoalTargets[cellKey]
  }

  nextCells.set(cellKey, nextCell)
  return { cells: nextCells, goalTargets: nextGoalTargets }
}

export function creatorCellsToGrid({ cells, width, height }) {
  const rows = []
  for (let row = 0; row < height; row += 1) {
    let line = ''
    for (let col = 0; col < width; col += 1) {
      const key = posKey(col, row)
      const cell = cells.get(key)
      if (!cell || cell.isVoid) {
        line += 'x'
      } else if (cell.isGoal) {
        line += 'G'
      } else if (cell.pieceChar) {
        line += cell.pieceChar
      } else {
        line += '-'
      }
    }
    rows.push(line)
  }
  return rows
}

export function toRawPuzzle(model) {
  const raw = {
    schemaVersion: 1,
    id: model.id.trim(),
    title: model.title.trim(),
    goalType: model.goalType,
    grid: creatorCellsToGrid({ cells: model.cells, width: model.width, height: model.height }),
  }

  if (model.descriptionHtml.trim().length > 0) {
    raw.descriptionHtml = model.descriptionHtml.trim()
  }
  if (model.goalType === 'capture-all-targets') {
    raw.targetColor = model.targetColor
  }
  if (model.goalType === 'reach-all-goal-squares') {
    const entries = Object.entries(model.goalTargets)
    if (entries.length > 0) {
      raw.goalTargets = Object.fromEntries(entries)
    }
  }
  if (model.promote) {
    raw.promote = true
  }
  return raw
}

export function toBoardMapFromCells(cells) {
  const board = new Map()
  for (const [key, cell] of cells.entries()) {
    if (cell.isVoid) continue
    const piece = cell.pieceChar
      ? {
        type: cell.pieceChar.toLowerCase(),
        color: cell.pieceChar === cell.pieceChar.toUpperCase() ? 'white' : 'black',
      }
      : null
    board.set(key, { piece, isGoal: cell.isGoal === true })
  }
  return board
}

export function creatorStateFromRawPuzzle(raw) {
  const rows = Array.isArray(raw?.grid) ? raw.grid.filter(row => typeof row === 'string') : []
  const width = Math.max(2, Math.min(12, rows.length > 0 ? Math.max(...rows.map(row => row.length)) : 6))
  const height = Math.max(2, Math.min(12, rows.length > 0 ? rows.length : 6))
  const cells = createEmptyCreatorCells(width, height)

  for (let row = 0; row < height; row += 1) {
    const line = rows[row] ?? ''
    for (let col = 0; col < width; col += 1) {
      const key = posKey(col, row)
      const char = line[col] ?? 'x'
      const cell = cells.get(key)
      if (!cell) continue
      if (char === 'x') {
        cells.set(key, { isVoid: true, isGoal: false, pieceChar: null })
      } else if (char === '-') {
        cells.set(key, { isVoid: false, isGoal: false, pieceChar: null })
      } else if (char === 'G') {
        cells.set(key, { isVoid: false, isGoal: true, pieceChar: null })
      } else if (PIECE_CHARS.includes(char)) {
        cells.set(key, { isVoid: false, isGoal: false, pieceChar: char })
      } else {
        cells.set(key, { isVoid: true, isGoal: false, pieceChar: null })
      }
    }
  }

  return {
    id: typeof raw?.id === 'string' && raw.id.length > 0 ? raw.id : 'draft-puzzle',
    title: typeof raw?.title === 'string' ? raw.title : 'Draft Puzzle',
    descriptionHtml: typeof raw?.descriptionHtml === 'string' ? raw.descriptionHtml : '',
    goalType: raw?.goalType === 'capture-all-targets' ? 'capture-all-targets' : 'reach-all-goal-squares',
    targetColor: raw?.targetColor === 'white' ? 'white' : 'black',
    promote: raw?.promote === true,
    width,
    height,
    cells,
    goalTargets: raw?.goalTargets && typeof raw.goalTargets === 'object' ? { ...raw.goalTargets } : {},
  }
}

export function applyMovesToBoard({ board, puzzle, moves }) {
  const snapshots = [new Map(board)]
  let current = new Map(board)

  for (const move of moves) {
    const fromCell = current.get(move.from)
    const toCell = current.get(move.to)
    if (!fromCell || !toCell || !fromCell.piece) break

    const next = new Map(current)
    next.set(move.to, { ...toCell, piece: fromCell.piece })
    next.set(move.from, { ...fromCell, piece: null })

    if (puzzle.promote === true) {
      const [, row] = parseKey(move.to)
      const moved = next.get(move.to)?.piece
      if (moved && moved.type === 'p' && row === 0) {
        next.set(move.to, { ...next.get(move.to), piece: { ...moved, type: 'q' } })
      }
    }

    snapshots.push(next)
    current = next
  }

  return snapshots
}

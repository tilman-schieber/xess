import { parseKey, posKey } from '../puzzles/loader.js'
import { getPieceSvg } from './pieces.js'

const PIECE_CHARS = ['P', 'N', 'B', 'R', 'Q', 'K', 'p', 'n', 'b', 'r', 'q', 'k']
const PIECE_TYPES = [
  { type: 'q', label: 'Queen' },
  { type: 'r', label: 'Rook' },
  { type: 'b', label: 'Bishop' },
  { type: 'n', label: 'Knight' },
  { type: 'p', label: 'Pawn' },
]

function placementModesForGoalType(goalType) {
  if (goalType === 'capture-all-targets') {
    return [
      { value: 'white-piece', label: 'White (you move these)' },
      { value: 'black-piece', label: 'Black (to capture)' },
    ]
  }

  return [
    { value: 'white-piece', label: 'White blockers' },
    { value: 'red-piece', label: 'Red pieces' },
    { value: 'red-target', label: 'Goal square for' },
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
    // Commit any in-progress text input before handling button action.
    // preventDefault above prevents blur from happening automatically, so
    // we trigger it manually so 'change' fires on any focused text field.
    if (document.activeElement && document.activeElement !== el) {
      document.activeElement.blur()
    }
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

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function actionButton(label, onActivate, { disabled = false, primary = false, attr = null } = {}) {
  const button = el('button', primary ? 'creator-action creator-action--primary' : 'creator-action', label)
  button.type = 'button'
  button.disabled = disabled
  if (attr) button.setAttribute(attr, 'true')
  bindActivate(button, onActivate)
  return button
}

// Drag-painting: the board is re-rendered after every painted cell, so the
// stroke is tracked at module level and resolved with elementFromPoint.
const paintStroke = { active: false, lastKey: null, onCell: null }
let _paintListenersBound = false
function ensurePaintListeners() {
  if (_paintListenersBound || typeof window === 'undefined') return
  _paintListenersBound = true

  window.addEventListener('pointermove', (event) => {
    if (!paintStroke.active) return
    const target = document.elementFromPoint(event.clientX, event.clientY)
    const key = target?.closest?.('[data-creator-cell]')?.getAttribute('data-creator-cell')
    if (!key || key === paintStroke.lastKey) return
    // Fast strokes skip squares between pointer events: fill the straight line
    const [fromCol, fromRow] = parseKey(paintStroke.lastKey ?? key)
    const [toCol, toRow] = parseKey(key)
    const steps = Math.max(Math.abs(toCol - fromCol), Math.abs(toRow - fromRow), 1)
    paintStroke.lastKey = key
    for (let step = 1; step <= steps; step += 1) {
      const col = Math.round(fromCol + ((toCol - fromCol) * step) / steps)
      const row = Math.round(fromRow + ((toRow - fromRow) * step) / steps)
      paintStroke.onCell?.(posKey(col, row), { drag: true })
    }
  })

  const endStroke = () => { paintStroke.active = false }
  window.addEventListener('pointerup', endStroke)
  window.addEventListener('pointercancel', endStroke)
}

function renderField(labelText, control) {
  const wrap = el('label', 'creator-field', labelText)
  wrap.append(control)
  return wrap
}

function renderPalette({ model, onSelectTool }) {
  const palette = el('div', 'creator-palette')
  const isReachGoal = model.goalType === 'reach-all-goal-squares'

  const basics = el('div', 'creator-palette-row')
  ;[
    { editMode: 'empty', label: 'Empty square', glyph: '' },
    { editMode: 'void', label: 'Hole', glyph: '✕' },
  ].forEach(({ editMode, label, glyph }) => {
    const button = el('button', 'creator-swatch creator-swatch--wide')
    button.type = 'button'
    button.setAttribute('data-creator-tool', editMode)
    button.setAttribute('aria-pressed', String(model.editMode === editMode))
    if (model.editMode === editMode) button.classList.add('is-active')
    const chip = el('span', editMode === 'void' ? 'creator-swatch-chip creator-swatch-chip--void' : 'creator-swatch-chip', glyph)
    button.append(chip, el('span', 'creator-swatch-label', label))
    bindActivate(button, () => onSelectTool({ editMode }))
    basics.append(button)
  })
  palette.append(basics)

  placementModesForGoalType(model.goalType).forEach((mode) => {
    const row = el('div', 'creator-palette-group')
    row.append(el('span', 'creator-palette-title', mode.label))
    const swatches = el('div', 'creator-palette-row')

    PIECE_TYPES.forEach(({ type, label }) => {
      const isTarget = mode.value === 'red-target'
      const char = mode.value === 'white-piece' ? type.toUpperCase() : type
      const active = model.editMode === 'place' && model.placementMode === mode.value && model.pieceType === type
      const button = el('button', 'creator-swatch')
      button.type = 'button'
      button.setAttribute('data-creator-tool', `${mode.value}:${type}`)
      button.setAttribute('aria-label', `${mode.label}: ${label}`)
      button.setAttribute('title', `${mode.label}: ${label}`)
      button.setAttribute('aria-pressed', String(active))
      if (active) button.classList.add('is-active')
      if (isTarget) button.classList.add('creator-swatch--goal')
      const piece = renderPieceSpan(char, isReachGoal, isTarget ? 'creator-piece creator-piece--ghost' : 'creator-piece')
      if (piece) button.append(piece)
      bindActivate(button, () => onSelectTool({ editMode: 'place', placementMode: mode.value, pieceType: type }))
      swatches.append(button)
    })

    row.append(swatches)
    palette.append(row)
  })

  return palette
}

function renderEdgeControls({ model, onResizeEdge }) {
  const wrap = el('div', 'creator-edges')
  wrap.append(el('span', 'creator-palette-title', `Board ${model.width} × ${model.height}`))

  const grid = el('div', 'creator-edges-grid')
  ;[
    { side: 'top', label: 'Top row' },
    { side: 'bottom', label: 'Bottom row' },
    { side: 'left', label: 'Left column' },
    { side: 'right', label: 'Right column' },
  ].forEach(({ side, label }) => {
    const isRow = side === 'top' || side === 'bottom'
    const size = isRow ? model.height : model.width
    const row = el('div', 'creator-edge')
    row.append(el('span', 'creator-edge-label', label))

    const minus = el('button', 'creator-action creator-action--compact', '−')
    minus.type = 'button'
    minus.disabled = size <= 1
    minus.setAttribute('aria-label', `Remove ${label.toLowerCase()}`)
    minus.setAttribute('data-creator-edge', `${side}:-1`)
    bindActivate(minus, () => onResizeEdge(side, -1))

    const plus = el('button', 'creator-action creator-action--compact', '+')
    plus.type = 'button'
    plus.disabled = size >= 12
    plus.setAttribute('aria-label', `Add ${label.toLowerCase()}`)
    plus.setAttribute('data-creator-edge', `${side}:1`)
    bindActivate(plus, () => onResizeEdge(side, 1))

    row.append(minus, plus)
    grid.append(row)
  })
  wrap.append(grid)
  return wrap
}

export function renderPuzzleCreator({
  model,
  onChangeField,
  onLoadPreset,
  onNewPuzzle,
  onSelectTool,
  onCellAction,
  onResizeEdge,
  onUndoEdit,
  onRedoEdit,
  onSetViewMode,
  onReplayStep,
  onPlayUndo,
  onPlayReset,
  onCopyExport,
  onChangeSolverDepth,
}) {
  ensurePaintListeners()

  const root = el('section', 'puzzle-creator')
  root.setAttribute('data-creator-view', model.viewMode)

  // ── Left: puzzle details, palette, board size ──
  const controls = el('section', 'creator-panel')

  const presetSelect = document.createElement('select')
  const blank = document.createElement('option')
  blank.value = ''
  blank.textContent = 'Open an existing puzzle…'
  presetSelect.append(blank)
  model.presetOptions.forEach((option) => {
    const opt = document.createElement('option')
    opt.value = option.id
    opt.textContent = option.label
    presetSelect.append(opt)
  })
  presetSelect.value = ''
  presetSelect.setAttribute('aria-label', 'Open an existing puzzle')
  presetSelect.addEventListener('change', () => {
    if (presetSelect.value) onLoadPreset(presetSelect.value)
  })

  const fileRow = el('div', 'creator-inline-field')
  fileRow.append(presetSelect, actionButton('New', onNewPuzzle, { attr: 'data-creator-new' }))
  controls.append(fileRow)

  const titleInput = document.createElement('input')
  titleInput.type = 'text'
  titleInput.value = model.title
  titleInput.addEventListener('change', () => onChangeField('title', titleInput.value))

  const idInput = document.createElement('input')
  idInput.type = 'text'
  idInput.value = model.id
  idInput.addEventListener('change', () => onChangeField('id', idInput.value))

  const goalSelect = document.createElement('select')
  ;[
    { value: 'reach-all-goal-squares', label: 'Reach: red pieces to their goal squares' },
    { value: 'capture-all-targets', label: 'Capture: white takes every black piece' },
  ].forEach((option) => {
    const opt = document.createElement('option')
    opt.value = option.value
    opt.textContent = option.label
    goalSelect.append(opt)
  })
  goalSelect.value = model.goalType
  goalSelect.addEventListener('change', () => onChangeField('goalType', goalSelect.value))

  const promoWrap = el('label', 'creator-checkbox')
  const promoInput = document.createElement('input')
  promoInput.type = 'checkbox'
  promoInput.checked = model.promote
  promoInput.addEventListener('change', () => onChangeField('promote', promoInput.checked))
  promoWrap.append(promoInput, el('span', null, 'Pawns become queens on the top row'))

  const descriptionInput = el('textarea', 'creator-description-input')
  descriptionInput.value = model.descriptionHtml
  descriptionInput.placeholder = '<p>One line that sets the scene.</p>'
  descriptionInput.addEventListener('change', () => onChangeField('descriptionHtml', descriptionInput.value))

  const form = el('div', 'creator-form')
  form.append(
    renderField('Title', titleInput),
    renderField('ID (follows the title until you edit it)', idInput),
    renderField('Goal', goalSelect),
    promoWrap,
    renderField('Description (HTML)', descriptionInput),
  )
  controls.append(form)

  controls.append(renderPalette({ model, onSelectTool }))
  controls.append(renderEdgeControls({ model, onResizeEdge }))

  // ── Right: mode tabs, board, status, mode-specific controls, export ──
  const boardPanel = el('section', 'creator-board-panel')

  const tabs = el('div', 'creator-tabs')
  tabs.setAttribute('role', 'tablist')
  ;[
    { value: 'edit', label: 'Edit', disabled: false },
    { value: 'play', label: 'Test play', disabled: !model.isValid },
    { value: 'replay', label: 'Solution', disabled: model.replayCount === 0 },
  ].forEach((tab) => {
    const button = el('button', 'creator-tab', tab.label)
    button.type = 'button'
    button.disabled = tab.disabled
    button.setAttribute('role', 'tab')
    button.setAttribute('data-creator-tab', tab.value)
    button.setAttribute('aria-selected', String(model.viewMode === tab.value))
    if (model.viewMode === tab.value) button.classList.add('is-active')
    bindActivate(button, () => onSetViewMode(tab.value))
    tabs.append(button)
  })
  boardPanel.append(tabs)

  const status = el('p', 'creator-status', model.status?.text ?? '')
  status.setAttribute('data-creator-status', model.status?.kind ?? 'idle')
  status.setAttribute('role', 'status')
  boardPanel.append(status)

  const board = el('div', 'board creator-board')
  board.setAttribute('data-promotion-enabled', model.promote === true ? 'true' : 'false')
  board.style.setProperty('--cols', String(model.width))
  board.style.setProperty('--rows', String(model.height))

  paintStroke.onCell = onCellAction
  const isReachGoal = model.goalType === 'reach-all-goal-squares'
  const legalSet = new Set(model.playLegal ?? [])
  for (let row = 0; row < model.height; row += 1) {
    for (let col = 0; col < model.width; col += 1) {
      const key = posKey(col, row)
      const cell = model.displayCells.get(key)
      const button = el('button', ['cell', cell?.isVoid ? 'cell--void' : 'cell--playable', cell?.isGoal ? 'cell--goal' : '']
        .filter(Boolean)
        .join(' '))
      button.type = 'button'
      button.setAttribute('data-creator-cell', key)
      if (model.playSelected === key) button.classList.add('is-selected')
      if (legalSet.has(key)) button.classList.add('is-legal')
      if (model.highlight?.from === key) button.classList.add('is-hint-from')
      if (model.highlight?.to === key) button.classList.add('is-hint-to')

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

      button.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        event.preventDefault()
        if (document.activeElement && document.activeElement !== button) document.activeElement.blur()
        // Touch pointers are captured by the pressed element; release so the
        // stroke can be tracked across cells.
        if (button.hasPointerCapture?.(event.pointerId)) button.releasePointerCapture(event.pointerId)
        paintStroke.active = model.viewMode === 'edit'
        paintStroke.lastKey = key
        onCellAction(key, { drag: false })
      })
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onCellAction(key, { drag: false })
        }
      })
      board.append(button)
    }
  }
  boardPanel.append(board)

  const modeBar = el('div', 'creator-actions')
  if (model.viewMode === 'edit') {
    modeBar.append(
      actionButton('Undo', onUndoEdit, { disabled: !model.canUndoEdit, attr: 'data-creator-undo' }),
      actionButton('Redo', onRedoEdit, { disabled: !model.canRedoEdit, attr: 'data-creator-redo' }),
      el('span', 'creator-hint', 'Click or drag to paint. Click a square again to clear it.'),
    )
  } else if (model.viewMode === 'play') {
    modeBar.append(
      actionButton('Undo move', onPlayUndo, { disabled: !model.play?.canUndo }),
      actionButton('Restart', onPlayReset, { disabled: (model.play?.moves ?? 0) === 0 }),
      el('span', 'creator-hint', model.play?.text ?? ''),
    )
  } else {
    modeBar.append(
      actionButton('◀ Back', () => onReplayStep(-1), { disabled: model.replayIndex <= 0 }),
      actionButton('Next ▶', () => onReplayStep(1), { disabled: model.replayIndex >= model.replayCount - 1 }),
      el('span', 'creator-hint', `Move ${model.replayIndex} of ${Math.max(0, model.replayCount - 1)} · arrow keys also step`),
    )
  }
  boardPanel.append(modeBar)

  // ── Export ──
  const exportWrap = el('div', 'creator-export-wrap')
  const exportHead = el('div', 'creator-export-head')
  exportHead.append(
    el('span', 'creator-palette-title', 'Catalogue entry'),
    actionButton(
      model.copyStatus === 'copied' ? 'Copied ✓' : model.copyStatus === 'failed' ? 'Copy failed' : 'Copy',
      onCopyExport,
      { disabled: !model.isValid, primary: true, attr: 'data-creator-copy' },
    ),
  )
  const exportArea = el('textarea', 'creator-export')
  exportArea.value = model.exportText
  exportArea.readOnly = true
  exportArea.setAttribute('data-creator-export', 'true')
  exportArea.setAttribute('aria-label', 'Catalogue entry for this puzzle')
  const exportHelp = el(
    'p',
    'creator-copy',
    'Paste into src/puzzles/catalogue.js, add the id to a track in src/puzzles/tracks.js, then run node scripts/generate-solutions.js.',
  )

  const depthRow = el('label', 'creator-size')
  depthRow.append(el('span', null, 'Solver gives up after'))
  const depthInput = document.createElement('input')
  depthInput.type = 'number'
  depthInput.min = '1'
  depthInput.max = '200'
  depthInput.value = String(model.solverMaxDepth)
  depthInput.addEventListener('change', () => onChangeSolverDepth(Number.parseInt(depthInput.value, 10)))
  depthRow.append(depthInput, el('span', null, 'moves'))

  exportWrap.append(exportHead, exportArea, exportHelp, depthRow)
  boardPanel.append(exportWrap)

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
  const width = Math.max(1, Math.min(12, rows.length > 0 ? Math.max(...rows.map(row => row.length)) : 6))
  const height = Math.max(1, Math.min(12, rows.length > 0 ? rows.length : 6))
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

/**
 * Add (+1) or remove (−1) a row/column on one side of the board, shifting the
 * existing content so nothing else moves relative to the other three edges.
 */
export function resizeCreatorEdge({ cells, goalTargets, width, height, side, delta }) {
  const isRow = side === 'top' || side === 'bottom'
  const nextWidth = Math.max(1, Math.min(12, width + (isRow ? 0 : delta)))
  const nextHeight = Math.max(1, Math.min(12, height + (isRow ? delta : 0)))
  const dx = side === 'left' ? nextWidth - width : 0
  const dy = side === 'top' ? nextHeight - height : 0

  const nextCells = new Map()
  const nextGoalTargets = {}
  for (let row = 0; row < nextHeight; row += 1) {
    for (let col = 0; col < nextWidth; col += 1) {
      const sourceKey = posKey(col - dx, row - dy)
      const source = cells.get(sourceKey)
      const key = posKey(col, row)
      nextCells.set(key, source ? { ...source } : { isVoid: false, isGoal: false, pieceChar: null })
      if (source?.isGoal && goalTargets[sourceKey]) nextGoalTargets[key] = goalTargets[sourceKey]
    }
  }

  return { cells: nextCells, goalTargets: nextGoalTargets, width: nextWidth, height: nextHeight }
}

/** True when applying the current tool to this cell would change nothing. */
export function cellMatchesTool({ cell, goalTarget, editMode, placementMode, pieceType }) {
  if (!cell) return false
  if (editMode === 'void') return cell.isVoid === true
  if (editMode === 'empty') return !cell.isVoid && !cell.isGoal && !cell.pieceChar
  if (editMode !== 'place') return false
  const char = charForPlacement(placementMode, pieceType)
  if (!char) return false
  if (placementMode === 'red-target') return cell.isGoal === true && goalTarget === char
  return !cell.isVoid && !cell.isGoal && cell.pieceChar === char
}

/** Convert an engine board Map into creator display cells (for test play and replay). */
export function boardToCreatorCells(board, width, height) {
  const cells = new Map()
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const key = posKey(col, row)
      const cell = board.get(key)
      if (!cell) {
        cells.set(key, { isVoid: true, isGoal: false, pieceChar: null })
        continue
      }
      const pieceChar = cell.piece
        ? (cell.piece.color === 'white' ? cell.piece.type.toUpperCase() : cell.piece.type)
        : null
      cells.set(key, { isVoid: false, isGoal: cell.isGoal === true, pieceChar })
    }
  }
  return cells
}

function jsString(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`
}

/** Format a raw puzzle as an object literal in the style of catalogue.js. */
export function toCatalogueSnippet(raw) {
  const lines = ['  {', '    schemaVersion: 1,', `    id: ${jsString(raw.id)},`, `    title: ${jsString(raw.title)},`]
  if (raw.descriptionHtml) lines.push(`    descriptionHtml: ${jsString(raw.descriptionHtml)},`)
  lines.push(`    goalType: ${jsString(raw.goalType)},`)
  if (raw.targetColor) lines.push(`    targetColor: ${jsString(raw.targetColor)},`)
  lines.push('    grid: [', ...raw.grid.map(row => `      ${jsString(row)},`), '    ],')
  if (raw.goalTargets && Object.keys(raw.goalTargets).length > 0) {
    lines.push(
      '    goalTargets: {',
      ...Object.entries(raw.goalTargets).map(([key, char]) => `      ${jsString(key)}: ${jsString(char)},`),
      '    },',
    )
  }
  if (raw.promote) lines.push('    promote: true,')
  lines.push('  },')
  return `${lines.join('\n')}\n`
}

/** Suggest a track from par and solver search size (same scale used to sort the catalogue). */
export function suggestTrack({ par, statesExplored }) {
  const weight = par * Math.log10(statesExplored + 10)
  if (weight < 12) return 'Tutorial'
  if (weight < 30) return 'Warm-up'
  if (weight < 60) return 'Tricky'
  return 'Fiendish'
}

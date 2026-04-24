import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./store/store.js', () => ({
  loadStore: vi.fn(() => ({ schemaVersion: 1, solvedIds: [], activeState: null })),
  saveProgress: vi.fn(),
  saveActiveState: vi.fn(),
  clearActiveState: vi.fn(),
  flushSync: vi.fn(),
}))

import { createGameUiController } from './main.js'

function byKey(model) {
  return new Map(model.cells.map(cell => [cell.key, cell]))
}


describe('main UI interaction flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initial render has no selected or legal interaction frame by default', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })
    const model = ui.getRenderModel()

    const highlighted = model.cells.filter(cell =>
      cell.interactionClasses.includes('is-selected') ||
      cell.interactionClasses.includes('is-legal') ||
      cell.interactionClasses.includes('is-illegal-feedback')
    )

    expect(highlighted).toHaveLength(0)
    expect(ui.getState().selectedKey).toBeNull()
  })

  it('tapping an empty square without a selected piece does not show selection feedback', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })

    ui.tapCell('2,2')
    const model = ui.getRenderModel()
    const cells = byKey(model)

    expect(cells.get('2,2').interactionClasses).not.toContain('is-selected')
    expect(cells.get('2,2').interactionClasses).not.toContain('is-illegal-feedback')
    expect(ui.getState().selectedKey).toBeNull()
  })

  it('selecting a white piece marks legal destination cells (INT-01)', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })

    ui.tapCell('0,0')
    const model = ui.getRenderModel()
    const cells = byKey(model)

    expect(cells.get('0,0').interactionClasses).toContain('is-selected')
    expect(cells.get('1,0').interactionClasses).toContain('is-legal')
    expect(cells.get('2,0').interactionClasses).toContain('is-legal')
    expect(cells.get('0,1').interactionClasses).toContain('is-legal')
    expect(cells.get('0,2').interactionClasses).toContain('is-legal')
  })

  it('tapping a legal destination performs move and clears selection/highlights (INT-02)', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })

    ui.tapCell('0,0')
    ui.tapCell('0,2')

    const model = ui.getRenderModel()
    const cells = byKey(model)
    const selectedOrLegal = model.cells.filter(cell =>
      cell.interactionClasses.includes('is-selected') ||
      cell.interactionClasses.includes('is-legal')
    )

    expect(cells.get('0,0').piece).toBeNull()
    expect(cells.get('0,2').piece).toMatchObject({ type: 'r', color: 'white' })
    expect(selectedOrLegal).toHaveLength(0)
    expect(model.animationMs).toBeGreaterThanOrEqual(150)
    expect(model.animationMs).toBeLessThanOrEqual(200)
    expect(model.animationMs).toBe(180)
    expect(ui.getState().selectedKey).toBeNull()
  })

  it('illegal destination tap applies temporary feedback and does not mutate board state (INT-02)', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })

    ui.tapCell('0,0')
    const before = Array.from(ui.getState().board.entries())

    ui.tapCell('2,2')

    const model = ui.getRenderModel()
    const cells = byKey(model)
    const after = Array.from(ui.getState().board.entries())

    expect(cells.get('2,2').interactionClasses).toContain('is-illegal-feedback')
    expect(after).toEqual(before)
  })

  it('winning move shows visible win marker immediately (INT-02)', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })

    ui.tapCell('0,0')
    ui.tapCell('0,2')
    ui.tapCell('0,2')
    ui.tapCell('2,2')

    const model = ui.getRenderModel()

    expect(model.boardClasses).toContain('is-won')
    expect(ui.getState().won).toBe(true)
  })

  it('restart resets board state and clears win/selection feedback', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })

    ui.tapCell('0,0')
    ui.tapCell('0,2')
    ui.tapCell('0,2')
    ui.tapCell('2,2')
    expect(ui.getState().won).toBe(true)

    ui.restart()

    const model = ui.getRenderModel()
    const cells = byKey(model)
    expect(cells.get('0,0').piece).toMatchObject({ type: 'r', color: 'white' })
    expect(cells.get('2,2').piece).toBeNull()
    expect(model.boardClasses).not.toContain('is-won')
    expect(ui.getState().selectedKey).toBeNull()
    expect(ui.getLastMoveResult()).toBeNull()
  })

  it('reach puzzles expose a goal ghost for the required target piece before completion', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })
    const model = ui.getRenderModel()
    const cells = byKey(model)

    expect(cells.get('2,2').goalGhost).toMatchObject({ type: 'r', color: 'white' })

    ui.tapCell('0,0')
    ui.tapCell('0,2')
    ui.tapCell('0,2')
    ui.tapCell('2,2')

    const solvedModel = ui.getRenderModel()
    const solvedCells = byKey(solvedModel)
    expect(solvedCells.get('2,2').piece).toMatchObject({ type: 'r', color: 'white' })
    expect(solvedCells.get('2,2').goalGhost).toBeNull()
  })
})


describe('tracking runtime and UI contracts', () => {
  it('undo/redo actions keep move counter synchronized across move, undo, redo, and restart', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })

    expect(ui.getRenderModel().moveCount).toBe(0)

    ui.tapCell('0,0')
    ui.tapCell('0,2')
    expect(ui.getRenderModel().moveCount).toBe(1)

    ui.undo()
    expect(ui.getRenderModel().moveCount).toBe(0)

    ui.redo()
    expect(ui.getRenderModel().moveCount).toBe(1)

    ui.restart()
    expect(ui.getRenderModel().moveCount).toBe(0)
  })

  it('divergent move after undo invalidates redo availability immediately', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })

    ui.tapCell('0,0')
    ui.tapCell('0,2')
    ui.undo()
    expect(ui.getRenderModel().canRedo).toBe(true)

    ui.tapCell('0,0')
    ui.tapCell('1,0')

    expect(ui.getRenderModel().canRedo).toBe(false)
  })

  it('runtime state exposes chronological move history data while list rendering remains deferred', () => {
    const ui = createGameUiController({ puzzleId: 'find-the-squ' })

    ui.tapCell('0,0')
    ui.tapCell('0,2')

    const runtime = ui.getState()
    expect(runtime.moveEvents).toHaveLength(1)
    expect(runtime.moveEvents[0]).toMatchObject({ from: '0,0', to: '0,2' })
    expect(runtime.historyListRendered).toBe(false)
  })

  it('capture and reach puzzle objectives stay behaviorally distinct in UI controller flow', () => {
    const captureUi = createGameUiController({ puzzleId: 'knight-leap' })
    captureUi.tapCell('0,0')
    captureUi.tapCell('1,2')
    expect(captureUi.getState().won).toBe(true)

    const reachUi = createGameUiController({ puzzleId: 'find-the-squ' })
    reachUi.tapCell('0,0')
    reachUi.tapCell('0,2')
    reachUi.tapCell('0,2')
    reachUi.tapCell('2,2')
    expect(reachUi.getState().won).toBe(true)
  })

  it('reach-mode dual-control puzzle still blocks captures through UI legality gates', () => {
    const ui = createGameUiController({ puzzleId: 'knight-relay' })

    ui.tapCell('0,0')
    const pre = ui.getRenderModel()
    const preMap = byKey(pre)
    expect(preMap.get('2,1').interactionClasses).not.toContain('is-legal')
  })
})

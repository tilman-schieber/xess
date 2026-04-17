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

  it('selecting a white piece marks legal destination cells (INT-01)', () => {
    const ui = createGameUiController({ puzzleId: 'gt7wz4r1' })

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
    const ui = createGameUiController({ puzzleId: 'gt7wz4r1' })

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
    expect(ui.getState().selectedKey).toBeNull()
  })

  it('illegal destination tap applies temporary feedback and does not mutate board state (INT-02)', () => {
    const ui = createGameUiController({ puzzleId: 'gt7wz4r1' })

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
    const ui = createGameUiController({ puzzleId: 'gt7wz4r1' })

    ui.tapCell('0,0')
    ui.tapCell('0,2')
    ui.tapCell('0,2')
    ui.tapCell('2,2')

    const model = ui.getRenderModel()

    expect(model.boardClasses).toContain('is-won')
    expect(ui.getState().won).toBe(true)
  })
})

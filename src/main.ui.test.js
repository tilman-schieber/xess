import { beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

function getCssFile(relativePath) {
  const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), relativePath)
  return {
    filePath,
    exists: existsSync(filePath),
    content: existsSync(filePath) ? readFileSync(filePath, 'utf8') : '',
  }
}

function expectTouchTargetContract(cssContent, selector) {
  const selectorRegex = new RegExp(`${selector}[^\\{]*\\{[^}]*`, 's')
  const blockMatch = cssContent.match(selectorRegex)
  expect(blockMatch, `Missing CSS block for ${selector}`).not.toBeNull()
  const block = blockMatch?.[0] ?? ''
  expect(block).toMatch(/min-inline-size:\s*(var\(--touch-target-min(?:,\s*44px)?\)|44px)/)
  expect(block).toMatch(/min-block-size:\s*(var\(--touch-target-min(?:,\s*44px)?\)|44px)/)
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
    expect(model.animationMs).toBeGreaterThanOrEqual(150)
    expect(model.animationMs).toBeLessThanOrEqual(200)
    expect(model.animationMs).toBe(180)
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

  it('restart resets board state and clears win/selection feedback', () => {
    const ui = createGameUiController({ puzzleId: 'gt7wz4r1' })

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
    const ui = createGameUiController({ puzzleId: 'gt7wz4r1' })
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

describe('responsive layout and touch target contracts', () => {
  it('375px viewport contract keeps board shell and controls visible (VIS-02)', () => {
    const appCss = getCssFile('./styles/app.css')
    const boardCss = getCssFile('./styles/board.css')

    expect(appCss.exists).toBe(true)
    expect(boardCss.exists).toBe(true)

    expect(appCss.content).toMatch(/\.xess-ui/)
    expect(appCss.content).toMatch(/max-width:\s*375px|inline-size:\s*min\(100vw,\s*375px\)/)
    expect(appCss.content).toMatch(/@media\s*\(min-width:\s*768px\)/)
  })

  it('board cell and piece targets enforce >=44px minimum touch size (RND-03)', () => {
    const boardCss = getCssFile('./styles/board.css')
    expect(boardCss.exists).toBe(true)

    expect(boardCss.content).toMatch(/min-(width|inline-size):\s*44px/)
    expect(boardCss.content).toMatch(/min-(height|block-size):\s*44px/)
    expect(boardCss.content).toMatch(/\.cell/)
    expect(boardCss.content).toMatch(/\.piece/)
  })

  it('launch-critical controls keep tokenized min-size touch target coverage (UXP-01)', () => {
    const appCss = getCssFile('./styles/app.css')
    const startCss = getCssFile('./styles/start-screen.css')
    const trackCss = getCssFile('./styles/track-browser.css')

    expect(appCss.exists).toBe(true)
    expect(startCss.exists).toBe(true)
    expect(trackCss.exists).toBe(true)

    expect(appCss.content).toMatch(/--touch-target-min:\s*44px/)

    expectTouchTargetContract(appCss.content, '\\.nav-btn')
    expectTouchTargetContract(appCss.content, '\\.btn-next-puzzle')
    expectTouchTargetContract(appCss.content, '\\.sound-toggle')

    expectTouchTargetContract(startCss.content, '\\.start-screen-primary')
    expectTouchTargetContract(startCss.content, '\\.start-screen-secondary')

    expectTouchTargetContract(trackCss.content, '\\.track-browser-back')
    expectTouchTargetContract(trackCss.content, '\\.track-action-open')
    expectTouchTargetContract(trackCss.content, '\\.track-action-resume')
    expectTouchTargetContract(trackCss.content, '\\.track-puzzle-item')
  })
})

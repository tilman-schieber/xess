import { describe, expect, it, vi } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

vi.mock('./store/store.js', () => ({
  loadStore: vi.fn(() => ({ schemaVersion: 1, solvedIds: [], activeState: null })),
  saveProgress: vi.fn(),
  saveActiveState: vi.fn(),
  clearActiveState: vi.fn(),
  flushSync: vi.fn(),
}))

import { createGameUiController, renderToDom } from './main.js'

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

describe('gap UX regressions: objective context + static square geometry', () => {
  it('render model includes puzzle title and human-readable objective copy', () => {
    const ui = createGameUiController({ puzzleId: 'gt7wz4r1' })
    const model = ui.getRenderModel()

    expect(model.puzzleTitle).toBe('Find the Square')
    expect(model.objectiveText).toBe('Move all white pieces onto goal squares.')

    const captureUi = createGameUiController({ puzzleId: 'xk3m9pq2' })
    const captureModel = captureUi.getRenderModel()
    expect(captureModel.puzzleTitle).toBe('Corner Trap')
    expect(captureModel.objectiveText).toBe('Capture all black targets.')

    const mainSource = getCssFile('./main.js')
    expect(mainSource.exists).toBe(true)
    expect(mainSource.content).toMatch(/data-puzzle-title/)
    expect(mainSource.content).toMatch(/data-puzzle-objective/)
    expect(mainSource.content).toMatch(/objective\.textContent\s*=\s*model\.objectiveText/)
  })

  it('board css enforces static square geometry for empty and occupied playable cells', () => {
    const boardCss = getCssFile('./styles/board.css')
    expect(boardCss.exists).toBe(true)

    expect(boardCss.content).toMatch(/grid-template-rows:\s*repeat\(var\(--rows\),\s*1fr\)/)
    expect(boardCss.content).toMatch(/\.cell\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/s)
    expect(boardCss.content).toMatch(/\.cell\s*\{[^}]*inline-size:\s*100%/s)
    expect(boardCss.content).toMatch(/\.cell\s*\{[^}]*block-size:\s*100%/s)
  })

  it('move, illegal, and win interaction classes remain intact with objective-aware UI', () => {
    const ui = createGameUiController({ puzzleId: 'gt7wz4r1' })

    ui.tapCell('0,0')
    let model = ui.getRenderModel()
    let cells = byKey(model)
    expect(cells.get('0,0').interactionClasses).toContain('is-selected')
    expect(cells.get('0,2').interactionClasses).toContain('is-legal')

    ui.tapCell('2,2')
    model = ui.getRenderModel()
    cells = byKey(model)
    expect(cells.get('2,2').interactionClasses).toContain('is-illegal-feedback')

    ui.tapCell('0,2')
    ui.tapCell('0,2')
    ui.tapCell('2,2')
    model = ui.getRenderModel()
    expect(model.boardClasses).toContain('is-won')
  })

  it('renders puzzle description block near objective for authored rich text', () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>')
    globalThis.document = dom.window.document

    const model = {
      puzzle: { goalType: 'capture-all-targets', targetColor: 'black', descriptionHtml: '<p><em>Pin first.</em></p>' },
      puzzleTitle: 'With Description',
      objectiveText: 'Capture all black targets.',
      boardClasses: [],
      animationMs: 180,
      cells: [{ key: '0,0', classes: ['cell'], interactionClasses: [], pieceClasses: [], piece: null }],
      width: 1,
      height: 1,
      puzzleId: 'xk3m9pq2',
      prevId: null,
      nextId: null,
    }

    const root = dom.window.document.querySelector('#root')
    renderToDom(root, model)

    const objective = root.querySelector('[data-puzzle-objective]')
    const description = root.querySelector('[data-puzzle-description]')

    expect(objective).not.toBeNull()
    expect(description).not.toBeNull()
    expect(description?.querySelector('em')?.textContent).toBe('Pin first.')
  })

  it('suppresses description block when content is empty', () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>')
    globalThis.document = dom.window.document

    const model = {
      puzzle: { goalType: 'capture-all-targets', targetColor: 'black', descriptionHtml: '' },
      puzzleTitle: 'No Description',
      objectiveText: 'Capture all black targets.',
      boardClasses: [],
      animationMs: 180,
      cells: [{ key: '0,0', classes: ['cell'], interactionClasses: [], pieceClasses: [], piece: null }],
      width: 1,
      height: 1,
      puzzleId: 'xk3m9pq2',
      prevId: null,
      nextId: null,
    }

    const root = dom.window.document.querySelector('#root')
    renderToDom(root, model)

    expect(root.querySelector('[data-puzzle-description]')).toBeNull()
  })
})

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

describe('gap UX regressions: objective context + static square geometry', () => {
  it('render model includes puzzle title and human-readable objective copy', () => {
    const ui = createGameUiController({ puzzleId: 'gt7wz4r1' })
    const model = ui.getRenderModel()

    expect(model.puzzleTitle).toBe('Find the Square')
    expect(model.objectiveText).toBe('The red pieces have to reach their goal squares.')

    const captureUi = createGameUiController({ puzzleId: 'xk3m9pq2' })
    const captureModel = captureUi.getRenderModel()
    expect(captureModel.puzzleTitle).toBe('Corner Trap')
    expect(captureModel.objectiveText).toBe('Capture all black targets.')

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
    globalThis.window = dom.window

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
    globalThis.window = dom.window

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

  it('renders allowlisted formatting while stripping unsafe rich-text content', () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>')
    globalThis.document = dom.window.document
    globalThis.window = dom.window

    const model = {
      puzzle: {
        goalType: 'capture-all-targets',
        targetColor: 'black',
        descriptionHtml: '<p><em>Safe</em> <strong>hint</strong><br></p><ul><li>Line</li></ul><a href="javascript:alert(1)" onclick="evil()">link</a><script>alert(1)</script>',
      },
      puzzleTitle: 'Unsafe Description',
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

    const description = root.querySelector('[data-puzzle-description]')
    expect(description).not.toBeNull()
    expect(description?.querySelector('p')).not.toBeNull()
    expect(description?.querySelector('em')?.textContent).toBe('Safe')
    expect(description?.querySelector('strong')?.textContent).toBe('hint')
    expect(description?.querySelectorAll('ul li')).toHaveLength(1)

    const link = description?.querySelector('a')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('onclick')).toBeNull()
    expect(link?.getAttribute('href')).toBeNull()
    expect(description?.querySelector('script')).toBeNull()
  })

  it('renders solved-with-next banner as explicit multi-line state with headline and action rows', () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>')
    globalThis.document = dom.window.document
    globalThis.window = dom.window

    const model = {
      puzzle: { goalType: 'reach-all-goal-squares', targetColor: 'black', descriptionHtml: '' },
      puzzleTitle: 'Solved Puzzle',
      objectiveText: 'The red pieces have to reach their goal squares.',
      boardClasses: ['is-won'],
      animationMs: 180,
      cells: [{ key: '0,0', classes: ['cell'], interactionClasses: [], pieceClasses: [], piece: null }],
      width: 1,
      height: 1,
      puzzleId: 'gt7wz4r1',
      prevId: null,
      nextId: 'xk3m9pq2',
    }

    const root = dom.window.document.querySelector('#root')
    renderToDom(root, model)

    const winBanner = root.querySelector('[data-win-banner]')
    expect(winBanner).not.toBeNull()
    expect(winBanner?.getAttribute('data-win-state')).toBe('puzzle-solved')
    const solvedState = winBanner?.querySelector('.win-banner-state--puzzle-solved')
    expect(solvedState).not.toBeNull()
    expect(winBanner?.querySelector('[data-win-headline]')?.textContent).toBe('Puzzle solved!')
    expect(winBanner?.querySelector('[data-win-action] [data-win-next-puzzle]')?.textContent).toBe('Next Puzzle')

  })

  it('renders terminal solved banner as distinct all-solved state block', () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>')
    globalThis.document = dom.window.document
    globalThis.window = dom.window

    const model = {
      puzzle: { goalType: 'capture-all-targets', targetColor: 'black', descriptionHtml: '' },
      puzzleTitle: 'Final Puzzle',
      objectiveText: 'Capture all black targets.',
      boardClasses: ['is-won'],
      animationMs: 180,
      cells: [{ key: '0,0', classes: ['cell'], interactionClasses: [], pieceClasses: [], piece: null }],
      width: 1,
      height: 1,
      puzzleId: 'xk3m9pq2',
      prevId: 'gt7wz4r1',
      nextId: null,
    }

    const root = dom.window.document.querySelector('#root')
    renderToDom(root, model)

    const winBanner = root.querySelector('[data-win-banner]')
    expect(winBanner).not.toBeNull()
    expect(winBanner?.getAttribute('data-win-state')).toBe('all-solved')
    expect(winBanner?.querySelector('.win-banner-state--all-solved')).not.toBeNull()
    expect(winBanner?.querySelector('[data-win-all-solved]')).not.toBeNull()
    expect(winBanner?.querySelector('[data-win-next-puzzle]')).toBeNull()
    expect(winBanner?.querySelector('[data-win-headline]')?.textContent).toMatch(/All .* puzzles solved! 🎉|All puzzles solved! 🎉/)
  })

  it('renders board with explicit mode metadata hooks for reach and capture puzzles', () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>')
    globalThis.document = dom.window.document
    globalThis.window = dom.window
    globalThis.DOMParser = dom.window.DOMParser

    const reachUi = createGameUiController({ puzzleId: 'b4c5d6e7' })
    const reachRoot = dom.window.document.querySelector('#root')
    renderToDom(reachRoot, { ...reachUi.getRenderModel(), puzzleId: 'b4c5d6e7', prevId: null, nextId: null })

    const reachBoard = reachRoot.querySelector('[data-board]')
    expect(reachBoard?.getAttribute('data-goal-type')).toBe('reach-all-goal-squares')
    expect(reachBoard?.getAttribute('data-board-mode')).toBe('reach')
    expect(reachBoard?.className).toContain('board--mode-reach')

    const captureUi = createGameUiController({ puzzleId: 'xk3m9pq2' })
    renderToDom(reachRoot, { ...captureUi.getRenderModel(), puzzleId: 'xk3m9pq2', prevId: null, nextId: null })
    const captureBoard = reachRoot.querySelector('[data-board]')
    expect(captureBoard?.getAttribute('data-goal-type')).toBe('capture-all-targets')
    expect(captureBoard?.getAttribute('data-board-mode')).toBe('capture')
    expect(captureBoard?.className).toContain('board--mode-capture')
  })

  it('styles reach-mode opponents via red SVG assets', () => {
    // Verify red piece asset files exist on disk for all piece types
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    for (const type of ['k', 'q', 'r', 'b', 'n', 'p']) {
      const redPath = path.resolve(__dirname, `ui/piece-assets/red-${type}.svg`)
      expect(existsSync(redPath), `red-${type}.svg missing`).toBe(true)
      const content = readFileSync(redPath, 'utf8')
      expect(content).toContain('<svg')
      expect(content).toContain('#cc3333')
    }
  })
})

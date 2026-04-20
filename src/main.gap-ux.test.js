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

  it('has compact mobile-friendly puzzle-description typography styles', () => {
    const appCss = getCssFile('./styles/app.css')
    expect(appCss.exists).toBe(true)
    expect(appCss.content).toMatch(/\.puzzle-description\s*\{[\s\S]*font-size:\s*var\(--text-label\)/)
    expect(appCss.content).toMatch(/\.puzzle-description\s+p\s*\{[\s\S]*margin:\s*0/)
    expect(appCss.content).toMatch(/\.puzzle-description\s+ul\s*,\s*\.puzzle-description\s+ol\s*\{[\s\S]*padding-inline-start:/)
    expect(appCss.content).toMatch(/\.puzzle-description\s+a\s*\{[\s\S]*text-decoration:/)
  })

  it('renders solved-with-next banner as explicit multi-line state with headline and action rows', () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>')
    globalThis.document = dom.window.document
    globalThis.window = dom.window

    const model = {
      puzzle: { goalType: 'reach-all-goal-squares', targetColor: 'black', descriptionHtml: '' },
      puzzleTitle: 'Solved Puzzle',
      objectiveText: 'Move all white pieces onto goal squares.',
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

    const appCss = getCssFile('./styles/app.css')
    expect(appCss.content).toMatch(/\.win-banner\.is-won\s*\{[\s\S]*display:\s*(grid|flex)/)
    expect(appCss.content).toMatch(/\.win-banner\s*\{[\s\S]*gap:/)
    expect(appCss.content).toMatch(/\.win-banner-state\s*\{[\s\S]*display:\s*grid/)
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

  it('suppresses root tap handling for pointer sequences already consumed by drag drop', () => {
    const mainSource = getCssFile('./main.js')
    expect(mainSource.exists).toBe(true)

    expect(mainSource.content).toMatch(/let\s+_suppressTapPointerId\s*=\s*null/)
    expect(mainSource.content).toMatch(/if\s*\(_suppressTapPointerId\s*===\s*event\.pointerId\)\s*\{[\s\S]*return/s)
    expect(mainSource.content).toMatch(/onDrop\([^)]*pointerId[^)]*\)[\s\S]*_suppressTapPointerId\s*=\s*pointerId/s)
    expect(mainSource.content).toMatch(/onCancel\([^)]*pointerId[^)]*\)[\s\S]*_suppressTapPointerId\s*=\s*pointerId/s)
  })

  it('uses pointer-first sound toggle handlers while keeping keyboard activation support', () => {
    const mainSource = getCssFile('./main.js')
    expect(mainSource.exists).toBe(true)

    expect(mainSource.content).toMatch(/sound-toggle/)
    expect(mainSource.content).toMatch(/addEventListener\('pointer(?:down|up)'/)
    expect(mainSource.content).toMatch(/addEventListener\('keydown'/)
    expect(mainSource.content).toMatch(/event\.key\s*===\s*'Enter'\s*\|\|\s*event\.key\s*===\s*' '/)
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

  it('styles reach-mode opponents via red SVG assets while leaving ghost styling neutral', () => {
    const boardCss = getCssFile('./styles/board.css')
    expect(boardCss.exists).toBe(true)

    // Red opponent coloring is now achieved via dedicated red-*.svg assets in the
    // boardRenderer (not via CSS filter), so the old board-scoped CSS selector is gone.
    // Verify ghost neutrality is still enforced by CSS.
    expect(boardCss.content).toMatch(/\.piece--ghost\s*\{[\s\S]*saturate\(0\.35\)/s)

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

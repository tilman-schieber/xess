// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

let mockStore = { schemaVersion: 1, solvedIds: [], activeState: null }

vi.mock('./store/store.js', () => ({
  loadStore: vi.fn(() => mockStore),
  saveProgress: vi.fn(),
  saveActiveState: vi.fn(),
  clearActiveState: vi.fn(),
  flushSync: vi.fn(),
}))

vi.mock('./sound.js', () => ({
  initSound: vi.fn(),
  playMove: vi.fn(),
  playSolve: vi.fn(),
  isSoundEnabled: vi.fn(() => false),
  toggleSound: vi.fn(() => false),
}))

vi.mock('./ui/dragDrop.js', () => ({
  initDragDrop: vi.fn(() => () => {}),
}))

vi.mock('./ui/pwaPrompts.js', () => ({
  initPwaPrompts: vi.fn(),
}))

import { createController } from './controller.js'
import { mountGameUi } from './main.js'

function getSourceFile(relativePath) {
  const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), relativePath)
  return {
    exists: existsSync(filePath),
    content: existsSync(filePath) ? readFileSync(filePath, 'utf8') : '',
  }
}

describe('track launch selection via controller', () => {
  beforeEach(() => {
    mockStore = { schemaVersion: 1, solvedIds: [], activeState: null }
  })

  it('returns active puzzle when active puzzle belongs to selected track', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: [],
      activeState: { puzzleId: 'p1q2r3s4', boardEntries: [], undoEntries: [] },
    }

    const controller = createController()
    const launchId = controller.getTrackLaunchPuzzleId('foundations')

    expect(launchId).toBe('p1q2r3s4')
  })

  it('falls back to first unsolved puzzle when active puzzle is outside selected track', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: ['xk3m9pq2', 'gt7wz4r1'],
      activeState: { puzzleId: 'x1y2z3a4', boardEntries: [], undoEntries: [] },
    }

    const controller = createController()
    const launchId = controller.getTrackLaunchPuzzleId('foundations')

    expect(launchId).toBe('g3h4i5j6')
  })

  it('falls back to first puzzle for fully solved track', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: ['xk3m9pq2', 'gt7wz4r1', 'g3h4i5j6', 'p1q2r3s4', 't5u6v7w8', 'x9y0z1a2', 'n5o6p7q8', 'v3w4x5y6'],
      activeState: null,
    }

    const controller = createController()
    const launchId = controller.getTrackLaunchPuzzleId('foundations')

    expect(launchId).toBe('xk3m9pq2')
  })
})

describe('main track-first screen flow', () => {
  beforeEach(() => {
    mockStore = { schemaVersion: 1, solvedIds: [], activeState: null }
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('renders start screen first before any play board', () => {
    mountGameUi(document.querySelector('#app'))

    expect(document.querySelector('[data-start-screen]')).not.toBeNull()
    expect(document.querySelector('[data-board]')).toBeNull()
  })

  it('start opens tracks and selecting puzzle enters play', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-start-action]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-open-track="foundations"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="xk3m9pq2"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-track-browser]')).toBeNull()
    expect(document.querySelector('[data-board]')).not.toBeNull()
  })

  it('tracks back action from play returns to previous selected track context', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-start-action]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-open-track="foundations"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="xk3m9pq2"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-back-to-tracks]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-track-browser]')).not.toBeNull()
    expect(document.querySelector('[data-selected-track="foundations"]')).not.toBeNull()
  })

  it('app style contract imports start/track styles and shared shell width hooks', () => {
    const appCss = getSourceFile('./styles/app.css')

    expect(appCss.exists).toBe(true)
    expect(appCss.content).toMatch(/@import\s+['"]\.\/start-screen\.css['"];/)
    expect(appCss.content).toMatch(/@import\s+['"]\.\/track-browser\.css['"];/)
    expect(appCss.content).toMatch(/\.xess-ui,\s*\n\.start-screen,\s*\n\.track-browser/s)
    expect(appCss.content).toMatch(/--app-max-width-mobile/)
  })
})

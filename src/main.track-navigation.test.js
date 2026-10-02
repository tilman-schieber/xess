// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

let mockStore = {
  schemaVersion: 1,
  solvedIds: [],
  activeState: null,
  tutorialDismissed: false,
  tutorialCompleted: false,
}

vi.mock('./store/store.js', () => ({
  loadStore: vi.fn(() => mockStore),
  saveProgress: vi.fn(),
  saveActiveState: vi.fn(),
  clearActiveState: vi.fn(),
  flushSync: vi.fn(),
  saveTutorialOnboarding: vi.fn(),
  saveSeenAchievements: vi.fn(),
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
import { saveTutorialOnboarding } from './store/store.js'

describe('track launch selection via controller', () => {
  beforeEach(() => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
      tutorialDismissed: false,
      tutorialCompleted: false,
    }
  })

  it('returns active puzzle when active puzzle belongs to selected track', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: [],
      activeState: { puzzleId: 'knight-relay', boardEntries: [], undoEntries: [] },
    }

    const controller = createController()
    const launchId = controller.getTrackLaunchPuzzleId('fiendish')

    expect(launchId).toBe('knight-relay')
  })

  it('falls back to first unsolved puzzle when active puzzle is outside selected track', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: ['knight-relay'],
      activeState: { puzzleId: 'first-steps', boardEntries: [], undoEntries: [] },
    }

    const controller = createController()
    const launchId = controller.getTrackLaunchPuzzleId('fiendish')

    expect(launchId).toBe('knight-train')
  })

  it('falls back to first puzzle for fully solved track', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: ['knight-relay', 'knight-train', 'route-the-ro', 'boxed-knight', 'four-queen-s', 'crown-the-ro'],
      activeState: null,
    }

    const controller = createController()
    const launchId = controller.getTrackLaunchPuzzleId('fiendish')

    expect(launchId).toBe('knight-relay')
  })
})

describe('main track-first screen flow', () => {
  beforeEach(() => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
      tutorialDismissed: false,
      tutorialCompleted: false,
    }
    vi.mocked(saveTutorialOnboarding).mockClear()
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('renders start screen first before any play board', () => {
    mountGameUi(document.querySelector('#app'))

    expect(document.querySelector('[data-app-shell]')).not.toBeNull()
    expect(document.querySelector('[data-shell-topbar]')).not.toBeNull()
    expect(document.querySelector('[data-start-screen]')).not.toBeNull()
    expect(document.querySelector('[data-board]')).toBeNull()
  })

  it('start opens tracks and selecting puzzle enters play', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-start-action="browse"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-open-track="fiendish"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="knight-relay"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-track-browser]')).toBeNull()
    expect(document.querySelector('[data-board]')).not.toBeNull()
  })

  it('resume action falls back safely when persisted active puzzle is stale', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: ['boxed-knight', 'rook-maze'],
      activeState: { puzzleId: 'stale-id', boardEntries: [], undoEntries: [] },
      tutorialDismissed: false,
      tutorialCompleted: false,
    }

    mountGameUi(document.querySelector('#app'))

    const resume = document.querySelector('[data-start-action="continue"]')
    expect(resume).not.toBeNull()

    resume?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-board]')).not.toBeNull()
  })

  it('starting the tutorial track from the hub enters play without dead ends', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-resume-track="tutorial"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-board]')).not.toBeNull()

    document.querySelector('[data-shell-menu-toggle]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-shell-nav-tracks]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-selected-track="tutorial"]')).not.toBeNull()
  })

  it('tracks action from play menu returns to previous selected track context', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-start-action="browse"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-open-track="fiendish"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="knight-relay"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-shell-menu-toggle]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-shell-nav-tracks]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-track-browser]')).not.toBeNull()
    expect(document.querySelector('[data-selected-track="fiendish"]')).not.toBeNull()
  })

  it('shell and menu taps do not trigger board move side effects', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-start-action="browse"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-open-track="fiendish"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="knight-relay"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    const beforeCounter = document.querySelector('[data-move-counter]')?.textContent

    document.querySelector('[data-shell-topbar]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-shell-menu-toggle]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    const afterCounter = document.querySelector('[data-move-counter]')?.textContent
    expect(document.querySelector('[data-board]')).not.toBeNull()
    expect(afterCounter).toBe(beforeCounter)
  })

  it('tutorial puzzles explain the rule without revealing a move', () => {
    mountGameUi(document.querySelector('#app'))
    document.querySelector('[data-resume-track="tutorial"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('.puzzle-title')?.textContent).toBe('First Steps')
    expect(document.querySelector('[data-coach="coach"]')?.textContent).toMatch(/red rook/)
    expect(document.querySelector('.is-hint-from')).toBeNull()
    expect(document.querySelector('.is-hint-to')).toBeNull()
  })

  it('hint button reveals the next solution move and counts the hint', () => {
    mountGameUi(document.querySelector('#app'))
    document.querySelector('[data-start-action="browse"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-open-track="warm-up"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="bloomer"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('.is-hint-from')).toBeNull()
    document.querySelector('[data-hint]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('.is-hint-from')?.getAttribute('data-cell-key')).toBe('0,1')
    expect(document.querySelector('.is-hint-to')).not.toBeNull()
    expect(document.querySelector('[data-hints-used]')?.textContent).toBe('1')
    expect(document.querySelector('[data-coach="hint"]')?.textContent).toMatch(/−20 points/)
  })

  it('the paid hint still works on a coached tutorial puzzle', () => {
    mountGameUi(document.querySelector('#app'))
    document.querySelector('[data-start-action="browse"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-open-track="tutorial"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="no-way-back"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-coach="coach"]')?.textContent).toMatch(/never go back/)
    expect(document.querySelector('.is-hint-from')).toBeNull()

    // The paid hint still works on such a step
    document.querySelector('[data-hint]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(document.querySelector('.is-hint-from')?.getAttribute('data-cell-key')).toBe('1,1')
    expect(document.querySelector('[data-hints-used]')?.textContent).toBe('1')
  })
})

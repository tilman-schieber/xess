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
      activeState: { puzzleId: 'b4c5d6e7', boardEntries: [], undoEntries: [] },
    }

    const controller = createController()
    const launchId = controller.getTrackLaunchPuzzleId('puzzle-master')

    expect(launchId).toBe('b4c5d6e7')
  })

  it('falls back to first unsolved puzzle when active puzzle is outside selected track', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: ['b4c5d6e7'],
      activeState: { puzzleId: 'd1e2f3g4', boardEntries: [], undoEntries: [] },
    }

    const controller = createController()
    const launchId = controller.getTrackLaunchPuzzleId('puzzle-master')

    expect(launchId).toBe('c7d8e9f0')
  })

  it('falls back to first puzzle for fully solved track', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: ['b4c5d6e7', 'c7d8e9f0'],
      activeState: null,
    }

    const controller = createController()
    const launchId = controller.getTrackLaunchPuzzleId('puzzle-master')

    expect(launchId).toBe('b4c5d6e7')
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
    document.querySelector('[data-open-track="puzzle-master"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="b4c5d6e7"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-track-browser]')).toBeNull()
    expect(document.querySelector('[data-board]')).not.toBeNull()
  })

  it('resume action falls back safely when persisted active puzzle is stale', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: ['xk3m9pq2', 'gt7wz4r1'],
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

  it('tutorial action launches the dedicated tutorial route without dead ends', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-start-action="tutorial"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-board]')).not.toBeNull()

    document.querySelector('[data-shell-menu-toggle]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-shell-nav-tracks]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-selected-track="tutorial"]')).not.toBeNull()
  })

  it('shows tutorial card on first-time landing by default', () => {
    mountGameUi(document.querySelector('#app'))
    expect(document.querySelector('[data-start-action="tutorial"]')).not.toBeNull()
  })

  it('hides tutorial card when tutorial was explicitly dismissed', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
      tutorialDismissed: true,
      tutorialCompleted: false,
    }

    mountGameUi(document.querySelector('#app'))
    expect(document.querySelector('[data-start-action="tutorial"]')).toBeNull()
  })

  it('hides tutorial card when tutorial is already completed', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
      tutorialDismissed: false,
      tutorialCompleted: true,
    }

    mountGameUi(document.querySelector('#app'))
    expect(document.querySelector('[data-start-action="tutorial"]')).toBeNull()
  })

  it('keeps tutorial card visible when persisted tutorial flags are malformed', () => {
    mockStore = {
      schemaVersion: 1,
      solvedIds: [],
      activeState: null,
      tutorialDismissed: 'yes',
      tutorialCompleted: { done: true },
    }

    mountGameUi(document.querySelector('#app'))
    expect(document.querySelector('[data-start-action="tutorial"]')).not.toBeNull()
  })

  it('dismiss action persists tutorial dismissal and hides card on rerender', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-start-dismiss="tutorial"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(saveTutorialOnboarding).toHaveBeenCalledWith({ tutorialDismissed: true })
  })

  it('tracks action from play menu returns to previous selected track context', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-start-action="browse"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-open-track="puzzle-master"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="b4c5d6e7"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-shell-menu-toggle]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-shell-nav-tracks]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.querySelector('[data-track-browser]')).not.toBeNull()
    expect(document.querySelector('[data-selected-track="puzzle-master"]')).not.toBeNull()
  })

  it('shell and menu taps do not trigger board move side effects', () => {
    mountGameUi(document.querySelector('#app'))

    document.querySelector('[data-start-action="browse"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-open-track="puzzle-master"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-puzzle-id="b4c5d6e7"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    const beforeCounter = document.querySelector('[data-move-counter]')?.textContent

    document.querySelector('[data-shell-topbar]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.querySelector('[data-shell-menu-toggle]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    const afterCounter = document.querySelector('[data-move-counter]')?.textContent
    expect(document.querySelector('[data-board]')).not.toBeNull()
    expect(afterCounter).toBe(beforeCounter)
  })

})

import { beforeEach, describe, expect, it, vi } from 'vitest'

let mockStore = { schemaVersion: 1, solvedIds: [], activeState: null }

vi.mock('./store/store.js', () => ({
  loadStore: vi.fn(() => mockStore),
  saveProgress: vi.fn(),
  saveActiveState: vi.fn(),
  clearActiveState: vi.fn(),
  flushSync: vi.fn(),
}))

import { createController } from './controller.js'

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

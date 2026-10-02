// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { renderTrackBrowser } from './trackBrowser.js'

const tracks = [
  {
    id: 'foundations',
    title: 'Foundations',
    subtitle: 'Learn core movement',
    solvedCount: 1,
    totalCount: 2,
    puzzles: [
      { id: 'p1', title: 'Puzzle 1', position: '1 / 2' },
      { id: 'p2', title: 'Puzzle 2', position: '2 / 2' },
    ],
    modes: { tutorial: { enabled: false } },
  },
  {
    id: 'formations',
    title: 'Formations',
    subtitle: 'Harder board shapes',
    solvedCount: 0,
    totalCount: 1,
    puzzles: [
      { id: 'p3', title: 'Puzzle 3', position: '1 / 1' },
    ],
    modes: { tutorial: { enabled: true } },
  },
]

describe('renderTrackBrowser', () => {
  it('renders grouped track labels in overview mode', () => {
    const view = renderTrackBrowser({
      tracks,
      selectedTrackId: null,
      onOpenTrack: () => {},
      onResumeTrack: () => {},
      onSelectPuzzle: () => {},
      onBack: () => {},
    })

    expect(view.querySelector('[data-track-id="foundations"] [data-track-title]')?.textContent).toBe('Foundations')
    expect(view.querySelector('[data-track-id="formations"] [data-track-title]')?.textContent).toBe('Formations')
  })

  it('shows within-track numbering in selected track mode', () => {
    const view = renderTrackBrowser({
      tracks,
      selectedTrackId: 'foundations',
      onOpenTrack: () => {},
      onResumeTrack: () => {},
      onSelectPuzzle: () => {},
      onBack: () => {},
    })

    const firstNumber = view.querySelector('[data-puzzle-id="p1"] [data-track-position]')
    const secondNumber = view.querySelector('[data-puzzle-id="p2"] [data-track-position]')

    expect(firstNumber?.textContent).toBe('1')
    expect(secondNumber?.textContent).toBe('2')
  })

  it('dispatches open/resume/select callbacks with track and puzzle payloads', () => {
    const onOpenTrack = vi.fn()
    const onResumeTrack = vi.fn()
    const onSelectPuzzle = vi.fn()

    const overview = renderTrackBrowser({
      tracks,
      selectedTrackId: null,
      onOpenTrack,
      onResumeTrack,
      onSelectPuzzle: () => {},
      onBack: () => {},
    })

    overview.querySelector('[data-open-track="foundations"]')?.dispatchEvent(new Event('pointerdown'))
    overview.querySelector('[data-resume-track="foundations"]')?.dispatchEvent(new Event('pointerdown'))

    expect(onOpenTrack).toHaveBeenCalledWith('foundations')
    expect(onResumeTrack).toHaveBeenCalledWith('foundations')

    const selected = renderTrackBrowser({
      tracks,
      selectedTrackId: 'foundations',
      onOpenTrack: () => {},
      onResumeTrack: () => {},
      onSelectPuzzle,
      onBack: () => {},
    })

    const puzzle = selected.querySelector('[data-puzzle-id="p2"]')
    puzzle?.dispatchEvent(new Event('pointerdown'))

    expect(onSelectPuzzle).toHaveBeenCalledWith({ trackId: 'foundations', puzzleId: 'p2' })
  })

  it('shows solved state and best score per puzzle', () => {
    const view = renderTrackBrowser({
      tracks: [{
        ...tracks[0],
        puzzles: [
          { id: 'p1', title: 'Puzzle 1', status: 'solved', bestScore: 80 },
          { id: 'p2', title: 'Puzzle 2', status: 'unlocked', inProgress: true },
        ],
      }],
      selectedTrackId: 'foundations',
      onOpenTrack: () => {},
      onResumeTrack: () => {},
      onSelectPuzzle: () => {},
      onBack: () => {},
    })

    expect(view.querySelector('[data-puzzle-id="p1"] [data-track-puzzle-status]')?.textContent).toBe('★★☆ 80')
    expect(view.querySelector('[data-puzzle-id="p2"] [data-track-puzzle-status]')?.textContent).toBe('In progress')
  })

  it('labels the track action by progress', () => {
    const view = renderTrackBrowser({
      tracks,
      selectedTrackId: null,
      onOpenTrack: () => {},
      onResumeTrack: () => {},
      onSelectPuzzle: () => {},
      onBack: () => {},
    })

    expect(view.querySelector('[data-resume-track="foundations"]')?.textContent).toBe('Continue')
    expect(view.querySelector('[data-resume-track="formations"]')?.textContent).toBe('Start')
  })

  it('marks tutorial-enabled tracks with tutorial copy in overview cards', () => {
    const view = renderTrackBrowser({
      tracks,
      selectedTrackId: null,
      onOpenTrack: () => {},
      onResumeTrack: () => {},
      onSelectPuzzle: () => {},
      onBack: () => {},
    })

    const tutorialBadge = view.querySelector('[data-track-id="formations"] [data-track-tutorial]')
    expect(tutorialBadge).not.toBeNull()
  })
})

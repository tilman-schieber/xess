// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { renderStartScreen } from './startScreen.js'

describe('renderStartScreen', () => {
  it('renders Continue, Tutorial, and Browse cards in fixed order', () => {
    const view = renderStartScreen({
      chips: ['Track: Foundations', 'Solved 2/8'],
      onContinue: () => {},
      onTutorial: () => {},
      onBrowseTracks: () => {},
      onDismissTutorial: () => {},
    })

    const cards = Array.from(view.querySelectorAll('[data-start-card]')).map(card => card.getAttribute('data-start-card'))
    expect(cards).toEqual(['continue', 'browse', 'tutorial'])
    expect(view.querySelector('[data-start-action="continue"]')).not.toBeNull()
    expect(view.querySelector('[data-start-action="tutorial"]')).not.toBeNull()
    expect(view.querySelector('[data-start-action="browse"]')).not.toBeNull()
  })

  it('renders compact progress chips without expanding puzzle lists', () => {
    const view = renderStartScreen({
      chips: ['Track: Foundations', 'Solved 2/8'],
      onContinue: () => {},
      onTutorial: () => {},
      onBrowseTracks: () => {},
      onDismissTutorial: () => {},
    })

    const chips = view.querySelectorAll('[data-progress-chip]')
    expect(chips).toHaveLength(2)
    expect(view.querySelector('[data-puzzle-id]')).toBeNull()
  })

  it('keeps pointer and keyboard activation parity across all card actions', () => {
    const onContinue = vi.fn()
    const onTutorial = vi.fn()
    const onBrowseTracks = vi.fn()

    const view = renderStartScreen({
      chips: [],
      onContinue,
      onTutorial,
      onBrowseTracks,
      onDismissTutorial: () => {},
    })

    const continueAction = view.querySelector('[data-start-action="continue"]')
    const tutorialAction = view.querySelector('[data-start-action="tutorial"]')
    const browseAction = view.querySelector('[data-start-action="browse"]')

    continueAction?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    tutorialAction?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    browseAction?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))

    expect(onContinue).toHaveBeenCalledTimes(1)
    expect(onTutorial).toHaveBeenCalledTimes(1)
    expect(onBrowseTracks).toHaveBeenCalledTimes(1)
  })

  it('hides tutorial card when showTutorialCard is false', () => {
    const view = renderStartScreen({
      chips: [],
      onContinue: () => {},
      onTutorial: () => {},
      onBrowseTracks: () => {},
      showTutorialCard: false,
    })

    const cards = Array.from(view.querySelectorAll('[data-start-card]')).map(card => card.getAttribute('data-start-card'))
    expect(cards).toEqual(['continue', 'browse'])
    expect(view.querySelector('[data-start-card="tutorial"]')).toBeNull()
  })

  it('calls dismiss callback when tutorial dismiss action is triggered', () => {
    const onDismissTutorial = vi.fn()

    const view = renderStartScreen({
      chips: [],
      onContinue: () => {},
      onTutorial: () => {},
      onBrowseTracks: () => {},
      onDismissTutorial,
    })

    view.querySelector('[data-start-dismiss="tutorial"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(onDismissTutorial).toHaveBeenCalledTimes(1)
  })

  it('renders the hub: stats with rank, track cards and achievements', () => {
    const onContinue = vi.fn()
    const onResumeTrack = vi.fn()

    const view = renderStartScreen({
      onContinue,
      onTutorial: () => {},
      onBrowseTracks: () => {},
      showTutorialCard: false,
      stats: {
        points: 1190,
        maxPoints: 2700,
        rank: { title: 'Bishop', piece: 'b', progress: 0.4, next: { title: 'Rook', missing: 430 } },
        stars: 35,
        maxStars: 81,
        solved: 12,
        total: 27,
      },
      tracks: [
        { id: 'warm-up', title: 'Warm-up', subtitle: '', solvedCount: 4, totalCount: 7, score: 390, maxScore: 700 },
        { id: 'tricky', title: 'Tricky', subtitle: '', solvedCount: 0, totalCount: 6 },
      ],
      currentTrackId: 'warm-up',
      achievements: [
        { id: 'hunter', title: 'Hunter', description: 'x', piece: 'n', unlocked: false, value: 6, target: 10 },
        { id: 'first-solve', title: 'First Move', description: 'y', piece: 'p', unlocked: true, value: 1, target: 1 },
      ],
      onOpenTrack: () => {},
      onResumeTrack,
    })

    expect(view.querySelector('[data-hero-preview]')).toBeNull()
    view.querySelector('[data-start-action="continue"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(onContinue).toHaveBeenCalledTimes(1)

    expect(view.querySelector('.hub-rank-title')?.textContent).toBe('Bishop')
    expect(view.querySelector('.hub-rank-next')?.textContent).toBe('430 points to Rook')
    expect(view.querySelector('[data-hub-stat="points"] .hub-stat-value')?.textContent).toBe('1,190 / 2,700')

    expect(view.querySelector('[data-track-id="warm-up"]')?.getAttribute('data-track-current')).toBe('true')
    expect(view.querySelector('[data-resume-track="warm-up"]')?.textContent).toBe('Continue')
    expect(view.querySelector('[data-resume-track="tricky"]')?.textContent).toBe('Start')
    view.querySelector('[data-resume-track="tricky"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(onResumeTrack).toHaveBeenCalledWith('tricky')

    // Unlocked achievements are listed first
    const order = Array.from(view.querySelectorAll('[data-achievement]')).map(item => item.getAttribute('data-achievement'))
    expect(order).toEqual(['first-solve', 'hunter'])
    expect(view.querySelector('[data-hub-achievements] .hub-section-count')?.textContent).toBe('1 / 2')
  })
})


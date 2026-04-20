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
    })

    const cards = Array.from(view.querySelectorAll('[data-start-card]')).map(card => card.getAttribute('data-start-card'))
    expect(cards).toEqual(['continue', 'tutorial', 'browse'])
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
})

// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { renderStartScreen } from './startScreen.js'

describe('renderStartScreen', () => {
  it('renders heading and primary start action', () => {
    const view = renderStartScreen({ canResume: false, onStart: () => {}, onResume: () => {} })

    const heading = view.querySelector('h1')
    const startButton = view.querySelector('[data-start-action]')

    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('Xess')
    expect(startButton).not.toBeNull()
    expect(startButton?.textContent).toBe('Start')
  })

  it('invokes onStart exactly once on pointerdown', () => {
    const onStart = vi.fn()
    const view = renderStartScreen({ canResume: false, onStart, onResume: () => {} })

    view.querySelector('[data-start-action]')?.dispatchEvent(new Event('pointerdown'))

    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('renders resume action only when canResume is true', () => {
    const withResume = renderStartScreen({ canResume: true, onStart: () => {}, onResume: () => {} })
    const withoutResume = renderStartScreen({ canResume: false, onStart: () => {}, onResume: () => {} })

    expect(withResume.querySelector('[data-resume-action]')).not.toBeNull()
    expect(withoutResume.querySelector('[data-resume-action]')).toBeNull()
  })
})

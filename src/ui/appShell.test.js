// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { renderAppShell } from './appShell.js'

function buildContent() {
  const content = document.createElement('section')
  content.setAttribute('data-test-content', 'true')
  return content
}

describe('renderAppShell', () => {
  it('renders shell wrapper and topbar in all modes', () => {
    const startView = renderAppShell({ mode: 'start', title: 'Start', content: buildContent() })
    const tracksView = renderAppShell({ mode: 'tracks', title: 'Tracks', content: buildContent() })
    const playView = renderAppShell({ mode: 'play', title: 'Play', content: buildContent() })

    expect(startView.getAttribute('data-app-shell')).toBe('true')
    expect(tracksView.getAttribute('data-app-shell')).toBe('true')
    expect(playView.getAttribute('data-app-shell')).toBe('true')

    expect(startView.querySelector('[data-shell-topbar]')).not.toBeNull()
    expect(tracksView.querySelector('[data-shell-topbar]')).not.toBeNull()
    expect(playView.querySelector('[data-shell-topbar]')).not.toBeNull()
  })

  it('renders Home and Tracks nav buttons in topbar for all modes', () => {
    const startView = renderAppShell({ mode: 'start', title: 'Start', content: buildContent() })
    const playView = renderAppShell({ mode: 'play', title: 'Play', content: buildContent() })

    expect(startView.querySelector('[data-shell-nav-home]')).not.toBeNull()
    expect(startView.querySelector('[data-shell-nav-tracks]')).not.toBeNull()
    expect(playView.querySelector('[data-shell-nav-home]')).not.toBeNull()
    expect(playView.querySelector('[data-shell-nav-tracks]')).not.toBeNull()
  })

  it('invokes nav callbacks exactly once for pointer and keyboard activation', () => {
    const onNavigateHome = vi.fn()
    const onNavigateTracks = vi.fn()

    const view = renderAppShell({
      mode: 'play',
      title: 'Play',
      content: buildContent(),
      onNavigateHome,
      onNavigateTracks,
    })

    const home = view.querySelector('[data-shell-nav-home]')
    const tracks = view.querySelector('[data-shell-nav-tracks]')

    home?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(onNavigateHome).toHaveBeenCalledTimes(1)

    tracks?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    expect(onNavigateTracks).toHaveBeenCalledTimes(1)
  })

  it('can hide Tracks button for creator shell', () => {
    const view = renderAppShell({
      mode: 'creator',
      title: 'Creator',
      content: buildContent(),
      showTracks: false,
    })

    expect(view.querySelector('[data-shell-nav-home]')).not.toBeNull()
    expect(view.querySelector('[data-shell-nav-tracks]')).toBeNull()
  })

  it('shows the logo as the home control, the score, and a grouped puzzle stepper in play mode', () => {
    const home = renderAppShell({ mode: 'start', title: 'Xess', content: buildContent(), points: 1190 })
    expect(home.querySelector('[data-shell-nav-home] .logo')).not.toBeNull()
    expect(home.querySelector('[data-shell-score]')?.textContent).toBe('★ 1,190')
    expect(home.querySelector('[data-shell-nav-tracks]')?.textContent).toBe('Tracks')

    const play = renderAppShell({
      mode: 'play', title: 'Warm-up', content: buildContent(), hasPrevPuzzle: true, hasNextPuzzle: false, position: '4 / 7',
    })
    expect(play.querySelector('.app-shell-title')?.textContent).toBe('Warm-up')
    expect(play.querySelector('[data-shell-nav-tracks]')?.textContent).toBe('Puzzles')
    expect(play.querySelector('.app-shell-stepper [data-shell-position]')?.textContent).toBe('4 / 7')
    expect(play.querySelector('[data-next-puzzle]')?.disabled).toBe(true)
  })
})


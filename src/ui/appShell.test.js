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
})

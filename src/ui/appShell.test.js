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

    expect(startView.querySelector('[data-shell-footer]')).not.toBeNull()
    expect(tracksView.querySelector('[data-shell-footer]')).not.toBeNull()
    expect(playView.querySelector('[data-shell-footer]')).not.toBeNull()
  })

  it('renders static footer copy for all shell modes', () => {
    const startView = renderAppShell({ mode: 'start', title: 'Start', content: buildContent() })
    const tracksView = renderAppShell({ mode: 'tracks', title: 'Tracks', content: buildContent() })
    const playView = renderAppShell({ mode: 'play', title: 'Play', content: buildContent() })

    const startFooter = startView.querySelector('[data-shell-footer]')
    const tracksFooter = tracksView.querySelector('[data-shell-footer]')
    const playFooter = playView.querySelector('[data-shell-footer]')

    expect(startFooter?.textContent).toContain('Xess')
    expect(startFooter?.textContent).toContain('Local-first puzzle progress')
    expect(tracksFooter?.textContent).toContain('Xess')
    expect(tracksFooter?.textContent).toContain('Local-first puzzle progress')
    expect(playFooter?.textContent).toContain('Xess')
    expect(playFooter?.textContent).toContain('Local-first puzzle progress')
  })

  it('renders menu toggle only in play mode with aria-expanded', () => {
    const startView = renderAppShell({ mode: 'start', title: 'Start', content: buildContent() })
    const playView = renderAppShell({ mode: 'play', title: 'Play', content: buildContent(), menuOpen: true })

    expect(startView.querySelector('[data-shell-menu-toggle]')).toBeNull()

    const toggle = playView.querySelector('[data-shell-menu-toggle]')
    expect(toggle).not.toBeNull()
    expect(toggle?.getAttribute('aria-expanded')).toBe('true')
  })

  it('invokes menu callbacks exactly once for pointer and keyboard activation', () => {
    const onOpenMenu = vi.fn()
    const onNavigateHome = vi.fn()
    const onNavigateTracks = vi.fn()

    const view = renderAppShell({
      mode: 'play',
      title: 'Play',
      content: buildContent(),
      menuOpen: true,
      onOpenMenu,
      onNavigateHome,
      onNavigateTracks,
    })

    const toggle = view.querySelector('[data-shell-menu-toggle]')
    const home = view.querySelector('[data-shell-nav-home]')
    const tracks = view.querySelector('[data-shell-nav-tracks]')

    toggle?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(onOpenMenu).toHaveBeenCalledTimes(1)

    home?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(onNavigateHome).toHaveBeenCalledTimes(1)

    tracks?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    expect(onNavigateTracks).toHaveBeenCalledTimes(1)
  })
})

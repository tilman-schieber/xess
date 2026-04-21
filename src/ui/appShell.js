function bindActivate(button, callback) {
  if (!button || typeof callback !== 'function') return

  button.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    callback()
  })

  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  })
}

export function renderAppShell({
  mode,
  title,
  content,
  onOpenMenu,
  onNavigateHome,
  onNavigateTracks,
  menuOpen = false,
}) {
  const shell = document.createElement('section')
  shell.className = 'app-shell'
  shell.setAttribute('data-app-shell', 'true')
  shell.setAttribute('data-shell-mode', mode ?? 'unknown')

  const topbar = document.createElement('header')
  topbar.className = 'app-shell-topbar'
  topbar.setAttribute('data-shell-topbar', 'true')

  const heading = document.createElement('h1')
  heading.className = 'app-shell-title'
  heading.textContent = typeof title === 'string' && title.length > 0 ? title : 'Xess'

  topbar.append(heading)

  if (mode === 'play') {
    const menuToggle = document.createElement('button')
    menuToggle.type = 'button'
    menuToggle.className = 'app-shell-menu-toggle'
    menuToggle.setAttribute('data-shell-menu-toggle', 'true')
    menuToggle.setAttribute('aria-label', 'Open navigation menu')
    menuToggle.setAttribute('aria-expanded', menuOpen ? 'true' : 'false')
    menuToggle.setAttribute('aria-controls', 'app-shell-menu')
    menuToggle.textContent = '☰'
    bindActivate(menuToggle, onOpenMenu)
    topbar.append(menuToggle)

    const menu = document.createElement('nav')
    menu.className = 'app-shell-menu'
    menu.id = 'app-shell-menu'
    menu.setAttribute('data-shell-menu', 'true')
    menu.hidden = !menuOpen

    const homeButton = document.createElement('button')
    homeButton.type = 'button'
    homeButton.className = 'app-shell-menu-action'
    homeButton.setAttribute('data-shell-nav-home', 'true')
    homeButton.textContent = 'Home'
    bindActivate(homeButton, onNavigateHome)

    const tracksButton = document.createElement('button')
    tracksButton.type = 'button'
    tracksButton.className = 'app-shell-menu-action'
    tracksButton.setAttribute('data-shell-nav-tracks', 'true')
    tracksButton.textContent = 'Tracks'
    bindActivate(tracksButton, onNavigateTracks)

    menu.append(homeButton, tracksButton)
    shell.append(topbar, menu)
  } else {
    const nav = document.createElement('nav')
    nav.className = 'app-shell-nav'
    nav.setAttribute('data-shell-nav', 'true')

    const homeButton = document.createElement('button')
    homeButton.type = 'button'
    homeButton.className = 'app-shell-nav-action'
    homeButton.setAttribute('data-shell-nav-home', 'true')
    homeButton.textContent = 'Home'
    bindActivate(homeButton, onNavigateHome)

    const tracksButton = document.createElement('button')
    tracksButton.type = 'button'
    tracksButton.className = 'app-shell-nav-action'
    tracksButton.setAttribute('data-shell-nav-tracks', 'true')
    tracksButton.textContent = 'Tracks'
    bindActivate(tracksButton, onNavigateTracks)

    nav.append(homeButton, tracksButton)
    shell.append(topbar, nav)
  }

  const body = document.createElement('div')
  body.className = 'app-shell-content'
  body.setAttribute('data-shell-content', 'true')
  if (content instanceof HTMLElement) {
    body.append(content)
  }

  shell.append(body)
  return shell
}

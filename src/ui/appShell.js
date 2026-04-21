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
  onNavigateHome,
  onNavigateTracks,
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

  topbar.append(heading, homeButton, tracksButton)
  shell.append(topbar)

  const body = document.createElement('div')
  body.className = 'app-shell-content'
  body.setAttribute('data-shell-content', 'true')
  if (content instanceof HTMLElement) {
    body.append(content)
  }

  shell.append(body)
  return shell
}

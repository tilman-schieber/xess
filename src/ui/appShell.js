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
  showTracks = true,
  hasPrevPuzzle = false,
  hasNextPuzzle = false,
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

  topbar.append(heading, homeButton)

  if (showTracks) {
    const tracksButton = document.createElement('button')
    tracksButton.type = 'button'
    tracksButton.className = 'app-shell-nav-action'
    tracksButton.setAttribute('data-shell-nav-tracks', 'true')
    tracksButton.textContent = 'Tracks'
    bindActivate(tracksButton, onNavigateTracks)
    topbar.append(tracksButton)
  }

  if (hasPrevPuzzle !== false || hasNextPuzzle !== false) {
    const prevBtn = document.createElement('button')
    prevBtn.type = 'button'
    prevBtn.className = 'app-shell-nav-action'
    prevBtn.setAttribute('data-prev-puzzle', 'true')
    prevBtn.setAttribute('aria-label', 'Previous puzzle')
    prevBtn.textContent = '‹'
    prevBtn.disabled = !hasPrevPuzzle

    const nextBtn = document.createElement('button')
    nextBtn.type = 'button'
    nextBtn.className = 'app-shell-nav-action'
    nextBtn.setAttribute('data-next-puzzle', 'true')
    nextBtn.setAttribute('aria-label', 'Next puzzle')
    nextBtn.textContent = '›'
    nextBtn.disabled = !hasNextPuzzle

    topbar.append(prevBtn, nextBtn)
  }

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

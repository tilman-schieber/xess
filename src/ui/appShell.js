import { renderLogo, renderLogoMark } from './logo.js'

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
  position = null,
  points = null,
}) {
  const shell = document.createElement('section')
  shell.className = 'app-shell'
  shell.setAttribute('data-app-shell', 'true')
  shell.setAttribute('data-shell-mode', mode ?? 'unknown')

  const topbar = document.createElement('header')
  topbar.className = 'app-shell-topbar'
  topbar.setAttribute('data-shell-topbar', 'true')

  const titleText = typeof title === 'string' && title.length > 0 ? title : 'Xess'
  const isAppTitle = titleText === 'Xess'

  // The logo is the way home. With a context title (track, creator) it shrinks to the mark.
  const homeButton = document.createElement('button')
  homeButton.type = 'button'
  homeButton.className = 'app-shell-home'
  homeButton.setAttribute('data-shell-nav-home', 'true')
  homeButton.setAttribute('aria-label', 'Xess home')
  homeButton.setAttribute('title', 'Home')
  homeButton.append(isAppTitle ? renderLogo() : renderLogoMark())
  bindActivate(homeButton, onNavigateHome)

  const heading = document.createElement('h1')
  heading.className = isAppTitle ? 'app-shell-title sr-only' : 'app-shell-title'
  heading.textContent = titleText

  const actions = document.createElement('div')
  actions.className = 'app-shell-actions'

  if (Number.isFinite(points)) {
    const score = document.createElement('span')
    score.className = 'app-shell-score'
    score.setAttribute('data-shell-score', 'true')
    score.setAttribute('aria-label', `${points} points`)
    score.setAttribute('title', 'Your total points')
    score.textContent = `★ ${points.toLocaleString('en-US')}`
    actions.append(score)
  }

  if (showTracks) {
    const tracksButton = document.createElement('button')
    tracksButton.type = 'button'
    tracksButton.className = 'app-shell-nav-action'
    tracksButton.setAttribute('data-shell-nav-tracks', 'true')
    // From a puzzle this opens the puzzle list of its track
    tracksButton.textContent = mode === 'play' ? 'Puzzles' : 'Tracks'
    if (mode === 'tracks') tracksButton.setAttribute('aria-current', 'page')
    bindActivate(tracksButton, onNavigateTracks)
    actions.append(tracksButton)
  }

  if (hasPrevPuzzle !== false || hasNextPuzzle !== false) {
    const stepper = document.createElement('div')
    stepper.className = 'app-shell-stepper'

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

    stepper.append(prevBtn)
    if (typeof position === 'string' && position.length > 0) {
      const where = document.createElement('span')
      where.className = 'app-shell-position'
      where.setAttribute('data-shell-position', 'true')
      where.textContent = position
      stepper.append(where)
    }
    stepper.append(nextBtn)
    actions.append(stepper)
  }

  topbar.append(homeButton, heading, actions)

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

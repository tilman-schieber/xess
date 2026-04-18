// src/ui/startScreen.js
// Pure start screen renderer.

export function renderStartScreen({ canResume, onStart, onResume }) {
  const screen = document.createElement('section')
  screen.className = 'start-screen'
  screen.setAttribute('data-start-screen', 'true')

  const panel = document.createElement('div')
  panel.className = 'start-screen-panel'

  const heading = document.createElement('h1')
  heading.className = 'start-screen-title'
  heading.textContent = 'Xess'

  const copy = document.createElement('p')
  copy.className = 'start-screen-copy'
  copy.textContent = 'Choose a track and solve geometry-twisted chess puzzles.'

  const actions = document.createElement('div')
  actions.className = 'start-screen-actions'

  const startButton = document.createElement('button')
  startButton.type = 'button'
  startButton.className = 'start-screen-primary'
  startButton.setAttribute('data-start-action', 'true')
  startButton.textContent = 'Start'
  startButton.addEventListener('pointerdown', () => onStart())
  actions.append(startButton)

  if (canResume) {
    const resumeButton = document.createElement('button')
    resumeButton.type = 'button'
    resumeButton.className = 'start-screen-secondary'
    resumeButton.setAttribute('data-resume-action', 'true')
    resumeButton.textContent = 'Resume'
    resumeButton.addEventListener('pointerdown', () => onResume())
    actions.append(resumeButton)
  }

  panel.append(heading, copy, actions)
  screen.append(panel)

  return screen
}

// src/ui/startScreen.js
// Pure start screen renderer.

function bindActivate(element, callback) {
  if (!element || typeof callback !== 'function') return

  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    callback()
  })

  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  })
}

function renderCard({ id, title, copy, onActivate }) {
  const card = document.createElement('article')
  card.className = 'start-card start-card--interactive'
  card.setAttribute('data-start-card', id)
  card.setAttribute('data-start-action', id)
  card.setAttribute('role', 'button')
  card.tabIndex = 0
  bindActivate(card, onActivate)

  const heading = document.createElement('h2')
  heading.className = 'start-card-title'
  heading.textContent = title

  const body = document.createElement('p')
  body.className = 'start-card-copy'
  body.textContent = copy

  card.append(heading, body)
  return card
}

export function renderStartScreen({
  chips = [],
  onContinue,
  onTutorial,
  onBrowseTracks,
  onDismissTutorial,
  showTutorialCard = true,
}) {
  const screen = document.createElement('section')
  screen.className = 'start-screen'
  screen.setAttribute('data-start-screen', 'true')

  const panel = document.createElement('div')
  panel.className = 'start-screen-panel'

  const intro = document.createElement('p')
  intro.className = 'start-screen-intro'
  intro.textContent = 'Xess is chess movement on strange boards - solve each puzzle by reaching goals or capturing targets.'

  const heading = document.createElement('h1')
  heading.className = 'start-screen-title'
  heading.textContent = 'Xess'

  const copy = document.createElement('p')
  copy.className = 'start-screen-copy'
  copy.textContent = 'Pick your next move with contextual actions.'

  const chipsRow = document.createElement('div')
  chipsRow.className = 'start-screen-chips'
  chipsRow.setAttribute('data-start-chips', 'true')
  chips.forEach((chipText, index) => {
    if (typeof chipText !== 'string' || chipText.length === 0) return
    const chip = document.createElement('span')
    chip.className = 'start-screen-chip'
    chip.setAttribute('data-progress-chip', String(index))
    chip.textContent = chipText
    chipsRow.append(chip)
  })

  const cards = document.createElement('div')
  cards.className = 'start-screen-cards'

  cards.append(
    renderCard({
      id: 'continue',
      title: 'Continue',
      copy: 'Jump back into your best next puzzle.',
      onActivate: onContinue,
    }),
  )

  if (showTutorialCard) {
    const tutorialCard = renderCard({
      id: 'tutorial',
      title: 'Tutorial',
      copy: 'Learn Xess movement and board geometry quickly.',
      onActivate: onTutorial,
    })

    if (typeof onDismissTutorial === 'function') {
      const dismissAction = document.createElement('button')
      dismissAction.type = 'button'
      dismissAction.className = 'start-card-dismiss'
      dismissAction.setAttribute('data-start-dismiss', 'tutorial')
      dismissAction.textContent = 'Dismiss'
      dismissAction.addEventListener('pointerdown', event => event.stopPropagation())
      dismissAction.addEventListener('keydown', event => event.stopPropagation())
      bindActivate(dismissAction, onDismissTutorial)
      tutorialCard.append(dismissAction)
    }

    cards.append(tutorialCard)
  }

  cards.append(
    renderCard({
      id: 'browse',
      title: 'Browse Tracks',
      copy: 'Explore tracks and pick a specific puzzle.',
      onActivate: onBrowseTracks,
    }),
  )

  panel.append(heading, copy, chipsRow, cards)
  screen.append(intro, panel)

  return screen
}

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

function renderCard({ id, title, copy, actionLabel, onActivate }) {
  const card = document.createElement('article')
  card.className = 'start-card'
  card.setAttribute('data-start-card', id)

  const heading = document.createElement('h2')
  heading.className = 'start-card-title'
  heading.textContent = title

  const body = document.createElement('p')
  body.className = 'start-card-copy'
  body.textContent = copy

  const action = document.createElement('button')
  action.type = 'button'
  action.className = 'start-card-action'
  action.setAttribute('data-start-action', id)
  action.textContent = actionLabel
  bindActivate(action, onActivate)

  card.append(heading, body, action)
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
      actionLabel: 'Continue',
      onActivate: onContinue,
    }),
  )

  if (showTutorialCard) {
    const tutorialCard = renderCard({
      id: 'tutorial',
      title: 'Tutorial',
      copy: 'Learn Xess movement and board geometry quickly.',
      actionLabel: 'Tutorial',
      onActivate: onTutorial,
    })

    if (typeof onDismissTutorial === 'function') {
      const dismissAction = document.createElement('button')
      dismissAction.type = 'button'
      dismissAction.className = 'start-card-dismiss'
      dismissAction.setAttribute('data-start-dismiss', 'tutorial')
      dismissAction.textContent = 'Dismiss'
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
      actionLabel: 'Browse Tracks',
      onActivate: onBrowseTracks,
    }),
  )

  panel.append(heading, copy, chipsRow, cards)
  screen.append(panel)

  return screen
}

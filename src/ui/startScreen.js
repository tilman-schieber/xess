// src/ui/startScreen.js
// Pure start screen renderer — Liquid hero layout.

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
  continueLabel = 'Continue',
  continueTrackTitle = null,
  totalPuzzleCount = 0,
  solvedPuzzleCount = 0,
  onContinue,
  onTutorial,
  onBrowseTracks,
  onDismissTutorial,
  showTutorialCard = true,
}) {
  const screen = document.createElement('section')
  screen.className = 'start-screen'
  screen.setAttribute('data-start-screen', 'true')

  // ── Hero card (frost) ──
  const hero = document.createElement('section')
  hero.className = 'start-screen-hero'

  // Eyebrow: "● CONTINUE · TRACK 03 · DETOUR"
  const eyebrow = document.createElement('div')
  eyebrow.className = 'hero-eyebrow'
  const eyebrowParts = ['Continue']
  if (continueTrackTitle) eyebrowParts.push(continueTrackTitle)
  eyebrow.innerHTML = `<span class="hero-eyebrow-dot"></span> ${eyebrowParts.join(' &middot; ')}`

  // Headline
  const h1 = document.createElement('h1')
  h1.className = 'hero-h1'
  h1.innerHTML = 'Chess pieces.<br><em>Stranger boards.</em>'

  // Subtitle
  const sub = document.createElement('p')
  sub.className = 'hero-sub'
  sub.textContent = 'Variable-shaped boards. Impassable squares. Same rules you already know.'

  // CTA row
  const ctaRow = document.createElement('div')
  ctaRow.className = 'hero-cta-row'

  const primaryBtn = document.createElement('button')
  primaryBtn.type = 'button'
  primaryBtn.className = 'hero-btn hero-btn--primary'
  primaryBtn.setAttribute('data-start-card', 'continue')
  primaryBtn.setAttribute('data-start-action', 'continue')
  primaryBtn.textContent = continueLabel
  bindActivate(primaryBtn, onContinue)

  const ghostBtn = document.createElement('button')
  ghostBtn.type = 'button'
  ghostBtn.className = 'hero-btn hero-btn--ghost'
  ghostBtn.setAttribute('data-start-card', 'browse')
  ghostBtn.setAttribute('data-start-action', 'browse')
  ghostBtn.textContent = 'All tracks'
  bindActivate(ghostBtn, onBrowseTracks)

  ctaRow.append(primaryBtn, ghostBtn)
  hero.append(eyebrow, h1, sub, ctaRow)
  screen.append(hero)

  // ── Action cards below the hero ──
  const cards = document.createElement('div')
  cards.className = 'start-screen-cards'

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

  // Progress chip row
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

  if (cards.children.length > 0) screen.append(cards)
  if (chipsRow.children.length > 0) screen.append(chipsRow)

  return screen
}

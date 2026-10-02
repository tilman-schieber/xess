// src/ui/startScreen.js
// Pure start screen renderer — the game hub: where you are, your score and rank,
// every track, and achievements.

import { getPieceSvg } from './pieces.js'
import { renderTrackCard } from './trackBrowser.js'

let _domParser = null
function pieceIcon(type, color = 'white') {
  if (!_domParser) _domParser = new DOMParser()
  const span = document.createElement('span')
  span.className = 'hub-piece'
  span.setAttribute('aria-hidden', 'true')
  const svgEl = _domParser.parseFromString(getPieceSvg({ type, color }), 'image/svg+xml').documentElement
  svgEl.querySelectorAll('script, foreignObject').forEach(node => node.remove())
  span.append(svgEl)
  return span
}

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function renderStats(stats) {
  const strip = el('section', 'hub-stats')
  strip.setAttribute('data-hub-stats', 'true')

  const rank = el('div', 'hub-rank')
  rank.append(pieceIcon(stats.rank.piece))
  const rankBody = el('div', 'hub-rank-body')
  rankBody.append(el('span', 'hub-stat-label', 'Rank'), el('strong', 'hub-rank-title', stats.rank.title))
  const meter = el('div', 'track-card-meter')
  meter.setAttribute('aria-hidden', 'true')
  const fill = document.createElement('span')
  fill.style.inlineSize = `${Math.round(stats.rank.progress * 100)}%`
  meter.append(fill)
  rankBody.append(meter, el(
    'span',
    'hub-rank-next',
    stats.rank.next ? `${stats.rank.next.missing} points to ${stats.rank.next.title}` : 'Highest rank reached',
  ))
  rank.append(rankBody)
  strip.append(rank)

  ;[
    { label: 'Points', value: stats.points.toLocaleString('en-US'), of: stats.maxPoints.toLocaleString('en-US'), key: 'points' },
    { label: 'Stars', value: String(stats.stars), of: String(stats.maxStars), key: 'stars' },
    { label: 'Solved', value: String(stats.solved), of: String(stats.total), key: 'solved' },
  ].forEach(({ label, value, of, key }) => {
    const tile = el('div', 'hub-stat')
    tile.setAttribute('data-hub-stat', key)
    const figure = el('strong', 'hub-stat-value', value)
    figure.append(el('span', 'hub-stat-of', ` / ${of}`))
    tile.append(el('span', 'hub-stat-label', label), figure)
    strip.append(tile)
  })

  return strip
}

function renderAchievements(achievements) {
  const section = el('section', 'hub-section')
  section.setAttribute('data-hub-achievements', 'true')
  const unlocked = achievements.filter(entry => entry.unlocked).length
  const head = el('div', 'hub-section-head')
  head.append(el('h2', 'hub-section-title', 'Achievements'), el('span', 'hub-section-count', `${unlocked} / ${achievements.length}`))
  section.append(head)

  const grid = el('ul', 'hub-achievements')
  // Unlocked first, then the ones closest to completion
  const ordered = [...achievements].sort((a, b) =>
    Number(b.unlocked) - Number(a.unlocked) || (b.value / b.target) - (a.value / a.target))
  ordered.forEach((entry) => {
    const item = el('li', 'hub-achievement')
    item.setAttribute('data-achievement', entry.id)
    item.setAttribute('data-unlocked', String(entry.unlocked))
    item.append(pieceIcon(entry.piece))
    const body = el('div', 'hub-achievement-body')
    const titleRow = el('div', 'hub-achievement-head')
    titleRow.append(el('strong', 'hub-achievement-title', entry.title))
    if (Number.isInteger(entry.points)) titleRow.append(el('span', 'hub-achievement-points', `+${entry.points}`))
    body.append(titleRow, el('span', 'hub-achievement-copy', entry.description))
    if (!entry.unlocked) {
      const meter = el('div', 'track-card-meter')
      meter.setAttribute('aria-hidden', 'true')
      const fill = document.createElement('span')
      fill.style.inlineSize = `${Math.round((entry.value / entry.target) * 100)}%`
      meter.append(fill)
      body.append(meter, el('span', 'hub-achievement-progress', `${entry.value.toLocaleString('en-US')} / ${entry.target.toLocaleString('en-US')}`))
    } else {
      body.append(el('span', 'hub-achievement-progress', '✓ Unlocked'))
    }
    item.append(body)
    grid.append(item)
  })
  section.append(grid)
  return section
}

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

export function renderStartScreen({
  chips = [],
  eyebrowLabel = 'Continue',
  continueLabel = 'Continue',
  continueTrackTitle = null,
  totalPuzzleCount = 0,
  solvedPuzzleCount = 0,
  onContinue,
  onBrowseTracks,
  stats = null,
  tracks = [],
  currentTrackId = null,
  achievements = [],
  onOpenTrack,
  onResumeTrack,
  renderPreview,
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
  const dot = document.createElement('span')
  dot.className = 'hero-eyebrow-dot'
  const eyebrowParts = [eyebrowLabel]
  if (continueTrackTitle) eyebrowParts.push(continueTrackTitle)
  eyebrow.append(dot, document.createTextNode(` ${eyebrowParts.join(' · ')}`))

  // Headline
  const h1 = document.createElement('h1')
  h1.className = 'hero-h1'
  h1.innerHTML = 'Chess pieces.<br><em>Stranger boards.</em>'

  // Subtitle
  const sub = document.createElement('p')
  sub.className = 'hero-sub'
  sub.textContent = 'The pieces move exactly like in chess. The boards are full of holes, corridors and dead ends.'

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
  const heroText = el('div', 'hero-text')
  heroText.append(eyebrow, h1, sub, ctaRow)
  hero.append(heroText)

  screen.append(hero)

  if (stats) screen.append(renderStats(stats))

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

  if (tracks.length > 0) {
    const section = el('section', 'hub-section')
    section.setAttribute('data-hub-tracks', 'true')
    const head = el('div', 'hub-section-head')
    head.append(el('h2', 'hub-section-title', 'Tracks'))
    section.append(head)
    const grid = el('div', 'hub-tracks')
    tracks.forEach((track) => {
      grid.append(renderTrackCard({
        track,
        onOpenTrack,
        onResumeTrack,
        renderPreview,
        isCurrent: track.id === currentTrackId,
      }))
    })
    section.append(grid)
    screen.append(section)
  }

  if (achievements.length > 0) screen.append(renderAchievements(achievements))
  if (chipsRow.children.length > 0) screen.append(chipsRow)

  return screen
}

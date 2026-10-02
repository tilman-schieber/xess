// src/ui/trackBrowser.js
// Pure renderer for track overview and per-track puzzle browsing.

import { formatStars, starsForScore } from '../puzzles/score.js'

function addKeyboardActivate(element, callback) {
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  })
}

/**
 * One track as a card: preview of the puzzle you would play next, progress, and
 * a single primary action. Shared by the landing page and the track overview.
 */
export function renderTrackCard({ track, onOpenTrack, onResumeTrack, renderPreview, isCurrent = false }) {
  const total = track.totalCount ?? track.puzzles?.length ?? 0
  const solvedCount = track.solvedCount ?? 0
  const isComplete = total > 0 && solvedCount >= total

  const card = document.createElement('article')
  card.className = 'track-card'
  card.setAttribute('data-track-id', track.id)
  if (isComplete) card.setAttribute('data-track-complete', 'true')
  if (isCurrent) card.setAttribute('data-track-current', 'true')

  const preview = typeof renderPreview === 'function' && track.previewPuzzleId
    ? renderPreview(track.previewPuzzleId)
    : null
  if (preview) {
    const frame = document.createElement('div')
    frame.className = 'track-card-preview'
    frame.append(preview)
    card.append(frame)
  }

  const body = document.createElement('div')
  body.className = 'track-card-body'

  const tags = document.createElement('div')
  tags.className = 'track-card-tags'
  if (track?.modes?.tutorial?.enabled === true && !isComplete) {
    const tutorialTag = document.createElement('span')
    tutorialTag.className = 'track-card-tutorial'
    tutorialTag.setAttribute('data-track-tutorial', 'true')
    tutorialTag.textContent = 'Start here'
    tags.append(tutorialTag)
  }
  if (isCurrent) {
    const currentTag = document.createElement('span')
    currentTag.className = 'track-card-tutorial'
    currentTag.textContent = 'You are here'
    tags.append(currentTag)
  }

  const title = document.createElement('h3')
  title.className = 'track-card-title'
  title.setAttribute('data-track-title', 'true')
  title.textContent = track.title

  const subtitle = document.createElement('p')
  subtitle.className = 'track-card-subtitle'
  subtitle.textContent = track.subtitle ?? ''

  const meter = document.createElement('div')
  meter.className = 'track-card-meter'
  meter.setAttribute('aria-hidden', 'true')
  const meterFill = document.createElement('span')
  meterFill.style.inlineSize = `${total > 0 ? Math.round((solvedCount / total) * 100) : 0}%`
  meter.append(meterFill)

  const progress = document.createElement('p')
  progress.className = 'track-card-progress'
  const progressParts = [isComplete ? `✓ All ${total} solved` : `${solvedCount} / ${total} solved`]
  if (Number.isInteger(track.score) && Number.isInteger(track.maxScore) && solvedCount > 0) {
    progressParts.push(`${track.score} / ${track.maxScore} points`)
  }
  progress.textContent = progressParts.join(' · ')

  const actions = document.createElement('div')
  actions.className = 'track-card-actions'

  const resumeButton = document.createElement('button')
  resumeButton.type = 'button'
  resumeButton.className = 'track-action-resume'
  resumeButton.setAttribute('data-resume-track', track.id)
  resumeButton.textContent = isComplete ? 'Replay' : solvedCount > 0 ? 'Continue' : 'Start'
  resumeButton.addEventListener('pointerdown', () => onResumeTrack(track.id))
  addKeyboardActivate(resumeButton, () => onResumeTrack(track.id))

  const openButton = document.createElement('button')
  openButton.type = 'button'
  openButton.className = 'track-action-open'
  openButton.setAttribute('data-open-track', track.id)
  openButton.textContent = 'Puzzle list'
  openButton.addEventListener('pointerdown', () => onOpenTrack(track.id))
  addKeyboardActivate(openButton, () => onOpenTrack(track.id))

  actions.append(resumeButton, openButton)
  if (tags.children.length > 0) body.append(tags)
  body.append(title, subtitle, meter, progress, actions)
  card.append(body)
  return card
}

export function renderTrackBrowser({
  tracks,
  selectedTrackId,
  onOpenTrack,
  onResumeTrack,
  onSelectPuzzle,
  onBack,
  renderPreview,
}) {
  const screen = document.createElement('section')
  screen.className = 'track-browser'
  screen.setAttribute('data-track-browser', 'true')

  const header = document.createElement('header')
  header.className = 'track-browser-header'

  const heading = document.createElement('h2')
  heading.className = 'track-browser-title'
  header.append(heading)

  const list = document.createElement('div')
  list.className = 'track-browser-list'

  const selectedTrack = tracks.find(track => track.id === selectedTrackId) ?? null
  if (selectedTrack) {
    screen.setAttribute('data-selected-track', selectedTrack.id)
  }

  if (!selectedTrack) {
    heading.textContent = 'Tracks'

    tracks.forEach((track) => {
      list.append(renderTrackCard({ track, onOpenTrack, onResumeTrack, renderPreview }))
    })
  } else {
    const back = document.createElement('button')
    back.type = 'button'
    back.className = 'track-browser-back'
    back.setAttribute('data-track-back', 'true')
    back.textContent = '‹ All tracks'
    back.addEventListener('pointerdown', () => onBack())
    addKeyboardActivate(back, () => onBack())
    header.prepend(back)

    heading.textContent = selectedTrack.title

    const selectedSubtitle = document.createElement('p')
    selectedSubtitle.className = 'track-browser-current'
    const total = selectedTrack.totalCount ?? selectedTrack.puzzles.length
    selectedSubtitle.textContent = [
      selectedTrack.subtitle,
      `${selectedTrack.solvedCount ?? 0} / ${total} solved`,
      Number.isInteger(selectedTrack.score) && selectedTrack.score > 0
        ? `${selectedTrack.score} / ${selectedTrack.maxScore} points`
        : null,
    ].filter(Boolean).join(' · ')
    header.append(selectedSubtitle)

    const puzzleList = document.createElement('ul')
    puzzleList.className = 'track-puzzle-list'

    selectedTrack.puzzles.forEach((puzzle, index) => {
      const item = document.createElement('li')
      item.className = 'track-puzzle-item'
      item.setAttribute('role', 'button')
      item.setAttribute('tabindex', '0')
      item.setAttribute('data-puzzle-id', puzzle.id)
      item.setAttribute('data-puzzle-status', puzzle.inProgress ? 'in-progress' : (puzzle.status ?? 'unlocked'))

      const position = document.createElement('span')
      position.className = 'track-puzzle-position'
      position.setAttribute('data-track-position', 'true')
      position.textContent = String(puzzle.number ?? index + 1)

      const title = document.createElement('span')
      title.className = 'track-puzzle-title'
      title.textContent = puzzle.title

      const status = document.createElement('span')
      status.className = 'track-puzzle-status'
      status.setAttribute('data-track-puzzle-status', 'true')
      if (puzzle.status === 'solved') {
        const score = Number.isInteger(puzzle.bestScore) ? puzzle.bestScore : null
        status.textContent = score === null ? '✓ Solved' : `${formatStars(starsForScore(score))} ${score}`
        if (score !== null) status.setAttribute('aria-label', `Solved, best score ${score} of 100`)
      } else if (puzzle.inProgress) {
        status.textContent = 'In progress'
      }

      const select = () => onSelectPuzzle({ trackId: selectedTrack.id, puzzleId: puzzle.id })
      item.addEventListener('pointerdown', select)
      addKeyboardActivate(item, select)

      const preview = typeof renderPreview === 'function' ? renderPreview(puzzle.id) : null
      if (preview) {
        const thumb = document.createElement('span')
        thumb.className = 'track-puzzle-thumb'
        thumb.append(preview)
        item.append(position, thumb, title, status)
        item.classList.add('track-puzzle-item--thumb')
      } else {
        item.append(position, title, status)
      }
      puzzleList.append(item)
    })

    list.append(puzzleList)
  }

  screen.append(header, list)
  return screen
}

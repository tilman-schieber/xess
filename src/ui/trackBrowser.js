// src/ui/trackBrowser.js
// Pure renderer for track overview and per-track puzzle browsing.

function addKeyboardActivate(element, callback) {
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  })
}

export function renderTrackBrowser({
  tracks,
  selectedTrackId,
  onOpenTrack,
  onResumeTrack,
  onSelectPuzzle,
  onBack,
}) {
  const screen = document.createElement('section')
  screen.className = 'track-browser'
  screen.setAttribute('data-track-browser', 'true')

  const header = document.createElement('header')
  header.className = 'track-browser-header'

  const heading = document.createElement('h2')
  heading.className = 'track-browser-title'
  heading.textContent = 'Tracks'
  header.append(heading)

  const list = document.createElement('div')
  list.className = 'track-browser-list'

  const selectedTrack = tracks.find(track => track.id === selectedTrackId) ?? null
  if (selectedTrack) {
    screen.setAttribute('data-selected-track', selectedTrack.id)
  }

  if (!selectedTrack) {
    tracks.forEach((track) => {
      const card = document.createElement('article')
      card.className = 'track-card'
      card.setAttribute('data-track-id', track.id)

      const title = document.createElement('h3')
      title.className = 'track-card-title'
      title.setAttribute('data-track-title', 'true')
      title.textContent = track.title

      const subtitle = document.createElement('p')
      subtitle.className = 'track-card-subtitle'
      subtitle.textContent = track.subtitle ?? ''

      const progress = document.createElement('p')
      progress.className = 'track-card-progress'
      progress.textContent = `Solved ${track.solvedCount ?? 0} / ${track.totalCount ?? track.puzzles?.length ?? 0}`

      if (track?.modes?.tutorial?.enabled === true) {
        const tutorialTag = document.createElement('span')
        tutorialTag.className = 'track-card-tutorial'
        tutorialTag.setAttribute('data-track-tutorial', 'true')
        tutorialTag.textContent = 'Tutorial'
        card.append(tutorialTag)
      }

      const actions = document.createElement('div')
      actions.className = 'track-card-actions'

      const openButton = document.createElement('button')
      openButton.type = 'button'
      openButton.className = 'track-action-open'
      openButton.setAttribute('data-open-track', track.id)
      openButton.textContent = 'Open'
      openButton.addEventListener('pointerdown', () => onOpenTrack(track.id))

      const resumeButton = document.createElement('button')
      resumeButton.type = 'button'
      resumeButton.className = 'track-action-resume'
      resumeButton.setAttribute('data-resume-track', track.id)
      resumeButton.textContent = 'Resume'
      resumeButton.addEventListener('pointerdown', () => onResumeTrack(track.id))

      actions.append(openButton, resumeButton)
      card.append(title, subtitle, progress, actions)
      list.append(card)
    })
  } else {
    const back = document.createElement('button')
    back.type = 'button'
    back.className = 'track-browser-back'
    back.setAttribute('data-track-back', 'true')
    back.textContent = 'Back'
    back.addEventListener('pointerdown', () => onBack())
    header.prepend(back)

    const selectedTitle = document.createElement('p')
    selectedTitle.className = 'track-browser-current'
    selectedTitle.textContent = selectedTrack.title
    header.append(selectedTitle)

    const puzzleList = document.createElement('ul')
    puzzleList.className = 'track-puzzle-list'

    selectedTrack.puzzles.forEach((puzzle) => {
      const item = document.createElement('li')
      item.className = 'track-puzzle-item'
      item.setAttribute('role', 'button')
      item.setAttribute('tabindex', '0')
      item.setAttribute('data-puzzle-id', puzzle.id)

      const position = document.createElement('span')
      position.className = 'track-puzzle-position'
      position.setAttribute('data-track-position', 'true')
      position.textContent = puzzle.position

      const title = document.createElement('span')
      title.className = 'track-puzzle-title'
      title.textContent = puzzle.title

      const select = () => onSelectPuzzle({ trackId: selectedTrack.id, puzzleId: puzzle.id })
      item.addEventListener('pointerdown', select)
      addKeyboardActivate(item, select)

      item.append(position, title)
      puzzleList.append(item)
    })

    list.append(puzzleList)
  }

  screen.append(header, list)
  return screen
}

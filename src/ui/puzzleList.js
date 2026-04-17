// src/ui/puzzleList.js
// Renders the full puzzle list screen as a DOM element.
// Pure: receives data in, returns DOM element, no side effects.

/**
 * Builds and returns the puzzle list screen element.
 *
 * @param {object} options
 * @param {{ id: string, title: string, status: 'solved'|'unlocked' }[]} options.list
 * @param {string} options.currentId — the currently active puzzle id
 * @param {(id: string) => void} options.onSelect — called with puzzle id when user selects one
 * @param {() => void} options.onClose — called when user dismisses the list
 * @returns {HTMLElement}
 */
export function renderPuzzleList({ list, currentId, onSelect, onClose }) {
  const screen = document.createElement('div')
  screen.className = 'puzzle-list-screen'
  screen.setAttribute('data-puzzle-list', 'true')

  // Header
  const header = document.createElement('header')
  header.className = 'puzzle-list-header'

  const heading = document.createElement('h2')
  heading.className = 'puzzle-list-heading'
  heading.textContent = 'Puzzles'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'puzzle-list-close'
  closeBtn.setAttribute('aria-label', 'Close puzzle list')
  closeBtn.textContent = '✕'
  closeBtn.addEventListener('pointerdown', () => onClose())

  header.append(heading, closeBtn)
  screen.append(header)

  // List
  const ul = document.createElement('ul')
  ul.className = 'puzzle-list-items'

  list.forEach((item, idx) => {
    const li = document.createElement('li')
    li.className = 'puzzle-list-item'
    if (item.id === currentId) li.classList.add('is-current')
    li.setAttribute('data-puzzle-id', item.id)

    const num = document.createElement('span')
    num.className = 'puzzle-list-num'
    num.textContent = String(idx + 1)

    const title = document.createElement('span')
    title.className = 'puzzle-list-title'
    title.textContent = item.title

    const statusSpan = document.createElement('span')
    statusSpan.className = 'puzzle-list-status'

    if (item.status === 'solved') {
      const symbol = document.createElement('span')
      symbol.setAttribute('aria-hidden', 'true')
      symbol.textContent = '✓'
      const srLabel = document.createElement('span')
      srLabel.className = 'sr-only'
      srLabel.textContent = 'Solved'
      statusSpan.append(symbol, srLabel)
    }

    li.append(num, title, statusSpan)

    li.setAttribute('tabindex', '0')
    li.setAttribute('role', 'button')
    li.addEventListener('pointerdown', () => onSelect(item.id))
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect(item.id)
      }
    })

    ul.append(li)
  })

  screen.append(ul)
  return screen
}

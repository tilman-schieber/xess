// src/ui/miniBoard.js
// Small non-interactive board thumbnail, used on the landing page and in track lists.

import { createBoardRenderModel } from './boardRenderer.js'

let _domParser = null
function getDomParser() {
  if (!_domParser) _domParser = new DOMParser()
  return _domParser
}

/**
 * @param {{ puzzle: object, board?: Map }} options - parsed puzzle; board defaults to its start position
 * @returns {HTMLElement}
 */
export function renderMiniBoard({ puzzle, board = puzzle?.board }) {
  const el = document.createElement('div')
  el.className = 'mini-board'
  el.setAttribute('aria-hidden', 'true')
  if (!puzzle || !(board instanceof Map)) return el

  const model = createBoardRenderModel({ puzzle, board })
  el.style.setProperty('--cols', String(model.width))
  el.style.setProperty('--rows', String(model.height))

  model.cells.forEach((cell) => {
    const cellEl = document.createElement('span')
    cellEl.className = cell.isVoid
      ? 'mini-cell mini-cell--void'
      : cell.isGoal ? 'mini-cell mini-cell--goal' : 'mini-cell'

    const glyph = cell.piece ?? cell.goalGhost
    if (glyph) {
      const svgEl = getDomParser().parseFromString(glyph.svg, 'image/svg+xml').documentElement
      svgEl.querySelectorAll('script, foreignObject').forEach(node => node.remove())
      if (!cell.piece) svgEl.setAttribute('class', 'mini-ghost')
      cellEl.append(svgEl)
    }
    el.append(cellEl)
  })

  return el
}

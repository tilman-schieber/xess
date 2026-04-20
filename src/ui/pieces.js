const PIECE_TYPES = ['k', 'q', 'r', 'b', 'n', 'p']
const PIECE_COLORS = ['white', 'black', 'red']

import whiteK from './piece-assets/white-k.svg?raw'
import whiteQ from './piece-assets/white-q.svg?raw'
import whiteR from './piece-assets/white-r.svg?raw'
import whiteB from './piece-assets/white-b.svg?raw'
import whiteN from './piece-assets/white-n.svg?raw'
import whiteP from './piece-assets/white-p.svg?raw'
import blackK from './piece-assets/black-k.svg?raw'
import blackQ from './piece-assets/black-q.svg?raw'
import blackR from './piece-assets/black-r.svg?raw'
import blackB from './piece-assets/black-b.svg?raw'
import blackN from './piece-assets/black-n.svg?raw'
import blackP from './piece-assets/black-p.svg?raw'
import redK from './piece-assets/red-k.svg?raw'
import redQ from './piece-assets/red-q.svg?raw'
import redR from './piece-assets/red-r.svg?raw'
import redB from './piece-assets/red-b.svg?raw'
import redN from './piece-assets/red-n.svg?raw'
import redP from './piece-assets/red-p.svg?raw'

function withStableViewBox(svg) {
  if (typeof svg !== 'string' || svg.length === 0) {
    return svg
  }

  if (svg.includes('viewBox=')) {
    return svg
  }

  return svg.replace('<svg ', '<svg viewBox="0 0 45 45" ')
}

const PIECE_SVGS = Object.freeze({
  'white-k': withStableViewBox(whiteK),
  'white-q': withStableViewBox(whiteQ),
  'white-r': withStableViewBox(whiteR),
  'white-b': withStableViewBox(whiteB),
  'white-n': withStableViewBox(whiteN),
  'white-p': withStableViewBox(whiteP),
  'black-k': withStableViewBox(blackK),
  'black-q': withStableViewBox(blackQ),
  'black-r': withStableViewBox(blackR),
  'black-b': withStableViewBox(blackB),
  'black-n': withStableViewBox(blackN),
  'black-p': withStableViewBox(blackP),
  'red-k': withStableViewBox(redK),
  'red-q': withStableViewBox(redQ),
  'red-r': withStableViewBox(redR),
  'red-b': withStableViewBox(redB),
  'red-n': withStableViewBox(redN),
  'red-p': withStableViewBox(redP),
})

export function getPieceSvgKey(piece) {
  const type = piece?.type
  const color = piece?.color

  if (!PIECE_TYPES.includes(type) || !PIECE_COLORS.includes(color)) {
    throw new Error(`Unknown piece key: ${color}:${type}`)
  }

  return `${color}-${type}`
}

export function getPieceSvg(piece) {
  const key = getPieceSvgKey(piece)
  return PIECE_SVGS[key]
}

export { PIECE_SVGS }

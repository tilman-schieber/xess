const PIECE_TYPES = ['k', 'q', 'r', 'b', 'n', 'p']
const PIECE_COLORS = ['white', 'black']

const PIECE_SVGS = Object.freeze({
  'white-k': '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="27" y="8" width="10" height="22" rx="2"/><rect x="20" y="26" width="24" height="8" rx="2"/><rect x="18" y="34" width="28" height="18" rx="3"/></svg>',
  'white-q': '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="16" cy="14" r="4"/><circle cx="32" cy="10" r="4"/><circle cx="48" cy="14" r="4"/><path d="M14 20h36l-4 20H18z"/><rect x="18" y="42" width="28" height="10" rx="3"/></svg>',
  'white-r': '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="16" y="10" width="8" height="10"/><rect x="28" y="10" width="8" height="10"/><rect x="40" y="10" width="8" height="10"/><rect x="18" y="20" width="28" height="22" rx="2"/><rect x="16" y="42" width="32" height="10" rx="3"/></svg>',
  'white-b': '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="13" r="5"/><path d="M32 18c-8 6-12 14-12 22h24c0-8-4-16-12-22z"/><rect x="18" y="40" width="28" height="12" rx="3"/></svg>',
  'white-n': '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 42c0-14 8-24 20-28l8 6-6 8 8 8v6z"/><rect x="16" y="42" width="30" height="10" rx="3"/></svg>',
  'white-p': '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="16" r="7"/><rect x="24" y="22" width="16" height="20" rx="7"/><rect x="20" y="42" width="24" height="10" rx="3"/></svg>',
  'black-k': '<svg viewBox="0 0 64 64" aria-hidden="true" fill="#222"><rect x="27" y="8" width="10" height="22" rx="2"/><rect x="20" y="26" width="24" height="8" rx="2"/><rect x="18" y="34" width="28" height="18" rx="3"/></svg>',
  'black-q': '<svg viewBox="0 0 64 64" aria-hidden="true" fill="#222"><circle cx="16" cy="14" r="4"/><circle cx="32" cy="10" r="4"/><circle cx="48" cy="14" r="4"/><path d="M14 20h36l-4 20H18z"/><rect x="18" y="42" width="28" height="10" rx="3"/></svg>',
  'black-r': '<svg viewBox="0 0 64 64" aria-hidden="true" fill="#222"><rect x="16" y="10" width="8" height="10"/><rect x="28" y="10" width="8" height="10"/><rect x="40" y="10" width="8" height="10"/><rect x="18" y="20" width="28" height="22" rx="2"/><rect x="16" y="42" width="32" height="10" rx="3"/></svg>',
  'black-b': '<svg viewBox="0 0 64 64" aria-hidden="true" fill="#222"><circle cx="32" cy="13" r="5"/><path d="M32 18c-8 6-12 14-12 22h24c0-8-4-16-12-22z"/><rect x="18" y="40" width="28" height="12" rx="3"/></svg>',
  'black-n': '<svg viewBox="0 0 64 64" aria-hidden="true" fill="#222"><path d="M18 42c0-14 8-24 20-28l8 6-6 8 8 8v6z"/><rect x="16" y="42" width="30" height="10" rx="3"/></svg>',
  'black-p': '<svg viewBox="0 0 64 64" aria-hidden="true" fill="#222"><circle cx="32" cy="16" r="7"/><rect x="24" y="22" width="16" height="20" rx="7"/><rect x="20" y="42" width="24" height="10" rx="3"/></svg>',
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

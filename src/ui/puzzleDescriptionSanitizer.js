import createDOMPurify from 'dompurify'

const URI_ALLOWLIST = /^(?:(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$)))/i

function getRuntimeWindow() {
  if (typeof window !== 'undefined' && window?.document) {
    return window
  }

  return null
}

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'em', 'strong', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  FORBID_ATTR: ['style'],
  ALLOWED_URI_REGEXP: URI_ALLOWLIST,
}

export function sanitizePuzzleDescription(html, options = {}) {
  if (typeof html !== 'string' || html.trim().length === 0) {
    return ''
  }

  const sanitizerWindow = options.window ?? getRuntimeWindow()
  if (!sanitizerWindow?.document) {
    return ''
  }

  const domPurify = createDOMPurify(sanitizerWindow)

  return domPurify.sanitize(html, SANITIZE_CONFIG)
}

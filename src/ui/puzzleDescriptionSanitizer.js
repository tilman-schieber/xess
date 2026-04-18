import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const URI_ALLOWLIST = /^(?:(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$)))/i

function createSanitizerWindow() {
  if (typeof window !== 'undefined' && window?.document) {
    return window
  }

  return new JSDOM('').window
}

const domPurify = createDOMPurify(createSanitizerWindow())

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'em', 'strong', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  FORBID_ATTR: ['style'],
  ALLOWED_URI_REGEXP: URI_ALLOWLIST,
}

export function sanitizePuzzleDescription(html) {
  if (typeof html !== 'string' || html.trim().length === 0) {
    return ''
  }

  return domPurify.sanitize(html, SANITIZE_CONFIG)
}

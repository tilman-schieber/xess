// src/store/creatorDraft.js
// localStorage persistence for the puzzle creator's work-in-progress draft.
// Kept apart from the player's progress blob (store.js) so neither can clobber the other.

const STORAGE_KEY = 'xess_creator_v1'

/**
 * @returns {object|null} the saved raw puzzle draft, or null when absent/unreadable
 */
export function loadCreatorDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && Array.isArray(parsed.grid) ? parsed : null
  } catch {
    return null
  }
}

/**
 * @param {object} rawPuzzle - raw puzzle definition (toRawPuzzle output)
 */
export function saveCreatorDraft(rawPuzzle) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawPuzzle))
  } catch (err) {
    console.error('xess: creator draft write failed', err)
  }
}

export function clearCreatorDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}

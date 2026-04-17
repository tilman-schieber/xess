export const MOVE_TRANSITION_MS = 180
const ILLEGAL_FEEDBACK_MS = 180

/**
 * Centralized interaction feedback state and class transitions.
 */
export function createInteractionFeedback({
  now = () => Date.now(),
  illegalFeedbackMs = ILLEGAL_FEEDBACK_MS,
  moveFeedbackMs = MOVE_TRANSITION_MS,
} = {}) {
  const state = {
    selectedKey: null,
    legalKeys: [],
    illegalKey: null,
    illegalUntil: 0,
    movingKey: null,
    movingUntil: 0,
    won: false,
  }

  const clearExpired = () => {
    const t = now()

    if (state.illegalKey && t >= state.illegalUntil) {
      state.illegalKey = null
      state.illegalUntil = 0
    }

    if (state.movingKey && t >= state.movingUntil) {
      state.movingKey = null
      state.movingUntil = 0
    }
  }

  return {
    select(selectedKey, legalKeys) {
      state.selectedKey = selectedKey
      state.legalKeys = [...new Set(legalKeys)]
      state.illegalKey = null
      state.illegalUntil = 0
    },

    clearSelection() {
      state.selectedKey = null
      state.legalKeys = []
    },

    triggerIllegal(key) {
      state.illegalKey = key
      state.illegalUntil = now() + illegalFeedbackMs
    },

    applyMove(destinationKey, won) {
      state.selectedKey = null
      state.legalKeys = []
      state.illegalKey = null
      state.illegalUntil = 0
      state.movingKey = destinationKey
      state.movingUntil = now() + moveFeedbackMs
      state.won = !!won
    },

    snapshot() {
      clearExpired()
      return {
        selectedKey: state.selectedKey,
        legalKeys: [...state.legalKeys],
        illegalKey: state.illegalKey,
        movingKey: state.movingKey,
        won: state.won,
      }
    },
  }
}

export function getCellInteractionClasses(snapshot, key) {
  const classes = []

  if (snapshot.selectedKey === key) classes.push('is-selected')
  if (snapshot.legalKeys.includes(key)) classes.push('is-legal')
  if (snapshot.illegalKey === key) classes.push('is-illegal-feedback')

  return classes
}

export function getPieceInteractionClasses(snapshot, key) {
  return snapshot.movingKey === key ? ['is-moving'] : []
}

export function getBoardInteractionClasses(snapshot) {
  return snapshot.won ? ['is-won'] : []
}

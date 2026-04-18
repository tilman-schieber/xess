function asStringOrNull(value) {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function normalizeModeEntry(entry) {
  if (!entry || typeof entry !== 'object') return undefined
  return {
    enabled: Boolean(entry.enabled),
  }
}

function normalizeModes(modes) {
  if (!modes || typeof modes !== 'object') return undefined

  const normalized = {}
  const random = normalizeModeEntry(modes.random)
  const guided = normalizeModeEntry(modes.guided)
  const tutorial = normalizeModeEntry(modes.tutorial)

  if (random) normalized.random = random
  if (guided) normalized.guided = guided
  if (tutorial) normalized.tutorial = tutorial

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

/**
 * Validate static track metadata against bundled catalogue IDs.
 * Fail-soft: malformed tracks/ids produce warnings and are filtered instead of throwing.
 *
 * @param {{ tracks?: object[], catalogue?: object[] }} input
 * @returns {{ tracks: { id: string, title: string, subtitle?: string, puzzleIds: string[] }[], warnings: object[] }}
 */
export function validateTrackCatalogueIntegrity({ tracks = [], catalogue = [] } = {}) {
  const catalogueIds = new Set(
    Array.isArray(catalogue)
      ? catalogue
        .map(entry => asStringOrNull(entry?.id))
        .filter(Boolean)
      : [],
  )

  const warnings = []
  const normalizedTracks = []
  const firstTrackByPuzzleId = new Map()

  if (!Array.isArray(tracks)) {
    return {
      tracks: [],
      warnings: [{ code: 'invalid-tracks-shape' }],
    }
  }

  tracks.forEach((rawTrack, index) => {
    if (!rawTrack || typeof rawTrack !== 'object') {
      warnings.push({ code: 'invalid-track-shape', index })
      return
    }

    const trackId = asStringOrNull(rawTrack.id) ?? `invalid-track-${index}`
    const title = asStringOrNull(rawTrack.title) ?? trackId
    const subtitle = typeof rawTrack.subtitle === 'string' ? rawTrack.subtitle : undefined
    const modes = normalizeModes(rawTrack.modes)

    const sourceIds = Array.isArray(rawTrack.puzzleIds)
      ? rawTrack.puzzleIds
      : null

    if (!sourceIds) {
      warnings.push({ code: 'invalid-track-puzzle-ids', trackId })
    }

    const filteredPuzzleIds = []
    const localSeen = new Set()

    ;(sourceIds ?? []).forEach((value) => {
      if (typeof value !== 'string') return
      if (localSeen.has(value)) return
      localSeen.add(value)

      if (!catalogueIds.has(value)) {
        warnings.push({ code: 'missing-puzzle-id', trackId, puzzleId: value })
        return
      }

      const firstTrackId = firstTrackByPuzzleId.get(value)
      if (firstTrackId && firstTrackId !== trackId) {
        warnings.push({ code: 'duplicate-puzzle-id', trackId, puzzleId: value, firstTrackId })
        return
      }

      if (!firstTrackId) {
        firstTrackByPuzzleId.set(value, trackId)
      }

      filteredPuzzleIds.push(value)
    })

    if (filteredPuzzleIds.length === 0) {
      warnings.push({ code: 'empty-track', trackId })
    }

    const normalizedTrack = {
      id: trackId,
      title,
      subtitle,
      puzzleIds: filteredPuzzleIds,
    }

    if (modes) {
      normalizedTrack.modes = modes
    }

    normalizedTracks.push(normalizedTrack)
  })

  return { tracks: normalizedTracks, warnings }
}

function asStringOrNull(value) {
  return typeof value === 'string' && value.length > 0 ? value : null
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

    normalizedTracks.push({
      id: trackId,
      title,
      subtitle,
      puzzleIds: filteredPuzzleIds,
    })
  })

  return { tracks: normalizedTracks, warnings }
}

import { describe, it, expect } from 'vitest'
import { validateTrackCatalogueIntegrity } from './contentIntegrity.js'

describe('validateTrackCatalogueIntegrity', () => {
  it('reports and filters missing catalogue ids from tracks', () => {
    const catalogue = [{ id: 'p1' }, { id: 'p2' }]
    const tracks = [
      {
        id: 'alpha',
        title: 'Alpha',
        subtitle: 'Subtitle',
        puzzleIds: ['p1', 'missing-id', 'p2'],
      },
    ]

    const result = validateTrackCatalogueIntegrity({ tracks, catalogue })

    expect(result.tracks).toEqual([
      {
        id: 'alpha',
        title: 'Alpha',
        subtitle: 'Subtitle',
        puzzleIds: ['p1', 'p2'],
      },
    ])
    expect(result.warnings).toContainEqual({
      code: 'missing-puzzle-id',
      trackId: 'alpha',
      puzzleId: 'missing-id',
    })
  })

  it('reports duplicate puzzle ids across tracks and keeps first occurrence', () => {
    const catalogue = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }]
    const tracks = [
      { id: 'alpha', title: 'Alpha', puzzleIds: ['p1', 'p2'] },
      { id: 'beta', title: 'Beta', puzzleIds: ['p2', 'p3'] },
    ]

    const result = validateTrackCatalogueIntegrity({ tracks, catalogue })

    expect(result.tracks).toEqual([
      { id: 'alpha', title: 'Alpha', subtitle: undefined, puzzleIds: ['p1', 'p2'] },
      { id: 'beta', title: 'Beta', subtitle: undefined, puzzleIds: ['p3'] },
    ])
    expect(result.warnings).toContainEqual({
      code: 'duplicate-puzzle-id',
      trackId: 'beta',
      puzzleId: 'p2',
      firstTrackId: 'alpha',
    })
  })

  it('warns for empty/invalid tracks and never throws', () => {
    const catalogue = [{ id: 'p1' }]
    const tracks = [
      { id: 'empty', title: 'Empty', puzzleIds: [] },
      { id: 'invalid-shape', title: 'Invalid', puzzleIds: 'not-an-array' },
      null,
    ]

    expect(() => validateTrackCatalogueIntegrity({ tracks, catalogue })).not.toThrow()

    const result = validateTrackCatalogueIntegrity({ tracks, catalogue })
    expect(result.tracks).toEqual([
      { id: 'empty', title: 'Empty', subtitle: undefined, puzzleIds: [] },
      { id: 'invalid-shape', title: 'Invalid', subtitle: undefined, puzzleIds: [] },
    ])
    expect(result.warnings).toEqual([
      { code: 'empty-track', trackId: 'empty' },
      { code: 'invalid-track-puzzle-ids', trackId: 'invalid-shape' },
      { code: 'empty-track', trackId: 'invalid-shape' },
      { code: 'invalid-track-shape', index: 2 },
    ])
  })
})

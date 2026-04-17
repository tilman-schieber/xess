import { describe, expect, it } from 'vitest'
import { getPieceSvg, getPieceSvgKey, PIECE_SVGS } from './pieces.js'

const EXPECTED_KEYS = [
  'white-k',
  'white-q',
  'white-r',
  'white-b',
  'white-n',
  'white-p',
  'black-k',
  'black-q',
  'black-r',
  'black-b',
  'black-n',
  'black-p',
]

describe('piece asset contracts', () => {
  it('resolves all 12 whitelisted keys to non-empty SVG payloads', () => {
    expect(Object.keys(PIECE_SVGS).sort()).toEqual([...EXPECTED_KEYS].sort())

    for (const key of EXPECTED_KEYS) {
      const [color, type] = key.split('-')
      const svg = getPieceSvg({ color, type })
      expect(typeof svg).toBe('string')
      expect(svg.trim().length).toBeGreaterThan(0)
    }
  })

  it('rejects unknown piece keys', () => {
    expect(() => getPieceSvgKey({ color: 'white', type: 'dragon' })).toThrow(/Unknown piece key/)
    expect(() => getPieceSvg({ color: 'gold', type: 'q' })).toThrow(/Unknown piece key/)
    expect(() => getPieceSvgKey({})).toThrow(/Unknown piece key/)
  })

  it('returns SVG payloads with <svg root and stable viewBox', () => {
    for (const key of EXPECTED_KEYS) {
      const [color, type] = key.split('-')
      const svg = getPieceSvg({ color, type })

      expect(svg).toContain('<svg')
      expect(svg).toMatch(/viewBox="0 0 45 45"/)
    }
  })
})

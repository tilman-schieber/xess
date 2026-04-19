import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import { sanitizePuzzleDescription } from './puzzleDescriptionSanitizer.js'

function parseBody(html) {
  const dom = new JSDOM(`<body>${html}</body>`)
  return dom.window.document.body
}

describe('sanitizePuzzleDescription', () => {
  const sanitizerWindow = new JSDOM('').window

  it('preserves allowlisted rich formatting tags', () => {
    const clean = sanitizePuzzleDescription('<p>Line <em>one</em><br><strong>bold</strong></p><ul><li>Item</li></ul>', { window: sanitizerWindow })
    const body = parseBody(clean)

    expect(body.querySelector('p')).not.toBeNull()
    expect(body.querySelector('em')?.textContent).toBe('one')
    expect(body.querySelector('strong')?.textContent).toBe('bold')
    expect(body.querySelectorAll('br')).toHaveLength(1)
    expect(body.querySelectorAll('ul li')).toHaveLength(1)
  })

  it('removes disallowed tags and attributes', () => {
    const clean = sanitizePuzzleDescription('<p onclick="evil()" style="color:red">safe</p><script>alert(1)</script><iframe src="https://x.com"></iframe>', { window: sanitizerWindow })
    const body = parseBody(clean)

    expect(body.querySelector('script')).toBeNull()
    expect(body.querySelector('iframe')).toBeNull()
    expect(body.querySelector('p')?.hasAttribute('onclick')).toBe(false)
    expect(body.querySelector('p')?.hasAttribute('style')).toBe(false)
    expect(body.textContent).not.toContain('alert(1)')
  })

  it('neutralizes unsafe javascript links', () => {
    const clean = sanitizePuzzleDescription('<a href="javascript:alert(1)">go</a><a href="https://xess.example">safe</a>', { window: sanitizerWindow })
    const body = parseBody(clean)
    const links = [...body.querySelectorAll('a')]

    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toBeNull()
    expect(links[1].getAttribute('href')).toBe('https://xess.example')
  })
})

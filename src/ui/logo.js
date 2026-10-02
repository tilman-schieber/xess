// src/ui/logo.js
// The Xess mark: a 5×5 board where only the X-shaped squares exist, with the
// goal square in the centre. Same artwork as public/logo-mark.svg.

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">
  <defs>
    <linearGradient id="xess-tile" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eef1ff"/>
      <stop offset="1" stop-color="#c3cdf0"/>
    </linearGradient>
    <linearGradient id="xess-goal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9f5d8"/>
      <stop offset="1" stop-color="#8fdcaa"/>
    </linearGradient>
  </defs>
  <rect x="1.40" y="1.40" width="17.20" height="17.20" rx="4.40" fill="url(#xess-tile)"/>
  <rect x="81.40" y="1.40" width="17.20" height="17.20" rx="4.40" fill="url(#xess-tile)"/>
  <rect x="21.40" y="21.40" width="17.20" height="17.20" rx="4.40" fill="url(#xess-tile)"/>
  <rect x="61.40" y="21.40" width="17.20" height="17.20" rx="4.40" fill="url(#xess-tile)"/>
  <rect x="41.40" y="41.40" width="17.20" height="17.20" rx="4.40" fill="url(#xess-goal)"/>
  <rect x="21.40" y="61.40" width="17.20" height="17.20" rx="4.40" fill="url(#xess-tile)"/>
  <rect x="61.40" y="61.40" width="17.20" height="17.20" rx="4.40" fill="url(#xess-tile)"/>
  <rect x="1.40" y="81.40" width="17.20" height="17.20" rx="4.40" fill="url(#xess-tile)"/>
  <rect x="81.40" y="81.40" width="17.20" height="17.20" rx="4.40" fill="url(#xess-tile)"/>
</svg>`

let _domParser = null

/** @returns {SVGElement} the mark as an inline SVG element */
export function renderLogoMark() {
  if (!_domParser) _domParser = new DOMParser()
  const svg = _domParser.parseFromString(MARK_SVG, 'image/svg+xml').documentElement
  svg.setAttribute('class', 'logo-mark')
  return svg
}

/** Wordmark lockup: the mark stands in for the X, followed by "ess". */
export function renderLogo() {
  const logo = document.createElement('span')
  logo.className = 'logo'
  logo.setAttribute('role', 'img')
  logo.setAttribute('aria-label', 'Xess')
  const rest = document.createElement('span')
  rest.className = 'logo-rest'
  rest.setAttribute('aria-hidden', 'true')
  rest.textContent = 'ess'
  logo.append(renderLogoMark(), rest)
  return logo
}

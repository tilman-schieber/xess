// src/ui/achievementToast.js
// Celebration popup for newly unlocked achievements. Lives on <body>, outside the
// app root, so screen re-renders never restart or remove a running animation.

import { getPieceSvg } from './pieces.js'

const VISIBLE_MS = 5200
const STAGGER_MS = 700
const SPARK_COUNT = 10

let _domParser = null

function getHost() {
  let host = document.querySelector('[data-achievement-toasts]')
  if (!host) {
    host = document.createElement('div')
    host.className = 'achievement-toasts'
    host.setAttribute('data-achievement-toasts', 'true')
    host.setAttribute('role', 'status')
    host.setAttribute('aria-live', 'polite')
    document.body.append(host)
  }
  return host
}

function renderToast(entry) {
  if (!_domParser) _domParser = new DOMParser()

  const toast = document.createElement('button')
  toast.type = 'button'
  toast.className = 'achievement-toast'
  toast.setAttribute('data-achievement-toast', entry.id)
  toast.setAttribute('aria-label', `Achievement unlocked: ${entry.title}. Plus ${entry.points} points. Dismiss`)

  const badge = document.createElement('span')
  badge.className = 'achievement-toast-badge'
  const svgEl = _domParser
    .parseFromString(getPieceSvg({ type: entry.piece, color: 'white' }), 'image/svg+xml')
    .documentElement
  svgEl.querySelectorAll('script, foreignObject').forEach(node => node.remove())
  badge.append(svgEl)

  // Sparks fly outward from the badge
  for (let i = 0; i < SPARK_COUNT; i += 1) {
    const spark = document.createElement('span')
    spark.className = 'achievement-toast-spark'
    spark.style.setProperty('--angle', `${Math.round((360 / SPARK_COUNT) * i)}deg`)
    spark.style.setProperty('--reach', `${34 + (i % 3) * 9}px`)
    badge.append(spark)
  }

  const body = document.createElement('span')
  body.className = 'achievement-toast-body'
  const label = document.createElement('span')
  label.className = 'achievement-toast-label'
  label.textContent = 'Achievement unlocked'
  const title = document.createElement('strong')
  title.className = 'achievement-toast-title'
  title.textContent = entry.title
  const copy = document.createElement('span')
  copy.className = 'achievement-toast-copy'
  copy.textContent = entry.description
  body.append(label, title, copy)

  const points = document.createElement('span')
  points.className = 'achievement-toast-points'
  points.textContent = `+${entry.points}`

  toast.append(badge, body, points)
  return toast
}

/**
 * Show one popup per achievement, staggered, each dismissing itself (or on tap).
 *
 * @param {{ id: string, title: string, description: string, piece: string, points: number }[]} achievements
 */
export function showAchievementToasts(achievements) {
  if (typeof document === 'undefined' || !Array.isArray(achievements) || achievements.length === 0) return
  const host = getHost()

  achievements.forEach((entry, index) => {
    const toast = renderToast(entry)
    toast.style.setProperty('--delay', `${index * STAGGER_MS}ms`)

    const dismiss = () => {
      if (toast.classList.contains('is-leaving')) return
      toast.classList.add('is-leaving')
      setTimeout(() => toast.remove(), 320)
    }
    toast.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      dismiss()
    })
    toast.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') dismiss()
    })
    setTimeout(dismiss, VISIBLE_MS + index * STAGGER_MS)

    host.append(toast)
  })
}

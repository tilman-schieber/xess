// src/ui/pwaPrompts.js
import { registerSW } from 'virtual:pwa-register'
import '../styles/pwa-prompts.css'

// ─── iOS install banner ────────────────────────────────────────────────────

const IOS_DISMISSED_KEY = 'xess-ios-prompt-dismissed'

function isIosSafari() {
  const ua = navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua)
  const isNativeSafari = !/(CriOS|FxiOS|OPiOS|mercury)/i.test(ua)
  const isStandalone = window.navigator.standalone === true
  return isIos && isNativeSafari && !isStandalone
}

function buildIosBanner() {
  const banner = document.createElement('div')
  banner.className = 'pwa-ios-banner'
  banner.setAttribute('role', 'banner')
  banner.setAttribute('aria-label', 'Install Xess')
  banner.innerHTML = `
    <div class="pwa-ios-banner__content">
      <span class="pwa-ios-banner__icon" aria-hidden="true">⬆</span>
      <p class="pwa-ios-banner__text">
        Install Xess: tap
        <span class="pwa-ios-banner__share-icon" aria-label="Share button">&#x2BC8;</span>
        then <strong>Add to Home Screen</strong>
      </p>
      <button
        class="pwa-ios-banner__close"
        aria-label="Dismiss install prompt"
        type="button"
      >✕</button>
    </div>
  `
  banner.querySelector('.pwa-ios-banner__close').addEventListener('click', () => {
    localStorage.setItem(IOS_DISMISSED_KEY, '1')
    banner.remove()
  })
  return banner
}

function maybeShowIosBanner() {
  if (!isIosSafari()) return
  if (localStorage.getItem(IOS_DISMISSED_KEY)) return
  const banner = buildIosBanner()
  document.body.appendChild(banner)
}

// ─── SW update banner ─────────────────────────────────────────────────────

function buildUpdateBanner(updateFn) {
  const banner = document.createElement('div')
  banner.className = 'pwa-update-banner'
  banner.setAttribute('role', 'alert')
  banner.setAttribute('aria-live', 'polite')
  banner.innerHTML = `
    <p class="pwa-update-banner__text">A new version of Xess is available.</p>
    <button
      class="pwa-update-banner__reload"
      type="button"
    >Reload</button>
  `
  banner.querySelector('.pwa-update-banner__reload').addEventListener('click', () => {
    updateFn(true)
  })
  return banner
}

// ─── Public API ───────────────────────────────────────────────────────────

export function initPwaPrompts() {
  maybeShowIosBanner()

  const updateServiceWorker = registerSW({
    onNeedRefresh() {
      const banner = buildUpdateBanner(updateServiceWorker)
      document.body.appendChild(banner)
    },
    onOfflineReady() {},
    onRegisterError(error) {
      console.warn('[pwa] SW registration error:', error)
    },
  })
}

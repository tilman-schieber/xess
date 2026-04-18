// src/sound.js
//
// Web Audio synthesis for Xess — no audio files, no network requests.
// All sounds are programmatically synthesized using the Web Audio API.
//
// Public API:
//   initSound()        — lifecycle hook, call at app startup (currently no-op)
//   playMove()         — brief tick on piece move
//   playSolve()        — ascending arpeggio on puzzle solve
//   isSoundEnabled()   — returns current preference (boolean)
//   toggleSound()      — flips preference, writes to localStorage, returns new boolean

const STORAGE_KEY = 'xess-sound-enabled'

// Session-level fallback when storage access fails (private mode, quota, etc.).
// Null means "defer to persisted storage state".
let _sessionSoundEnabled = null

// Module-level AudioContext — created lazily on first sound call.
// iOS Safari requires AudioContext to be created inside a user gesture handler.
// We call getCtx() only from playMove/playSolve, which are always triggered by
// user taps, so we meet the gesture requirement.
let _ctx = null

function resumeCtxSafe(ctx) {
  if (!ctx || ctx.state !== 'suspended') return
  try {
    const maybePromise = ctx.resume()
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {})
    }
  } catch {
    // Fail silent: resume failures must never block gameplay interactions
  }
}

function getCtx() {
  if (_ctx) {
    resumeCtxSafe(_ctx)
    return _ctx
  }
  const Ctor =
    typeof globalThis !== 'undefined' && typeof globalThis.AudioContext !== 'undefined'
      ? globalThis.AudioContext
      : typeof globalThis !== 'undefined' && typeof globalThis.webkitAudioContext !== 'undefined'
        ? globalThis.webkitAudioContext
        : null
  if (!Ctor) return null
  try {
    _ctx = new Ctor()
    resumeCtxSafe(_ctx)
    return _ctx
  } catch {
    return null
  }
}

function primeSoundContext() {
  getCtx()
}

// ─── Preference ──────────────────────────────────────────────────────────────

export function isSoundEnabled() {
  if (typeof _sessionSoundEnabled === 'boolean') {
    return _sessionSoundEnabled
  }

  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function toggleSound() {
  const next = !isSoundEnabled()
  _sessionSoundEnabled = next

  try {
    localStorage.setItem(STORAGE_KEY, String(next))
  } catch {
    // Ignore storage errors (private browsing quotas, etc.)
  }
  if (next) {
    // Explicit enable path occurs during a user gesture; prime context eagerly.
    primeSoundContext()
  }
  return next
}

// ─── Low-level synthesis ─────────────────────────────────────────────────────

/**
 * Schedule a single synthesized tone on the AudioContext timeline.
 * @param {number} frequency  - Hz
 * @param {number} duration   - seconds
 * @param {number} gain       - 0..1 peak amplitude
 * @param {'sine'|'triangle'|'square'|'sawtooth'} type - oscillator waveform
 * @param {number} [startOffset=0] - seconds from ctx.currentTime to start
 */
function scheduleTone(frequency, duration, gain, type, startOffset = 0) {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + startOffset)

    gainNode.gain.setValueAtTime(gain, ctx.currentTime + startOffset)
    // Exponential fade prevents click artifacts at tone end
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + startOffset + duration,
    )

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(ctx.currentTime + startOffset)
    osc.stop(ctx.currentTime + startOffset + duration)
  } catch {
    // Silently swallow all Web Audio errors — sound is strictly optional
  }
}

// ─── Sound events ─────────────────────────────────────────────────────────────

/**
 * Brief soft tick on piece move.
 * Triangle wave at 520 Hz, 80ms — subtle, not distracting.
 */
export function playMove() {
  if (!isSoundEnabled()) return
  scheduleTone(520, 0.08, 0.18, 'triangle')
}

/**
 * Short ascending arpeggio on puzzle solve.
 * C5 (523 Hz) → E5 (659 Hz) → G5 (784 Hz), each 90ms apart.
 * Three-tone major chord resolves with a satisfying "win" feel.
 */
export function playSolve() {
  if (!isSoundEnabled()) return
  const notes = [523, 659, 784]
  notes.forEach((freq, i) => {
    scheduleTone(freq, 0.18, 0.28, 'sine', i * 0.09)
  })
}

// ─── Init ────────────────────────────────────────────────────────────────────

/**
 * Call once at app startup.
 * AudioContext is created lazily; this function exists as an explicit lifecycle
 * marker so main.js documents its dependency on this module.
 */
export function initSound() {
  // No-op intentionally. AudioContext deferred to first user gesture.
}

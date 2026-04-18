import { afterEach, describe, expect, it, vi } from 'vitest'

function createStorage(seed = {}) {
  const state = new Map(Object.entries(seed))
  return {
    getItem: vi.fn(key => (state.has(key) ? state.get(key) : null)),
    setItem: vi.fn((key, value) => {
      state.set(key, String(value))
    }),
    removeItem: vi.fn(key => {
      state.delete(key)
    }),
    clear: vi.fn(() => {
      state.clear()
    }),
  }
}

function installAudioMock({ throwOnCtor = false, throwOnOscillator = false } = {}) {
  const resume = vi.fn(() => Promise.resolve())
  const createdOscillators = []

  class MockAudioContext {
    constructor() {
      if (throwOnCtor) throw new Error('ctor failed')
      this.state = 'suspended'
      this.currentTime = 10
      this.destination = {}
      this.resume = resume
    }

    createOscillator() {
      if (throwOnOscillator) throw new Error('oscillator failed')
      const osc = {
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }
      createdOscillators.push(osc)
      return osc
    }

    createGain() {
      return {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }
    }
  }

  globalThis.AudioContext = vi.fn(() => new MockAudioContext())
  globalThis.webkitAudioContext = undefined

  return { resume, createdOscillators }
}

async function loadSoundModule() {
  vi.resetModules()
  return import('./sound.js')
}

afterEach(() => {
  vi.restoreAllMocks()
  delete globalThis.AudioContext
  delete globalThis.webkitAudioContext
  delete globalThis.localStorage
})

describe('sound contract', () => {
  it('defaults to muted unless storage value is explicitly true', async () => {
    globalThis.localStorage = createStorage({ 'xess-sound-enabled': 'false' })
    let sound = await loadSoundModule()
    expect(sound.isSoundEnabled()).toBe(false)

    globalThis.localStorage = createStorage({ 'xess-sound-enabled': 'true' })
    sound = await loadSoundModule()
    expect(sound.isSoundEnabled()).toBe(true)

    globalThis.localStorage = createStorage({ 'xess-sound-enabled': '1' })
    sound = await loadSoundModule()
    expect(sound.isSoundEnabled()).toBe(false)
  })

  it('toggleSound persists preference and returns new state', async () => {
    const storage = createStorage({ 'xess-sound-enabled': 'false' })
    globalThis.localStorage = storage
    installAudioMock()
    const sound = await loadSoundModule()

    const enabled = sound.toggleSound()
    expect(enabled).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith('xess-sound-enabled', 'true')
    expect(sound.isSoundEnabled()).toBe(true)

    const disabled = sound.toggleSound()
    expect(disabled).toBe(false)
    expect(storage.setItem).toHaveBeenCalledWith('xess-sound-enabled', 'false')
    expect(sound.isSoundEnabled()).toBe(false)
  })

  it('playMove and playSolve do nothing when muted', async () => {
    globalThis.localStorage = createStorage({ 'xess-sound-enabled': 'false' })
    const { createdOscillators } = installAudioMock()
    const sound = await loadSoundModule()

    sound.playMove()
    sound.playSolve()

    expect(globalThis.AudioContext).not.toHaveBeenCalled()
    expect(createdOscillators).toHaveLength(0)
  })

  it('swallows Web Audio failures and never throws', async () => {
    globalThis.localStorage = createStorage({ 'xess-sound-enabled': 'true' })
    installAudioMock({ throwOnOscillator: true })
    const sound = await loadSoundModule()

    expect(() => sound.playMove()).not.toThrow()
    expect(() => sound.playSolve()).not.toThrow()

    globalThis.localStorage = createStorage({ 'xess-sound-enabled': 'true' })
    installAudioMock({ throwOnCtor: true })
    const ctorFailing = await loadSoundModule()
    expect(() => ctorFailing.playMove()).not.toThrow()
  })
})

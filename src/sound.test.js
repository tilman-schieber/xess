import { beforeEach, describe, expect, it, vi } from 'vitest'

function makeStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: vi.fn((key) => (data.has(key) ? data.get(key) : null)),
    setItem: vi.fn((key, value) => {
      data.set(key, String(value))
    }),
  }
}

function makeAudioContext({
  shouldThrowInCtor = false,
  shouldThrowInSchedule = false,
  state = 'running',
  resumeImpl,
} = {}) {
  const scheduled = []
  const stats = { instances: 0, resumeCalls: 0 }
  class MockAudioContext {
    constructor() {
      if (shouldThrowInCtor) throw new Error('ctor failed')
      stats.instances += 1
      this.state = state
      this.currentTime = 1
      this.destination = {}
    }

    resume() {
      stats.resumeCalls += 1
      if (resumeImpl) return resumeImpl()
      return Promise.resolve()
    }

    createOscillator() {
      return {
        type: 'triangle',
        frequency: {
          setValueAtTime: vi.fn((freq, at) => {
            if (shouldThrowInSchedule) throw new Error('osc failed')
            scheduled.push({ kind: 'freq', freq, at })
          }),
        },
        connect: vi.fn(),
        start: vi.fn((at) => {
          if (shouldThrowInSchedule) throw new Error('start failed')
          scheduled.push({ kind: 'start', at })
        }),
        stop: vi.fn((at) => {
          scheduled.push({ kind: 'stop', at })
        }),
      }
    }

    createGain() {
      return {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn((value, at) => {
            if (shouldThrowInSchedule) throw new Error('gain failed')
            scheduled.push({ kind: 'ramp', value, at })
          }),
        },
        connect: vi.fn(),
      }
    }
  }

  return { MockAudioContext, scheduled, stats }
}

async function loadSoundModule() {
  vi.resetModules()
  return import('./sound.js')
}

describe('sound contract', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults to muted unless storage flag is explicitly true', async () => {
    vi.stubGlobal('localStorage', makeStorage())
    let sound = await loadSoundModule()
    expect(sound.isSoundEnabled()).toBe(false)

    vi.stubGlobal('localStorage', makeStorage({ 'xess-sound-enabled': 'true' }))
    sound = await loadSoundModule()
    expect(sound.isSoundEnabled()).toBe(true)

    vi.stubGlobal('localStorage', makeStorage({ 'xess-sound-enabled': 'TRUE' }))
    sound = await loadSoundModule()
    expect(sound.isSoundEnabled()).toBe(false)
  })

  it('toggleSound persists preference and returns the new state', async () => {
    const storage = makeStorage()
    vi.stubGlobal('localStorage', storage)
    const sound = await loadSoundModule()

    expect(sound.toggleSound()).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith('xess-sound-enabled', 'true')

    expect(sound.toggleSound()).toBe(false)
    expect(storage.setItem).toHaveBeenLastCalledWith('xess-sound-enabled', 'false')
  })

  it('playMove/playSolve are no-ops while muted', async () => {
    const storage = makeStorage({ 'xess-sound-enabled': 'false' })
    const { MockAudioContext, scheduled } = makeAudioContext()
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('AudioContext', MockAudioContext)

    const sound = await loadSoundModule()
    sound.playMove()
    sound.playSolve()

    expect(scheduled).toHaveLength(0)
  })

  it('swallows audio API failures and never throws', async () => {
    vi.stubGlobal('localStorage', makeStorage({ 'xess-sound-enabled': 'true' }))

    const ctorFail = makeAudioContext({ shouldThrowInCtor: true })
    vi.stubGlobal('AudioContext', ctorFail.MockAudioContext)
    let sound = await loadSoundModule()
    expect(() => sound.playMove()).not.toThrow()

    const scheduleFail = makeAudioContext({ shouldThrowInSchedule: true })
    vi.stubGlobal('AudioContext', scheduleFail.MockAudioContext)
    sound = await loadSoundModule()
    expect(() => sound.playSolve()).not.toThrow()

    const resumeSyncThrow = makeAudioContext({
      state: 'suspended',
      resumeImpl: () => {
        throw new Error('resume failed synchronously')
      },
    })
    vi.stubGlobal('AudioContext', resumeSyncThrow.MockAudioContext)
    sound = await loadSoundModule()
    expect(() => sound.playMove()).not.toThrow()
    expect(() => sound.playMove()).not.toThrow()
  })

  it('enabling sound primes shared context through gesture-safe lifecycle', async () => {
    vi.stubGlobal('localStorage', makeStorage({ 'xess-sound-enabled': 'false' }))
    const audio = makeAudioContext({ state: 'suspended' })
    vi.stubGlobal('AudioContext', audio.MockAudioContext)

    const sound = await loadSoundModule()
    expect(sound.toggleSound()).toBe(true)

    expect(audio.stats.instances).toBe(1)
    expect(audio.stats.resumeCalls).toBe(1)
  })

  it('schedules deterministic move/solve tones only when enabled', async () => {
    vi.stubGlobal('localStorage', makeStorage({ 'xess-sound-enabled': 'false' }))
    const audio = makeAudioContext()
    vi.stubGlobal('AudioContext', audio.MockAudioContext)

    const sound = await loadSoundModule()
    sound.playMove()
    sound.playSolve()
    expect(audio.scheduled).toHaveLength(0)

    sound.toggleSound()
    sound.playMove()
    sound.playSolve()

    const frequencies = audio.scheduled
      .filter(event => event.kind === 'freq')
      .map(event => event.freq)

    expect(frequencies).toEqual([520, 523, 659, 784])
  })
})

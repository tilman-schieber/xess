// Loaded before every test file (vitest.config.js → setupFiles).
// jsdom has no ResizeObserver, but the game screen creates one on render.
// Nothing in the tests depends on layout, so a no-op stand-in is enough.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

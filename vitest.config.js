// vitest.config.js
import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      'virtual:pwa-register': path.resolve(__dirname, 'src/__mocks__/virtual_pwa-register_vanilla.js'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    setupFiles: ['src/test-setup.js'],
    globals: false,
    passWithNoTests: true,
  },
})

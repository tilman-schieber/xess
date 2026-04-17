import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      strategies: 'generateSW',
      includeAssets: [
        'icons/icon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'Xess',
        short_name: 'Xess',
        description: 'Chess puzzles with non-standard boards',
        theme_color: '#090d16',
        background_color: '#090d16',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache everything Vite emits. The glob patterns below cover JS
        // chunks, CSS, SVG pieces, font files, and puzzle data.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        // Do not skip waiting — plan 05-02 controls activation via prompt.
        skipWaiting: false,
        clientsClaim: true,
        // Runtime cache: nothing — this is fully offline-first with precache only.
        runtimeCaching: [],
      },
      // Dev options: enable SW in dev mode so we can test offline behavior
      // during development with `vite dev`. Set to false if SW interferes.
      devOptions: {
        enabled: false,
      },
    }),
  ],
})

# Phase 05 Plan 01: PWA Icons, Manifest, and Service Worker Summary

## One-liner

Full PWA stack: SVG icon source + 3 PNG sizes generated via sharp, vite-plugin-pwa configured with generateSW strategy, web app manifest, and offline precaching of all 41 assets (506 KB).

## What Was Built

- **`public/icons/icon.svg`** — Canonical vector logo: navy (#090d16) rounded-rect background with teal (#61d9a7) bold "X" letterform
- **`scripts/generate-icons.js`** — Node ESM script using `sharp` to rasterize SVG to 3 PNG sizes
- **`public/icons/icon-192.png`** — 192×192 PNG for Android/Chrome installability
- **`public/icons/icon-512.png`** — 512×512 PNG for splash screen
- **`public/icons/apple-touch-icon.png`** — 180×180 PNG for iOS Safari Add to Home Screen
- **`vite.config.js`** — Rewritten with VitePWA plugin (registerType: 'prompt', generateSW, full manifest, workbox precache config)
- **`index.html`** — Updated head: theme-color meta, apple-touch-icon link, updated favicon links

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `public/icons/icon.svg` | Created | Vector source logo |
| `public/icons/icon-192.png` | Created | 4.2 KB, 192×192 |
| `public/icons/icon-512.png` | Created | 16 KB, 512×512 |
| `public/icons/apple-touch-icon.png` | Created | 3.8 KB, 180×180 |
| `scripts/generate-icons.js` | Created | sharp-based rasterizer |
| `vite.config.js` | Rewritten | VitePWA plugin with full config |
| `index.html` | Updated | theme-color, apple-touch-icon, updated icons |
| `package.json` | Updated | Added sharp, vite-plugin-pwa as devDependencies |

## Verification Results

All checks passed:

```
✓ public/icons/icon-192.png  — 4332 bytes
✓ public/icons/icon-512.png  — 16463 bytes
✓ public/icons/apple-touch-icon.png — 3931 bytes
✓ dist/sw.js — generated (3698 bytes)
✓ dist/manifest.webmanifest — present
✓ Manifest: name "Xess", display "standalone", 4 icon entries (192×2, 512×2)
✓ Build: 41 entries precached (506.65 KiB)
```

Build output:
```
PWA v1.2.0
mode      generateSW
precache  41 entries (506.65 KiB)
files generated
  dist/sw.js
  dist/workbox-8c29f6e4.js
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vite-plugin-pwa peer dependency conflict with Vite 8**

- **Found during:** Task 2 install step
- **Issue:** `vite-plugin-pwa@1.2.0` declares peer: `vite@"^3.1.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"` — doesn't yet list Vite 8 despite working with it
- **Fix:** Used `--legacy-peer-deps` flag. Plugin works correctly with Vite 8 (build succeeded, SW and manifest generated)
- **Files modified:** None (install flag only)

## Key Decisions

- **`registerType: 'prompt'`** not `autoUpdate` — plan 05-02 owns the update-prompt UI
- **`skipWaiting: false`** — paired with prompt registration; activation controlled by user
- **`clientsClaim: true`** — new SW takes control of existing open tabs after activation
- **`devOptions.enabled: false`** — SW not active in dev to avoid cache interference during development

## Self-Check

- ✅ `public/icons/icon-192.png` — exists (4332 bytes)
- ✅ `public/icons/icon-512.png` — exists (16463 bytes)
- ✅ `public/icons/apple-touch-icon.png` — exists (3931 bytes)
- ✅ `dist/sw.js` — exists
- ✅ `dist/manifest.webmanifest` — exists, passes all assertions
- ✅ Commit `ee01657` — verified in git log

---
phase: "05-pwa-and-launch-readiness"
plan: "05-02"
subsystem: "pwa"
tags: [pwa, service-worker, ios, install-prompt, update-banner]
dependency-graph:
  requires: ["05-01"]
  provides: ["SW update banner", "iOS install prompt", "initPwaPrompts"]
  affects: ["src/main.js", "src/ui/pwaPrompts.js", "src/styles/pwa-prompts.css"]
tech-stack:
  added: ["virtual:pwa-register (vite-plugin-pwa virtual module)", "registerSW API"]
  patterns: ["fixed-position banner", "localStorage dismissal persistence", "UA-based iOS detection"]
key-files:
  created:
    - src/ui/pwaPrompts.js
    - src/styles/pwa-prompts.css
    - src/__mocks__/virtual_pwa-register_vanilla.js
  modified:
    - src/main.js
    - vitest.config.js
decisions:
  - "Used `registerSW` from `virtual:pwa-register` (not `useRegisterSW` from `virtual:pwa-register/vanilla`) — the 'vanilla' subpath does not exist in vite-plugin-pwa 1.2.0; the base module exports `registerSW` which returns the update function directly"
  - "Guarded `initPwaPrompts()` call with `typeof window !== 'undefined'` in main.js to prevent test failures in node environment"
  - "Added vitest alias for `virtual:pwa-register` to a mock module since Vitest cannot resolve Vite virtual modules"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-17"
  tasks: 2
  files: 5
---

# Phase 05 Plan 02: SW Update Banner and iOS Install Prompt Summary

**One-liner:** `registerSW`-based PWA update banner (top) and iOS Safari install banner (bottom) with localStorage dismissal persistence.

## What Was Built

- **`src/ui/pwaPrompts.js`** — exports `initPwaPrompts()` that wires both banners
  - iOS banner: bottom-fixed, shown only on iOS Safari (not Chrome/Firefox on iOS, not standalone), dismissed permanently via `xess-ios-prompt-dismissed` in localStorage
  - SW update banner: top-fixed, shown when `onNeedRefresh` fires from `registerSW`, "Reload" calls `updateServiceWorker()` to skip waiting and reload

- **`src/styles/pwa-prompts.css`** — styles for both banners using app CSS tokens (`--surface-card`, `--accent`, `--border-subtle`, `--text-secondary`), with `backdrop-filter: blur(8px)`, slide-in animations, and iOS safe-area inset padding

- **`src/main.js`** — calls `initPwaPrompts()` at startup (guarded with `typeof window !== 'undefined'`)

- **`src/__mocks__/virtual_pwa-register_vanilla.js`** — Vitest mock for the virtual module

- **`vitest.config.js`** — added `resolve.alias` for `virtual:pwa-register` to the mock file

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `virtual:pwa-register/vanilla` does not exist in vite-plugin-pwa 1.2.0**
- **Found during:** Task 1 (build verification)
- **Issue:** The plan specified `import { useRegisterSW } from 'virtual:pwa-register/vanilla'` but this subpath is not in the VIRTUAL_MODULES_MAP of vite-plugin-pwa 1.2.0. The map only includes `virtual:pwa-register`, `virtual:pwa-register/vue`, `/svelte`, `/react`, `/preact`, `/solid`. The build failed with "Rolldown failed to resolve import".
- **Fix:** Changed to `import { registerSW } from 'virtual:pwa-register'` and adjusted the call pattern from `const { updateServiceWorker } = useRegisterSW(...)` to `const updateServiceWorker = registerSW(...)` (returns the function directly, not a destructured object)
- **Files modified:** `src/ui/pwaPrompts.js`
- **Commit:** 05f93bd

**2. [Rule 2 - Missing guard] `initPwaPrompts()` crashed in node test environment**
- **Found during:** Task 2 (test run)
- **Issue:** `initPwaPrompts()` was called unconditionally at module load time in main.js; `window` is not defined in the Vitest node environment, causing 2 test suites to fail
- **Fix:** Wrapped call with `if (typeof window !== 'undefined')`
- **Files modified:** `src/main.js`
- **Commit:** 05f93bd

**3. [Rule 3 - Blocking] Vitest cannot resolve Vite virtual modules**
- **Found during:** Task 2 (test run)  
- **Issue:** `virtual:pwa-register` is a Vite virtual module provided at build time; Vitest cannot resolve it
- **Fix:** Created `src/__mocks__/virtual_pwa-register_vanilla.js` stub and added alias in `vitest.config.js`
- **Files modified:** `vitest.config.js`, `src/__mocks__/virtual_pwa-register_vanilla.js`
- **Commit:** 05f93bd

## Verification Results

- ✅ `npm test -- --run`: 167/167 tests passed (13 test files)
- ✅ `npm run build`: succeeded, dist/sw.js and workbox generated, 43.31 kB JS bundle

## Self-Check: PASSED

- `src/ui/pwaPrompts.js` — FOUND ✅
- `src/styles/pwa-prompts.css` — FOUND ✅
- `src/__mocks__/virtual_pwa-register_vanilla.js` — FOUND ✅
- Commit 05f93bd — FOUND ✅

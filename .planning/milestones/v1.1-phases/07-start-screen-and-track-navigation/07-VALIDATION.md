---
phase: 7
slug: start-screen-and-track-navigation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-18
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.js` |
| **Quick run command** | `npm test -- src/puzzles/nav.test.js src/ui/startScreen.test.js src/ui/trackBrowser.test.js src/main.track-navigation.test.js --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~20-45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/puzzles/nav.test.js src/ui/startScreen.test.js src/ui/trackBrowser.test.js src/main.track-navigation.test.js --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | TRK-02, TRK-03 | T-07-01 / T-07-02 | Track grouping uses static local metadata only, no dynamic HTML | unit | `npm test -- src/puzzles/nav.test.js --run` | ✅ | ⬜ pending |
| 07-01-02 | 01 | 1 | TRK-04 | T-07-03 | Resume target resolved by pure helper rules | unit | `npm test -- src/puzzles/nav.test.js --run` | ✅ | ⬜ pending |
| 07-02-01 | 02 | 1 | TRK-01 | T-07-04 | Start screen labels rendered via textContent | unit/dom | `npm test -- src/ui/startScreen.test.js --run` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 1 | TRK-02, TRK-03 | T-07-04 | Track browser renders static text and numbered entries per track | unit/dom | `npm test -- src/ui/trackBrowser.test.js --run` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 2 | TRK-01, TRK-04 | T-07-05 | Screen transitions respect explicit state machine only | integration | `npm test -- src/main.track-navigation.test.js --run` | ❌ W0 | ⬜ pending |
| 07-03-02 | 03 | 2 | UXP-03 | T-07-04 | Shared spacing tokens applied across start/track/play screens | integration/css | `npm test -- src/main.track-navigation.test.js src/main.gap-ux.test.js --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/ui/startScreen.test.js` — start screen renderer tests for TRK-01
- [ ] `src/ui/trackBrowser.test.js` — track grouping/browse tests for TRK-02/TRK-03
- [ ] `src/main.track-navigation.test.js` — app flow tests for TRK-01/TRK-04/UXP-03

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

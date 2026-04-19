---
phase: 8
slug: track-compatibility-and-launch-content-robustness
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-18
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.js` |
| **Quick run command** | `npm test -- src/puzzles/nav.test.js src/store/store.test.js src/controller.test.js --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~25-50 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/puzzles/nav.test.js src/store/store.test.js src/controller.test.js --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | CNT-01, CNT-02 | T-08-01 | Invalid track references are filtered without crashing launch flow | unit | `npm test -- src/puzzles/nav.test.js --run` | ✅ | ⬜ pending |
| 08-01-02 | 01 | 1 | TRK-05 | T-08-02 | Optional mode metadata accepted; unknown fields ignored safely | unit | `npm test -- src/puzzles/nav.test.js --run` | ✅ | ⬜ pending |
| 08-02-01 | 02 | 1 | TRK-06 | T-08-03 | Stale IDs are dropped while valid solved/active records are preserved | unit | `npm test -- src/store/store.test.js --run` | ✅ | ⬜ pending |
| 08-02-02 | 02 | 1 | CNT-01, TRK-06 | T-08-04 | Controller rehydration preserves valid progress and falls back safely on stale state | unit/integration | `npm test -- src/controller.test.js --run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

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

---
phase: 13
slug: ui-liquid-glass-visual-redesign-and-mode-affordances
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-20
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.js` |
| **Quick run command** | `npm test -- --run src/main.ui.test.js src/main.gap-ux.test.js src/controller.test.js` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run src/main.ui.test.js src/main.gap-ux.test.js src/controller.test.js`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | VIS-01, VIS-02, VIS-03 | T-13-03 | Gameplay chrome uses centralized tokens and preserves readable contrast under redesigned surfaces | integration | `npm test -- --run src/main.ui.test.js src/main.gap-ux.test.js` | ✅ | ✅ green |
| 13-01-02 | 01 | 1 | VIS-01, VIS-02, VIS-03 | T-13-01, T-13-02 | Selected/legal/illegal affordances stay translucent cell overlays and reach-mode styling remains correctly scoped | integration | `npm test -- --run src/main.ui.test.js src/main.gap-ux.test.js` | ✅ | ✅ green |
| 13-02-01 | 02 | 2 | VIS-01, VIS-02 | T-13-05 | Visual contract assertions detect selector/overlay regressions without brittle screenshot dependence | unit/integration | `npm test -- --run src/main.ui.test.js src/main.gap-ux.test.js` | ✅ | ✅ green |
| 13-02-02 | 02 | 2 | MODE-04, MODE-05 | T-13-04, T-13-06 | Capture and reach legality rules remain behaviorally distinct and protected by controller/UI regressions | unit/integration | `npm test -- --run src/controller.test.js src/main.ui.test.js && npm test -- --run` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-20

## Validation Audit 2026-04-20

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

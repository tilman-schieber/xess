---
phase: 3
slug: board-renderer-and-core-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.js` |
| **Quick run command** | `npm test -- src/ui/boardRenderer.test.js src/main.ui.test.js --run` |
| **Full suite command** | `npm test --run && npm run build` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/ui/boardRenderer.test.js src/main.ui.test.js --run`
- **After every plan wave:** Run `npm test --run && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | RND-01, RND-04 | T-03-01 | Renderer never treats missing map keys as playable | unit | `npm test -- src/ui/boardRenderer.test.js --run` | ✅ / ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | RND-02 | T-03-02 | Goal/void/normal classes map only from trusted cell state | unit | `npm test -- src/ui/boardRenderer.test.js --run` | ✅ / ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | INT-01, INT-02 | T-03-03 | UI validates target against legal set before move call | integration | `npm test -- src/main.ui.test.js --run` | ✅ / ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | INT-05 | T-03-04 | Animation class timing constrained to 150–200ms | integration | `npm test -- src/main.ui.test.js --run` | ✅ / ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | RND-03, VIS-02 | T-03-05 | Touch targets remain >=44px at mobile viewport | integration | `npm test -- src/main.ui.test.js --run` | ✅ / ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/ui/boardRenderer.test.js` — renderer contract tests for shape/void/goal classes
- [ ] `src/main.ui.test.js` — interaction + responsive behavior tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Piece transition feels smooth on touch device | INT-05 | Perceptual animation quality on real device | `npm run dev`, open on 375px viewport, move piece and confirm ~180ms smooth transition |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 1
slug: puzzle-format-and-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | vitest.config.js (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | FMT-01 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | FMT-02, FMT-03 | — | N/A | unit | `npx vitest run src/puzzle/` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | FMT-04, FMT-05 | — | N/A | unit | `npx vitest run src/puzzle/` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | ENG-01, ENG-02 | — | N/A | unit | `npx vitest run src/engine/` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 2 | ENG-03, ENG-04 | — | N/A | unit | `npx vitest run src/engine/` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 2 | ENG-05, ENG-06 | — | N/A | unit | `npx vitest run src/engine/` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 3 | ENG-07, ENG-08 | — | N/A | unit | `npx vitest run src/engine/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — Vite + Vitest install via `npm create vite@latest` + `npm install -D vitest`
- [ ] `vitest.config.js` — basic config pointing at `src/`
- [ ] `src/puzzle/` directory stubs for FMT requirements
- [ ] `src/engine/` directory stubs for ENG requirements

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| None | — | — | — |

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

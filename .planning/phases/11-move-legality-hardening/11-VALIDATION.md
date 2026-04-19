---
phase: 11
slug: move-legality-hardening
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-19
---

# Phase 11 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | vitest |
| Config | `vitest.config.js` |
| Quick run | `npm test -- src/puzzles/loader.test.js src/engine/moves.test.js src/controller.test.js --run` |
| Full run | `npm test -- --run` |
| Runtime target | < 60 seconds for targeted suites |

## Sampling Rate

- After each task commit: run the task's targeted Vitest command.
- After each plan: run plan-level grouped legality tests.
- Before phase verification: run full suite.

## Per-Task Verification Map

| Task ID | Plan | Requirement | Threat Ref | Automated Command | Status |
|---------|------|-------------|------------|-------------------|--------|
| 11-01-01 | 01 | LOGIC-01 | T-11-01 | `npm test -- src/puzzles/loader.test.js src/puzzles/catalogue.test.js --run` | ⬜ pending |
| 11-01-02 | 01 | LOGIC-01 | T-11-02 | `npm test -- src/puzzles/contentIntegrity.test.js --run` | ⬜ pending |
| 11-02-01 | 02 | LOGIC-01 | T-11-03 | `npm test -- src/engine/moves.test.js src/engine/index.test.js --run` | ⬜ pending |
| 11-02-02 | 02 | LOGIC-01 | T-11-04 | `npm test -- src/engine/apply.test.js --run` | ⬜ pending |
| 11-03-01 | 03 | LOGIC-02 | T-11-05 | `npm test -- src/controller.test.js --run` | ⬜ pending |
| 11-03-02 | 03 | LOGIC-02 | T-11-06 | `npm test -- src/controller.test.js src/engine/apply.test.js --run` | ⬜ pending |

## Wave 0 Requirements

Existing test infrastructure is sufficient. No Wave 0 scaffolding required.

## Validation Sign-Off

- [ ] All tasks include automated verification commands.
- [ ] No 3 consecutive tasks without automated checks.
- [ ] Full suite green before phase completion.
- [ ] `nyquist_compliant: true` set after execution evidence.

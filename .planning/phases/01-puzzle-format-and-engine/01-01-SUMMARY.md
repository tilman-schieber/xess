---
phase: 01-puzzle-format-and-engine
plan: 01
subsystem: puzzle-format
tags: [scaffold, puzzle-format, loader, catalogue, vitest, tdd]
dependency_graph:
  requires: []
  provides:
    - src/puzzles/catalogue.js
    - src/puzzles/loader.js
  affects:
    - src/engine/ (future — imports posKey, parseKey from loader.js)
    - src/puzzles/ (all future puzzle authoring follows catalogue.js format)
tech_stack:
  added:
    - vite@8.0.8 (dev server + bundler)
    - vitest@4.1.4 (test runner, node environment)
  patterns:
    - board as Map<"col,row", Cell> — impassable squares absent, not flagged
    - lowercase=white/uppercase=black piece encoding (FEN-style)
    - per-pawn direction vector stored on piece object
    - passWithNoTests in vitest config for runner to exit 0 with no files
key_files:
  created:
    - package.json
    - vite.config.js
    - vitest.config.js
    - index.html
    - src/main.js
    - .gitignore
    - src/puzzles/catalogue.js
    - src/puzzles/loader.js
    - src/puzzles/loader.test.js
    - src/puzzles/catalogue.test.js
  modified: []
decisions:
  - "passWithNoTests: true added to vitest.config.js — vitest 4.x exits 1 with no test files, which would fail CI on the scaffold-only commit"
  - "T-01-03 mitigation implemented: typeof rowStr !== 'string' guard in parsePuzzle rows.forEach"
  - "posKey and parseKey exported as named exports (not just constants) for engine imports"
metrics:
  duration: "3m 6s"
  completed: "2026-04-16T21:04:44Z"
  tasks_completed: 2
  files_created: 10
  files_modified: 0
---

# Phase 01 Plan 01: Scaffold Vite Project and Puzzle Format Layer Summary

**One-liner:** Vite 8 + Vitest 4 project scaffolded from zero; text-grid puzzle format locked with parsePuzzle converting catalogue entries to board Map<string,Cell> with 20 passing tests covering FMT-01 through FMT-05.

## What Was Built

The project started as a single `CLAUDE.md` file. This plan delivered:

1. **Project scaffold** — `package.json` with `type: module`, Vite 8, Vitest 4; `vitest.config.js` with node environment and `passWithNoTests`; minimal `index.html` and `src/main.js`.

2. **Puzzle catalogue** — `src/puzzles/catalogue.js` with 2 sample puzzles: one `capture-all-targets` (Corner Trap) and one `reach-all-goal-squares` (Find the Square), using the locked text-grid format.

3. **Puzzle loader** — `src/puzzles/loader.js` exporting `parsePuzzle`, `posKey`, and `parseKey`. `parsePuzzle` converts raw catalogue objects into runtime Puzzle objects with a `Map<string, Cell>` board where impassable squares (`x`) are entirely absent, piece color is determined by char case, pawn direction is stored per-piece, and schema version is validated.

4. **Test suite** — 20 tests across `loader.test.js` (16 cases, TDD RED then GREEN) and `catalogue.test.js` (4 assertions). All pass green.

## Commits

| Hash | Message |
|------|---------|
| f68ac92 | chore(01-01): scaffold Vite + Vitest project |
| f0ad737 | feat(01-01): add puzzle catalogue, loader, and passing tests |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] passWithNoTests added to vitest config**
- **Found during:** Task 1 verification
- **Issue:** `npx vitest run` exits code 1 when no test files are found (vitest 4.x behavior). The plan acceptance criteria required exit 0 before any test files existed.
- **Fix:** Added `passWithNoTests: true` to `vitest.config.js`
- **Files modified:** `vitest.config.js`
- **Commit:** f68ac92

**2. [Rule 2 - Missing Critical Functionality] T-01-03 null-row guard implemented**
- **Found during:** Task 2 implementation (threat model review)
- **Issue:** Threat model item T-01-03 required `parsePuzzle` to guard against rows that are not strings
- **Fix:** Added `if (typeof rowStr !== 'string') return` before the `[...rowStr].forEach` spread in `parsePuzzle`
- **Files modified:** `src/puzzles/loader.js`
- **Commit:** f0ad737

**3. [Rule 3 - Blocking] Vite scaffold used manual file creation instead of `npm create vite`**
- **Found during:** Task 1 execution
- **Issue:** `npm create vite@latest . -- --template vanilla --yes` cancelled when run non-interactively (the `--yes` flag was not honoured in the current create-vite version). Piped stdin also had no effect.
- **Fix:** Created all standard Vite vanilla template files manually (`index.html`, `src/main.js`, `vite.config.js`, `package.json`) matching what the scaffold would produce, then ran `npm install`.
- **Files modified:** All scaffold files
- **Commit:** f68ac92

## Known Stubs

None — all exports are fully implemented. The `src/main.js` placeholder (`document.querySelector('#app').innerHTML = '<h1>Xess</h1>'`) is intentional: UI is out of scope for Phase 1.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries beyond what the plan's threat model already covers.

## TDD Gate Compliance

- RED gate: loader tests written first, confirmed failing (14 failures against stub)
- GREEN gate: implementation written, all 20 tests passing
- No REFACTOR commit needed — code was clean on first pass

## Self-Check: PASSED

All 9 key files found. Both commits (f68ac92, f0ad737) verified in git log. All 20 tests pass (exit 0).

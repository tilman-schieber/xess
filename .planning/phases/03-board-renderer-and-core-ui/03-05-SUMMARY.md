---
phase: 03-board-renderer-and-core-ui
plan: 05
subsystem: ui
tags: [svg, assets, licensing, vitest, renderer]

# Dependency graph
requires:
  - phase: 03-board-renderer-and-core-ui
    provides: strict piece key whitelist and renderer integration contracts from plan 01
provides:
  - Curated open-licensed SVG piece assets for all 12 white/black type combinations
  - Static asset import mapping in `pieces.js` that preserves allow-list key validation
  - Contract tests for key coverage, unknown-key rejection, and SVG payload shape
  - In-repo asset attribution metadata for audit/distribution readiness
affects: [phase-04-visual-polish, ui-rendering, asset-compliance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Piece SVG payloads come from static local imports (`?raw`), never dynamic paths
    - Asset payloads are normalized to stable `viewBox="0 0 45 45"` for deterministic rendering tests

key-files:
  created:
    - src/ui/pieces.test.js
    - src/ui/piece-assets/white-k.svg
    - src/ui/piece-assets/white-q.svg
    - src/ui/piece-assets/white-r.svg
    - src/ui/piece-assets/white-b.svg
    - src/ui/piece-assets/white-n.svg
    - src/ui/piece-assets/white-p.svg
    - src/ui/piece-assets/black-k.svg
    - src/ui/piece-assets/black-q.svg
    - src/ui/piece-assets/black-r.svg
    - src/ui/piece-assets/black-b.svg
    - src/ui/piece-assets/black-n.svg
    - src/ui/piece-assets/black-p.svg
    - src/ui/piece-assets/ATTRIBUTION.md
  modified:
    - src/ui/pieces.js

key-decisions:
  - "Adopted the open-licensed Cburnett Wikimedia set and stored exact local SVG copies under src/ui/piece-assets/."
  - "Kept security boundary unchanged by mapping runtime keys only through fixed `color-type` whitelist entries and static imports."

patterns-established:
  - "Piece asset upgrades must keep the 12-key contract test suite green before merge."
  - "Attribution for bundled third-party visual assets is mandatory and versioned in-repo."

requirements-completed: [RND-04, VIS-02]

# Metrics
duration: 5 min
completed: 2026-04-17
---

# Phase 3 Plan 5: Curated Piece Asset Pack Summary

**Board rendering now uses the open-licensed Cburnett chess SVG set with strict static key mapping, stable SVG payload contracts, and auditable attribution metadata.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-17T12:18:51Z
- **Completed:** 2026-04-17T12:24:37Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Added failing-first contract tests to enforce 12-key coverage, unknown-key rejection, and stable SVG structure constraints.
- Replaced placeholder inline piece SVG strings with curated static local assets for all white/black piece types.
- Added `ATTRIBUTION.md` with source URLs, artist credit, and redistribution license obligations.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add failing contract tests for curated SVG asset mapping** - `e939617` (test)
2. **Task 2: Replace inline placeholder SVGs with open-licensed curated assets + attribution** - `2196f4a` (feat)

**Plan metadata:** `4a623e7` (docs: complete plan)

## Files Created/Modified
- `src/ui/pieces.test.js` - Contract tests for whitelist coverage, unknown-key rejection, and SVG payload invariants.
- `src/ui/pieces.js` - Static `?raw` SVG imports, strict key validation, and stable viewBox normalization.
- `src/ui/piece-assets/*.svg` - Curated Cburnett white/black piece assets for all 12 piece keys.
- `src/ui/piece-assets/ATTRIBUTION.md` - Licensing/provenance record for bundled third-party SVGs.

## Decisions Made
- Selected Wikimedia Commons Cburnett assets to satisfy visual-quality goals while remaining compatible with open licensing.
- Kept piece selection deterministic and bounded to the fixed whitelist to preserve DOM injection safety guarantees.

## Deviations from Plan

None - plan executed exactly as written.

## Authentication Gates

None.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Curated piece visuals and attribution tracking are in place; Phase 4 can build on these assets for broader visual polish work without reopening security or licensing foundations.

## Self-Check: PASSED

- FOUND: `.planning/phases/03-board-renderer-and-core-ui/03-05-SUMMARY.md`
- FOUND: `e939617`
- FOUND: `2196f4a`

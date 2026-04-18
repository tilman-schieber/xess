# Phase 8: Track Compatibility and Launch Content Robustness - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 8 hardens the puzzle content and persistence boundary introduced in Phase 7: launch puzzles remain fully playable from bundled local assets, and existing solved/in-progress user data keeps working after the track-first indexing shift.

</domain>

<decisions>
## Implementation Decisions

### Launch Content Source and Delivery
- **D-01 [auto]:** Keep launch puzzle content as build-bundled local modules (no runtime fetch path for catalogue/track data).
- **D-02 [auto]:** Treat `src/puzzles/catalogue.js` + `src/puzzles/tracks.js` as the launch source of truth; planning should harden validation around these assets rather than introducing a second data source.

### Compatibility and Persistence Strategy
- **D-03 [auto]:** Preserve compatibility by keeping `solvedIds` and `activeState.puzzleId` keyed by stable puzzle IDs, not track position/index.
- **D-04 [auto]:** Add a non-destructive migration/sanitization path: invalid or stale IDs are ignored safely, but valid solved/in-progress records are retained.

### Future-Ready Track Metadata
- **D-05 [auto]:** Extend track metadata with optional mode-entry fields (`random`, `guided`, `tutorial`) in a backward-compatible shape that does not alter current start/track/play flow.
- **D-06 [auto]:** Unknown future mode fields must fail soft (ignored by current UI) rather than break track rendering or puzzle launch.

### Robustness Guards
- **D-07 [auto]:** Add startup consistency checks for track-to-catalogue references (missing/duplicate/empty cases) with graceful degradation rather than app crash.
- **D-08 [auto]:** If inconsistencies exist, keep the app playable by filtering invalid references and preserving valid puzzle launch paths.

### Claude's Discretion
- Exact error/telemetry surface for content-integrity warnings (console-only vs lightweight UI hint) as long as it does not create a runtime dependency or block play.
- Exact naming of any new metadata keys, provided the schema stays optional and backward compatible.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and Requirements
- `.planning/ROADMAP.md` — Phase 8 goal, success criteria, and dependency position.
- `.planning/REQUIREMENTS.md` — `CNT-01`, `CNT-02`, `TRK-05`, `TRK-06` acceptance anchors.
- `.planning/PROJECT.md` — local-first/browser-only constraints that prohibit runtime backend dependencies.

### Existing Track and Puzzle Data Contracts
- `src/puzzles/catalogue.js` — launch puzzle content currently bundled as static module data.
- `src/puzzles/tracks.js` — static track metadata and per-track puzzle ID membership.
- `src/puzzles/nav.js` — track navigation and launch selection behavior contract.

### Persistence and Runtime Integration
- `src/store/store.js` — persisted `schemaVersion`, `solvedIds`, and `activeState` shape.
- `src/controller.js` — load/save compatibility path and track launch resolution entrypoint.
- `src/main.js` — start/tracks/play routing and track-browser integration points.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/puzzles/nav.js`: Pure helpers already encapsulate track/cross-track launch behavior and unknown-track safety.
- `src/store/store.js`: Existing sanitization helpers provide a natural migration-hardening point.
- `src/controller.js`: Central load/rehydration workflow is the right place to preserve compatibility guarantees.

### Established Patterns
- Puzzle and track data are currently static imports (`catalogue.js`, `tracks.js`) with no runtime network requirement.
- Persistence uses localStorage with schema-gated, fail-safe defaults rather than hard failures.
- Unknown IDs and missing data often return safe null/empty values instead of throwing in user-facing paths.

### Integration Points
- Phase 8 should primarily touch `src/puzzles/*` data/validation contracts plus `src/store/store.js` and `src/controller.js` compatibility logic.
- `src/main.js` and track UI should consume hardened data contracts without changing the visible Phase 7 flow.

</code_context>

<specifics>
## Specific Ideas

- Keep launch content robustness focused on shipped placeholder set readiness (immediate play after install/update), not content-authoring expansion.
- Prefer deterministic fallback behavior over strict failure for malformed track references so users can still access valid puzzles.

</specifics>

<deferred>
## Deferred Ideas

- Server-synced or remotely fetched catalogue/track content distribution.
- Full mode implementation for random/guided/tutorial (Phase 8 only prepares metadata compatibility).

</deferred>

---

*Phase: 08-track-compatibility-and-launch-content-robustness*
*Context gathered: 2026-04-18*

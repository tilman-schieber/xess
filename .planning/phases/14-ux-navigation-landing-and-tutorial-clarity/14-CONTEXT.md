# Phase 14: UX Navigation, Landing, and Tutorial Clarity - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a clearer UX shell and onboarding flow so first-time and returning players can reliably navigate landing, tracks, and play, then understand and access tutorial content with context-aware actions.

This phase clarifies navigation and onboarding behavior inside existing app modes (`start`, `tracks`, `play`) and does not add new gameplay capabilities.

</domain>

<decisions>
## Implementation Decisions

### Shell navigation model
- **D-01:** Use a persistent top bar shell as the shared navigation frame across start, tracks, and play views.
- **D-02:** In play mode, expose global navigation through a top-bar menu button rather than always-visible global nav rows around the board.
- **D-03:** Back navigation from play should return to the last selected track context by default.
- **D-04:** Keep the same information architecture across desktop and mobile, but adapt presentation density by breakpoint.

### Landing action strategy
- **D-05:** Landing should be a dashboard with contextual action cards, not a single CTA.
- **D-06:** Phase-14 landing cards are: Continue, Tutorial, and Browse Tracks.
- **D-07:** Tutorial card is hidden after either tutorial completion or explicit user dismissal.
- **D-08:** Continue card falls back to best next action when active puzzle is missing/stale (prefer first unsolved in last relevant track, else route to track browsing prompt).
- **D-09:** Show compact progress chips (for example active track and solved/total context) rather than dense listings on landing.

### Claude's Discretion
- Exact top-bar visual composition and icon/label pairing, provided touch targets and clarity remain strong.
- Exact fallback copy and empty-state phrasing for Continue/Tutorial cards.
- Exact compact progress chip formatting and truncation behavior.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirement contract
- `.planning/ROADMAP.md` — Phase 14 goal, requirement mapping, and success criteria.
- `.planning/REQUIREMENTS.md` — NAV-01, NAV-02, ONB-01, ONB-02, MODE-03 definitions and pending status.
- `.planning/PROJECT.md` — milestone intent and onboarding clarity priorities.
- `.planning/STATE.md` — current milestone/phase execution state.

### Existing UX flow baseline
- `src/main.js` — current mode routing (`start`, `tracks`, `play`), back-to-track behavior, and interaction wiring.
- `src/ui/startScreen.js` — current landing/start renderer contract.
- `src/ui/trackBrowser.js` — current track overview/detail renderer contract.
- `src/puzzles/tracks.js` — track metadata including tutorial flags.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/main.js`: central mode orchestration and routing hooks for start/tracks/play transitions.
- `src/ui/startScreen.js`: pure renderer contract suitable for expanding into dashboard-style contextual actions.
- `src/ui/trackBrowser.js`: reusable card/list interaction patterns and keyboard activation helpers.
- `src/controller.js`: local progress-derived launch helpers (`getTrackLaunchPuzzleId`) for Continue fallback behavior.

### Established Patterns
- Pure UI renderers with callback-only contracts and no store/controller imports inside UI modules.
- Pointer-first interaction with Enter/Space keyboard parity on actionable elements.
- Local progress and navigation decisions delegated through controller/nav helpers rather than ad-hoc DOM state.

### Integration Points
- Shell and responsive behavior: `src/styles/app.css`, `src/styles/start-screen.css`, `src/styles/track-browser.css`.
- Landing decision logic and routing: `src/main.js` + controller snapshot accessors.
- Regression anchors for UX/nav behavior: `src/main.track-navigation.test.js`, `src/ui/startScreen.test.js`, `src/ui/trackBrowser.test.js`.

</code_context>

<specifics>
## Specific Ideas

- User wants a dashboard-like landing that surfaces contextual actions, not a minimal one-button entry.
- Tutorial should stay visible until complete or explicitly dismissed.
- Landing should feel context-aware through compact, readable progress chips.

</specifics>

<deferred>
## Deferred Ideas

- Solve random puzzle from landing dashboard (`MODE-01`) was requested but remains out of scope for Phase 14 and should be handled in a future phase/backlog entry.

</deferred>

---

*Phase: 14-ux-navigation-landing-and-tutorial-clarity*
*Context gathered: 2026-04-20*

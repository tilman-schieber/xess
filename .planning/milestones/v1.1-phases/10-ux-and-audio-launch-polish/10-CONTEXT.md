# Phase 10: UX and Audio Launch Polish - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 10 delivers a launch-quality polish pass on existing gameplay surfaces: touch-first control ergonomics, readable completion messaging, closure of known interaction rough edges, and predictable opt-in sound behavior. This phase refines current start/track/play flows and audio feedback; it does not introduce new game modes, new puzzle mechanics, or backend/services.

</domain>

<decisions>
## Implementation Decisions

### Touch-Target Coverage and Enforcement
- **D-01 [auto]:** Keep `--touch-target-min: 44px` as the single source of truth and enforce it consistently on all primary interactive controls across start, track browser, and play screens.
- **D-02 [auto]:** Treat touch-target compliance as selector-level contract coverage (buttons and puzzle list tap targets), not visual approximation via padding alone.

### Completion Messaging Layout
- **D-03 [auto]:** Rework solved-state messaging to a structured, multi-line layout with explicit spacing so headline and action CTA remain readable on narrow mobile widths.
- **D-04 [auto]:** Keep two distinct completion states: "puzzle solved + next action" and "all puzzles solved"; both must use predictable line breaks and avoid cramped inline rendering.

### Interaction Rough-Edge Polish Scope
- **D-05 [auto]:** Focus launch rough-edge fixes on high-frequency input seams already present in play flow (tap vs drag transitions, accidental double trigger paths, and post-cancel selection clarity).
- **D-06 [auto]:** Standardize tap-driven primary UI actions on pointer events for mobile parity while preserving keyboard activation where already supported.

### Opt-In Audio Reliability
- **D-07 [auto]:** Sound remains strictly off by default and only activates after explicit user toggle persisted in local storage.
- **D-08 [auto]:** Preserve one shared lazy `AudioContext` lifecycle and ensure context resume/creation happens inside gesture-safe interaction paths so first enabled feedback is reliable on iOS Safari.
- **D-09 [auto]:** Audio errors remain fail-silent (never block gameplay or navigation), but move/solve cues should trigger deterministically on successful move outcomes when enabled.

### the agent's Discretion
- Exact solved-banner visual treatment (stack spacing, text emphasis, CTA alignment) so long as UXP-02 readability criteria are met.
- Exact selector list for touch-target regression assertions as long as all primary controls in scoped screens are covered.
- Exact audio synthesis tuning (waveform/gain/duration) while preserving opt-in behavior and event reliability.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and Requirement Anchors
- `.planning/ROADMAP.md` — Phase 10 goal, success criteria, and dependency boundary.
- `.planning/REQUIREMENTS.md` — `SND-02`, `UXP-01`, `UXP-02`, `UXP-04` acceptance anchors.
- `.planning/PROJECT.md` — mobile-first and local-first constraints for launch polish.

### Prior Context to Carry Forward
- `.planning/phases/08-track-compatibility-and-launch-content-robustness/08-CONTEXT.md` — fail-soft behavior and compatibility conventions to preserve during polish.
- `.planning/phases/09-puzzle-rich-text-content/09-CONTEXT.md` — puzzle metadata layout and sanitized description integration already established in play UI.
- `.planning/phases/07-start-screen-and-track-navigation/07-02-SUMMARY.md` — established pointerdown and 44px touch-target conventions for start/track surfaces.

### UX and Audio Integration Surfaces
- `src/main.js` — solved banner composition, primary play controls wiring, and sound toggle/event trigger integration points.
- `src/styles/app.css` — shared touch-target token, win banner styling, and sound-toggle styling baseline.
- `src/styles/start-screen.css` — start-screen primary/secondary action touch-target contract.
- `src/styles/track-browser.css` — track browser action and puzzle-row touch-target contract.
- `src/ui/dragDrop.js` — drag/tap threshold and pointer-capture behavior relevant to rough-edge fixes.
- `src/sound.js` — shared `AudioContext`, opt-in preference persistence, and move/solve cue scheduling behavior.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/sound.js`: Already implements shared lazy `AudioContext`, explicit opt-in storage key, and move/solve cue APIs.
- `src/main.js`: Centralized rendering and interaction wiring for win banner, nav actions, drag-drop callbacks, and sound trigger points.
- `src/ui/dragDrop.js`: Existing pointer-based drag/drop adapter with threshold and cancel paths to refine.

### Established Patterns
- Pointer events are the primary interaction model across gameplay and track/start actions.
- Touch-target sizing is tokenized via `--touch-target-min` and already applied in multiple screen stylesheets.
- UX regressions are guarded by behavior/style tests (for example `main.gap-ux.test.js` and renderer tests) rather than manual-only checks.

### Integration Points
- Apply completion-message layout adjustments in `renderToDom` + `app.css` win banner styles.
- Apply touch-target and rough-edge polish across `app.css`, `start-screen.css`, `track-browser.css`, and relevant play-control event handlers in `main.js`.
- Apply audio reliability hardening in `sound.js` and sound-toggle behavior in `main.js`.

</code_context>

<specifics>
## Specific Ideas

- Sound affordance should remain explicit and user-controlled (clear mute/unmute state, no surprise playback).
- Completion feedback should feel decisive but lightweight: readable solved headline first, action second.
- Keep polish changes focused on launch friction points rather than introducing new capability surface.

</specifics>

<deferred>
## Deferred Ideas

- Expanded sound design (additional cues, volume controls, or music tracks) beyond launch move/solve feedback.
- New post-solve celebration systems (confetti/particle effects) beyond readability and layout polish.
- Additional input paradigms (gesture shortcuts, haptics) not required to satisfy current launch criteria.

</deferred>

---

*Phase: 10-ux-and-audio-launch-polish*
*Context gathered: 2026-04-18*

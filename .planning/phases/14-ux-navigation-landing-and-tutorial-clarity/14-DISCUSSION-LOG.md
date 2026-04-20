# Phase 14: UX Navigation, Landing, and Tutorial Clarity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20T17:55:30.838Z
**Phase:** 14-ux-navigation-landing-and-tutorial-clarity
**Areas discussed:** Shell navigation model, Landing action strategy

---

## Shell navigation model

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent top bar only | Keep a single top app bar visible in start/tracks/play; avoids footer crowding on mobile. | ✓ |
| Top bar + bottom tab bar | Adds stronger destination discoverability but consumes vertical space. | |
| Mode-specific shells | Tailored chrome per mode with higher implementation complexity. | |

**User's choice:** Persistent top bar only.
**Notes:** User accepted recommended low-friction shell baseline.

| Option | Description | Selected |
|--------|-------------|----------|
| Menu button in top bar | Single top-bar menu for global nav so gameplay controls stay focused. | ✓ |
| Always-visible nav row | Faster direct access but competes with gameplay chrome. | |
| Slide-in edge panel only | Clean visuals with lower discoverability. | |

**User's choice:** Menu button in top bar.
**Notes:** Keep global navigation discoverable without persistent board-adjacent clutter.

| Option | Description | Selected |
|--------|-------------|----------|
| Return to last selected track | Preserves player context when exiting play mode. | ✓ |
| Always go to track overview | Predictable reset but extra taps for focused progression. | |
| Smart by puzzle state | Adaptive but less transparent pathing. | |

**User's choice:** Return to last selected track.
**Notes:** Matches existing selected-track routing contract.

| Option | Description | Selected |
|--------|-------------|----------|
| Same IA, different presentation | Keep destinations identical; adapt nav density by viewport. | ✓ |
| Desktop expanded, mobile reduced | More direct desktop controls, reduced mobile actions. | |
| Identical visual layout everywhere | Simplifies styling but hurts small-screen ergonomics. | |

**User's choice:** Same IA, different presentation.
**Notes:** Strong cross-device mental model with responsive rendering.

---

## Landing action strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Freeform direction | Dashboard-like landing with context-dependent actions. | ✓ |
| Start tutorial first | Strong guided onboarding-first single CTA. | |
| Browse tracks first | Discovery-first, weaker guidance. | |
| Continue/start smart CTA | Adaptive single CTA, less explicit tutorial discoverability. | |

**User's choice:** Freeform dashboard with context-dependent actions.
**Notes:** User explicitly requested a multi-action dashboard. Mentioned actions included continue, tutorial, and random puzzle.

| Option | Description | Selected |
|--------|-------------|----------|
| Continue + Tutorial + Browse tracks | Balanced contextual action set within phase scope. | ✓ |
| Continue + Browse tracks only | Simpler but weaker onboarding cue. | |
| Tutorial + Browse tracks only | Better onboarding, weaker return flow. | |

**User's choice:** Continue + Tutorial + Browse tracks.
**Notes:** Random puzzle request captured as deferred (out of current phase scope).

| Option | Description | Selected |
|--------|-------------|----------|
| Hide after complete or explicit dismiss | Tutorial remains visible until solved or dismissed. | ✓ |
| Hide only after completion | Always show until completion. | |
| Never hide, only de-emphasize | Persistent discoverability with reduced prominence. | |

**User's choice:** Hide after complete or explicit dismiss.
**Notes:** Matches user-stated context-dependent tutorial visibility requirement.

| Option | Description | Selected |
|--------|-------------|----------|
| Fallback to next best action | Continue routes to valid unsolved/start path if active state is stale. | ✓ |
| Hide Continue card | Removes dead states but drops continuity affordance. | |
| Disabled Continue with explanation | Keeps layout symmetry with a non-interactive card. | |

**User's choice:** Fallback to next best action.
**Notes:** Keep return-player velocity high while tolerating stale local progress pointers.

| Option | Description | Selected |
|--------|-------------|----------|
| Compact progress chips | Lightweight contextual status on action cards. | ✓ |
| Detailed per-track list | Rich data but visually heavy for landing. | |
| No progress metadata | Cleanest visuals, lowest contextual guidance. | |

**User's choice:** Compact progress chips.
**Notes:** Maintain dashboard readability without dense lists.

---

## Claude's Discretion

- Visual details of top bar and card treatment.
- Exact progress-chip copy and formatting.
- Exact empty/fallback wording for stale continue state.

## Deferred Ideas

- Random puzzle dashboard action (`MODE-01`) — out of Phase 14 scope; defer to future phase/backlog.

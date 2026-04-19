# Phase 7 UI Design Contract

**Phase:** 7 — Start Screen and Track Navigation  
**Status:** ready
**Date:** 2026-04-18

## UX Intent

Create a clear 3-screen flow:
1. **Start screen** (entry point)
2. **Track browser** (grouped navigation)
3. **Puzzle play** (existing board UI)

The user should never land directly in puzzle play on initial app open.

## Information Architecture

### Screen A — Start Screen
- Primary heading: `Xess`
- Supporting copy: one short sentence explaining track-based play
- Primary CTA: `Start`
- Secondary CTA (optional): `Resume`

### Screen B — Track Browser
- Heading: `Tracks`
- Track cards/list sections, each with:
  - Track title
  - Track subtitle/short description
  - Progress text (`Solved X / Y`)
  - CTA buttons: `Open`, `Resume`

### Screen C — Puzzle Play
- Existing board and controls remain
- Replace global list affordance with `Tracks` back affordance to return to track browser context

## Interaction Rules

1. App boot shows Start Screen first.
2. Start CTA transitions to Track Browser.
3. Open Track transitions to per-track puzzle list view.
4. Selecting puzzle launches puzzle play.
5. Resume from a track launches active puzzle in that track if present; otherwise first unsolved puzzle in that track.
6. Back from play returns to track context (not a global flat list modal).

## Visual Rules (UXP-03)

- Reuse spacing scale from `src/styles/app.css` (`--space-*`)
- Reuse typography scale from `src/styles/app.css` (`--text-*`)
- Minimum tap targets remain `>=44px`
- Keep card/surface style aligned with existing `--surface-card` + `--border-subtle`
- Keep one primary action hierarchy per screen (single strongest button style)

## Accessibility Rules

- All CTAs are semantic `button` elements
- Screen headings use semantic heading tags (`h1`/`h2`)
- Keyboard support for actionable list items/cards (`Enter`/`Space`)
- No color-only status communication; pair status with text labels

## Out of Scope for Phase 7

- Animated transitions between screens
- Track metadata expansion for random/guided/tutorial modes (Phase 8)
- Rich text puzzle descriptions (Phase 9)

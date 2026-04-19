# Phase 9 Research: Puzzle Rich Text Content

**Phase:** 9 — Puzzle Rich Text Content  
**Date:** 2026-04-18  
**Status:** complete

## Scope Restatement

Phase 9 adds short authored puzzle descriptions in the in-play metadata area, supports curated rich-text formatting, and prevents unsafe markup execution.

Mapped requirements:
- TXT-01: Show a short puzzle description in puzzle UI
- TXT-02: Support curated HTML formatting from author content
- TXT-03: Sanitize/allowlist HTML so unsafe markup does not execute

## Current Codebase Signals

1. `src/puzzles/catalogue.js` is the single bundled content source (offline/local-first already satisfied).
2. `src/puzzles/loader.js` is the runtime shape boundary where optional puzzle metadata is normalized.
3. `src/main.js` renders puzzle metadata via explicit DOM API (`textContent`) and is the integration seam for description placement near objective.
4. Existing tests (`src/puzzles/loader.test.js`, `src/main.gap-ux.test.js`) already protect parser and UI contracts and should be extended for description coverage.

## Discovery Notes (Level 2)

### Options considered
1. Hand-written allowlist sanitizer using `DOMParser`
2. Vetted sanitizer dependency (`dompurify`) with strict `ALLOWED_TAGS`/`ALLOWED_ATTR`

### Recommendation
Use **DOMPurify** for sanitization with a strict, phase-scoped allowlist.

Why:
- Security-critical behavior (TXT-03) is high-risk for hand-rolled implementations.
- DOMPurify supports ESM usage in browser builds and explicit allowlist configuration.
- It aligns with D-03/D-04 (sanitize-before-render + constrained formatting subset).

### Context7 evidence
- `/cure53/dompurify`: ESM import + `sanitize` usage
- `/cure53/dompurify`: `ALLOWED_TAGS` / `ALLOWED_ATTR` allowlist controls

## Recommended Implementation Direction

1. Add a dedicated sanitizer module (`src/ui/puzzleDescriptionSanitizer.js`) that wraps DOMPurify with an explicit allowlist for short formatting-oriented markup (`em`, `strong`, `ul`, `ol`, `li`, `br`, `p`, and tightly constrained links).
2. Extend puzzle loader contract to parse an optional rich-text field (for example `descriptionHtml`) and normalize non-string values to empty string for backward compatibility (D-01, D-06).
3. Integrate sanitized description rendering into `renderToDom` in `src/main.js` directly below/near objective metadata (D-05), with fail-soft suppression when sanitized output is empty (D-06).
4. Add parser, sanitizer, and UI rendering/security tests to prove:
   - optional field compatibility,
   - allowed formatting survives,
   - blocked tags/attributes/events are stripped,
   - no unsafe script execution path.

## Constraints / Non-goals

- No authoring UI/editor tooling (deferred).
- No remote CMS/content sync (deferred).
- No broad markdown/interactive embeds beyond constrained HTML subset (deferred).

## Test Strategy

- `src/puzzles/loader.test.js`: optional `descriptionHtml` normalization and compatibility.
- `src/ui/puzzleDescriptionSanitizer.test.js`: allowlist + strip/disallow cases (events/scripts/javascript: URLs).
- `src/main.gap-ux.test.js`: metadata rendering contract includes rich description block near objective with safe content only.
- Full regression run: `npm test -- --run`.

## Validation Architecture

- Task-level checks: targeted Vitest files per touched subsystem.
- Plan-level checks: grouped targeted suite.
- Phase-level check: full test run.

## Risks and Mitigations

1. **Risk:** Unsafe attributes/URLs sneak through rich text.
   - **Mitigation:** strict allowlist + protocol restrictions + explicit security regression tests (TXT-03).
2. **Risk:** Sanitization strips all content and leaves broken/awkward UI.
   - **Mitigation:** fail-soft render behavior (hide description block when empty after sanitize).
3. **Risk:** Contract extension breaks older puzzle records.
   - **Mitigation:** optional field with default empty string; loader compatibility tests for missing/non-string input.

# Phase 9: Puzzle Rich Text Content - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 9 adds short, authored puzzle descriptions to the in-play puzzle UI with constrained rich-text formatting. The scope covers puzzle-data contract updates, safe rendering behavior, and fail-safe handling of malformed or unsafe markup; it does not add editing tooling or external content delivery.

</domain>

<decisions>
## Implementation Decisions

### Puzzle Content Contract
- **D-01 [auto]:** Extend puzzle catalogue entries with an optional authored description field for rich text (for example `descriptionHtml`) while keeping backward compatibility for puzzles that omit it.
- **D-02 [auto]:** Keep description content bundled in static local puzzle assets (`src/puzzles/catalogue.js`) so rich text remains fully offline and aligned with current content delivery.

### Safe Rich-Text Rendering Model
- **D-03 [auto]:** Render description content through a strict allowlist sanitization path before injecting into the DOM; never trust raw authored HTML.
- **D-04 [auto]:** Use a constrained formatting subset (emphasis, strong, lists, line breaks, links if allowlisted) and strip unsafe tags/attributes/events/scripts.

### In-Play UI Placement and Fallback Behavior
- **D-05 [auto]:** Place the rendered rich-text description in puzzle play metadata near the existing objective block so context is visible without opening another screen.
- **D-06 [auto]:** If description content is empty, invalid, or fully stripped by sanitizer, fail soft by rendering no description (or plain fallback text) without breaking play flow.

### Validation and Regression Protection
- **D-07 [auto]:** Add parser/contract tests for optional description field handling and rendering tests that verify expected formatting appears in the UI.
- **D-08 [auto]:** Add security-focused tests that prove unsafe markup does not execute and disallowed content is removed.

### Claude's Discretion
- Exact field naming (`descriptionHtml` vs equivalent) as long as the contract remains optional and stable.
- Exact sanitizer implementation approach (small local allowlist sanitizer vs tightly scoped dependency) as long as it enforces TXT-03.
- Exact visual styling of the description block within existing puzzle meta hierarchy.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and Requirement Anchors
- `.planning/ROADMAP.md` — Phase 9 goal, success criteria, and dependency constraints.
- `.planning/REQUIREMENTS.md` — `TXT-01`, `TXT-02`, `TXT-03` acceptance requirements.
- `.planning/PROJECT.md` — local-first/offline and sanitized rich-text product constraint.

### Existing Puzzle Data and Parsing Contracts
- `src/puzzles/catalogue.js` — authored puzzle content source where rich-text description data will live.
- `src/puzzles/loader.js` — puzzle parse contract and backward-compatible runtime shape extension point.
- `src/puzzles/loader.test.js` — parser behavior baseline to extend for description field coverage.

### Existing In-Play Rendering Surface
- `src/main.js` — puzzle play meta/objective DOM rendering flow where description UI integrates.
- `src/styles/app.css` — puzzle metadata typography/layout styles to extend for rich-text block readability.
- `src/main.gap-ux.test.js` — existing objective rendering safety checks (`textContent`) to preserve while adding sanitized rich text path.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/main.js`: Central `renderToDom` function already builds puzzle metadata UI and is the natural integration point for description rendering.
- `src/puzzles/loader.js`: Runtime puzzle object construction already handles optional fields and can safely incorporate an optional rich-text property.
- `src/puzzles/catalogue.js`: Static authored content model already supports per-puzzle metadata extensions without network dependencies.

### Established Patterns
- User-facing puzzle copy currently uses safe `textContent` assignments in puzzle metadata.
- Puzzle data is loaded from bundled local modules and parsed into a normalized runtime model.
- The project favors fail-soft handling for malformed data over crashing player flow.

### Integration Points
- Add optional description field parsing in `src/puzzles/loader.js` and extend related tests.
- Render sanitized description block in `src/main.js` puzzle metadata region near objective text.
- Add minimal style rules in `src/styles/app.css` for lists/paragraph spacing/readability in the description block.

</code_context>

<specifics>
## Specific Ideas

- Keep description text short and supportive: tactical hint/context flavor, not long-form article content.
- Preserve immediate play readability on mobile by keeping rich text lightweight and vertically compact.

</specifics>

<deferred>
## Deferred Ideas

- In-app rich-text authoring/editor tools for puzzle creators.
- Remote CMS/content sync for puzzle descriptions.
- Interactive embeds or advanced markdown-like extensions beyond constrained HTML formatting.

</deferred>

---

*Phase: 09-puzzle-rich-text-content*
*Context gathered: 2026-04-18*

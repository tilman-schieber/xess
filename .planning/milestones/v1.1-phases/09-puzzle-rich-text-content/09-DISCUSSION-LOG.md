# Phase 9: Puzzle Rich Text Content - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-18
**Phase:** 09-puzzle-rich-text-content
**Areas discussed:** Puzzle content contract, safe rich-text rendering model, in-play UI placement and fallback behavior, validation and regression protection
**Mode:** `--auto` (non-interactive)

---

## Puzzle content contract

| Option | Description | Selected |
|--------|-------------|----------|
| Optional rich-text field in puzzle catalogue | Add optional authored description field per puzzle and preserve compatibility when absent | ✓ |
| Required rich-text field for every puzzle | Force all puzzles to define rich text now | |
| Separate descriptions file | Keep puzzle content and rich text in separate asset files with runtime join | |

**Auto choice:** `[auto]` Optional rich-text field in puzzle catalogue (recommended default)
**Notes:** Matches current static local-content model and avoids mandatory migration churn for existing puzzles.

---

## Safe rich-text rendering model

| Option | Description | Selected |
|--------|-------------|----------|
| Strict allowlist sanitizer before render | Permit only constrained tags/attributes and strip unsafe markup before DOM injection | ✓ |
| Raw authored HTML render | Trust author content and inject directly | |
| Plain-text only | Escape everything and remove formatting capability | |

**Auto choice:** `[auto]` Strict allowlist sanitizer before render (recommended default)
**Notes:** Needed to satisfy `TXT-02` and `TXT-03` together: curated formatting plus execution safety.

---

## In-play UI placement and fallback behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Render in puzzle metadata near objective | Keep description visible in play context without extra navigation | ✓ |
| Separate modal/panel | Show description only on demand in a separate UI layer | |
| Track-screen-only text | Show description outside puzzle play view | |

**Auto choice:** `[auto]` Render in puzzle metadata near objective (recommended default)
**Notes:** Directly supports success criterion that users see puzzle description within puzzle play UI.

---

## Validation and regression protection

| Option | Description | Selected |
|--------|-------------|----------|
| Parser + rendering + security tests | Add coverage for optional field parsing, allowed formatting, and unsafe-markup stripping | ✓ |
| Manual QA only | Rely on hand testing for rich-text behavior | |
| Snapshot tests only | Visual snapshots without explicit security assertions | |

**Auto choice:** `[auto]` Parser + rendering + security tests (recommended default)
**Notes:** Rich text safety regressions are silent/high-risk, so explicit automated security assertions are required.

---

## Claude's Discretion

- Final optional field name for authored rich text.
- Concrete sanitizer implementation details (dependency-free allowlist or minimal vetted helper).
- Final visual styling details for description typography/spacing.

## Deferred Ideas

- Puzzle description authoring UI/editor workflow.
- Remote content source/CMS synchronization for descriptions.
- Advanced content features beyond constrained static rich text.

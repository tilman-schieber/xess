# Phase 12: Tracking State and UX Verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 12-tracking-state-and-ux-verification
**Areas discussed:** runtime move tracking contract, move-history UI scope, solved move-count persistence, compatibility guardrails

---

## Runtime Move Tracking Contract

| Option | Description | Selected |
|--------|-------------|----------|
| UI-only counting | Count only for presentation and avoid canonical runtime events | |
| Runtime canonical events + count | Record deterministic move events and maintain undo/redo-safe count in core runtime state | ✓ |

**User's choice:** Runtime canonical move recording/counting with undo support is required as a core feature.
**Notes:** Locked as a non-negotiable decision for this phase.

---

## Move-History UI Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Include history list UI now | Build and render chronological history entries in this milestone | |
| Defer UI rendering | Keep canonical history data in runtime, but do not render history UI in this milestone | ✓ |

**User's choice:** Move-history UI rendering is deferred.
**Notes:** Runtime history data still required for replay/persistence integrity.

---

## Solved Move Count Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Persist solved flag only | Keep current solved persistence without move-count metadata | |
| Persist per-puzzle solved move count | Store move count achieved at solve time per solved puzzle | ✓ |

**User's choice:** Persist per-puzzle solve move count.
**Notes:** Applies at puzzle completion boundary.

---

## Compatibility and Progression Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Rework unlock/progress semantics | Allow tracking changes to alter existing progression behavior | |
| Preserve existing behavior | Keep current progress/unlock behavior fully compatible while extending tracking state | ✓ |

**User's choice:** Keep existing progress/unlock behavior compatible.
**Notes:** Backward compatibility is a hard guardrail.

---

## Claude's Discretion

- Event schema details and storage structure are implementation choices.
- Test layering (controller vs store vs integration focus) is planner/executor discretion, provided invariants are covered.

## Deferred Ideas

- Chronological move-history UI rendering deferred to a future phase.

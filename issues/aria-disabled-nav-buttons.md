# aria-disabled used instead of disabled on nav buttons

## Affected buttons

Four buttons in `renderToDom` (`src/main.js`) use `setAttribute('aria-disabled', 'true')` to
signal their inactive state, but never set the native `disabled` property:

- Previous puzzle `←` (line 420) — when `!model.prevId`
- Next puzzle `→` (line 428) — when `!model.nextId`
- Undo `↶` (line 454) — when `!model.canUndo`
- Redo `↷` (line 462) — when `!model.canRedo`

## Why this is a problem

`aria-disabled` is a semantic hint for assistive technology only. It does **not** prevent
pointer or keyboard activation. The native `disabled` attribute on `<button>` does both:
it suppresses events and marks the element as inactive for AT.

As a result, clicking the undo button when there is nothing to undo still fires the
`bindPrimaryAction` handler and calls `ui.undo()`. The behavior is harmless (the controller
handles an empty stack gracefully) but the button is not truly inactive.

## Fix

Replace each conditional `setAttribute('aria-disabled', ...)` with the `disabled` property:

```js
// before
if (!model.canUndo) undoBtn.setAttribute('aria-disabled', 'true')

// after
undoBtn.disabled = !model.canUndo
```

The same change applies to `redoBtn`, `prevBtn`, and `nextNavBtn`. The `disabled` attribute
automatically exposes `aria-disabled: true` to the accessibility tree, so no separate
`aria-disabled` attribute is needed.

## Note on CSS

If existing styles target `[aria-disabled="true"]` for visual treatment, they will need
to be updated to target `[disabled]` or `:disabled` after this change.

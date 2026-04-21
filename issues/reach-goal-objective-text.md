# Objective text hardcodes "white pieces" for reach-all-goal-squares

## Location

`getPuzzleObjectiveText` in `src/main.js` (line 104):

```js
if (puzzle.goalType === 'reach-all-goal-squares') {
  return 'Move all white pieces onto goal squares.'
}
```

## Problem

The text assumes the player is always moving white pieces, but `reach-all-goal-squares`
puzzles can require moving pieces of any color. Puzzle 24 (Knight Relay, id `b4c5d6e7`)
is a concrete example: the player must route a **black** knight (`n`) to the goal square.
The objective text shown to the player is factually wrong for that puzzle.

## Fix options

The cleanest approach is to derive the text from the puzzle's `controllableColors` and
`goalTargets`. A minimal improvement would be to drop the color assumption entirely:

```js
if (puzzle.goalType === 'reach-all-goal-squares') {
  return 'Move pieces onto all goal squares.'
}
```

A more precise version could inspect `goalTargets` to name the specific piece(s) required,
but that may be more detail than the one-line objective text needs — the `descriptionHtml`
field is the right place for puzzle-specific guidance.

## Affected test

`src/main.gap-ux.test.js` line 36 asserts the current (wrong) string:

```js
expect(model.objectiveText).toBe('Move all white pieces onto goal squares.')
```

This test will need to be updated alongside the fix.

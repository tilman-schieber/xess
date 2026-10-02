# Puzzle Format Reference

This document describes the current puzzle JSON contract as implemented in `src/puzzles/loader.js` and validated by `src/puzzles/loader.test.js`.

## Required Fields

These fields are required for puzzles to parse and behave correctly in the app:

- `schemaVersion` (number): must be exactly `1`.
- `id` (string): unique puzzle identifier.
- `goalType` (string): one of:
  - `capture-all-targets`
  - `reach-all-goal-squares`
- `grid` (string[]): row-major board encoding.

Practical catalogue contract (enforced by `src/puzzles/catalogue.test.js`):

- For `capture-all-targets`, `targetColor` should be non-null.

## Optional Fields And Defaults

- `title` (string): defaults to `''` when missing.
- `descriptionHtml` (string): defaults to `''`; non-string values are ignored to `''`.
- `targetColor` (`'white' | 'black' | null`): defaults to `null` when missing.
- `goalTargets` (object): defaults to empty `Map` at runtime when missing.
- `controllableColors` (`string[]`):
  - defaults by `goalType`:
    - `capture-all-targets` -> `['white']`
    - `reach-all-goal-squares` -> `['white', 'black']`
  - only `'white'` and `'black'` are kept.
  - duplicates are removed.
  - if provided but no valid colors remain, fallback uses the same goal-type default above.
- `capturableByColor` (object with `white` and/or `black` arrays):
  - defaults by `goalType`:
    - `capture-all-targets` -> `{ white: ['black'], black: [] }`
    - `reach-all-goal-squares` -> `{ white: [], black: [] }`
  - each side only keeps `'white'`/`'black'`, with duplicates removed.
  - missing side falls back to default for that side.
- `promote` (boolean): defaults to `false`; only literal `true` enables promotion.
- `coach` (array): tutorial coaching lines that explain a rule. `coach[i]` is shown while the player is on the stored shortest solution with `i` moves played; the catalogue only uses `coach[0]`, an introduction shown until the first move. A plain string never reveals a move; `{ text, show: true }` would also highlight the next solution move for free.

## Derived: par, hints and score

`par` is not authored. It is the length of the puzzle's shortest solution in `src/puzzles/solutions.js`, which is generated:

```sh
node scripts/generate-solutions.js
```

Run it after adding a puzzle to a track or changing a grid; `hints.test.js` fails if a track puzzle has no solution or the stored one no longer replays to a win. The stored solution also drives the Hint button (instant while the player is on that line, background BFS otherwise) and `coach` indexing.

Scoring (`src/puzzles/score.js`): 100 points per puzzle, −5 per move over par (max −50), −20 per requested hint (max −40), never below 10. Undo, reset and tutorial coaching are free. Three stars at 100, two from 60, one below.

## Grid Symbol Legend

Each `grid` row is a string. Coordinates are `"col,row"` with zero-based indices.

- `x`: impassable (square is excluded from board map).
- `-`: empty playable square.
- `G`: empty goal square (`isGoal: true`).
- Piece letters: `p n b r q k` / `P N B R Q K`.

Unknown characters are ignored by the loader (no board cell created), so treat them as invalid authoring input.

## Color/Case Mapping (FEN-Like)

- Uppercase piece char => `color: 'white'`.
- Lowercase piece char => `color: 'black'`.
- Runtime `piece.type` is always lowercase (`'P'` -> `{ type: 'p', color: 'white' }`).

## Goal Types And `goalTargets`

### `capture-all-targets`

- Win when no pieces of `targetColor` remain on the board.
- In current catalogue, this uses `targetColor: 'black'`.
- Default policy: white pieces are controllable; white may capture black; black captures are disabled unless explicitly configured.

### `reach-all-goal-squares`

- Requires at least one `G` square in `grid`.
- Without `goalTargets`: every `G` square must be occupied by any piece.
- With `goalTargets`: each mapped goal coordinate must be occupied by the exact piece type+color.
- Default policy: both colors are controllable; captures are disabled for both colors.
- UI convention: the special goal pieces are shown in red tint in reach mode.

`goalTargets` format:

```js
goalTargets: {
  '2,2': 'R',
}
```

- Key is `"col,row"` and must reference a `G` square.
- Value is a valid piece character from the same piece set as `grid`.

Real examples from `src/puzzles/catalogue.js`:

- `gt7wz4r1` (`Find the Square`) uses `goalType: 'reach-all-goal-squares'` with `goalTargets: { '2,2': 'R' }`.
- `xk3m9pq2` (`Corner Trap`) uses `goalType: 'capture-all-targets'` with `targetColor: 'black'`.

## Policy Fields

- `controllableColors`: optional override for which piece colors the player may move.
- `capturableByColor`: optional override for capture policy by mover color.
  - Example: `capturableByColor.white = ['black']` means white movers can capture black only.
- `promote`: when `true`, pawn auto-promotes to queen on reaching row `0`.

## Minimal Valid Examples

### Capture Goal

```js
{
  schemaVersion: 1,
  id: 'example-capture',
  goalType: 'capture-all-targets',
  targetColor: 'black',
  grid: [
    'Pp',
  ],
}
```

### Reach Goal

```js
{
  schemaVersion: 1,
  id: 'example-reach',
  goalType: 'reach-all-goal-squares',
  grid: [
    'R-G',
  ],
  goalTargets: {
    '2,0': 'R',
  },
}
```

## Common Validation Errors

Current loader errors include:

- `Unknown schema version: <value>`
- `Puzzle "<id>": reach-all-goal-squares requires at least one G square`
- `Puzzle "<id>": goalTargets key "<col,row>" must reference a G square`
- `Puzzle "<id>": goalTargets key "<col,row>" has invalid piece "<char>"`

Common authoring pitfalls that will not throw but still break intent:

- Non-string rows in `grid` are skipped.
- Unknown grid symbols are ignored (cell not created).
- Invalid colors inside policy arrays are dropped silently.

# Development Guide

## Prerequisites

- Node.js (v18 or later)
- npm

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server (http://localhost:5173, hot reload)
npm test          # run unit tests (watch mode)
npm run build     # production build → dist/
npm run preview   # serve the dist/ build locally
```

## Tests

Tests use Vitest with a jsdom environment. The convention is one `.test.js` file per source file, co-located with the source:

```
src/engine/moves.js         →  src/engine/moves.test.js
src/controller.js           →  src/controller.test.js
src/ui/appShell.js          →  src/ui/appShell.test.js
```

Run a specific file:

```bash
npx vitest src/engine/moves.test.js
```

The engine tests are the most exhaustive — every piece type is tested for move generation across edge cases (board edges, impassable squares, captures). UI tests assert DOM contract properties (selector presence, attribute values) rather than visual appearance.

The controller is tested without a DOM — it takes an optional catalogue parameter so tests can inject fixture puzzles without mocking modules.

## Puzzle Catalogue

All puzzles live in `src/puzzles/catalogue.js` as a static array. There is no database or external fetch.

`src/puzzles/loader.js` parses each puzzle's `grid` string array into a `Map<string, Cell>` at load time. The format is documented in [puzzle-format.md](puzzle-format.md).

To add a puzzle:

1. Write your puzzle definition following [puzzle-format.md](puzzle-format.md)
2. Append it to the array in `src/puzzles/catalogue.js`
3. Assign it to a track in `src/puzzles/tracks.js` (or create a new track)
4. Run `npm test` — `src/puzzles/catalogue.test.js` validates the catalogue structure

Policy defaults are goal-type-driven and usually should not be repeated in puzzle data:

- `capture-all-targets`: white-controlled, white captures black.
- `reach-all-goal-squares`: both colors controllable, no captures.

Only add `controllableColors` / `capturableByColor` when intentionally overriding those defaults.

## PWA and Service Worker

The service worker is only active in the production build (`npm run build` + `npm run preview`). It is disabled in dev mode (`devOptions.enabled: false` in `vite.config.js`).

The service worker precaches all static assets (JS, CSS, SVGs, fonts, icons) so the app works fully offline after the first visit. No runtime caching strategies are used — everything is served from the precache.

On updates, the app shows a prompt rather than silently activating the new service worker (`registerType: 'prompt'`, `skipWaiting: false`).

## Styles

CSS custom properties defined in `src/styles/app.css` control the visual design tokens (colors, spacing, glass effect parameters). Board-specific layout is in `src/styles/board.css`.

There is no CSS preprocessor — everything is plain CSS targeting modern browsers (no IE support).

## Known Issues

Open issues are tracked as Markdown files in the `issues/` directory at the project root.
Each file describes the affected code, the problem, and a suggested fix. Check there before
starting work on a bug that sounds familiar.

## Local Storage Schema

All persistence goes through `src/store/store.js`. A single key `xess_v1` stores a JSON blob with this shape:

```json
{
  "schemaVersion": 1,
  "solvedIds": ["puzzle-id-1", "puzzle-id-2"],
  "solvedMoveCounts": { "puzzle-id-1": 4 },
  "activeState": {
    "puzzleId": "puzzle-id-1",
    "boardEntries": [["a1", { ... }], ...],
    "undoEntries": [[["a1", { ... }], ...], ...],
    "moveEvents": [{ "from": "a1", "to": "b2" }, ...],
    "redoEntries": [[["a1", { ... }], ...], ...],
    "moveCount": 3
  },
  "tutorialDismissed": false,
  "tutorialCompleted": false
}
```

The board `Map` is serialized via `Array.from(map.entries())` since `JSON.stringify(map)` produces `{}`. Deserialization uses `new Map(entries)`.

The store sanitizes all values on read — stale puzzle IDs, type mismatches, schema version mismatches, and malformed JSON all fall back to a clean default without throwing. Active state writes are debounced (300ms) and flushed synchronously on `visibilitychange` to prevent data loss when the tab is backgrounded.

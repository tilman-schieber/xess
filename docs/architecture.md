# Architecture

Xess is a client-only vanilla JS app built with Vite. There is no backend, no framework, and no virtual DOM — just ES modules, CSS Grid, and direct DOM manipulation.

## Source Layout

```
src/
├── engine/          # Pure move logic
├── puzzles/         # Puzzle data and navigation
├── ui/              # Rendering and interaction
├── store/           # Local storage persistence
├── styles/          # CSS
├── main.js          # App entry point
├── controller.js    # Game state orchestrator
└── sound.js         # Audio
```

## Modules

### `engine/`

Pure functions — no DOM, no side effects. The heart of the game.

- `moves.js` — generates legal moves for each piece type on arbitrary board shapes
- `apply.js` — applies a move and returns the new board state
- `win.js` — checks win conditions after each move
- `index.js` — exports `getLegalMoves(board, position)` and `applyMove(board, move)`

The engine implements the six standard chess piece movement rules (pawn, knight, bishop, rook, queen, king) adapted for variable-size, non-rectangular grids. It does not implement castling, en passant, check, or promotion — none of which apply in Xess.

### `puzzles/`

Puzzle data and navigation logic.

- `catalogue.js` — static array of all puzzle definitions
- `loader.js` — parses a puzzle definition (string grid → board `Map`) and validates fields
- `nav.js` — navigation helpers: track listing, puzzle unlock state, continue-action resolver; also exports `getPrevIdInTrack`, `getNextIdInTrack`, and `getTrackPuzzlePosition` for track-scoped navigation
- `tracks.js` — track metadata (names, ordering, tutorial designation)
- `contentIntegrity.js` — validates catalogue structure at startup
- `solver.js` — BFS puzzle solver
- `solver.worker.js` — Web Worker wrapper for the solver

### `ui/`

Rendering modules. Each is a pure function of its inputs — no internal state, no localStorage access.

- `appShell.js` — persistent topbar rendered across all modes; includes a Home button, a Tracks button, and optional Prev/Next puzzle navigation buttons (added when mode is 'play')
- `startScreen.js` — landing dashboard with Continue / Tutorial / Browse action cards
- `trackBrowser.js` — track list with puzzle progress chips
- `puzzleList.js` — puzzle list UI component for per-track puzzle browsing
- `puzzleCreator.js` — hidden visual puzzle creator tool
- `boardRenderer.js` — renders the puzzle board as a CSS Grid with piece SVGs
- `dragDrop.js` — pointer/touch event handling for piece selection and moves
- `interactionFeedback.js` — selected-piece and legal-move overlay state machine
- `puzzleDescriptionSanitizer.js` — DOMPurify wrapper for puzzle `descriptionHtml`
- `pwaPrompts.js` — install and update prompts
- `pieces.js` — static inline SVG assets for all 12 piece glyphs (6 types × 2 colors)

### `store/`

All localStorage access is isolated here. The controller and UI modules never call localStorage directly.

- `store.js` — `loadStore()`, `saveProgress()`, `saveActiveState()`, `clearActiveState()`, tutorial lifecycle helpers

### `styles/`

Vanilla CSS with custom properties. No framework, no utility classes.

- `app.css` — main layout tokens, liquid-glass visual design system, shell chrome
- `board.css` — board grid, cells, piece overlays
- `start-screen.css` — landing page layout
- `track-browser.css` — track list layout
- `puzzle-list.css` — per-track puzzle list
- `puzzle-creator.css` — puzzle creator tool styles
- `pwa-prompts.css` — install/update prompt styles

### `controller.js`

The single stateful object in the app. It owns the current puzzle, board state, undo/redo stacks, and solved-puzzle list. It calls the engine for move generation and application, calls `store.js` for persistence, and exposes an API that `main.js` uses to wire everything together.

The controller has no browser API access — it can be instantiated in a test environment without a DOM.

### `main.js`

App entry point. Mounts the app shell, routes between start/tracks/play modes, wires DOM events to the controller, and drives the render loop.

### `sound.js`

Web Audio API synthesis. Opt-in only — audio context is not created until the user enables sound. Exports `playMove()` and `playSolve()`.

## Data Flow

```
catalogue.js (static data)
    │
    └─▶ controller.loadPuzzle(id)
              │
              ├─▶ loader.js    (parse grid string → board Map)
              ├─▶ store.js     (load solved IDs, restore active state)
              │
              └─▶ main.js renders board
                      │
                      └─▶ user selects piece
                                │
                                ├─▶ engine.getLegalMoves()   (pure)
                                │
                                └─▶ user selects target square
                                          │
                                          ├─▶ engine.applyMove()    (pure, returns new board)
                                          ├─▶ engine.win.js         (check win condition)
                                          ├─▶ store.js              (persist state)
                                          └─▶ boardRenderer.js      (re-render)
```

## Key Design Decisions

**Custom chess engine, not chess.js.** The standard chess library encodes an 8×8 board as a first-class constraint. Xess boards are variable-size and non-rectangular — there is no viable path to using chess.js. The custom engine is ~300 lines of pure functions.

**Controller is pure (no localStorage).** `store.js` owns all persistence. The controller calls `loadStore()` once at puzzle load and calls `saveProgress()` / `saveActiveState()` explicitly after state changes. This makes the controller straightforwardly testable.

**Default move/capture policy is goal-type-based.** Capture puzzles default to white-only control with white-on-black captures; reach puzzles default to dual-color control with captures disabled for both sides. Puzzle entries only include policy fields when overriding these defaults.

**Pawn direction is per-piece.** Pawn forward direction is encoded in the puzzle definition, not inferred from piece color or board orientation. This allows puzzle authors to place pawns pointing in any direction on a non-rectangular board.

**Visual affordances use CSS overlays, not piece recoloring.** Selected pieces and legal-move targets are shown via `::before`/`::after` pseudo-elements on cells, not by recoloring the piece SVG. This keeps piece glyphs readable against the overlay tint.

**Win state is a fixed overlay modal.** On puzzle completion, a `.win-modal { position: fixed; inset: 0 }` overlay renders above the board rather than modifying the board's appearance inline.

**Map serialization via `Array.from(entries)`.** The board `Map` is serialized to localStorage using `Array.from(map.entries())` rather than `JSON.stringify(map)` (which would produce `{}`). Deserialization reconstructs with `new Map(entries)`.

**No framework.** The UI surface is a single-screen game with a fixed component inventory. Direct DOM manipulation is straightforward and keeps the bundle small.

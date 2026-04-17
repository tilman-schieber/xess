# Architecture Patterns: Xess Chess Puzzle PWA

**Domain:** Client-side chess puzzle game with non-standard board geometries
**Researched:** 2026-04-16
**Confidence:** HIGH (well-established domain patterns; no external research access needed)

---

## Recommended Architecture

Xess decomposes into five clear layers. Each has a single responsibility and communicates downward only — the UI reads from state, the engine mutates state, the store persists state, and the PWA shell serves assets.

```
┌─────────────────────────────────────────┐
│              UI Layer                   │  Board renderer + interaction handlers
│         (SVG + DOM components)          │
├─────────────────────────────────────────┤
│           Game Controller               │  Orchestrates engine + store + UI
├──────────────────┬──────────────────────┤
│   Puzzle Engine  │   Puzzle Catalogue   │  Move logic / win detection | Static data
│  (pure functions)│  (JSON definitions)  │
├──────────────────┴──────────────────────┤
│           Persistence Store             │  localStorage read/write, schema owner
├─────────────────────────────────────────┤
│             PWA Shell                   │  Service worker, manifest, asset cache
└─────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Inputs | Outputs |
|-----------|---------------|--------|---------|
| **Puzzle Engine** | Move generation, move validation, win detection | Board state + move intent | Valid move list, new board state, win/loss flag |
| **Puzzle Catalogue** | Holds all 25-50 puzzle definitions as static JSON | Puzzle ID | PuzzleDefinition object |
| **Persistence Store** | Read/write localStorage; defines schema | Progress events, state snapshots | Hydrated progress/state on boot |
| **Game Controller** | Wires engine + store + UI; owns in-memory game state | User interactions, puzzle load requests | Commands to renderer, write calls to store |
| **Board Renderer** | Draws board, pieces, highlights; handles pointer events | Board state, selection, valid squares | User interaction events (select, move) |
| **PWA Shell** | Service worker registration, manifest, offline cache strategy | First HTTP load | Offline-capable app |

### Hard Boundary Rules

- The Puzzle Engine has **zero DOM/browser dependencies** — pure functions only, portable to a Worker if needed.
- The Puzzle Catalogue is **read-only static data** — never written at runtime.
- The Persistence Store is the **only component that touches localStorage** — all other components call it, never `localStorage` directly.
- The Board Renderer **never mutates game state** — it fires events upward and re-renders when told.

---

## Data Flow

```
User taps square
       │
       ▼
Board Renderer  ──(selectSquare / requestMove event)──▶  Game Controller
                                                               │
                                          ┌────────────────────┴────────────────────┐
                                          ▼                                         ▼
                                   Puzzle Engine                          Persistence Store
                                   validateMove()                         saveSnapshot()
                                   applyMove()
                                   checkWin()
                                          │
                                          ▼
                                   new BoardState
                                          │
                                          ▼
                                  Game Controller  ──(render command)──▶  Board Renderer
```

**Key data flow principles:**

1. **State lives in Game Controller** as a single in-memory object. The Renderer only receives what it needs to paint.
2. **Undo** is implemented by the Game Controller maintaining a move history stack (array of BoardState snapshots). No engine involvement needed.
3. **Reset** restores the puzzle's initial BoardState from the Puzzle Catalogue definition.
4. **Win detection** runs synchronously after every `applyMove()` — the engine returns a result object `{ newState, isWin }`.

---

## Board Rendering: SVG over Canvas

**Recommendation: SVG. Confidence: HIGH.**

**Why SVG wins for this use case:**

- Non-rectangular, variable-dimension boards are expressed naturally as positioned `<rect>` or `<polygon>` elements — no coordinate math in a draw loop.
- Piece artwork (Chess pieces demand clean vectors at any size) is natively SVG — embed inline or as `<use>` references, no blurring at any DPI.
- Hit-testing (which square was tapped?) is free — the browser handles it via pointer events on SVG elements. Canvas requires manual inverse-transform hit detection.
- Accessibility: SVG elements are part of the DOM, enabling `aria-label`, keyboard focus, and screen reader hooks without a parallel shadow structure.
- CSS transitions on piece movement feel natural and cost nothing to implement.
- Mobile retina displays render SVG crisply without a `devicePixelRatio` workaround.

**When Canvas would win:** animation-heavy games with hundreds of moving sprites per frame. Xess has at most ~20 pieces making discrete moves. Canvas complexity is not justified.

**Implementation pattern:**

```
BoardRenderer
├── buildGridSVG(puzzleDef)      → creates square elements from board shape
├── renderPieces(boardState)     → positions piece SVG <use> elements
├── highlightSquares(squareIds)  → adds/removes CSS classes for selection, valid moves
└── bindPointerEvents()          → single delegated listener on the SVG root
```

---

## Puzzle Definition Format

**Recommendation: JSON with text-grid board encoding. Confidence: HIGH.**

The PROJECT.md text-grid notation (characters per cell) is the right instinct. Formalize it:

```json
{
  "id": "puzzle-001",
  "name": "L-Shape",
  "goalType": "capture",
  "goalParams": {
    "targetPieceIds": ["black-queen"]
  },
  "board": {
    "rows": 4,
    "cols": 4,
    "grid": [
      "rn--",
      "pp--",
      "xx--",
      "xxwq"
    ]
  },
  "pieces": {
    "r": { "color": "black", "type": "rook" },
    "n": { "color": "black", "type": "knight" },
    "p": { "color": "black", "type": "pawn" },
    "w": { "color": "white", "type": "pawn" },
    "q": { "color": "white", "type": "queen" }
  },
  "goalSquares": []
}
```

**Grid cell key:**

| Char | Meaning |
|------|---------|
| `-`  | Empty playable square |
| `x`  | Impassable (does not exist) |
| `G`  | Goal square (for "reach goal" puzzles) |
| lowercase letter | Piece identifier — looked up in `pieces` map |

**Why this format:**

- Human-readable in source — designers can author puzzles in a text editor.
- The grid visually mirrors the board shape, making layout errors obvious.
- The `pieces` map decouples character codes from piece semantics — the same char can be reused across puzzles.
- JSON serializes trivially for embedding in a JS module (`export default puzzles`) — no fetch needed, works offline immediately.
- Goal type is explicit and extensible: `"capture"` and `"reach"` cover both required goal types; more can be added without format changes.

**Puzzle Catalogue implementation:** A single `puzzles.js` module exporting the array. Imported at build time — zero runtime fetch, zero network dependency.

---

## Puzzle Engine Design

**Recommendation: Pure functional module, position represented as a 2D array. Confidence: HIGH.**

Bitboards (the standard in full chess engines) are overkill here. Xess boards are variable-shape and never need AI search. A simple 2D array with cell objects is readable, testable, and fast enough for human-speed play.

### Board State Shape

```javascript
// BoardState — the only mutable entity during gameplay
{
  grid: Cell[][],        // 2D array indexed [row][col]
  moveHistory: Move[],   // for undo stack
  puzzleId: string
}

// Cell
{
  exists: boolean,       // false = impassable square
  isGoal: boolean,
  piece: Piece | null
}

// Piece
{
  id: string,            // stable identifier for win detection
  color: "white" | "black",
  type: "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
}

// Move
{
  from: { row, col },
  to: { row, col },
  captured: Piece | null  // for undo restoration
}
```

### Engine API (pure functions)

```javascript
// All functions take BoardState and return new values — no mutation
getLegalMoves(state, from)         → { row, col }[]
applyMove(state, move)             → { newState: BoardState, captured: Piece | null }
checkWinCondition(state, puzzleDef) → boolean
isInCheck(state, color)            → boolean  // needed only for King movement validity
```

**Pawn direction:** With no alternating-color squares, pawn direction must be encoded per puzzle or per-piece (e.g., a `direction: "up" | "down"` field on Piece). "Up" means decreasing row index. This avoids any board-orientation ambiguity on non-standard shapes.

**Knight jumps:** Knights ignore impassable squares (they jump over them) but cannot land on `exists: false` cells. This is the only piece requiring special-case handling for impassable squares.

---

## Persistence Store: localStorage Schema

**Schema version key:** `xess_schema_version` (integer, increment on breaking changes)

### Keys

| Key | Type | Content |
|-----|------|---------|
| `xess_schema_version` | number | Current: `1` |
| `xess_progress` | JSON object | `{ solvedPuzzles: string[], unlockedPuzzles: string[] }` |
| `xess_active_puzzle` | JSON object | Full BoardState snapshot for current in-progress puzzle |

### Progress Object

```json
{
  "solvedPuzzles": ["puzzle-001", "puzzle-002"],
  "unlockedPuzzles": ["puzzle-001", "puzzle-002", "puzzle-003"]
}
```

Sequential unlocking: on solve, the next puzzle ID is pushed to `unlockedPuzzles`. The Persistence Store owns this rule — the Game Controller fires a "puzzle solved" event and the store updates accordingly.

### Active Puzzle Snapshot

Stored after every move (debounced ~500ms) and on page visibility change. This ensures progress survives browser crashes and tab switches on mobile.

**Migration pattern:** On boot, read `xess_schema_version`. If missing or outdated, run migrations in sequence (v0→v1 etc.) before hydrating app state. Keep migration functions alongside the schema.

### Storage Limits

localStorage is capped at ~5MB on most browsers (iOS Safari: 5MB, Chrome: 5-10MB). With 50 puzzles and small board states, total storage will be well under 100KB. No size management needed.

---

## PWA Offline Architecture

**Recommendation: Cache-first for app shell + puzzle assets, no dynamic fetching. Confidence: HIGH.**

Because all puzzle data ships as JS modules (not fetched), the offline strategy is simple:

```
Service Worker Strategy
├── App Shell (HTML, CSS, JS bundles)     → Cache-first, version-stamped
├── Piece SVG assets                      → Cache-first, version-stamped
├── puzzle catalogue (embedded in JS)    → Part of app shell, no separate cache
└── No network calls during gameplay     → Offline works automatically
```

**Cache versioning:** Name the cache `xess-v1`. On service worker update, delete old cache versions. Stamp all asset URLs with a build hash (Vite does this automatically).

**Install prompt:** Capture the `beforeinstallprompt` event in the app shell, defer it, and show a subtle "Install app" UI element. Don't trigger it automatically on first visit.

**Manifest essentials:** `display: standalone`, `start_url: /`, `background_color` and `theme_color` matching the game's premium palette, at least 192×192 and 512×512 icon variants.

---

## Suggested Build Order

Dependencies flow bottom-up. Build in this order:

```
1. Puzzle Definition Format + Catalogue
   └── Foundation for everything. No dependencies.

2. Puzzle Engine (pure functions)
   └── Depends only on: agreed BoardState shape from step 1.
   └── Write unit tests here — this is the most logic-dense component.

3. Persistence Store
   └── Depends on: BoardState shape (to serialize/deserialize).
   └── Can be tested independently with a mock localStorage.

4. Game Controller
   └── Depends on: Engine (step 2) + Store (step 3).
   └── Wire them together; test the full move→win→persist flow.

5. Board Renderer (SVG)
   └── Depends on: agreed BoardState shape and events from Controller.
   └── Can be built with a hardcoded fixture state to develop visuals.

6. PWA Shell
   └── Depends on: complete app (steps 1-5).
   └── Add service worker + manifest as the final integration step.
```

**Parallelization opportunity:** Steps 2 and 5 can proceed simultaneously once BoardState is agreed (step 1 complete). Renderer development against fixture data does not block engine work.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Board Shape in Game State

**What goes wrong:** The board grid shape (which cells exist) is duplicated between the puzzle definition and the live BoardState. Mutations to grid existence cause subtle bugs.

**Instead:** Board shape (which `cell.exists`) is read-only after puzzle load. Only `cell.piece` and `cell.isGoal` change during gameplay.

### Anti-Pattern 2: Rendering Engine Calling the Engine Directly

**What goes wrong:** The renderer computes legal moves itself to draw highlights, creating a second place where move validation logic lives.

**Instead:** The Game Controller calls `getLegalMoves()` and passes the result to the renderer as data. The renderer only draws — it never calls engine functions.

### Anti-Pattern 3: localStorage Writes on Every Render

**What goes wrong:** Mobile browsers throttle or throw on high-frequency writes. Laggy UI on low-end devices.

**Instead:** Debounce snapshot writes (500ms). Always write on `visibilitychange: hidden` (the only reliable "page is closing" event on mobile Safari).

### Anti-Pattern 4: Hardcoding Pawn Direction to Board Orientation

**What goes wrong:** On non-rectangular boards, "up" is ambiguous. Puzzles become unsolvable or buggy when board shapes change.

**Instead:** Pawn direction is a per-piece property set in the puzzle definition (`direction: "up" | "down"` meaning row-decreasing or row-increasing).

### Anti-Pattern 5: One Giant `puzzles.js` File at 2000+ Lines

**What goes wrong:** Authoring, diffing, and reviewing 50 puzzle definitions in one file becomes painful quickly.

**Instead:** One file per puzzle in a `puzzles/` directory, barrel-imported by an `index.js`. Each puzzle file is ~20 lines of JSON-in-JS.

---

## Scalability Considerations

This is a static client-side game. "Scaling" here means content growth and maintainability, not load:

| Concern | At 50 puzzles | At 200 puzzles | At 500+ puzzles |
|---------|---------------|----------------|-----------------|
| Bundle size | Negligible | ~50KB additional | Lazy-load puzzle chunks |
| localStorage | <100KB | <200KB | Consider IndexedDB |
| Unlock logic | Simple array | Simple array | May need chapter/world grouping |
| Puzzle authoring | Manual JSON | Need a local editor tool | Full editor needed |

---

## Sources

- Architecture conclusions drawn from well-established patterns in open-source chess UIs (chessboard.js, chessground, lichess codebase) — HIGH confidence.
- PWA offline strategy based on MDN Service Worker API documentation and Workbox caching patterns — HIGH confidence.
- localStorage limits: MDN Web Docs, browser vendor documentation — HIGH confidence.
- SVG vs Canvas recommendation: based on documented DOM event model, SVG coordinate transforms, and the specific rendering requirements of this game — HIGH confidence.

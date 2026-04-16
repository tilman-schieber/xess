# Domain Pitfalls: Xess (Chess Puzzle PWA)

**Domain:** Client-side chess puzzle game with non-standard board geometry, PWA
**Researched:** 2026-04-16
**Overall confidence:** HIGH (chess engine logic, PWA mechanics) / MEDIUM (mobile-specific behaviors)

---

## Critical Pitfalls

Mistakes that cause rewrites, silent bugs, or broken puzzle states.

---

### Pitfall 1: Pins Are Ignored in Legal Move Generation

**What goes wrong:** A piece is "pinned" to the king if moving it would expose the king to check. Forgetting to enforce pins means the engine allows illegal moves — moving a pinned bishop, for example, leaves the king in check. The puzzle becomes unsolvable or trivially solvable in unintended ways.

**Why it happens:** Pin detection requires generating opponent attacks *after* the candidate move, not before. Developers often check "can this piece reach that square" without simulating the board state post-move to verify the king is not in check. En passant creates a special double-removal case that makes pin detection even harder: removing both the moving pawn and the captured pawn from the same rank can expose the king along a rank — a bug in every naive en passant + pin implementation.

**Consequences:** Silent illegal moves corrupt puzzle solutions. Puzzles become unsolvable or can be solved by moves the designer never intended.

**Prevention:**
- Implement move legality as: generate pseudo-legal moves → apply move to a copy of board state → verify king is not in check in the resulting position → discard if check.
- Write explicit test cases: pinned rook, pinned bishop, pinned queen, diagonal pin vs. rank/file pin, the en passant + pin edge case.
- Since Xess has no alternating turns and opponents are static targets, check/pin rules still apply to the player's own king if one exists on the board. Clarify early: *does the player's king ever appear on a puzzle board?* If yes, enforce fully. If no, pin detection can be simplified but must be documented.

**Warning signs:** Puzzles that can be solved in fewer moves than intended. Pieces appearing to slide through other pieces.

**Phase:** Engine foundation (Phase 1). Non-negotiable before puzzle authoring begins.

---

### Pitfall 2: En Passant State Is Board-Global, Not Piece-Local

**What goes wrong:** En passant is only legal on the move *immediately* following a two-square pawn advance. If the en-passant-eligible square is stored on the pawn piece itself rather than as ephemeral board state, it either persists too long (allowing en passant on a later move) or is not cleared correctly after undo.

**Why it happens:** Object-oriented piece models tempt developers to store `canBeCapturedEnPassant: true` on the pawn. But this flag must be cleared at the start of every new move — including after undo — and storing it on the piece makes clearing it non-obvious.

**Consequences:** Invalid en passant captures accepted on non-adjacent moves. Undo after en passant leaves the board in an inconsistent state (captured pawn missing, flag still set or cleared incorrectly).

**Prevention:**
- Store the en-passant target square as a single nullable field on the board state object, not on the pawn: `board.enPassantSquare = {row, col} | null`.
- Clear it at the beginning of every move application. On undo, restore it from the previous board state snapshot (undo should snapshot full board state, not just piece deltas).
- Test: double pawn push → wait one move → attempt en passant (should fail). Double pawn push → immediately en passant (should succeed). Undo en passant → board fully restored.

**Warning signs:** En passant available two moves after the double push. Undo after en passant shows both pawns missing or the captured pawn reappearing in the wrong position.

**Phase:** Engine foundation (Phase 1). Test before any puzzle authoring.

---

### Pitfall 3: Non-Rectangular Board Breaks Sliding Piece Ray Casting

**What goes wrong:** Rook, bishop, and queen move by casting rays in cardinal/diagonal directions, stopping at board edges or blocking pieces. Standard chess code checks bounds like `col >= 0 && col < 8`. On an irregular board with impassable squares or non-rectangular shapes, the same logic either allows moves through impassable squares (treating them as empty) or crashes on out-of-bounds coordinates.

**Why it happens:** The board representation typically uses a flat 2D array. Developers add an impassable-square concept but forget to add it to the ray-casting termination condition. Separately, boundary detection for non-rectangular shapes (e.g., a cross-shaped board) requires knowing not just "is this coordinate in bounds" but "is this coordinate a valid playable square."

**Consequences:** Pieces slide through walls. Queens "teleport" across holes. Puzzles are unsolvable or trivially broken.

**Prevention:**
- Define a `isValidSquare(row, col)` function that returns false for out-of-bounds AND for impassable squares. All movement code calls this before considering a square.
- Ray casting: advance along ray; if `!isValidSquare(next)`, stop the ray entirely (do not skip and continue — impassable squares are walls, not holes, for sliding pieces).
- Knights jump over impassable squares per spec — confirm this is tested explicitly (knight can land on a valid square even if intermediate squares are impassable; knight cannot land on an impassable square).
- Store the board as a sparse structure (map of coordinate → square type) rather than a dense 2D array to make "does this square exist" a natural O(1) lookup.

**Warning signs:** Pieces moving across visual gaps in the board. Knights landing on impassable squares.

**Phase:** Engine foundation (Phase 1). Core data structure decision — changing it later is a rewrite.

---

### Pitfall 4: Castling Rights Corrupted by Undo

**What goes wrong:** Castling is legal only if neither the king nor the chosen rook has moved previously. If castling rights are stored as a simple boolean and undo simply moves pieces back, the boolean is not restored — after undoing a king move, castling appears legal again even though it was just invalidated. Conversely, if castling rights are fully restored on undo, a player can castle, undo, and castle again from a different position than intended.

**Why it happens:** Castling rights are metadata that changes when king or rook moves. Undo systems that replay piece positions from a move list (rather than snapshotting full board state) miss this metadata.

**Consequences:** Castling available after king has moved (silently illegal). UI allows castle move, then puzzle state diverges from intended solution.

**Prevention:**
- Full board state snapshot on every move: positions + castling rights + en passant square. Undo pops the snapshot stack.
- Note: Xess spec says "opponents are static targets, no alternating turns." Verify whether the player's side ever has castling available in any intended puzzle. If castling will never appear in a Xess puzzle, remove it from the engine entirely and document the decision. Simpler is better.

**Warning signs:** King castles after being moved and undone. Castling available after rook was captured.

**Phase:** Engine foundation (Phase 1). Decide explicitly whether castling appears in Xess puzzles before implementing.

---

### Pitfall 5: Pawn Direction Is Ambiguous on Irregular Boards

**What goes wrong:** Standard chess pawns move "forward" — toward the opponent's back rank. On a non-rectangular or non-standard-orientation board, "forward" is ambiguous. If different puzzle boards use different pawn orientations and the pawn direction is hardcoded relative to the board array (always row decreasing = white forward), puzzles with pawns on rotated or mirrored boards behave incorrectly.

**Why it happens:** The puzzle format encodes piece type and color but not the pawn's movement direction. Developers assume all white pawns always move in the same array direction.

**Consequences:** Pawns move backwards. Capture diagonals point the wrong way. Puzzle is unsolvable.

**Prevention:**
- The puzzle format must encode pawn direction explicitly per piece instance, or define a board-level "up" direction. The text-grid notation described in PROJECT.md (`p`=white pawn, `P`=black pawn) implies two opposing sides — formalize what "white pawn forward" means in the coordinate system.
- Simplest safe choice: all pawns on a given board always move toward lower row indices (or higher, consistently defined). Document this constraint in the puzzle format spec.
- Even simpler: if Xess puzzles never require opposing pawns, use a single pawn piece type with an explicit `direction: +1 | -1` field in the puzzle definition.

**Warning signs:** Pawns can't move or move backward in playtesting. En passant available from wrong direction.

**Phase:** Puzzle format design (Phase 1/2). Must be resolved before authoring more than a handful of puzzles.

---

## Critical PWA Pitfalls

---

### Pitfall 6: Stale Service Worker Leaves Players on Old Puzzle Data

**What goes wrong:** After deploying updated puzzles or a bug fix, players who have the PWA installed continue running the cached old version. The service worker intercepts all fetches and serves the stale cache. Players see the fixed version only after manually clearing the cache or the service worker update cycle completes — which requires two visits in the default lifecycle.

**Why it happens:** The default service worker lifecycle: new SW installs but waits for all existing tabs to close before activating. Most developers don't configure `skipWaiting()` + `clients.claim()` and don't implement an update notification UI.

**Consequences:** Bug fixes don't reach players. New puzzles don't appear. Players with broken puzzle state from a previous bug never receive the fix.

**Prevention:**
- Use `skipWaiting()` + `clients.claim()` in the service worker to activate updates immediately.
- Add a version hash to the service worker filename or cache name. When the new SW activates, delete all old cache entries by name.
- For puzzle data specifically: cache puzzle JSON with a version-stamped cache key. A new puzzle set ships with a new key, old key is deleted on activation.
- Implement a reload prompt: listen for `controllerchange` event on `navigator.serviceWorker`, show a banner "New version available — tap to reload."
- Tool recommendation: Workbox (via workbox-cli or Vite plugin) handles cache versioning and skipWaiting automatically. Manual service worker authoring has a very high rate of subtle caching bugs.

**Warning signs:** Players reporting they still see old bugs after a deploy. DevTools Application > Service Workers showing an "Update pending" state that never resolves.

**Phase:** PWA setup phase (before first deploy). Retrofitting cache invalidation strategy is painful.

---

### Pitfall 7: Offline-First Breaks If Puzzle Assets Are Not Pre-Cached

**What goes wrong:** The game works offline *after* the player has visited the specific pages or loaded the specific assets that were cached. But if puzzle images, fonts, or audio are loaded lazily (on first access), a player who installs the PWA after completing puzzle 1 cannot play puzzle 5 offline because those assets were never fetched.

**Why it happens:** Many implementations use a runtime cache strategy (cache on first access) without a precache step. This is fine for content sites but wrong for games that must work fully offline.

**Consequences:** Offline play fails for puzzles the player hasn't yet visited. Missing fonts/icons make the UI look broken.

**Prevention:**
- Precache all game assets at service worker install time: the puzzle JSON file, all fonts, CSS, JS bundles, and any SVG/icon assets.
- For Xess, puzzles are static curated content — precache all 25–50 puzzle definitions at install. The total data size for text-format puzzles will be negligible (kilobytes).
- Use a manifest-based precache (Workbox generateSW) rather than manually listing filenames in the service worker — manual lists go stale on every build.

**Warning signs:** Game works online but individual puzzles fail to load offline. Font rendering differs online vs. offline.

**Phase:** PWA setup phase.

---

### Pitfall 8: iOS Safari PWA Quirks Are Numerous and Distinct from Chrome

**What goes wrong:** iOS Safari's PWA support has significant gaps: no push notifications (still limited), the `beforeinstallprompt` event does not fire (the "Add to Home Screen" prompt must be triggered manually by the user, not by the app), and standalone mode behavior differs.

Additionally: iOS Safari limits localStorage to ~5MB but may evict it under storage pressure without warning (unlike Android Chrome which is more aggressive about persisting). Safari's IndexedDB has also historically had bugs with large writes.

**Why it happens:** Developers test primarily on Chrome Android or desktop Chrome and assume behavior is uniform.

**Consequences:** Install prompt never shows on iOS. Storage gets silently evicted. PWA "installed" on iOS home screen still behaves unexpectedly.

**Prevention:**
- Do not rely on `beforeinstallprompt` for iOS. Show a persistent "tap Share → Add to Home Screen" instruction as an in-app prompt, conditioned on `navigator.standalone !== true` and `iOS user agent`.
- Test on real iOS Safari, not just Chrome. Safari 16+ improved many PWA behaviors but quirks remain.
- For Xess: puzzle progress stored in localStorage is low-risk due to small data size. Still, add a defensive export/import puzzle progress feature (deferred to v2 is fine) and document the iOS eviction risk.

**Warning signs:** "Install" button visible on Android but never on iOS. Progress lost after iOS low-storage event.

**Phase:** PWA setup + QA phase. iOS must be explicitly tested — not assumed from Chrome parity.

---

## Mobile Touch Pitfalls

---

### Pitfall 9: Touch Events and Click Events Fire in Wrong Order on Mobile

**What goes wrong:** Mobile browsers fire `touchstart` → `touchend` → `mousemove` → `mousedown` → `mouseup` → `click` in that sequence. If the chess board handles both touch and click events without deduplication, a single tap fires both handlers — moving the piece twice, or triggering piece selection then immediately deselecting it.

**Why it happens:** Desktop development with click handlers works fine. Adding touch support as an afterthought results in duplicate event handlers.

**Consequences:** Piece selections flicker. Moves fire twice, breaking puzzle state. Drag-and-drop conflicts with tap-to-select.

**Prevention:**
- Pick one interaction model: pointer events (the modern unified API that covers mouse, touch, and stylus) or touch events with explicit `e.preventDefault()` to suppress synthetic mouse events.
- Recommendation for Xess: use the Pointer Events API (`pointerdown`, `pointermove`, `pointerup`). It is supported on all modern mobile browsers and eliminates the touch/mouse duality entirely.
- For tap-to-select + tap-to-move (the simpler mobile interaction model): use `pointerdown` only. Do not implement drag-and-drop unless explicitly required — tap-to-select is more reliable on small screens.

**Warning signs:** Piece moves twice on a single tap. Selection immediately clears after being set. `console.log` shows handler called twice per touch.

**Phase:** Board UI implementation.

---

### Pitfall 10: Touch Target Size and "Fat Finger" on Small Boards

**What goes wrong:** Chess puzzles with many squares on a small mobile screen result in squares smaller than 44×44px — Apple's minimum touch target guideline. Players tap adjacent squares to the one they intended. On an irregular board, the visual square boundaries may not match the touch hit area, especially if SVG paths or CSS clip-paths are used for non-rectangular cells.

**Why it happens:** Board layout is designed by dividing available screen width by number of columns. A 10×10 board on a 360px-wide phone gives 36px squares — too small.

**Consequences:** Wrong piece selected. Puzzle frustrating to play. Negative reviews citing "controls don't work."

**Prevention:**
- Enforce a minimum square size of 44px. If the board is too large for the screen at this size, render it scrollable (pan-to-navigate) rather than compressing squares.
- For non-rectangular cells: use pointer event coordinates against the logical grid, not the visual polygon. Map pointer position to grid coordinate mathematically rather than relying on DOM event targets for irregular shapes.
- Consider a zoom/pan gesture for large puzzles rather than scaling down past the minimum.

**Warning signs:** In playtesting, players reporting wrong piece selected. Tap accuracy degrades on boards wider than 8 cells.

**Phase:** Board UI design + QA.

---

### Pitfall 11: Scroll Conflict — Board Pan vs. Page Scroll

**What goes wrong:** On mobile, a touch-drag on the chess board should move a piece (or pan a large board), but the browser interprets it as a page scroll event. The page scrolls instead of the piece moving.

**Why it happens:** Default browser behavior for `touchmove` is scroll. Developers call `e.preventDefault()` on `touchmove` to suppress scroll, but modern browsers require touch handlers to be declared as `{ passive: false }` for `preventDefault()` to work. Declaring them passive (the default, which is the browser's performance optimization) silently ignores the `preventDefault()` call.

**Consequences:** Board scrolls the page when the player tries to drag a piece. Completely broken drag-and-drop on mobile.

**Prevention:**
- Register `touchmove` (or `pointermove`) with `{ passive: false }` on the board element.
- Apply `touch-action: none` CSS property to the board element — this is the preferred modern approach and does not require `preventDefault()` in JavaScript.
- `touch-action: none` on the board container tells the browser to hand all touch events to the JS handler without attempting scroll, zoom, or other native behaviors.

**Warning signs:** Page scrolls when dragging pieces on mobile. `Unable to preventDefault inside passive event listener` console warning.

**Phase:** Board UI implementation (add `touch-action: none` from the start).

---

## Puzzle Format Pitfalls

---

### Pitfall 12: Puzzle Format Designed Ad Hoc Becomes Unmaintainable at Scale

**What goes wrong:** The text-grid notation described in PROJECT.md (`p`, `P`, `n`, `-`, `x`) is readable for simple cases but breaks down for: (a) pieces of the same type with different goals, (b) goal squares that coincide with piece starting squares, (c) multi-character piece identifiers needed as more piece types or colors are added, (d) boards with metadata (pawn direction, puzzle name, unlock requirements).

Designing the format as an afterthought after 10 puzzles means retrofitting all existing puzzles when the format evolves.

**Why it happens:** Initial prototyping favors the simplest thing that works. The format grows organically without a schema.

**Consequences:** 20 puzzles into authoring, a new requirement (e.g., a goal square under a piece) requires changing the format and migrating all existing puzzle files by hand.

**Prevention:**
- Define a versioned JSON schema for puzzles before authoring more than 2–3 test puzzles. Fields: `version`, `id`, `name`, `board` (width, height, squares with type and occupant), `goals`, `pieces` with explicit positions, types, colors, movement direction for pawns.
- The visual text-grid notation can remain as a human-readable authoring convenience that compiles to the JSON schema — but the canonical stored format is JSON.
- Add a `schemaVersion` field from day one. When the format changes, increment it and write a migration script.
- Test: can the format represent a goal square that also starts with a piece on it? Can it represent two kings? Can it represent a board with no pawns?

**Warning signs:** Having to "know" things about a puzzle that aren't in the format (e.g., "pawn on row 3 always moves up"). Format needing prose comments to be comprehensible.

**Phase:** Puzzle format design (Phase 1). Should be settled before more than a handful of test puzzles are authored.

---

### Pitfall 13: Sequential Unlock State Stored Without Integrity Check

**What goes wrong:** Puzzle unlock progression is stored in localStorage as a simple index or set of solved IDs. A player who manually edits localStorage (or a bug that corrupts it) can unlock all puzzles immediately or, worse, trigger an out-of-bounds access when the game reads a puzzle index that doesn't exist.

More commonly: a new deploy adds puzzles at the start of the list (reordering IDs), which invalidates all existing saved progress.

**Why it happens:** Simple implementations store `solvedPuzzles: [0, 1, 2]`. Reordering puzzles changes which puzzle `id=2` refers to.

**Consequences:** Player progress reset on deploy. Corrupted state causes JS errors. Puzzle unlock inconsistency.

**Prevention:**
- Identify puzzles by a stable opaque ID (UUID or short hash), never by array index.
- Validate localStorage contents on load: check schema version, reject/reset if invalid rather than crashing.
- New puzzles appended (not inserted) to the puzzle list to avoid invalidating existing IDs.
- Keep the total localStorage footprint small and auditable: store only solved puzzle IDs + current board state for the in-progress puzzle. No state bloat.

**Warning signs:** Progress resets after deploy. JS errors referencing undefined puzzle at a numeric index.

**Phase:** Persistence + puzzle data design (Phase 1/2).

---

## Performance Pitfalls

---

### Pitfall 14: DOM Re-Renders on Every Move Kill Performance on Low-End Devices

**What goes wrong:** Naive implementations re-render the entire board DOM on every move by clearing `innerHTML` and rebuilding all squares and pieces. On a 64-cell board with pieces, this triggers significant layout/paint work. On a low-end Android device (2GB RAM, slow CPU), this causes visible jank on every move.

**Why it happens:** Full re-render is the simplest correct implementation. Performance issues only appear on real low-end hardware.

**Consequences:** Janky, stuttery piece movement. Battery drain. Negative reviews from users on budget phones.

**Prevention:**
- Use incremental DOM updates: only update squares that changed. Move animation only touches the moved piece's element.
- If using a framework (Lit, Preact, etc.), its virtual DOM diffing handles this. If using vanilla JS, maintain a "previous state" to diff against and only touch changed DOM nodes.
- CSS transitions for piece movement: translate the piece with `transform: translate()` (GPU composited, cheap) rather than changing `top`/`left` (triggers layout).
- Avoid re-rendering goal square highlights on every move — only the moved square's highlight status can change.
- Test specifically on a low-end Android device or use Chrome DevTools CPU throttle (6x slowdown) during development.

**Warning signs:** Jank visible in DevTools Performance panel as long purple "layout" bars. FPS drops below 30 during moves on simulated slow hardware.

**Phase:** Board UI implementation. Establish rendering strategy upfront — switching from full-re-render to incremental later requires significant refactor.

---

### Pitfall 15: Local Storage Size Limit Exhausted by Puzzle State Snapshots

**What goes wrong:** If move history for undo is stored in localStorage (rather than only in memory), and each undo snapshot stores the full board state, a player who makes many moves can fill localStorage. The limit is 5MB on most browsers but is shared across the entire origin. A board with 64 squares × N pieces × JSON overhead × many moves can add up unexpectedly.

**Why it happens:** Developers persist undo history to survive page refreshes, serializing full board snapshots per move.

**Consequences:** `QuotaExceededError` on localStorage write. Current move not saved. Progress lost silently or with a cryptic error.

**Prevention:**
- Keep undo history **in memory only** (not persisted). On page refresh, restore the puzzle to its initial state from the static puzzle definition. This is simpler and avoids the size problem entirely.
- Persist to localStorage only: the set of solved puzzle IDs + which puzzle is currently active. The initial board state is always reconstructed from the static puzzle definition file.
- If persisting current move count is desired, persist only the move count or the sequence of moves (compact notation), not board state snapshots.
- Xess has 25–50 puzzles with small boards. Full progress state including move lists should fit well under 100KB. Still: test the actual byte size of your saved state before shipping.

**Warning signs:** `QuotaExceededError` in console on a long play session. Undo history lost on page refresh when it was supposed to be preserved.

**Phase:** Persistence design (Phase 1/2).

---

## Minor Pitfalls

---

### Pitfall 16: SVG Board Rendering and Coordinate System Mismatch

**What goes wrong:** If the board is rendered in SVG, SVG's Y-axis points down (origin top-left), matching typical screen coordinates. The chess engine's internal grid may use Y-up (origin bottom-left, row 0 = rank 1) for human readability. Mixing these coordinate systems without a clear conversion layer produces pieces that appear on the wrong squares.

**Prevention:** Define a single canonical coordinate system for the engine (recommend row 0 = top of board, column 0 = leftmost column) and keep all display code as pure projections from engine coordinates to screen coordinates. Never mix coordinate systems in a single layer.

**Phase:** Engine + UI interface design (Phase 1/2).

---

### Pitfall 17: Manifest Icons Missing Required Sizes Breaks PWA Install

**What goes wrong:** The Web App Manifest must include icons at specific sizes (192×192 and 512×512 minimum) for the browser to offer installation. Missing sizes cause silent install failure on Chrome Android or a degraded home screen icon on iOS.

**Prevention:** Generate icons at all required sizes from a single source SVG: 192, 512 (maskable variants for Android), and Apple Touch icon at 180×180. Use a build tool step to generate these rather than manually creating PNGs. Include `"purpose": "maskable"` on the 512px icon.

**Phase:** PWA setup phase.

---

### Pitfall 18: Puzzle Solution Verification Too Strict or Too Permissive

**What goes wrong:** For "move piece to goal square" puzzles, the win condition checks if a piece occupies a goal square at the end of a move. If multiple pieces can reach goal squares simultaneously, or if the goal requires a *specific* piece type (not any piece), the check can produce false positives (win triggered by wrong piece) or false negatives (puzzle appears unsolved when all goals are met).

**Prevention:** Define the win condition precisely in the puzzle schema: does any piece on a goal square count, or a specific piece? For "capture all target pieces": track which target pieces remain, not board positions. Test edge cases: capturing a target piece with a piece that is itself a target. Two target pieces in the same move (can't happen in Xess since there are no opponent moves, but confirm).

**Phase:** Game logic implementation (Phase 2).

---

## Phase-Specific Warning Map

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Chess engine — move generation | Pins ignored; rays cross impassable squares | Implement post-move king-check validation first; `isValidSquare()` as a primitive |
| Chess engine — en passant | Flag persists too long; undo broken | Store en passant target on board state, snapshot-based undo |
| Chess engine — castling | Undo restores position but not rights | Snapshot-based undo; consider removing castling from Xess entirely |
| Puzzle format definition | Ad hoc text format, unmaintainable at 25+ puzzles | JSON schema with schemaVersion before authoring begins |
| Board UI — rendering | Full DOM re-render on every move | Incremental update from the start; CSS transform for movement |
| Board UI — touch | Scroll conflict; double-event firing | `touch-action: none`; Pointer Events API; tap-to-select only |
| Board UI — touch targets | Squares too small on mobile | 44px minimum enforced; minimum size test on real device |
| Persistence | Progress tied to array index, lost on reorder | Stable puzzle IDs; validate schema on load |
| PWA — caching | Stale cache after deploy | Workbox; skipWaiting + clients.claim; cache version keys |
| PWA — offline | Assets not precached | Precache all puzzle data and static assets at SW install |
| PWA — iOS | No install prompt; eviction risk | Explicit iOS "Add to Home Screen" instructions; test on real iOS |

---

## Sources

- Chess programming knowledge: training data (HIGH confidence — these are well-known, well-documented chess engine correctness requirements)
- PWA service worker lifecycle: MDN Web Docs / W3C Service Worker specification (HIGH confidence)
- iOS Safari PWA limitations: widely documented in web developer community (MEDIUM confidence — behavior changes across iOS versions; verify against current iOS release)
- Pointer Events API and `touch-action`: W3C Pointer Events Level 2 specification (HIGH confidence)
- localStorage quotas: browser-specific, widely documented (MEDIUM confidence — exact limits vary; 5MB is the common default)
- Touch target size 44px: Apple Human Interface Guidelines / Material Design guidelines (HIGH confidence)

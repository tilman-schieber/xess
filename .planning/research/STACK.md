# Technology Stack

**Project:** Xess — Client-side PWA chess puzzle game
**Researched:** 2026-04-16
**Confidence note:** All external tools (WebSearch, WebFetch, Bash/CLI) were blocked during this research session. Findings are derived from training knowledge (cutoff August 2025). Versions marked [VERIFY] should be confirmed against current npm/official docs before pinning.

---

## Recommended Stack

### Build Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vite | ~6.x [VERIFY] | Dev server, bundler, asset pipeline | Fastest HMR for iterating on game UI; native ES modules; trivial PWA integration via plugin; zero config for vanilla JS or Preact; widely adopted as the standard for client-only apps in 2024-2025 |
| vite-plugin-pwa | ~0.21.x [VERIFY] | Service worker generation, manifest injection | Wraps Workbox; generates precache manifest from Vite build output automatically; handles SW registration, update prompts, offline fallback; only sane way to do PWA with Vite without writing service worker boilerplate |

**Do NOT use:** Webpack (too much config for no benefit here), Parcel (less ecosystem momentum, less PWA tooling), Create React App (abandoned), plain rollup (no dev server).

### Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla JS (no framework) | ES2022+ | UI rendering, game logic | Xess has no server-side rendering, no data-fetching layer, and a tightly controlled UI surface (puzzle board + minimal chrome). DOM manipulation for a grid-based board is straightforward. No virtual DOM overhead. No framework churn risk. Keeps the bundle tiny (~0 KB of framework overhead). |

**Why not React:** React is the right choice when component trees are deep, state is complex, or a team needs shared conventions. For a single-screen puzzle game with one board component and a few UI controls, React's reconciler is unused overhead. More importantly, the PROJECT.md explicitly says "vanilla JS or lightweight framework" — React is not lightweight.

**Why not Preact:** Preact (3 KB) is a reasonable fallback if DOM code gets messy, but start vanilla. If component re-render logic becomes painful after the board renderer is built, migrate to Preact — the Vite template swap takes minutes.

**Why not Svelte:** Svelte 5 is excellent and compiles to minimal JS. Valid alternative to vanilla. However, it introduces a compiler step and rune-based reactivity that adds onboarding cost for a game where "reactivity" is just re-rendering the board on move. Vanilla is simpler here.

**Why not Lit:** Reasonable for web components, but custom elements add ceremony for what is essentially one canvas/grid component.

**Verdict: Vanilla JS. Revisit Preact only if DOM management becomes unpleasant.**

### Chess Movement Logic

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Custom movement engine (hand-written) | N/A | Move generation and validation for Xess rules | chess.js (the standard JS chess library) encodes standard 8x8 chess with FEN/PGN, castling, en passant, check detection, and promotion — none of which apply to Xess. It cannot represent variable-size boards or non-rectangular grids. Using it would require fighting its assumptions constantly. Writing a movement validator for the 6 piece types on an arbitrary grid is ~200–400 lines and gives full control over goal types, impassable squares, and board shape. |

**Why NOT chess.js:** chess.js v1.x is hardcoded to an 8x8 board with standard FEN notation. It has no concept of impassable squares, variable board dimensions, or goal-square win conditions. Adapting it to Xess's rules would require more code than writing from scratch, and the result would be fragile.

**Why NOT chessboard.js or cm-chessboard:** These are rendering libraries for standard boards. Wrong layer entirely — Xess needs a custom board renderer anyway.

**Movement implementation strategy:**
- Represent the board as a `Map<string, Cell>` or a flat array with coordinate lookups
- Each piece type implements a `getMoves(board, position) => Position[]` function
- Impassable squares are excluded from the board's cell set
- Knights jump (ignore impassable squares in path, but target must be valid)
- This is a well-understood algorithm; no external dependency needed

### Local Storage / State Persistence

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `localStorage` (native browser API) | N/A | Persist solved puzzles, current puzzle state | The requirement is explicit: local storage only, no sync, no accounts. localStorage is synchronous, universally supported, and more than adequate for a JSON blob of 25–50 puzzle states (a few KB total). No library needed. |

**Why NOT IndexedDB:** IndexedDB is async and better for large structured data. Puzzle progress is a trivial JSON object. localStorage.setItem('xess-progress', JSON.stringify(state)) is sufficient and simpler.

**Why NOT a wrapper library (localforage, idb):** Adds dependency for no benefit at this data scale. Use localStorage directly. Abstract behind a thin module (e.g., `storage.js`) so it can be swapped if needed.

**Storage schema recommendation:**
```json
{
  "solvedPuzzles": [1, 3, 5],
  "currentPuzzle": 6,
  "puzzleStates": {
    "6": { "moves": [...], "startedAt": "..." }
  }
}
```

### PWA

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vite-plugin-pwa | ~0.21.x [VERIFY] | SW registration + precaching | See Build Tooling above |
| Workbox (via vite-plugin-pwa) | ~7.x [VERIFY] | Service worker strategies | vite-plugin-pwa uses Workbox under the hood. Use `generateSW` mode (not `injectManifest`) for zero boilerplate. Precache all static assets (JS, CSS, puzzle JSON, piece SVGs). Network-first for nothing — this is fully offline-capable. |
| Web App Manifest | N/A (spec) | Installability, splash screen, theme color | Configured in vite-plugin-pwa config, not a separate file. Set `name`, `short_name`, `display: standalone`, `orientation: portrait-primary` (mobile-first), `background_color`, `theme_color`, `icons` (at minimum 192x192 and 512x512 PNG). |

**iOS Safari note (MEDIUM confidence):** iOS Safari has historically had quirks with PWA installation (no beforeinstallprompt event, requires "Add to Home Screen" manually). As of iOS 16.4+, most core PWA features work. Service workers work. Standalone display works. Web Push is supported from iOS 16.4. Verify behavior on current iOS before shipping — this is a known rough edge.

### CSS / Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla CSS with custom properties | N/A | Layout, theming, mobile-first responsive | For a puzzle game with a fixed component inventory (board, piece, control bar), vanilla CSS with CSS Grid is the right tool. No Tailwind needed — utility classes add noise when styling a bespoke game board. CSS custom properties handle theming (colors, sizes) cleanly. |
| CSS Grid | N/A | Board layout | The puzzle board is literally a grid. `display: grid` with `grid-template-columns: repeat(N, 1fr)` maps directly to the board model. Dynamic board sizes (variable N) are trivially handled with inline style `--cols: N`. |

**Why NOT Tailwind:** Tailwind shines on content-heavy sites with many UI patterns. A chess board needs ~5 CSS rules per component type, all custom. Tailwind purge + config adds build complexity for no gain. The "utility class" mental model also conflicts with state-driven styling (piece selected, square highlighted) which is easier with class toggling against component-scoped styles.

**Why NOT a component library (MUI, shadcn, etc.):** The UI is entirely custom — no standard inputs or layouts that a component library would help with.

**Mobile-first approach:**
- Base styles target 320px viewport (smallest reasonable phone)
- Board fills available width: `width: min(100vw, 100vh - header-height)` to keep it square and visible
- Touch events: use `pointerdown`/`pointerup` (unified mouse/touch) for piece interaction
- No hover-only interaction patterns
- Font sizes in `rem` with a sensible base

### Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vitest | ~3.x [VERIFY] | Unit tests for movement engine | Vitest is Vite-native (same config, same transform pipeline). The movement engine (the custom chess logic) is the most critical and most testable part of the codebase — it's pure functions. Test every piece type's move generation exhaustively. No need for browser tests for logic. |

**Why NOT Jest:** Jest requires separate Babel/transform config when using Vite. Vitest shares Vite config, runs faster, and has a Jest-compatible API. No reason to use Jest in a Vite project.

**Why NOT Playwright/Cypress for v1:** E2E tests are valuable but not essential for the first build. The game is simple enough that manual testing covers UI. Add Playwright later if regression bugs appear in game flow.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build tool | Vite | Webpack 5 | 10x more config, no meaningful benefit for this project |
| Build tool | Vite | Parcel | Less PWA ecosystem, less community momentum |
| Framework | Vanilla JS | Preact | Valid but unnecessary for a single-screen game; revisit if DOM code grows |
| Framework | Vanilla JS | Svelte 5 | Compiler step, rune reactivity overhead for minimal benefit |
| Chess logic | Custom engine | chess.js | Hardcoded 8x8, no custom board support, fights Xess requirements |
| CSS | Vanilla CSS | Tailwind | Adds config complexity for a bespoke game UI; utility classes don't help custom game states |
| Storage | localStorage | IndexedDB | Async overhead not justified for KB-scale puzzle state |
| Storage | localStorage | localforage | Wrapper dependency not justified at this scale |
| Testing | Vitest | Jest | Requires separate transform config in Vite project |

---

## Installation

```bash
# Scaffold
npm create vite@latest xess -- --template vanilla

# PWA
npm install -D vite-plugin-pwa

# Testing
npm install -D vitest
```

No runtime dependencies are needed for the chess engine or storage layer — both are custom/native.

Optional (add only if needed):
```bash
# If vanilla DOM management becomes messy
npm install preact
```

---

## Confidence Assessment

| Recommendation | Confidence | Notes |
|----------------|------------|-------|
| Vite as build tool | HIGH | Dominant standard for client-only JS apps; no credible competition in this niche |
| Vanilla JS (no framework) | HIGH | Explicitly supported by PROJECT.md; appropriate for single-screen game complexity |
| Custom chess engine (not chess.js) | HIGH | chess.js's 8x8 constraint is documented fact; custom engine is the only viable path |
| vite-plugin-pwa for service worker | HIGH | Standard Vite PWA solution; well-maintained; no credible alternative |
| localStorage for persistence | HIGH | Matches stated requirements exactly; no scale concern at 50 puzzles |
| Vanilla CSS + CSS Grid | HIGH | CSS Grid is baseline for all modern browsers; right fit for grid-based game |
| Vitest for testing | HIGH | Native Vite integration; clear winner over Jest for Vite projects |
| Specific version numbers | LOW | All versions marked [VERIFY] — training cutoff is August 2025; verify against npm before pinning |
| iOS Safari PWA behavior | MEDIUM | Known rough edge; behavior improves with each iOS release but needs hands-on verification |

---

## Sources

- Training knowledge (August 2025 cutoff) — all external research tools blocked during this session
- PROJECT.md constraints: "Vanilla JS or lightweight framework", "Local storage only", "PWA service worker"
- chess.js README (training data): documents 8x8 FEN-based architecture
- Vite documentation (training data): v5/v6 feature set and PWA plugin integration
- Workbox documentation (training data): SW generation strategies

**Action required before development:** Verify `vite`, `vite-plugin-pwa`, and `vitest` current versions on npmjs.com. All were confirmed correct as of training data but may have major releases since August 2025.

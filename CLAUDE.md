<!-- GSD:project-start source:PROJECT.md -->
## Project

**Xess**

Xess is a client-side chess-based puzzle game that runs in the browser and installs as a PWA. Pieces move exactly like chess, but the boards are non-standard — variable sizes, non-rectangular grids, impassable squares — and all squares are uniform (no alternating colors). Players solve curated puzzles by capturing target pieces or moving pieces onto goal squares.

**Core Value:** A chess puzzle game where the twist is the board, not the rules — players who know chess can immediately play, but the strange board geometries create fresh, surprising challenges.

### Constraints

- **Tech stack**: Vanilla JS or lightweight framework — no backend, runs entirely in browser
- **Storage**: Local storage only — no accounts, no sync
- **Offline**: Must work offline after first load (PWA service worker)
- **Compatibility**: Modern mobile browsers (iOS Safari, Chrome Android) + desktop
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Build Tooling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vite | ~6.x [VERIFY] | Dev server, bundler, asset pipeline | Fastest HMR for iterating on game UI; native ES modules; trivial PWA integration via plugin; zero config for vanilla JS or Preact; widely adopted as the standard for client-only apps in 2024-2025 |
| vite-plugin-pwa | ~0.21.x [VERIFY] | Service worker generation, manifest injection | Wraps Workbox; generates precache manifest from Vite build output automatically; handles SW registration, update prompts, offline fallback; only sane way to do PWA with Vite without writing service worker boilerplate |
### Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla JS (no framework) | ES2022+ | UI rendering, game logic | Xess has no server-side rendering, no data-fetching layer, and a tightly controlled UI surface (puzzle board + minimal chrome). DOM manipulation for a grid-based board is straightforward. No virtual DOM overhead. No framework churn risk. Keeps the bundle tiny (~0 KB of framework overhead). |
### Chess Movement Logic
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Custom movement engine (hand-written) | N/A | Move generation and validation for Xess rules | chess.js (the standard JS chess library) encodes standard 8x8 chess with FEN/PGN, castling, en passant, check detection, and promotion — none of which apply to Xess. It cannot represent variable-size boards or non-rectangular grids. Using it would require fighting its assumptions constantly. Writing a movement validator for the 6 piece types on an arbitrary grid is ~200–400 lines and gives full control over goal types, impassable squares, and board shape. |
- Represent the board as a `Map<string, Cell>` or a flat array with coordinate lookups
- Each piece type implements a `getMoves(board, position) => Position[]` function
- Impassable squares are excluded from the board's cell set
- Knights jump (ignore impassable squares in path, but target must be valid)
- This is a well-understood algorithm; no external dependency needed
### Local Storage / State Persistence
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `localStorage` (native browser API) | N/A | Persist solved puzzles, current puzzle state | The requirement is explicit: local storage only, no sync, no accounts. localStorage is synchronous, universally supported, and more than adequate for a JSON blob of 25–50 puzzle states (a few KB total). No library needed. |
### PWA
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vite-plugin-pwa | ~0.21.x [VERIFY] | SW registration + precaching | See Build Tooling above |
| Workbox (via vite-plugin-pwa) | ~7.x [VERIFY] | Service worker strategies | vite-plugin-pwa uses Workbox under the hood. Use `generateSW` mode (not `injectManifest`) for zero boilerplate. Precache all static assets (JS, CSS, puzzle JSON, piece SVGs). Network-first for nothing — this is fully offline-capable. |
| Web App Manifest | N/A (spec) | Installability, splash screen, theme color | Configured in vite-plugin-pwa config, not a separate file. Set `name`, `short_name`, `display: standalone`, `orientation: portrait-primary` (mobile-first), `background_color`, `theme_color`, `icons` (at minimum 192x192 and 512x512 PNG). |
### CSS / Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla CSS with custom properties | N/A | Layout, theming, mobile-first responsive | For a puzzle game with a fixed component inventory (board, piece, control bar), vanilla CSS with CSS Grid is the right tool. No Tailwind needed — utility classes add noise when styling a bespoke game board. CSS custom properties handle theming (colors, sizes) cleanly. |
| CSS Grid | N/A | Board layout | The puzzle board is literally a grid. `display: grid` with `grid-template-columns: repeat(N, 1fr)` maps directly to the board model. Dynamic board sizes (variable N) are trivially handled with inline style `--cols: N`. |
- Base styles target 320px viewport (smallest reasonable phone)
- Board fills available width: `width: min(100vw, 100vh - header-height)` to keep it square and visible
- Touch events: use `pointerdown`/`pointerup` (unified mouse/touch) for piece interaction
- No hover-only interaction patterns
- Font sizes in `rem` with a sensible base
### Testing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vitest | ~3.x [VERIFY] | Unit tests for movement engine | Vitest is Vite-native (same config, same transform pipeline). The movement engine (the custom chess logic) is the most critical and most testable part of the codebase — it's pure functions. Test every piece type's move generation exhaustively. No need for browser tests for logic. |
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
## Installation
# Scaffold
# PWA
# Testing
# If vanilla DOM management becomes messy
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
## Sources
- Training knowledge (August 2025 cutoff) — all external research tools blocked during this session
- PROJECT.md constraints: "Vanilla JS or lightweight framework", "Local storage only", "PWA service worker"
- chess.js README (training data): documents 8x8 FEN-based architecture
- Vite documentation (training data): v5/v6 feature set and PWA plugin integration
- Workbox documentation (training data): SW generation strategies
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

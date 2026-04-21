## Project

**Xess**

Xess is a client-side chess-based puzzle game that runs in the browser and installs as a PWA. Pieces move exactly like chess, but the boards are non-standard — variable sizes, non-rectangular grids, impassable squares — and all squares are uniform (no alternating colors). Players solve curated puzzles by capturing target pieces or moving pieces onto goal squares.

**Core Value:** A chess puzzle game where the twist is the board, not the rules — players who know chess can immediately play, but the strange board geometries create fresh, surprising challenges.

### Constraints

- **Tech stack**: Vanilla JS or lightweight framework — no backend, runs entirely in browser
- **Storage**: Local storage only — no accounts, no sync
- **Offline**: Must work offline after first load (PWA service worker)
- **Compatibility**: Modern mobile browsers (iOS Safari, Chrome Android) + desktop

## Technology Stack

### Build Tooling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vite | ~6.x | Dev server, bundler, asset pipeline | Fastest HMR for iterating on game UI; native ES modules; trivial PWA integration via plugin; zero config for vanilla JS; widely adopted standard for client-only apps |
| vite-plugin-pwa | ~0.21.x | Service worker generation, manifest injection | Wraps Workbox; generates precache manifest from Vite build output automatically; handles SW registration, update prompts, offline fallback |

### Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla JS (no framework) | ES2022+ | UI rendering, game logic | Xess has no server-side rendering, no data-fetching layer, and a tightly controlled UI surface. DOM manipulation for a grid-based board is straightforward. No virtual DOM overhead. Keeps the bundle tiny. |

### Chess Movement Logic
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Custom movement engine (hand-written) | N/A | Move generation and validation for Xess rules | chess.js encodes standard 8x8 chess and cannot represent variable-size boards or non-rectangular grids. Custom engine is ~300 lines of pure functions and gives full control over goal types, impassable squares, and board shape. |

- Board represented as a `Map<string, Cell>` with coordinate key lookups
- Each piece type implements move generation for arbitrary grid shapes
- Impassable squares are excluded from the board's cell set
- Knights jump (ignore impassable squares in path, but target must be valid)
- Pawn direction is encoded per-piece in the puzzle definition (not inferred from color)

### Local Storage / State Persistence
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `localStorage` (native browser API) | N/A | Persist solved puzzles, current puzzle state | Single `xess_v1` JSON blob; synchronous, universally supported, adequate for KB-scale puzzle state |

### PWA
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vite-plugin-pwa | ~0.21.x | SW registration + precaching | Standard Vite PWA solution |
| Workbox (via vite-plugin-pwa) | ~7.x | Service worker strategies | `generateSW` mode; precaches all static assets; fully offline-capable with no runtime caching |

### CSS / Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla CSS with custom properties | N/A | Layout, theming, mobile-first responsive | CSS Grid maps directly to the board model; custom properties handle theming cleanly; no utility-class overhead |

- Base styles target 320px viewport
- Touch events use `pointerdown`/`pointerup` (unified mouse/touch)
- No hover-only interaction patterns
- Font sizes in `rem`

### Testing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vitest | ~3.x | Unit tests for movement engine and UI contracts | Vite-native; same config and transform pipeline; pure-function engine is exhaustively testable without a browser |

## Conventions

- One `.test.js` file per source file, co-located with the source
- Engine functions are pure — no DOM access, no localStorage
- Controller is pure — no direct browser API access; store.js owns all localStorage
- Visual affordances use CSS pseudo-element overlays on cells, not piece recoloring
- Map serialization uses `Array.from(map.entries())` (not `JSON.stringify`)
- Controller accepts an optional catalogue parameter for test injection (avoids module mocking)

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full module map and data flow.

Key decisions:
- Custom chess engine (not chess.js) — 8×8 assumption is incompatible with Xess boards
- Controller is pure (no localStorage); `store.js` handles all persistence
- No framework — single-screen game with a fixed component inventory

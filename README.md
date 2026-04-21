# Xess

A browser-based chess puzzle game where the twist is the board, not the rules. Pieces move exactly like chess, but boards are non-standard — variable sizes, non-rectangular grids, impassable squares. Players who know chess can start immediately; the strange geometries create the challenge.

Runs entirely in the browser. No accounts, no server. Installable as a PWA and playable offline.

## Features

- **Capture mode** — capture all target pieces to solve the puzzle
- **Reach mode** — move your pieces onto all goal squares
- **Tutorial track** — introduces Xess-specific board concepts for new players
- **Track browser** — curated puzzle collections organized by theme
- **Progress persistence** — solved puzzles and active state saved in local storage
- **PWA** — installs on mobile and desktop, works offline after first load
- **Optional audio** — sound effects for moves and wins (explicit opt-in)

## Getting Started

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
npm test         # run unit tests
npm run build    # production build
npm run preview  # preview production build locally
```

## Documentation

- [docs/architecture.md](docs/architecture.md) — source structure, module map, data flow
- [docs/development.md](docs/development.md) — dev workflow, testing, adding puzzles
- [docs/puzzle-format.md](docs/puzzle-format.md) — puzzle JSON schema reference

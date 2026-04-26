# Xess Design Guidelines

A snapshot of the current visual design system — intended as a reference point for redesign, not a prescription to keep.

---

## Design language

The current aesthetic is **dark liquid glass**: deep navy backgrounds, translucent frosted-glass panels, glowing accent highlights. The look leans into the idea of a polished game UI — premium-feeling but minimal, no decorative chrome.

The board itself is the visual centrepiece. Everything else — nav, meta panel, controls — recedes to support it.

---

## Colour

### Background
A deep navy base (`#090d16`) with a layered radial gradient on `<body>`: a cool blue bloom at the top-left, a teal-green bloom at the top-right, fading into solid dark. The gradient gives the page depth without photography or illustration.

### Glass surfaces
Panels, cards, and the top bar are semi-transparent dark-blue layers sitting on top of the background gradient, blurred with `backdrop-filter: saturate(140%) blur(16px)`. Two gradient stops:
- Lighter face: `rgba(27, 41, 72, 0.42)`
- Darker base: `rgba(16, 26, 50, 0.24)`

Applied as a `155deg` linear gradient.

### Borders
Glass elements use a two-tone border: a soft edge `rgba(206, 223, 255, 0.34)` on the sides and bottom, a stronger top edge `rgba(230, 240, 255, 0.5)` to simulate light catching the rim. This is the core glass illusion.

### Accent
- Primary accent (mint green): `#61d9a7` — used for active states, the win state, legal-move highlights, and the primary CTA button.
- Destructive / warning: `#ff6f7a` — used sparingly for illegal-move feedback and the promotion indicator stripe.

### Text
- Primary: `#f5f7ff` — near-white with a blue cast
- Secondary: `#c7d2f4` — muted periwinkle
- Muted / labels: `#6b7aa3`

### Cells
- Playable cells: light blue-grey gradient (`#e7ecff` → `#d2dbf6`) — the board is pale, pieces sit on it with high contrast
- Goal cells: light green gradient (`#f6ffe9` → `#dff7cd`) with a mint inset border ring
- Selected cell: blue-violet overlay (`#4a6fff`) applied via `::after` pseudo-element
- Legal move: mint green overlay (same pseudo-element pattern)
- Illegal feedback: destructive red overlay (same pattern)

---

## Typography

Single typeface: **Inter** (locally bundled for offline PWA support), weights 400 and 600.

Scale (rem-based):
| Token | Size |
|---|---|
| label | 0.875rem |
| body | 1rem |
| heading | 1.125rem |
| display | 1.25rem |

Font sizes are rem, never px, for accessibility scaling. No italic is used. Headings are weight 600; body copy is 400.

---

## Spacing

4px base unit. Named scale: `xs` (0.25rem) → `sm` (0.5rem) → `md` (1rem) → `lg` (1.5rem) → `xl` (2rem) → `2xl` (3rem) → `3xl` (4rem). Components use the named tokens throughout, not raw values.

---

## Layout

- Mobile-first, single-column. Max-width for the gameplay shell: 375px on mobile, 960px on desktop.
- The board dominates. On small screens, the play view uses the full viewport height with a sticky top bar and the board fills remaining space.
- Board sizing is CSS-only via the `--board-width` custom property in `src/styles/board.css`, constrained by viewport width only (`min(calc(100vw - 1rem), var(--board-max-size-mobile))`). Height is derived from width × (rows/cols) to keep cells square.
- Desktop layout splits into a two-column grid for the puzzle creator (sidebar + board).

---

## Components

### Glass panels (`.puzzle-topbar`, `.app-shell-topbar`, `.start-screen-panel`, `.track-card`)
The repeating pattern:
- `border-radius` ~0.95rem
- 1px border with the soft/strong two-tone treatment
- `background: linear-gradient(155deg, …)` using glass tokens
- `backdrop-filter: saturate(140%) blur(16px)`
- `box-shadow` with a large-radius dark drop shadow

### Controls (buttons, nav actions)
- Minimum touch target 44×44px enforced everywhere
- Same glass border pattern as panels, slightly more opaque gradient
- Hover: accent border highlight (`border-color: var(--accent)`)
- Active: `translateY(1px)` nudge
- Disabled: `opacity: 0.35`, pointer-events off
- Transitions on `color` and `border-color` at 0.15s

### Primary CTA (`.btn-next-puzzle`, `.track-action-open`)
Solid accent green fill with a dark-tinted text (`var(--surface-bg)`). The only fully-opaque coloured surface in the UI.

### Chips / badges
Pill-shaped (`border-radius: 999px`), semi-transparent chip background, glass border, inset 1px white highlight at the top edge.

### Board
- CSS Grid with uniform cell gaps (0.15rem mobile, 0.2rem desktop)
- Cells are square by `aspect-ratio: 1/1`
- Board itself has the deep glass treatment
- Win state: a fixed overlay modal (`.win-modal { position: fixed; inset: 0 }`) renders above the board
- Promotion-enabled: a thin destructive-coloured gradient bar at the top edge

### Interaction overlays
Cell states (selected, legal, illegal) use `::after` pseudo-elements with `opacity` transitions. Pieces are not recoloured; the cell beneath changes instead.

---

## Motion

Minimal. The only animated transition is piece movement: `transform` over ~180ms `ease`. State overlays (`::after`) fade in at 140ms. Button hover/active states are 150ms. No entrance animations, no page transitions.

---

## What is intentionally absent

- No light mode
- No alternating cell colours (all cells are the same — boards are non-standard shapes, not 8×8 chess)
- No hover-only interactions (everything works on touch)
- No illustrations or photography
- No icon font — the one SVG icon pattern uses inline SVG

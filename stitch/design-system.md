# Design System: Obsidian Gambit
**Project:** Teal Glass Gambit (`11278984645670924589`)
**Asset:** `assets/4f93c0b80d434e94af1ac179f4bd4e58`

---

# Design System Strategy: Tactical Refraction

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Grandmaster's Lens."**

This system moves away from the flat, utilitarian nature of standard mobile apps toward a high-tech, immersive atmosphere that mimics a futuristic tactical terminal. We achieve a premium feel not through complexity, but through **depth, light, and translucency.** By utilizing intentional asymmetry and overlapping glass layers, we create a UI that feels like it's floating over a deep, infinite void. The goal is to make the player feel less like they are playing a game and more like they are operating a sophisticated piece of sentient chess hardware.

## 2. Colors & Surface Philosophy
The palette is rooted in deep charcoal tones, punctuated by high-frequency teal accents that signify energy and active intelligence.

### The "No-Line" Rule
Standard UI relies on borders to separate content. In this design system, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through background color shifts or subtle tonal transitions.
*   **Contextual Separation:** Use a `surface_container_low` section sitting on a `surface` background to define a zone.
*   **Depth-First Layout:** Instead of a flat grid, treat the UI as physical layers. An inner container should use a higher surface tier (e.g., `surface_container_highest`) to signal a "lift" toward the user.

### Glassmorphism & The Gradient Soul
To achieve the signature high-tech look, floating elements must utilize **Glassmorphism**:
*   **The Recipe:** Combine a semi-transparent `surface_container` (approx. 40-60% opacity) with a `backdrop-blur` (16px to 32px).
*   **Signature Gradients:** Main CTAs and interactive chess pieces should utilize a subtle linear gradient transitioning from `primary` (#48f7e2) to `primary_container` (#00dac6). This provides a sense of "glow" and volume that flat colors lack.

## 3. Typography
*   **Display & Headline:** Space Grotesk — geometric precision mirroring chess mathematics.
*   **Body & Labels:** Manrope — humanist clarity contrasting the sharp headlines.
*   **Editorial Hierarchy:** Wide tracking (letter-spacing) on `label-sm` in uppercase for "System Status" / "Move History" elements.

## 4. Elevation & Depth
Hierarchy through **Tonal Layering**, not drop shadows.
*   **Ambient Shadows:** blur 30px+, opacity 4–8%, color tinted from `on_surface`.
*   **Ghost Border Fallback:** `outline_variant` at 15% opacity for accessibility boundaries.

## 5. Components

### Buttons
*   **Primary:** Teal gradient (`primary` → `primary_container`), pill shape (`full` roundedness), `on_primary` text in `title-sm`.
*   **Secondary (Glass):** Semi-transparent `surface_variant`, 20px backdrop-blur, Ghost Border.
*   **Tertiary:** No background, `primary` text with underline or chevron.

### Chips
*   `surface_container_highest` background, no border, `md` roundedness (0.75rem), `label-md` text.

### Cards & Boards
*   No dividers — use whitespace (1.5–2rem) or background shift to `surface_container_low`.
*   Board: `surface_container_lowest` base; "light" squares are `surface_container_high` at 20% opacity.

### Input Fields
*   Sunken: `surface_container_lowest` + 15% opacity Ghost Border.
*   Active: Ghost Border → 100% `primary` + teal outer glow (blur 10px).

### Tooltips & Overlays
*   `surface_container_highest` at 50% opacity + 40px backdrop-blur.

---

## Color Tokens

| Token | Hex |
|---|---|
| `primary` | `#48f7e2` |
| `primary_container` | `#00dac6` |
| `primary_fixed` | `#4efbe6` |
| `primary_fixed_dim` | `#15deca` |
| `on_primary` | `#003731` |
| `on_primary_container` | `#005a51` |
| `secondary` | `#99d1c7` |
| `secondary_container` | `#16524a` |
| `on_secondary` | `#003731` |
| `on_secondary_container` | `#8bc3b9` |
| `tertiary` | `#ffd8ab` |
| `tertiary_container` | `#ffb34d` |
| `on_tertiary` | `#472a00` |
| `background` | `#131313` |
| `surface` | `#131313` |
| `surface_dim` | `#131313` |
| `surface_bright` | `#393939` |
| `surface_container_lowest` | `#0e0e0e` |
| `surface_container_low` | `#1c1b1b` |
| `surface_container` | `#201f1f` |
| `surface_container_high` | `#2a2a2a` |
| `surface_container_highest` | `#353534` |
| `surface_variant` | `#353534` |
| `surface_tint` | `#15deca` |
| `on_surface` | `#e5e2e1` |
| `on_surface_variant` | `#bacac6` |
| `on_background` | `#e5e2e1` |
| `outline` | `#849490` |
| `outline_variant` | `#3b4a47` |
| `error` | `#ffb4ab` |
| `error_container` | `#93000a` |
| `on_error` | `#690005` |
| `inverse_surface` | `#e5e2e1` |
| `inverse_on_surface` | `#313030` |
| `inverse_primary` | `#006a60` |

## Typography

| Role | Font |
|---|---|
| Display / Headline | Space Grotesk |
| Body | Manrope |
| Label | Manrope |

## Spacing & Shape

| Property | Value |
|---|---|
| Roundness | `ROUND_EIGHT` (8px base) |
| Spacing Scale | 3 |
| Color Mode | Dark |
| Custom Accent | `#00DAC6` |

---

## Do's and Don'ts

**DO:**
- Use intentional asymmetry for a sophisticated, non-template look.
- Lean into the "Teal Glow" for critical interactive paths and success states.
- Ensure `on_surface` text has sufficient contrast against blurred backgrounds.

**DON'T:**
- Use 100% opaque black for containers — it kills the glass illusion. Always use `surface_container` tiers.
- Use 0px corners. System relies on DEFAULT (0.5rem) and xl (1.5rem) roundedness.
- Use standard Material Design shadows. Use tonal stacking and diffused ambient glows instead.

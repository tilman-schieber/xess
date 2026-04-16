# Feature Landscape

**Domain:** Browser-based chess puzzle game (PWA, non-standard board geometry)
**Project:** Xess
**Researched:** 2026-04-16
**Confidence:** MEDIUM (based on training-data knowledge of Chess.com, Lichess, Really Bad Chess, mobile puzzle game conventions; web search unavailable)

---

## Table Stakes

Features players expect from a puzzle game. Missing any of these causes abandonment.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Tap/click to select + move pieces | Fundamental chess input model; drag is secondary | Low | Two-tap pattern (select then destination) works well on mobile; drag optional |
| Move validation with visual feedback | Players need to know what's legal immediately — invalid moves must be rejected with clear feedback | Medium | Highlight legal destinations on piece select; red flash or shake on illegal attempt |
| Undo move | Standard in every puzzle game; players recover from mistakes without full restart | Low | Single-level undo is table stakes; multi-level is a differentiator |
| Reset puzzle | Return to initial state; essential safety net when player is deeply stuck | Low | Confirm dialog optional — keep friction low |
| Win detection and clear win state | The "you solved it" moment must be unambiguous and satisfying | Low | Needs animation/sound feedback or it feels broken |
| Sequential puzzle unlock | Players expect progression with a sense of direction; open access to hard puzzles before easy ones is disorienting | Low | Lock icon on future puzzles; current puzzle clearly highlighted |
| Progress persistence across sessions | PWAs and web games that lose progress on close are immediately uninstalled | Low | localStorage is sufficient; document the key schema early to avoid migrations |
| Offline play after install | PWA contract: once installed, works offline. Failure here breaks trust in the install entirely | Medium | Service worker + precache all puzzle assets; test on iOS Safari specifically |
| Installable as PWA (manifest + service worker) | Users who choose to install expect it to behave like a native app | Medium | Icons at all required sizes (192, 512), standalone display mode, theme color |
| Readable puzzle board at mobile scale | Chess pieces must be distinguishable at 375px width; non-standard boards add layout complexity | Medium | SVG pieces or icon font; minimum touch target 44px per Apple HIG |
| Clear goal communication | Players need to know at a glance what "winning" means for each puzzle (capture these pieces vs reach these squares) | Low | Goal type label + visual highlighting of targets at puzzle start |
| Puzzle count / position indicator | "Puzzle 7 of 42" — players need to orient themselves in the overall set | Low | Simple counter in header |

---

## Differentiators

Features that set Xess apart. Not universally expected, but create loyalty and word-of-mouth.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Non-rectangular board shapes | The core novelty of Xess — no other chess puzzle game uses variable board geometry as the puzzle mechanic | High | Board renderer must handle arbitrary connected-cell graphs, not just rectangular grids; impassable squares as first-class concept |
| Uniform square coloring (no chess color pattern) | Reinforces that this is not standard chess; makes non-rectangular boards visually clean and unambiguous | Low | Already in scope; makes piece vision genuinely harder since the standard color-based pattern recognition is removed |
| Static opponent pieces (no alternating turns) | Simpler mental model than full chess; lets puzzles be curated as single-player logic problems rather than tactical positions | Low | Removes a whole class of complexity (opponent responses) and lets puzzle design focus on geometry |
| Two distinct goal types | Capture-all vs reach-square creates different puzzle flavors from the same movement rules | Medium | Goal type must be encoded in puzzle format and surfaced clearly in UI |
| Multi-level undo (full history) | Most chess puzzle apps give only single undo; full undo history lets players explore freely and is especially valuable on non-obvious boards | Medium | Stack of game states in memory; negligible size for board-scale puzzles |
| Smooth micro-animations for piece movement | Tactile quality signals premium product; chess.com's animations are a benchmark | Medium | CSS transitions or Web Animations API; 150-200ms slide feels right |
| Elegant, premium visual style (no chess clichés) | Most chess puzzle apps look like 2005; a modern, clean aesthetic attracts non-chess players | High | Custom piece set (not standard Merida/CBurnett), refined color palette, considered typography |
| Puzzle solved celebration (tasteful) | Short particle burst or piece animation on solve creates a moment worth sharing; absent from most browser chess games | Low | Canvas confetti or CSS keyframe animation; keep under 500ms |
| Difficulty curve visible in puzzle list | Seeing "early puzzles are easy, later are hard" communicates pacing even before playing | Low | Can be as simple as implied ordering without explicit labels |
| Sound feedback (optional, off by default) | Click/move/win sounds add tactile quality; must be opt-in (mobile users often in silent contexts) | Low | Single AudioContext; 3-4 short samples; persist preference in localStorage |

---

## Anti-Features

Features to explicitly NOT build in v1. Each entry explains why avoidance is a feature, not a gap.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Hint system | Hints require knowing the intended solution path, which requires solver infrastructure; they also reduce the satisfaction of solving | Trust undo + reset as the safety net; puzzle difficulty curve does the rest |
| Move count / par ("solve in N moves") | Par systems pressure players and frame exploration as failure; non-standard boards make "optimal" paths unintuitive | Remove move count from UI entirely; success is success regardless of path |
| Timer / speed challenge | Speed runs attract a specific audience (competitive chess) that isn't the Xess target; adds anxiety to a geometry puzzle experience | No timer in UI; if analytics needed use passive time-on-puzzle tracking only |
| In-app level editor | Editor requires a substantially different UI, validation tooling, and QA surface; user-created content raises moderation questions | Curated content is a feature: every puzzle is intentional |
| Online leaderboards / accounts | Requires a backend, authentication, GDPR/privacy considerations, ongoing ops cost; none of this serves the core value | Local completion tracking is sufficient; social sharing of "I solved puzzle 42" is free |
| Undo limit / move limit | Artificial constraints on undo feel punitive in a geometry puzzle game where orientation is genuinely hard | Unlimited undo; players learn by exploring |
| Pawn promotion | On non-rectangular boards, promotion zones are geometrically ambiguous; adds rules complexity with no puzzle design benefit | Pawns move and capture normally, never promote; document this clearly in any tutorial |
| Alternating-turn chess (opponent moves) | Full chess requires minimax or pre-computed lines; makes puzzle authoring exponentially harder; changes genre from logic puzzle to tactics trainer | Static opponent pieces only; all movement is by the player |
| Interstitial ads / monetization prompts | PWA puzzle games that interrupt with ads have near-zero retention; free + premium is the model if monetization is ever added | Keep ad-free; if monetization: one-time unlock for additional puzzle packs |
| Social/feed features | Complexity for a solo puzzle game; feeds require backend, moderation, trust-and-safety | Share button (Web Share API) for specific puzzle completion is sufficient |
| Achievements / badge system | Meaningful achievements require thoughtful design to avoid feeling hollow; hollow achievements are worse than none | Completion checkmarks on puzzle list give sufficient sense of progress |

---

## Feature Dependencies

```
PWA install → Service worker → Offline play
             ↓
         localStorage persistence → Progress tracking → Sequential unlock

Board renderer (arbitrary shape) → Move validation → Legal move highlighting
                                                    → Win detection
                                                    → Undo stack

Puzzle format (text grid notation) → All puzzle features (no format = nothing else works)

Win detection → Win state animation → Sound feedback (optional layer on top)

Goal type encoding (capture vs reach) → Goal display in UI → Win condition check
```

Critical path: Puzzle format definition → Board renderer → Move validation → Win detection. Everything else layers on top.

---

## MVP Recommendation

**Prioritize (ship with):**

1. Puzzle format (text grid with impassable squares, piece positions, goal type)
2. Board renderer that handles arbitrary shapes
3. Standard chess movement for all 6 piece types
4. Two-tap select-and-move with legal move highlighting
5. Win detection for both goal types with clear win state
6. Undo (multi-level) + reset
7. Sequential unlock with localStorage persistence
8. PWA manifest + service worker (offline, installable)
9. Goal type display per puzzle
10. Puzzle position indicator ("7 / 42")

**Defer but plan for:**

- Sound feedback (design audio hooks in early; add samples later)
- Smooth piece movement animations (CSS transitions are low-effort; add in polish phase)
- Puzzle solved celebration (add after core loop is validated)
- Difficulty labeling / visual curve in puzzle list

**Explicitly out of scope (document for stakeholders):**

- Hints, par system, timer, accounts, leaderboards, editor, opponent turns, pawn promotion

---

## Sources

- Training-data knowledge of Chess.com puzzle UX, Lichess puzzle interface, Really Bad Chess (Zach Gage), Monument Valley progression model
- Apple Human Interface Guidelines: minimum touch target sizing (44x44pt)
- PWA install/offline requirements: Web App Manifest spec, Service Worker lifecycle
- Confidence: MEDIUM — web search unavailable; recommendations based on well-established patterns in the genre rather than 2025/2026 market data

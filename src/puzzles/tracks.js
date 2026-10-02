// src/puzzles/tracks.js
// Static track metadata for grouped puzzle navigation.
// Tracks are ordered by difficulty; puzzles within a track are ordered easy → hard.

const guided = (tutorial = false) => ({
  random: { enabled: false },
  guided: { enabled: true },
  tutorial: { enabled: tutorial },
})

export default [
  {
    id: 'tutorial',
    title: 'Tutorial',
    subtitle: 'Eight short puzzles that teach everything you need',
    modes: guided(true),
    puzzleIds: [
      'first-steps',
      'make-way',
      'leap',
      'zig-zag',
      'promotion',
      'first-catch',
      'carousel',
      'no-way-back',
    ],
  },
  {
    id: 'warm-up',
    title: 'Warm-up',
    subtitle: 'Short puzzles with one idea each',
    modes: guided(),
    puzzleIds: [
      'bishopping',
      'bloomer',
      'pawn-ascent',
      'square-dance',
      'capture-the',
      'pawn-storm-b',
    ],
  },
  {
    id: 'tricky',
    title: 'Tricky',
    subtitle: 'Crowded boards where the order of moves matters',
    modes: guided(),
    puzzleIds: [
      'gatekeepers',
      'rook-maze',
      'bishop-swap',
      'knight-fork',
      'pawn-walls',
      'night-stable',
      'rook-shuffle',
    ],
  },
  {
    id: 'fiendish',
    title: 'Fiendish',
    subtitle: 'Long, tightly packed routing challenges',
    modes: guided(),
    puzzleIds: [
      'knight-relay',
      'knight-train',
      'route-the-ro',
      'boxed-knight',
      'four-queen-s',
      'crown-the-ro',
    ],
  },
]

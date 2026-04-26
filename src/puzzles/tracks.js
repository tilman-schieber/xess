// src/puzzles/tracks.js
// Static track metadata for grouped puzzle navigation.

export default [
  {
    id: 'tutorial',
    title: 'Tutorial',
    subtitle: 'Single placeholder while tutorial content is rebuilt',
    modes: {
      random: { enabled: false },
      guided: { enabled: true },
      tutorial: { enabled: true },
    },
    puzzleIds: [
      'rook-gauntl',
      'zig-zag',
    ],
  },
  {
    id: 'puzzle-master',
    title: 'Puzzle Master',
    subtitle: 'Only the curated real puzzles',
    modes: {
      random: { enabled: false },
      guided: { enabled: true },
      tutorial: { enabled: false },
    },
    puzzleIds: [
      'knight-relay',
      'crown-the-ro',
    ],
  },
  {
    id: 'reach-the-goal',
    title: 'Reach the Goal',
    subtitle: 'No-capture goal-routing puzzles',
    modes: {
      random: { enabled: false },
      guided: { enabled: true },
      tutorial: { enabled: false },
    },
    puzzleIds: [
      'bishopping',
      'knight-train',
      'pawn-ascent',
      'route-the-ro',
      'night-stable',
      'four-queen-s',
    ],
  },
  {
    id: 'capture-to-win',
    title: 'Capture to Win',
    subtitle: 'White pieces must capture the black targets',
    modes: {
      random: { enabled: false },
      guided: { enabled: true },
      tutorial: { enabled: false },
    },
    puzzleIds: [
      'capture-the',
      'square-dance',
    ],
  },
]

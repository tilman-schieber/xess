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
      'd1e2f3g4',
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
      'b4c5d6e7',
      'c7d8e9f0',
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
      'm4n5o6p7',
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
      'k8l9m0n1',
    ],
  },
]

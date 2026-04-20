// src/puzzles/tracks.js
// Static track metadata for grouped puzzle navigation.

export default [
  {
    id: 'foundations',
    title: 'Foundations',
    subtitle: 'Learn board quirks and core movement ideas',
    modes: {
      random: { enabled: false },
      guided: { enabled: true },
      tutorial: { enabled: true },
    },
    puzzleIds: [
      'xk3m9pq2',
      'gt7wz4r1',
      'g3h4i5j6',
      'p1q2r3s4',
      't5u6v7w8',
      'x9y0z1a2',
      'n5o6p7q8',
      'v3w4x5y6',
    ],
  },
  {
    id: 'formations',
    title: 'Formations',
    subtitle: 'Multi-piece tactics on larger boards',
    modes: {
      random: { enabled: true },
      guided: { enabled: true },
      tutorial: { enabled: false },
    },
    puzzleIds: [
      'd1e2f3g4',
      'l9m0n1o2',
      't7u8v9w0',
      'x1y2z3a4',
      'f9g0h1i2',
      'n7o8p9q0',
      'r1s2t3u4',
      'z9a0b1c2',
    ],
  },
  {
    id: 'labyrinths',
    title: 'Labyrinths',
    subtitle: 'Irregular geometry and finale challenges',
    modes: {
      random: { enabled: true },
      guided: { enabled: false },
      tutorial: { enabled: false },
    },
    puzzleIds: [
      'h7i8j9k0',
      'l1m2n3o4',
      'x3y4z5a6',
      'f1g2h3i4',
      'j5k6l7m8',
      'n9o0p1q2',
      'v7w8x9y0',
      'b4c5d6e7',
    ],
  },
]

// src/puzzles/catalogue.js
// D-01: single catalogue file  D-02: default export array
// 25 verified solvable puzzles (solver-checked, broken entries removed)

export default [
  // ── 3×3 boards ──────────────────────────────────────────────────────────────

  {
    // Puzzle 1 — Corner Trap
    schemaVersion: 1,
    id: 'xk3m9pq2',
    title: 'Corner Trap',
    descriptionHtml: '<p><strong>Theme:</strong> Cut off escape squares before capturing.</p><ul><li>Use tempo to force the target into the corner.</li></ul>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'x-P',
      '-p-',
      'n-x',
    ],
  },
  {
    // Puzzle 2 — Find the Square
    schemaVersion: 1,
    id: 'gt7wz4r1',
    title: 'Find the Square',
    descriptionHtml: '<p><em>Hint:</em> Rook paths stay open on files and ranks.</p>',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'R--',
      '-x-',
      '--G',
    ],
    goalTargets: {
      '2,2': 'R',
    },
  },
  {
    // Puzzle 3 — Knight Leap
    schemaVersion: 1,
    id: 'g3h4i5j6',
    title: 'Knight Leap',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'N--',
      '---',
      '-n-',
    ],
  },
  {
    // Puzzle 4 — Around the Corner
    schemaVersion: 1,
    id: 'p1q2r3s4',
    title: 'Around the Corner',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'R--',
      '---',
      '--G',
    ],
    goalTargets: {
      '2,2': 'R',
    },
  },
  {
    // Puzzle 5 — Bishop Hop
    schemaVersion: 1,
    id: 't5u6v7w8',
    title: 'Bishop Hop',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'B-b',
      '---',
      '---',
    ],
  },
  {
    // Puzzle 6 — Double Hunt
    schemaVersion: 1,
    id: 'x9y0z1a2',
    title: 'Double Hunt',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'RNr',
      '---',
      'n--',
    ],
  },

  // ── 4×3 boards ──────────────────────────────────────────────────────────────

  {
    // Puzzle 7 — Rook and Pawn
    schemaVersion: 1,
    id: 'n5o6p7q8',
    title: 'Rook and Pawn',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'R--r',
      '----',
      '-Pn-',
    ],
  },
  {
    // Puzzle 8 — Triple Threat
    schemaVersion: 1,
    id: 'v3w4x5y6',
    title: 'Triple Threat',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'R-rb',
      '----',
      'B-rR',
    ],
  },
  {
    // Puzzle 9 — Detour
    schemaVersion: 1,
    id: 'd1e2f3g4',
    title: 'Detour',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'R-x-',
      '----',
      '--rb',
    ],
  },

  // ── 4×4 boards ──────────────────────────────────────────────────────────────

  {
    // Puzzle 10 — Bishops and Knights
    schemaVersion: 1,
    id: 'l9m0n1o2',
    title: 'Bishops and Knights',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'B--n',
      '----',
      '----',
      'N--b',
    ],
  },
  {
    // Puzzle 11 — Queen Enters
    schemaVersion: 1,
    id: 't7u8v9w0',
    title: 'Queen Enters',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'Q---',
      '----',
      '----',
      '---b',
    ],
  },
  {
    // Puzzle 12 — Royal Hunt
    schemaVersion: 1,
    id: 'x1y2z3a4',
    title: 'Royal Hunt',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'Q--r',
      '----',
      '----',
      'b---',
    ],
  },
  {
    // Puzzle 13 — Sweep
    schemaVersion: 1,
    id: 'f9g0h1i2',
    title: 'Sweep',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'R--r',
      '----',
      'b---',
      '-B-n',
    ],
  },
  {
    // Puzzle 14 — Pawn Line
    schemaVersion: 1,
    id: 'n7o8p9q0',
    title: 'Pawn Line',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'nbn-',
      '----',
      '-PPP',
      '----',
    ],
  },
  {
    // Puzzle 15 — Clear the Path
    schemaVersion: 1,
    id: 'r1s2t3u4',
    title: 'Clear the Path',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'Q-rb',
      '----',
      '----',
      'Rn-r',
    ],
  },

  // ── 5×4 / 5×5 boards ────────────────────────────────────────────────────────

  {
    // Puzzle 16 — Scattered Targets
    schemaVersion: 1,
    id: 'z9a0b1c2',
    title: 'Scattered Targets',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'B---r',
      '-----',
      'b----',
      '---Rn',
    ],
  },
  {
    // Puzzle 17 — Knight Odyssey
    schemaVersion: 1,
    id: 'h7i8j9k0',
    title: 'Knight Odyssey',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'N----',
      '-----',
      '---n-',
      '-----',
    ],
  },
  {
    // Puzzle 18 — Queen Dominates
    schemaVersion: 1,
    id: 'l1m2n3o4',
    title: 'Queen Dominates',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'Q----',
      '-----',
      '--b--',
      '-----',
      '---rn',
    ],
  },

  // ── Irregular boards ─────────────────────────────────────────────────────────

  {
    // Puzzle 19 — Cross Shape
    schemaVersion: 1,
    id: 'x3y4z5a6',
    title: 'Cross Shape',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'xx-xx',
      '-R-b-',
      '-----',
      '-n-r-',
      'xx-xx',
    ],
  },
  {
    // Puzzle 20 — Notched Board
    schemaVersion: 1,
    id: 'f1g2h3i4',
    title: 'Notched Board',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'x--x',
      'R--n',
      'P--b',
      'x--x',
    ],
  },
  {
    // Puzzle 21 — T-Board
    schemaVersion: 1,
    id: 'j5k6l7m8',
    title: 'T-Board',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'Q-r-b',
      'xx-xx',
      'xx-xx',
      'xx-xx',
    ],
  },
  {
    // Puzzle 22 — Swiss Cheese
    schemaVersion: 1,
    id: 'n9o0p1q2',
    title: 'Swiss Cheese',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'R-x-r',
      '--n--',
      'x---x',
      '--b--',
      'B-x-N',
    ],
  },
  {
    // Puzzle 23 — Grand Finale
    schemaVersion: 1,
    id: 'v7w8x9y0',
    title: 'Grand Finale',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'Q-x-N',
      '-r-b-',
      'x---x',
      '-n-r-',
      'B-x-R',
    ],
  },
  {
    // Puzzle 24 — Knight Relay
    schemaVersion: 1,
    id: 'b4c5d6e7',
    title: 'Knight Relay',
    descriptionHtml: '<p><strong>Theme:</strong> Coordinate both colors to route the black knight to its destination.</p><ul><li>No captures are allowed for either side.</li></ul>',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'nBBBBR',
      'NNNNRR',
      'xxxxRG',
    ],
    goalTargets: {
      '5,2': 'n',
    },
    controllableColors: ['white', 'black'],
    capturableByColor: {
      white: [],
      black: [],
    },
  },
  {
    // Puzzle 25 — Crown the Route
    schemaVersion: 1,
    id: 'c7d8e9f0',
    title: 'Crown the Route',
    descriptionHtml: '<p><strong>Theme:</strong> Promote the pawn first, then bring the new queen home.</p><ul><li>The goal square only accepts a queen.</li><li>No captures are allowed.</li></ul>',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'NNNN',
      'BBBB',
      'RRRR',
      'Gxxp',
    ],
    goalTargets: {
      '0,3': 'q',
    },
    controllableColors: ['white', 'black'],
    capturableByColor: {
      white: [],
      black: [],
    },
    promote: true,
  },
]

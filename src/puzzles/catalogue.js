// src/puzzles/catalogue.js
// D-01: single catalogue file  D-02: default export array
// 40 curated puzzles — simple to challenging

export default [
  // ── 3×3 boards (puzzles 1–8) ────────────────────────────────────────────

  {
    // Puzzle 1 — Corner Trap (original tutorial puzzle)
    schemaVersion: 1,
    id: 'xk3m9pq2',
    title: 'Corner Trap',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'x-P',
      '-p-',
      'n-x',
    ],
    pawnDirections: {
      '1,1': [0, -1],
    },
  },
  {
    // Puzzle 2 — Find the Square (original reach puzzle)
    schemaVersion: 1,
    id: 'gt7wz4r1',
    title: 'Find the Square',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'r--',
      '-x-',
      '--G',
    ],
  },
  {
    // Puzzle 3 — single move: rook reaches goal square directly below
    schemaVersion: 1,
    id: 'c9d0e1f2',
    title: 'Corner Goal',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'R--',
      '---',
      'G--',
    ],
  },
  {
    // Puzzle 4 — single move: knight jumps to capture
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
    // Puzzle 5 — single move: pawn captures diagonally forward
    schemaVersion: 1,
    id: 'k7l8m9n0',
    title: 'Pawn Takes',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'n--',
      '-P-',
      '---',
    ],
    pawnDirections: {
      '1,1': [0, -1],
    },
  },
  {
    // Puzzle 6 — 2 moves: rook goes to far row then across to goal
    schemaVersion: 1,
    id: 'p1q2r3s4',
    title: 'Around the Corner',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'r--',
      '---',
      '--G',
    ],
  },
  {
    // Puzzle 7 — 2 moves: bishop bounces via intermediate square to capture
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
    // Puzzle 8 — 2 moves: rook + knight each capture one black piece
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

  // ── 4×3 boards (puzzles 9–16) ───────────────────────────────────────────

  {
    // Puzzle 9 — reach: rook slides to far goal on wide board
    schemaVersion: 1,
    id: 'b3c4d5e6',
    title: 'Long Slide',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'R---',
      '----',
      '---G',
    ],
  },
  {
    // Puzzle 10 — capture: bishop sweeps long diagonal on 4×3
    schemaVersion: 1,
    id: 'f7g8h9i0',
    title: 'Long Diagonal',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'B---',
      '----',
      '---b',
    ],
  },
  {
    // Puzzle 11 — reach: knight must reach corner goal in 2 jumps
    schemaVersion: 1,
    id: 'j1k2l3m4',
    title: 'Knight to the End',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'N---',
      '----',
      '--G-',
    ],
  },
  {
    // Puzzle 12 — capture: rook + pawn, each captures one piece
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
    pawnDirections: {
      '1,2': [0, -1],
    },
  },
  {
    // Puzzle 13 — reach: bishop must find 2-square path to goal
    schemaVersion: 1,
    id: 'r9s0t1u2',
    title: 'Bishop Path',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      '-B--',
      '----',
      'G---',
    ],
  },
  {
    // Puzzle 14 — capture: 3 pieces, each has a clear target
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
    // Puzzle 15 — reach: pawn advances to goal square
    schemaVersion: 1,
    id: 'z7a8b9c0',
    title: 'Pawn March',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      '--G-',
      '----',
      '-P--',
    ],
    pawnDirections: {
      '1,2': [0, -1],
    },
  },
  {
    // Puzzle 16 — capture: rook must route around a gap
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

  // ── 4×4 boards (puzzles 17–26) ──────────────────────────────────────────

  {
    // Puzzle 17 — reach: rook on 4×4, navigates to far goal
    schemaVersion: 1,
    id: 'h5i6j7k8',
    title: 'Cross the Board',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'R---',
      '----',
      '----',
      '---G',
    ],
  },
  {
    // Puzzle 18 — capture: bishop + knight pair up
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
    // Puzzle 19 — reach: two goals require two pieces
    schemaVersion: 1,
    id: 'p3q4r5s6',
    title: 'Two Destinations',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'R--B',
      '----',
      '----',
      'G--G',
    ],
  },
  {
    // Puzzle 20 — capture: introduce queen, simple sweep
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
    // Puzzle 21 — capture: queen hunts two targets
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
    // Puzzle 22 — reach: pawn + rook, pawn needs to reach goal
    schemaVersion: 1,
    id: 'b5c6d7e8',
    title: 'Pawn Goal',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      '---G',
      '----',
      '----',
      'RP--',
    ],
    pawnDirections: {
      '1,3': [0, -1],
    },
  },
  {
    // Puzzle 23 — capture: rook + bishop clear 3 targets
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
    // Puzzle 24 — reach: knight zigzag path on 4×4
    schemaVersion: 1,
    id: 'j3k4l5m6',
    title: 'Knight Maze',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'N---',
      '----',
      '----',
      '--G-',
    ],
  },
  {
    // Puzzle 25 — capture: pawns + bishop combo
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
    pawnDirections: {
      '1,2': [0, -1],
      '2,2': [0, -1],
      '3,2': [0, -1],
    },
  },
  {
    // Puzzle 26 — reach + capture mix: queen reaches goal, rook clears path
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

  // ── 5×4 / 4×5 / 5×5 boards (puzzles 27–36) ─────────────────────────────

  {
    // Puzzle 27 — 5×4: reach goal across wide board
    schemaVersion: 1,
    id: 'v5w6x7y8',
    title: 'Wide Open',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'R----',
      '-----',
      '-----',
      '----G',
    ],
  },
  {
    // Puzzle 28 — 5×4: bishop + rook clear scattered targets
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
    // Puzzle 29 — 4×5: pawn march with obstacles
    schemaVersion: 1,
    id: 'd3e4f5g6',
    title: 'Long March',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      '--G-',
      '----',
      '----',
      '----',
      '-P--',
    ],
    pawnDirections: {
      '1,4': [0, -1],
    },
  },
  {
    // Puzzle 30 — 5×4: knight odyssey
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
    // Puzzle 31 — 5×5: queen dominates
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
  {
    // Puzzle 32 — 5×5: three goals, three pieces
    schemaVersion: 1,
    id: 'p5q6r7s8',
    title: 'Triple Goals',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'R-B-N',
      '-----',
      '-----',
      '-----',
      'G-G-G',
    ],
  },
  {
    // Puzzle 33 — irregular 5×4 with impassable corners
    schemaVersion: 1,
    id: 't9u0v1w2',
    title: 'Island Board',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'x-R-x',
      '-----',
      '-----',
      'x-G-x',
    ],
  },
  {
    // Puzzle 34 — irregular 5×5: cross-shaped board
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
    // Puzzle 35 — irregular 5×5: diamond-ish, bishop path
    schemaVersion: 1,
    id: 'b7c8d9e0',
    title: 'Diamond Board',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'xx-xx',
      'x---x',
      '-B-G-',
      'x---x',
      'xx-xx',
    ],
  },
  {
    // Puzzle 36 — irregular 4×4: notched corners, pawn + rook
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
    pawnDirections: {
      '0,2': [0, -1],
    },
  },

  // ── More irregular / complex (puzzles 37–40) ────────────────────────────

  {
    // Puzzle 37 — irregular T-shaped board, queen hunt
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
    // Puzzle 38 — irregular 5×5: scattered impassables, multi-piece
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
    // Puzzle 39 — irregular 5×4: L-shaped board, reach goal
    schemaVersion: 1,
    id: 'r3s4t5u6',
    title: 'L-Shaped Board',
    goalType: 'reach-all-goal-squares',
    targetColor: null,
    grid: [
      'R--xx',
      '-----',
      '-----',
      '--G--',
    ],
  },
  {
    // Puzzle 40 — irregular 5×5: hardest, queen + bishop + knight, 4 targets
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
]

// src/puzzles/catalogue.js
// Curated puzzle set

export default [
  {
    // Tutorial — Rook Gauntlet
    schemaVersion: 1,
    id: 'rook-gauntl',
    title: 'Rook Gauntlet',
    descriptionHtml: '<p><strong>Theme:</strong> Thread the red rook through a maze of bishops to reach the goal.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'r-B-x',
      'BxBx-',
      '-B-Bx',
      'xBxB-',
      'x-B-G',
    ],
    goalTargets: {
      '4,4': 'r',
    },
  },
  {
    // Tutorial puzzle — Zig-zag
    schemaVersion: 1,
    id: 'zig-zag',
    title: 'Zig-zag',
    descriptionHtml: '<p><strong>Tutorial:</strong> Use your white pieces to create a path for the red bishop.</p><ul><li>The red pieces have to reach their goal squares.</li><li>No pieces can be captured.</li><li>Normal chess movement still applies.</li></ul>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'b-----',
      'PPPPPG',
    ],
    goalTargets: {
      '5,1': 'b',
    },
  },
  {
    // Boxed Knight — navigate a knight through rook-guarded corridors
    schemaVersion: 1,
    id: 'boxed-knight',
    title: 'Boxed Knight',
    descriptionHtml: '<p><strong>Theme:</strong> The knight must hop through a grid of rook-guarded squares to reach the opposite corner.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'G-x-x',
      'xRxRx',
      '-R-R-',
      'xRxRx',
      'x-x-n',
    ],
    goalTargets: {
      '0,0': 'n',
    },
  },
  {
    // Rook Maze — navigate a rook through a blocked corridor
    schemaVersion: 1,
    id: 'rook-maze',
    title: 'Rook Maze',
    descriptionHtml: '<p><strong>Theme:</strong> Clear a path for the red rook by moving blockers out of the way.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'rxBx',
      'BxN-',
      '-NRx',
      'xB-G',
    ],
    goalTargets: {
      '3,3': 'r',
    },
  },
  {
    // Pawn Wall — knights must capture pawns across a wall of voids
    schemaVersion: 1,
    id: 'pawn-wall',
    title: 'Pawn Wall',
    descriptionHtml: '<p><strong>Theme:</strong> Two knights must jump across the void wall to capture the opposing pawns.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'N-n-n',
      '-xxx-',
      '-----',
      '-xxx-',
      'N-n-n',
    ],
  },
  {
    // Puzzle 24 — Knight Relay
    schemaVersion: 1,
    id: 'knight-relay',
    title: 'Knight Relay',
    descriptionHtml: '<p><strong>Theme:</strong> Coordinate both colors to route the black knight to its destination.</p><ul><li>The red pieces have to reach their goal squares.</li><li>No pieces can be captured.</li><li>Normal chess movement still applies.</li></ul>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'nBBBBR',
      'NNNNRR',
      'xxxxRG',
    ],
    goalTargets: {
      '5,2': 'n',
    },
  },
  {
    // Puzzle 25 — Crown the Route
    schemaVersion: 1,
    id: 'crown-the-ro',
    title: 'Crown the Route',
    descriptionHtml: '<p><strong>Theme:</strong> Promote the pawn first, then bring the new queen home.</p><ul><li>Pawns promote to queens.</li><li>The goal square only accepts a queen.</li><li>The red pieces have to reach their goal squares.</li><li>No pieces can be captured.</li><li>Normal chess movement still applies.</li></ul>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'NNNN',
      'BBBB',
      'RRRR',
      'Gxxp',
    ],
    goalTargets: {
      '0,3': 'q',
    },
    promote: true,
  },
  {
    // Puzzle — Bishopping
    schemaVersion: 1,
    id: 'bishopping',
    title: 'Bishopping',
    descriptionHtml: '<p><strong>Theme:</strong> Guide the bishop to the goal square.</p><ul><li>The red pieces have to reach their goal squares.</li><li>No pieces can be captured.</li><li>Normal chess movement still applies.</li></ul>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'xRNG',
      'bNRx',
      'xPxx',
    ],
    goalTargets: {
      '3,0': 'b',
    },
  },
  {
    // Puzzle — Capture the Queen
    schemaVersion: 1,
    id: 'capture-the',
    title: 'Capture the Queen',
    descriptionHtml: '<p><strong>Theme:</strong> Use your white pieces to capture the black queen.</p><ul><li>Normal chess movement rules apply.</li><li>Only knights can jump!</li></ul>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'xqx',
      'xxx',
      'BN-',
      'RRR',
      'PPP',
    ],
  },
  {
    // Puzzle — Knight Train
    schemaVersion: 1,
    id: 'knight-train',
    title: 'Knight Train',
    descriptionHtml: '<p><strong>Theme:</strong> Route the red knight through the corridor to the goal.</p><ul><li>The red pieces have to reach their goal squares.</li><li>No pieces can be captured.</li><li>Normal chess movement still applies.</li></ul>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'RRG',
      'BRR',
      'BNx',
      'BNx',
      'BNx',
      'nNx',
    ],
    goalTargets: {
      '2,0': 'n',
    },
  },
  {
    // Puzzle — Pawn Ascent
    schemaVersion: 1,
    id: 'pawn-ascent',
    title: 'Pawn Ascent',
    descriptionHtml: '<p><strong>Theme:</strong> Thread the red pawn up the file to the goal.</p><ul><li>The red pieces have to reach their goal squares.</li><li>No pieces can be captured.</li><li>Normal chess movement still applies.</li></ul>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'xxGxx',
      'xxBxx',
      '-BRB-',
      'xxNxx',
      'xxpxx',
    ],
    goalTargets: {
      '2,0': 'q',
    },
    promote: true,
  },
  {
    // Puzzle — Route the Rook
    schemaVersion: 1,
    id: 'route-the-ro',
    title: 'Route the Rook',
    goalType: 'reach-all-goal-squares',
    grid: [
      'rxxx',
      'BBBB',
      'NNNN',
      'PPPP',
      'xxxG',
    ],
    goalTargets: {
      '3,4': 'r',
    },
  },
  {
    // Puzzle — Night Stable
    schemaVersion: 1,
    id: 'night-stable',
    title: 'Night Stable',
    goalType: 'reach-all-goal-squares',
    grid: [
      'xGGGGx',
      'xxxxxx',
      '-x--x-',
      'xx--xx',
      'xxxxxx',
      'xnnnnx',
    ],
    goalTargets: {
      '1,0': 'n',
      '2,0': 'n',
      '3,0': 'n',
      '4,0': 'n',
    },
  },
  {
    // Puzzle — Four Queen Shuffle
    schemaVersion: 1,
    id: 'four-queen-s',
    title: 'Four Queen Shuffle',
    goalType: 'reach-all-goal-squares',
    grid: [
      'G---G',
      'xxPxx',
      'xxPxx',
      'xxPxx',
      'rNPNr',
    ],
    goalTargets: {
      '4,0': 'r',
      '0,0': 'r',
    },
    promote: true,
  },
  {
    // Puzzle — Square Dance
    schemaVersion: 1,
    id: 'square-dance',
    title: 'Square Dance',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'RppP',
      '-xx-',
      '-xx-',
      'PppP',
    ],
  },

  // --- Test fixtures (not in any track, not shown in UI) ---
  {
    schemaVersion: 1,
    id: 'knight-leap',
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
    schemaVersion: 1,
    id: 'corner-trap',
    title: 'Corner Trap',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'x-P',
      '-p-',
      'n-x',
    ],
  },
  {
    schemaVersion: 1,
    id: 'find-the-squ',
    title: 'Find the Square',
    goalType: 'reach-all-goal-squares',
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
    schemaVersion: 1,
    id: 'detour',
    title: 'Detour',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'R-x-',
      '----',
      '--rb',
    ],
  },
]

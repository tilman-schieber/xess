// src/puzzles/catalogue.js
// Curated puzzle set

export default [
  {
    // Tutorial placeholder — Detour
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
  {
    // Tutorial puzzle — Zig-zag
    schemaVersion: 1,
    id: 'z1i2g3z4',
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
    // Legacy contract puzzle — Corner Trap
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
    // Legacy contract puzzle — Find the Square
    schemaVersion: 1,
    id: 'gt7wz4r1',
    title: 'Find the Square',
    descriptionHtml: '<p><em>Hint:</em> Rook paths stay open on files and ranks.</p><p><strong>Reach rules:</strong> The red pieces have to reach their goal squares. No pieces can be captured, and normal chess movement still applies.</p>',
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
    // Legacy contract puzzle — Knight Leap
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
    // Puzzle 24 — Knight Relay
    schemaVersion: 1,
    id: 'b4c5d6e7',
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
    id: 'c7d8e9f0',
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
    id: 'm4n5o6p7',
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
    id: 'k8l9m0n1',
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
    id: 'q2r3s4t5',
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
    id: 'u1v2w3x4',
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
      '2,0': 'p',
    },
  },
]

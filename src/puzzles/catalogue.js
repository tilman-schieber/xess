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
    descriptionHtml: '<p><em>Hint:</em> Rook paths stay open on files and ranks.</p>',
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
    descriptionHtml: '<p><strong>Theme:</strong> Coordinate both colors to route the black knight to its destination.</p><ul><li>No captures are allowed for either side.</li></ul>',
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
    descriptionHtml: '<p><strong>Theme:</strong> Promote the pawn first, then bring the new queen home.</p><ul><li>The goal square only accepts a queen.</li><li>No captures are allowed.</li></ul>',
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
]

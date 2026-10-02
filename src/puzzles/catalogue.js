// src/puzzles/catalogue.js
// Curated puzzle set

export default [
  {
    // Tutorial 1 — the reach goal
    schemaVersion: 1,
    id: 'first-steps',
    title: 'First Steps',
    descriptionHtml: '<p>Bring the red rook to the green square.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'r--x',
      'xx-x',
      'G---',
    ],
    goalTargets: {
      '0,2': 'r',
    },
    coach: [
      'The red rook has to reach the green square. Tap the rook, then tap the glowing square.',
      'Rooks slide in straight lines, but they can\'t cross the holes. Head down.',
      'One more slide and you\'re home.',
    ],
  },
  {
    // Tutorial 2 — white blockers
    schemaVersion: 1,
    id: 'make-way',
    title: 'Make Way',
    descriptionHtml: '<p>A white piece is in the way. Move it aside first.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'x-xx',
      'rR-G',
    ],
    goalTargets: {
      '3,1': 'r',
    },
    coach: [
      'A white rook blocks the way. You can move the white pieces too: slide it up.',
      'Nothing is ever captured in these puzzles, so blockers have to step aside. Now bring the red rook home.',
    ],
  },
  {
    // Tutorial 3 — knights jump, but need a free landing square
    schemaVersion: 1,
    id: 'leap',
    title: 'Leap',
    descriptionHtml: '<p>Only knights can jump over pieces and holes. They still need somewhere to land.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'nPxx',
      'x-xx',
      'xPPx',
      'xxxG',
    ],
    goalTargets: {
      '3,3': 'n',
    },
    coach: [
      'Knights move in an L-shape and jump right over pieces and holes. But the square this knight needs is taken: push that pawn up first.',
      'Now jump.',
    ],
  },
  {
    // Tutorial 4 — Zig-zag
    schemaVersion: 1,
    id: 'zig-zag',
    title: 'Zig-zag',
    descriptionHtml: '<p>Use your white pieces to create a path for the red bishop.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'b-----',
      'PPPPPG',
    ],
    goalTargets: {
      '5,1': 'b',
    },
    coach: [
      'A pawn sits on the red bishop\'s diagonal. Push it up one square.',
      'The diagonal is open. Move the red bishop down.',
      'Bishops only move diagonally, so zig-zag back up to the top row.',
      'Same trick again: open the next gap. From here you are on your own.',
    ],
  },
  {
    // Tutorial 5 — promotion, with white pieces to clear out of the way
    schemaVersion: 1,
    id: 'promotion',
    title: 'Promotion',
    descriptionHtml: '<p>The goal wants a queen, and all you have is a pawn with a crowd in front of it.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      '-B-G',
      'Nx-x',
      'p-xx',
    ],
    goalTargets: {
      '3,0': 'q',
    },
    promote: true,
    coach: [
      'The goal square shows a queen. A pawn becomes a queen when it reaches the red line at the top. White pieces block both the pawn and the top row, so clear them out. Start with the bishop.',
    ],
  },
  {
    // Tutorial 6 — the capture goal, with a blocker that has to move twice
    schemaVersion: 1,
    id: 'first-catch',
    title: 'First Catch',
    descriptionHtml: '<p>Capture both black pawns. Your own bishop keeps getting in the rook\'s way.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'RBp',
      'xx-',
      'xxp',
    ],
    coach: [
      'A new kind of puzzle: capture every black piece. You only move the white pieces, and black never moves. The bishop is in the rook\'s way, so move it first.',
    ],
  },
  {
    // Tutorial 8 — pawns are irreversible: two of the three first moves are dead ends
    schemaVersion: 1,
    id: 'no-way-back',
    title: 'No Way Back',
    descriptionHtml: '<p>Pawns capture diagonally and never move backwards. The rook cannot get out until the pawn makes the right choice.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'p-p-',
      'xPxp',
      'xR-x',
    ],
    coach: [
      { text: 'Pawns step straight up, capture diagonally upward, and can never go back. Only one of the pawn\'s three moves lets the rook finish the job. If you get stuck, Undo and Reset cost nothing.', show: false },
    ],
  },
  {
    // Boxed Knight — navigate a knight through rook-guarded corridors
    schemaVersion: 1,
    id: 'boxed-knight',
    title: 'Boxed Knight',
    descriptionHtml: '<p>The knight must hop through a grid of rook-guarded squares to reach the opposite corner.</p>',
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
    descriptionHtml: '<p>Clear a path for the red rook by moving blockers out of the way.</p>',
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
    // Pawn Wall — two pawn walls face each other; the knights are boxed in behind their own
    schemaVersion: 1,
    id: 'pawn-walls',
    title: 'Pawn Wall',
    descriptionHtml: '<p>Two walls of pawns face each other across a narrow gap. Your knights are stuck behind your own wall until it opens, and every pawn move is final.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'ppppp',
      'x---x',
      'PPPPP',
      'NxxxN',
    ],
  },
  {
    // Puzzle 24 — Knight Relay
    schemaVersion: 1,
    id: 'knight-relay',
    title: 'Knight Relay',
    descriptionHtml: '<p>Coordinate both colors to route the red knight to its destination.</p>',
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
    descriptionHtml: '<p>Promote the pawn first, then bring the new queen home.</p><ul><li>The goal square only accepts a queen.</li></ul>',
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
    descriptionHtml: '<p>Guide the bishop to the goal square.</p>',
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
    descriptionHtml: '<p>Use your white pieces to capture the black queen.</p><ul><li>Only knights can jump!</li></ul>',
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
    descriptionHtml: '<p>Route the red knight through the corridor to the goal.</p>',
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
    descriptionHtml: '<p>Thread the red pawn up the file to the goal.</p>',
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
    descriptionHtml: '<p>Three ranks of white pieces stand between the red rook and its goal.</p>',
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
    descriptionHtml: '<p>Four red knights, four stalls. Knights jump, but they still need a free square to land on.</p>',
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
    descriptionHtml: '<p>The red rooks need the top corners, and the white pawns need somewhere to go.</p>',
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
    descriptionHtml: '<p>One rook and two pawns circle the ring. The pawns only get one way round.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'RppP',
      '-xx-',
      '-xx-',
      'PppP',
    ],
  },

  {
    // Tutorial 7 — knight capture loop, no coaching
    schemaVersion: 1,
    id: 'carousel',
    title: 'Carousel',
    descriptionHtml: '<p>One knight, three pawns, and a hole in the middle.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'N-p',
      '-x-',
      'p-p',
    ],
  },
  {
    // Warm-up — pawn capture order
    schemaVersion: 1,
    id: 'pawn-storm',
    title: 'Pawn Storm',
    descriptionHtml: '<p>Two pawns have to take all six. Pawns never go back, so pick your captures carefully.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'p-p-',
      '-p-p',
      'p-p-',
      '-P-P',
    ],
  },
  {
    // Warm-up — promotion in a capture puzzle
    schemaVersion: 1,
    id: 'late-bloomer',
    title: 'Late Bloomer',
    descriptionHtml: '<p>The pawn cannot reach anything yet. Let it grow up first.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      '---p',
      '-xx-',
      '-xxp',
      'Pxxx',
    ],
    promote: true,
  },
  {
    // Tricky — two bishops trade corners
    schemaVersion: 1,
    id: 'bishop-swap',
    title: 'Bishop Exchange',
    descriptionHtml: '<p>Each red bishop belongs in the opposite corner. The rooks have very little room to get out of the way.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'bRRG',
      'RRRR',
      'GRRb',
    ],
    goalTargets: {
      '3,0': 'b',
      '0,2': 'b',
    },
  },
  {
    // Tricky — rooks and knights behind pawns
    schemaVersion: 1,
    id: 'gatekeepers',
    title: 'Gatekeepers',
    descriptionHtml: '<p>Your own pawns are stuck in the gate. Work around them.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'xpxpx',
      '-P-P-',
      'R-x-R',
      'xNxNx',
    ],
  },
  {
    // Tricky — knight tour
    schemaVersion: 1,
    id: 'knight-fork',
    title: 'Knight Fork',
    descriptionHtml: '<p>Four pawns in four corners, and one knight to collect them all.</p>',
    goalType: 'capture-all-targets',
    targetColor: 'black',
    grid: [
      'p-x-p',
      '-x-x-',
      '--N--',
      '-x-x-',
      'p---p',
    ],
  },
  {
    // Tricky — rook sliding puzzle
    schemaVersion: 1,
    id: 'rook-shuffle',
    title: 'Rook Shuffle',
    descriptionHtml: '<p>Only one free square. Every rook has to take its turn.</p>',
    goalType: 'reach-all-goal-squares',
    grid: [
      'rRRx',
      'RRRR',
      'xRRG',
    ],
    goalTargets: {
      '3,2': 'r',
    },
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

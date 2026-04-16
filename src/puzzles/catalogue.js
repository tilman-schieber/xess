// src/puzzles/catalogue.js
// D-01: single catalogue file  D-02: default export array

export default [
  {
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
]

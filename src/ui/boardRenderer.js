import { posKey } from '../puzzles/loader.js'
import { getPieceSvg, getPieceSvgKey } from './pieces.js'

/**
 * Build a render-ready board model from puzzle dimensions and board occupancy.
 * Playability is derived strictly from board.has(posKey).
 */
export function createBoardRenderModel({
  puzzle,
  board,
  selectedKey = null,
  legalMoves = [],
  illegalKey = null,
}) {
  if (!puzzle || typeof puzzle.width !== 'number' || typeof puzzle.height !== 'number') {
    throw new Error('createBoardRenderModel requires puzzle.width and puzzle.height')
  }
  if (!(board instanceof Map)) {
    throw new Error('createBoardRenderModel requires board Map')
  }

  const legalSet = new Set(legalMoves)
  const cells = []

  for (let row = 0; row < puzzle.height; row += 1) {
    for (let col = 0; col < puzzle.width; col += 1) {
      const key = posKey(col, row)
      const isPlayable = board.has(key)

      if (!isPlayable) {
        cells.push({
          key,
          col,
          row,
          isVoid: true,
          isPlayable: false,
          isGoal: false,
          piece: null,
          goalGhost: null,
          classes: ['cell', 'cell--void'],
        })
        continue
      }

      const cell = board.get(key)
      if (!cell || typeof cell !== 'object') {
        cells.push({
          key,
          col,
          row,
          isVoid: false,
          isPlayable: true,
          isGoal: false,
          piece: null,
          goalGhost: null,
          classes: ['cell', 'cell--playable'],
        })
        continue
      }
      const classes = ['cell', 'cell--playable']

      if (cell.isGoal) classes.push('cell--goal')
      if (key === selectedKey) classes.push('cell--selected')
      if (legalSet.has(key)) classes.push('cell--legal')
      if (key === illegalKey) classes.push('cell--illegal')

      const isReachMode = puzzle.goalType === 'reach-all-goal-squares'
      const piece = cell.piece
        ? (() => {
          const displayColor = isReachMode && cell.piece.color === 'black' ? 'red' : cell.piece.color
          const displayPiece = { ...cell.piece, color: displayColor }
          return {
            type: cell.piece.type,
            color: cell.piece.color,
            svgKey: getPieceSvgKey(displayPiece),
            svg: getPieceSvg(displayPiece),
          }
        })()
        : null

      const goalTarget = puzzle.goalTargets?.get?.(key)
      const goalGhost = cell.isGoal && !piece && goalTarget
        ? (() => {
          const ghostDisplayColor = isReachMode && goalTarget.color === 'black' ? 'red' : goalTarget.color
          const ghostDisplayPiece = { ...goalTarget, color: ghostDisplayColor }
          return {
            type: goalTarget.type,
            color: goalTarget.color,
            svgKey: getPieceSvgKey(ghostDisplayPiece),
            svg: getPieceSvg(ghostDisplayPiece),
          }
        })()
        : null

      cells.push({
        key,
        col,
        row,
        isVoid: false,
        isPlayable: true,
        isGoal: !!cell.isGoal,
        piece,
        goalGhost,
        classes,
      })
    }
  }

  return {
    width: puzzle.width,
    height: puzzle.height,
    cells,
  }
}

// src/ui/dragDrop.js
// Pointer-based drag and drop for the Xess board.
// Works on both mouse and touch via unified Pointer Events API.

const DRAG_THRESHOLD = 8 // px — min movement before a drag is recognised

/**
 * @param {HTMLElement} boardEl  — the element with [data-board]
 * @param {{ onDragStart, onDrop, onCancel }} callbacks
 * @returns {function} cleanup — call to remove all listeners
 */
export function initDragDrop(boardEl, { onDragStart, onDrop, onCancel }) {
  let dragState = null
  // When null: no drag in progress
  // When set: {
  //   pointerId,    // for setPointerCapture / releasePointerCapture
  //   fromKey,      // data-cell-key of source cell
  //   fromEl,       // the source cell button element
  //   ghostEl,      // the floating ghost div (null until threshold exceeded)
  //   startX,       // pointerdown clientX
  //   startY,       // pointerdown clientY
  //   dragging,     // boolean — true once threshold exceeded
  // }

  function cleanupDrag() {
    if (dragState.ghostEl) dragState.ghostEl.remove()
    if (dragState.fromEl) dragState.fromEl.classList.remove('cell--dragging')
  }

  function handlePointerDown(event) {
    // Only track if a piece is present in the cell
    const cellEl = event.target.closest('[data-cell-key]')
    if (!cellEl) return
    const pieceEl = cellEl.querySelector('.piece')
    if (!pieceEl) return

    // Release implicit pointer capture that browsers assign to <button> elements.
    // Without this, pointermove fires on the button (not boardEl) and the board
    // listener never sees the movement needed to cross the drag threshold.
    if (event.target.hasPointerCapture?.(event.pointerId)) {
      event.target.releasePointerCapture(event.pointerId)
    }

    dragState = {
      pointerId: event.pointerId,
      fromKey: cellEl.dataset.cellKey,
      fromEl: cellEl,
      ghostEl: null,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
    }
  }

  function handlePointerMove(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return

    if (!dragState.dragging) {
      const dx = event.clientX - dragState.startX
      const dy = event.clientY - dragState.startY
      if (Math.hypot(dx, dy) <= DRAG_THRESHOLD) return

      // Threshold exceeded — activate drag
      dragState.dragging = true
      boardEl.setPointerCapture(event.pointerId)

      // Create ghost
      const pieceEl = dragState.fromEl.querySelector('.piece')
      const rect = pieceEl.getBoundingClientRect()
      const clone = pieceEl.cloneNode(true)
      const ghost = document.createElement('div')
      ghost.className = 'drag-ghost'
      ghost.style.width = rect.width + 'px'
      ghost.style.height = rect.height + 'px'
      ghost.style.left = (event.clientX - rect.width / 2) + 'px'
      ghost.style.top = (event.clientY - rect.height / 2) + 'px'
      ghost.append(clone)
      document.body.appendChild(ghost)
      dragState.ghostEl = ghost

      dragState.fromEl.classList.add('cell--dragging')
      onDragStart(dragState.fromKey)
      return
    }

    // Position ghost centered on pointer
    dragState.ghostEl.style.left = (event.clientX - dragState.ghostEl.offsetWidth / 2) + 'px'
    dragState.ghostEl.style.top = (event.clientY - dragState.ghostEl.offsetHeight / 2) + 'px'
  }

  function handlePointerUp(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return

    if (!dragState.dragging) {
      // Tap path — root listener handles it; we do nothing
      dragState = null
      return
    }

    // Resolve drop: temporarily hide ghost so elementFromPoint hits the cell beneath
    dragState.ghostEl.style.display = 'none'
    const target = document.elementFromPoint(event.clientX, event.clientY)
    dragState.ghostEl.style.display = ''

    const targetCellEl = target?.closest('[data-cell-key]')
    const toKey = targetCellEl?.dataset.cellKey ?? null

    const fromKey = dragState.fromKey
    cleanupDrag()
    dragState = null

    if (toKey && toKey !== fromKey) {
      onDrop(fromKey, toKey, event.pointerId)
    } else {
      onCancel(fromKey, event.pointerId)
    }
  }

  function handlePointerCancel(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return

    if (dragState.dragging) {
      const fromKey = dragState.fromKey
      cleanupDrag()
      dragState = null
      onCancel(fromKey, event.pointerId)
    } else {
      dragState = null
    }
  }

  boardEl.addEventListener('pointerdown', handlePointerDown)
  boardEl.addEventListener('pointermove', handlePointerMove)
  boardEl.addEventListener('pointerup', handlePointerUp)
  boardEl.addEventListener('pointercancel', handlePointerCancel)

  return function cleanup() {
    if (dragState) { cleanupDrag(); dragState = null }
    boardEl.removeEventListener('pointerdown', handlePointerDown)
    boardEl.removeEventListener('pointermove', handlePointerMove)
    boardEl.removeEventListener('pointerup', handlePointerUp)
    boardEl.removeEventListener('pointercancel', handlePointerCancel)
  }
}

// server/drawing-state.js

// This array is the "source of truth" for the entire canvas.
let historyStack = [];

// This array holds undone strokes for the "redo" functionality.
let redoStack = [];

/**
 * Adds a new stroke to the history.
 */
const addStroke = (stroke) => {
  historyStack.push(stroke);
  // When a new stroke is added, the redo stack must be cleared.
  redoStack = [];
};

/**
 * Gets the complete drawing history.
 */
const getHistory = () => historyStack;

/**
 * Removes the last stroke from history and adds it to the redo stack.
 */
const undo = () => {
  if (historyStack.length === 0) return null;
  const lastStroke = historyStack.pop();
  redoStack.push(lastStroke);
  return lastStroke;
};

/**
 * Moves a stroke from the redo stack back to the history stack.
 */
const redo = () => {
  if (redoStack.length === 0) return null;
  const lastUndoneStroke = redoStack.pop();
  historyStack.push(lastUndoneStroke);
  return lastUndoneStroke;
};

module.exports = {
  addStroke,
  getHistory,
  undo,
  redo
};
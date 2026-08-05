/**
 * UX-9.7 — Undo / Redo local barrel.
 * Outside src/ui (Module Purity · No New Base Infrastructure).
 */

export type { ThinHistoryAdapter } from "./ThinHistoryAdapter";
export {
  createThinHistoryAdapter,
  thinHistoryAdapter,
} from "./ThinHistoryAdapter";

export type {
  UndoRedoBridge,
  UndoRedoFeedbackKind,
  UndoRedoFeedbackSnapshot,
  UndoRedoOverlayState,
} from "./UndoRedoBridge";
export {
  HISTORY_REDO_COMMAND_ID,
  HISTORY_UNDO_COMMAND_ID,
  createUndoRedoBridge,
  getUndoRedoFeedback,
  getUndoRedoOverlay,
  subscribeUndoRedoFeedback,
  subscribeUndoRedoOverlay,
  undoRedoBridge,
} from "./UndoRedoBridge";

export type { UndoRedoDomHostProps } from "./UndoRedoDomHost";
export { UndoRedoDomHost } from "./UndoRedoDomHost";

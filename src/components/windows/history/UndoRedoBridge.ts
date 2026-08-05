/**
 * UX-9.7 — Undo / Redo Bridge.
 *
 * History Overlay Ownership Freeze: overlay · feedback · availability belong
 * ONLY here. ThinHistoryAdapter remains pure. FloatingWindow is observe-only.
 *
 * Execution Ownership Freeze: executeUndo / executeRedo dispatch only through
 * InteractionCommandBridge — never directly through Dispatcher.
 *
 * History Canonical Freeze: recordAccepted() is invoked only from
 * InteractionCommandBridge after accepted === true (non-history commands).
 *
 * Structural undo/redo only — no domain inversion.
 */

import type {
  InteractionCommand,
  InteractionCommandDispatcherApi,
  InteractionCommandResult,
} from "@/ui/interaction-commands";
import { interactionCommandBridge } from "../commands/InteractionCommandBridge";
import { thinHistoryAdapter } from "./ThinHistoryAdapter";

export const HISTORY_UNDO_COMMAND_ID = "history.undo";
export const HISTORY_REDO_COMMAND_ID = "history.redo";

export type UndoRedoOverlayState = Readonly<{
  canUndo: boolean;
  canRedo: boolean;
}>;

export type UndoRedoFeedbackKind =
  | "undo-available"
  | "redo-available"
  | "undo-executed"
  | "redo-executed";

export type UndoRedoFeedbackSnapshot = Readonly<{
  kind: UndoRedoFeedbackKind;
  token: number;
}>;

let overlaySnapshot: UndoRedoOverlayState = Object.freeze({
  canUndo: false,
  canRedo: false,
});
const overlayListeners = new Set<() => void>();

let feedbackSnapshot: UndoRedoFeedbackSnapshot | null = null;
const feedbackListeners = new Set<() => void>();
const FEEDBACK_MS = 900;

function notifyOverlayListeners(): void {
  for (const listener of overlayListeners) {
    listener();
  }
}

function notifyFeedbackListeners(): void {
  for (const listener of feedbackListeners) {
    listener();
  }
}

function syncOverlayFromAdapter(): void {
  const next = Object.freeze({
    canUndo: thinHistoryAdapter.canUndo(),
    canRedo: thinHistoryAdapter.canRedo(),
  });
  if (
    next.canUndo === overlaySnapshot.canUndo &&
    next.canRedo === overlaySnapshot.canRedo
  ) {
    return;
  }
  overlaySnapshot = next;
  notifyOverlayListeners();
}

function emitEphemeralFeedback(kind: UndoRedoFeedbackKind): void {
  const token = Date.now();
  feedbackSnapshot = Object.freeze({ kind, token });
  notifyFeedbackListeners();
  globalThis.setTimeout(() => {
    if (feedbackSnapshot?.token === token) {
      feedbackSnapshot = null;
      notifyFeedbackListeners();
    }
  }, FEEDBACK_MS);
}

/** Observe-only overlay for FloatingWindow chrome. */
export function subscribeUndoRedoOverlay(listener: () => void): () => void {
  overlayListeners.add(listener);
  return () => {
    overlayListeners.delete(listener);
  };
}

export function getUndoRedoOverlay(): UndoRedoOverlayState {
  return overlaySnapshot;
}

/** Observe-only ephemeral feedback for FloatingWindow chrome. */
export function subscribeUndoRedoFeedback(listener: () => void): () => void {
  feedbackListeners.add(listener);
  return () => {
    feedbackListeners.delete(listener);
  };
}

export function getUndoRedoFeedback(): UndoRedoFeedbackSnapshot | null {
  return feedbackSnapshot;
}

export type UndoRedoBridge = Readonly<{
  recordAccepted(command: InteractionCommand): void;
  executeUndo(
    dispatcher: InteractionCommandDispatcherApi,
  ): InteractionCommandResult;
  executeRedo(
    dispatcher: InteractionCommandDispatcherApi,
  ): InteractionCommandResult;
}>;

/**
 * Creates the Undo / Redo Bridge bound to the Thin History Adapter.
 */
export function createUndoRedoBridge(): UndoRedoBridge {
  return Object.freeze({
    recordAccepted(command: InteractionCommand): void {
      // History Identity — push accepted reference unchanged
      thinHistoryAdapter.push(command);
      syncOverlayFromAdapter();
      emitEphemeralFeedback("undo-available");
    },

    executeUndo(
      dispatcher: InteractionCommandDispatcherApi,
    ): InteractionCommandResult {
      if (!thinHistoryAdapter.canUndo()) {
        return Object.freeze({ accepted: false, reason: "nothing to undo" });
      }
      // Execution Ownership — dispatch only via InteractionCommandBridge
      const result = interactionCommandBridge.execute(
        dispatcher,
        HISTORY_UNDO_COMMAND_ID,
      );
      if (!result.accepted) {
        return result;
      }
      thinHistoryAdapter.undo();
      syncOverlayFromAdapter();
      emitEphemeralFeedback("undo-executed");
      if (thinHistoryAdapter.canRedo()) {
        globalThis.setTimeout(() => {
          emitEphemeralFeedback("redo-available");
        }, FEEDBACK_MS);
      }
      return result;
    },

    executeRedo(
      dispatcher: InteractionCommandDispatcherApi,
    ): InteractionCommandResult {
      if (!thinHistoryAdapter.canRedo()) {
        return Object.freeze({ accepted: false, reason: "nothing to redo" });
      }
      const result = interactionCommandBridge.execute(
        dispatcher,
        HISTORY_REDO_COMMAND_ID,
      );
      if (!result.accepted) {
        return result;
      }
      thinHistoryAdapter.redo();
      syncOverlayFromAdapter();
      emitEphemeralFeedback("redo-executed");
      if (thinHistoryAdapter.canUndo()) {
        globalThis.setTimeout(() => {
          emitEphemeralFeedback("undo-available");
        }, FEEDBACK_MS);
      }
      return result;
    },
  });
}

/** Shared Productivity Layer bridge instance (not a Registry). */
export const undoRedoBridge: UndoRedoBridge = createUndoRedoBridge();

/**
 * UX-9.6 — Interaction Command Bridge.
 * UX-9.7 — Command Envelope Reuse: history.undo · history.redo.
 *          History Canonical: sole caller of undoRedoBridge.recordAccepted().
 *
 * Sole Productivity-Layer caller of dispatcher.dispatch().
 * Sole construction point for InteractionCommand envelopes
 * (Command Envelope Canonical Freeze).
 *
 * Execution Ownership Freeze: ends at dispatch(); never business logic;
 * never Clipboard / Focus / Selection / Workspace / Hover / Keyboard.
 * Transforms { accepted, reason } into ephemeral visual feedback only.
 * History commands skip command feedback (UndoRedoBridge owns undo/redo feedback).
 */

import type {
  InteractionCommand,
  InteractionCommandDispatcherApi,
  InteractionCommandResult,
} from "@/ui/interaction-commands";
import {
  HISTORY_REDO_COMMAND_ID,
  HISTORY_UNDO_COMMAND_ID,
  undoRedoBridge,
} from "../history/UndoRedoBridge";

export type CommandFeedbackKind = "accepted" | "rejected";

export type CommandFeedbackSnapshot = Readonly<{
  kind: CommandFeedbackKind;
  reason: string | null;
  token: number;
}>;

let feedbackSnapshot: CommandFeedbackSnapshot | null = null;
const feedbackListeners = new Set<() => void>();
const FEEDBACK_MS = 900;

function notifyFeedbackListeners(): void {
  for (const listener of feedbackListeners) {
    listener();
  }
}

function emitEphemeralFeedback(
  kind: CommandFeedbackKind,
  reason: string | null,
): void {
  const token = Date.now();
  feedbackSnapshot = Object.freeze({ kind, reason, token });
  notifyFeedbackListeners();
  globalThis.setTimeout(() => {
    if (feedbackSnapshot?.token === token) {
      feedbackSnapshot = null;
      notifyFeedbackListeners();
    }
  }, FEEDBACK_MS);
}

function isHistoryCommandId(commandId: string): boolean {
  return (
    commandId === HISTORY_UNDO_COMMAND_ID ||
    commandId === HISTORY_REDO_COMMAND_ID
  );
}

/** Observe-only ephemeral feedback for FloatingWindow chrome. */
export function subscribeCommandFeedback(listener: () => void): () => void {
  feedbackListeners.add(listener);
  return () => {
    feedbackListeners.delete(listener);
  };
}

export function getCommandFeedback(): CommandFeedbackSnapshot | null {
  return feedbackSnapshot;
}

export type InteractionCommandBridge = Readonly<{
  createCommandEnvelope(commandId: string): InteractionCommand;
  execute(
    dispatcher: InteractionCommandDispatcherApi,
    commandId: string,
  ): InteractionCommandResult;
}>;

export function createInteractionCommandBridge(): InteractionCommandBridge {
  function createCommandEnvelope(commandId: string): InteractionCommand {
    // Command Envelope Reuse Freeze — history.undo / history.redo
    if (commandId === HISTORY_UNDO_COMMAND_ID) {
      return Object.freeze({
        id: commandId,
        type: "history.undo",
        payload: Object.freeze({}),
      });
    }
    if (commandId === HISTORY_REDO_COMMAND_ID) {
      return Object.freeze({
        id: commandId,
        type: "history.redo",
        payload: Object.freeze({}),
      });
    }
    // Existing palette.execute behavior unchanged
    return Object.freeze({
      id: commandId,
      type: "palette.execute",
      payload: Object.freeze({ commandId }),
    });
  }

  return Object.freeze({
    createCommandEnvelope,
    execute(
      dispatcher: InteractionCommandDispatcherApi,
      commandId: string,
    ): InteractionCommandResult {
      const envelope = createCommandEnvelope(commandId);
      const result = dispatcher.dispatch(envelope);
      if (result.accepted) {
        // History Canonical Freeze — only this Bridge may recordAccepted
        if (!isHistoryCommandId(commandId)) {
          undoRedoBridge.recordAccepted(envelope);
          emitEphemeralFeedback("accepted", null);
        }
        // history.* — UndoRedoBridge owns stack mutation + feedback
      } else {
        emitEphemeralFeedback("rejected", result.reason);
      }
      return result;
    },
  });
}

export const interactionCommandBridge: InteractionCommandBridge =
  createInteractionCommandBridge();

/**
 * UX-9.6 — Interaction Command Bridge.
 *
 * Sole Productivity-Layer caller of dispatcher.dispatch().
 * Sole construction point for InteractionCommand envelopes
 * (Command Envelope Canonical Freeze).
 *
 * Execution Ownership Freeze: ends at dispatch(); never business logic;
 * never Clipboard / Focus / Selection / Workspace / Hover / Keyboard.
 * Transforms { accepted, reason } into ephemeral visual feedback only.
 */

import type {
  InteractionCommand,
  InteractionCommandDispatcherApi,
  InteractionCommandResult,
} from "@/ui/interaction-commands";

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
        emitEphemeralFeedback("accepted", null);
      } else {
        emitEphemeralFeedback("rejected", result.reason);
      }
      return result;
    },
  });
}

export const interactionCommandBridge: InteractionCommandBridge =
  createInteractionCommandBridge();

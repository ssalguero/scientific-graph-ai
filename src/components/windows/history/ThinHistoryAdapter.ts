/**
 * UX-9.7 — Thin History Adapter.
 *
 * Thin History Adapter Freeze: owns only push / undo / redo / canUndo / canRedo.
 * History State Canonical Freeze: public surface exposes only canUndo / canRedo.
 *   Stacks remain private. UI never inspects stacks.
 * History Identity Freeze: stores accepted InteractionCommand references unchanged.
 *   No clone · no copy · no normalize. undo()/redo() return the same reference.
 * Adapter Purity: no React · no registries · no WindowManager · no business logic.
 *
 * Structural history only — no domain inversion.
 */

import type { InteractionCommand } from "@/ui/interaction-commands";

export type ThinHistoryAdapter = Readonly<{
  push(command: InteractionCommand): void;
  undo(): InteractionCommand | null;
  redo(): InteractionCommand | null;
  canUndo(): boolean;
  canRedo(): boolean;
}>;

/**
 * Creates a pure Thin History Adapter (stacks private · reference identity).
 */
export function createThinHistoryAdapter(): ThinHistoryAdapter {
  const undoStack: InteractionCommand[] = [];
  const redoStack: InteractionCommand[] = [];

  return Object.freeze({
    push(command: InteractionCommand): void {
      // History Identity Freeze — store the accepted reference unchanged
      undoStack.push(command);
      redoStack.length = 0;
    },

    undo(): InteractionCommand | null {
      const command = undoStack.pop();
      if (command === undefined) {
        return null;
      }
      redoStack.push(command);
      return command;
    },

    redo(): InteractionCommand | null {
      const command = redoStack.pop();
      if (command === undefined) {
        return null;
      }
      undoStack.push(command);
      return command;
    },

    canUndo(): boolean {
      return undoStack.length > 0;
    },

    canRedo(): boolean {
      return redoStack.length > 0;
    },
  });
}

/** Shared Productivity Layer adapter instance (not a Registry). */
export const thinHistoryAdapter: ThinHistoryAdapter =
  createThinHistoryAdapter();

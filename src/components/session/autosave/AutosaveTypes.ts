/**
 * D68.1 — Session Autosave Foundation · Types + API Freeze.
 * Authority: D68.0 Architecture Freeze · API Freeze.
 * Contracts only — factory implementation lives in SessionAutosaveController.ts (D68.5).
 */

import type { SessionId } from "../SessionTypes";

/** API Freeze — default debounce (ms). */
export const AUTOSAVE_DEBOUNCE_MS = 1000 as const;

/** API Freeze — mutation kinds that may trigger autosave. */
export type AutosaveMutationKind = "register" | "unregister" | "updateState";

/**
 * API Freeze — mutation notification payload.
 * Always updates dirty (even while paused). Schedules flush only if !paused.
 */
export type AutosaveMutationEvent = {
  readonly kind: AutosaveMutationKind;
  readonly sessionId: SessionId;
};

/**
 * API Freeze — Session Autosave Controller surface.
 * Single-flight flush (model B). dispose = cancel timer only · no implicit flush.
 */
export type SessionAutosaveController = {
  /** Always updates dirty (even while paused). Schedules flush only if !paused && !disposed. */
  notifyMutation(event: AutosaveMutationEvent): void;
  /** Suppress schedule/flush; dirty tracking continues. */
  pause(): void;
  /** Clear paused; if dirty pending → flush() immediately (no debounce wait). */
  resume(): void;
  /** Single-flight: concurrent calls coalesce via dirty-remain + re-flush (model B). */
  flush(): Promise<void>;
  /** Cancel timer only. NO implicit flush. Subsequent notifyMutation is no-op. */
  dispose(): void;
};

/** API Freeze — optional controller construction knobs. */
export type SessionAutosaveControllerOptions = {
  /** Default = AUTOSAVE_DEBOUNCE_MS (1000). */
  readonly debounceMs?: number;
};

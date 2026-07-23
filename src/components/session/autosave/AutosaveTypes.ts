/**
 * D68.1 — Session Autosave Foundation · Types + API Freeze.
 * Authority: D68.0 Architecture Freeze · API Freeze.
 * Contracts + factory stub only — no DirtyTracker, Scheduler, FlushPolicy,
 * timers, Bridge/Adapter I/O, React, or Provider wiring (D68.2+).
 */

import type {
  SessionPersistenceBridge,
  SessionStorageAdapter,
} from "../persistence/SessionPersistenceTypes";
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

/**
 * API Freeze — factory.
 * D68.1: returns a valid stub controller (no-op methods).
 * Real dirty / debounce / flush policy = D68.2+.
 * Bridge and Adapter are accepted for Freeze signature compatibility only.
 */
export function createSessionAutosaveController(
  _bridge: SessionPersistenceBridge,
  _adapter: SessionStorageAdapter,
  _options?: SessionAutosaveControllerOptions
): SessionAutosaveController {
  return {
    notifyMutation(_event: AutosaveMutationEvent): void {
      /* D68.1 stub — dirty + schedule in D68.2+ */
    },
    pause(): void {
      /* D68.1 stub — pause flag in D68.5+ */
    },
    resume(): void {
      /* D68.1 stub — resume + flush-if-dirty in D68.5+ */
    },
    async flush(): Promise<void> {
      /* D68.1 stub — single-flight flush in D68.4/D68.5+ */
    },
    dispose(): void {
      /* D68.1 stub — cancel timer only · no implicit flush (HR-dispose-no-implicit-flush) */
    },
  };
}

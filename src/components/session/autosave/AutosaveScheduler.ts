/**
 * D68.3 — Session Autosave Foundation · AutosaveScheduler.
 * Authority: D68.0 Architecture Freeze · API Freeze.
 * Debounce-only — no DirtyTracker, FlushPolicy, Controller, Bridge, Adapter,
 * React, or I/O (D68.4+).
 */

import { AUTOSAVE_DEBOUNCE_MS } from "./AutosaveTypes";

/** API Freeze — optional scheduler knobs. */
export type AutosaveSchedulerOptions = {
  readonly debounceMs?: number;
};

/**
 * API Freeze — debounce timer surface.
 * dispose = cancel only · no implicit flush (HR-dispose-no-implicit-flush).
 */
export type AutosaveScheduler = {
  schedule(callback: () => void): void;
  cancel(): void;
  flushNow(): void;
  dispose(): void;
};

/**
 * Factory — pure debounce scheduler via setTimeout / clearTimeout.
 * Keeps only the latest callback; reschedule resets the timer.
 */
export function createAutosaveScheduler(
  options?: AutosaveSchedulerOptions
): AutosaveScheduler {
  const debounceMs = options?.debounceMs ?? AUTOSAVE_DEBOUNCE_MS;

  let timerId: ReturnType<typeof setTimeout> | null = null;
  let pending: (() => void) | null = null;

  function cancel(): void {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    pending = null;
  }

  return {
    schedule(callback: () => void): void {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      pending = callback;
      timerId = setTimeout(() => {
        timerId = null;
        const cb = pending;
        pending = null;
        if (cb !== null) {
          cb();
        }
      }, debounceMs);
    },

    cancel,

    flushNow(): void {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      const cb = pending;
      pending = null;
      if (cb !== null) {
        cb();
      }
    },

    dispose(): void {
      cancel();
    },
  };
}

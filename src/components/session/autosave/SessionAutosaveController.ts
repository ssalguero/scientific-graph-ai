/**
 * D68.5 / D68.8 — Session Autosave Foundation · SessionAutosaveController.
 * Authority: D68.0 Architecture Freeze · API Freeze ·
 * HR-pause-dirty-continue · HR-flush-single-flight · HR-dispose-no-implicit-flush ·
 * HR-clear-only-on-unregister · HR-autosave-bridge-only · HR-autosave-adapter-clear-only.
 * Assembles DirtyTracker + Scheduler + FlushPolicy + Bridge + Adapter.
 * No React, Context, Registry mutation, Restore, or Provider wiring (D68.6).
 *
 * D68.8 edge audit:
 * - pause → notifyMutation marks dirty only (no schedule / no pendingFlush)
 * - resume → immediate flush if dirty
 * - notifyMutation during flushInFlight (!paused) → pendingFlush → re-flush (model B)
 * - dispose → scheduler.dispose · no implicit flush · idempotent
 */

import type {
  SessionPersistenceBridge,
  SessionStorageAdapter,
} from "../persistence/SessionPersistenceTypes";
import { createAutosaveFlushPolicy } from "./AutosaveFlushPolicy";
import { createAutosaveScheduler } from "./AutosaveScheduler";
import { createDirtyTracker } from "./DirtyTracker";
import type {
  AutosaveMutationEvent,
  SessionAutosaveController,
  SessionAutosaveControllerOptions,
} from "./AutosaveTypes";

/**
 * API Freeze — factory.
 * Real dirty / debounce / flush / pause / dispose semantics.
 */
export function createSessionAutosaveController(
  bridge: SessionPersistenceBridge,
  adapter: SessionStorageAdapter,
  options?: SessionAutosaveControllerOptions
): SessionAutosaveController {
  const dirty = createDirtyTracker();
  const policy = createAutosaveFlushPolicy();
  const scheduler = createAutosaveScheduler({
    debounceMs: options?.debounceMs,
  });

  let paused = false;
  let disposed = false;
  let flushInFlight = false;
  let pendingFlush = false;

  function hasPendingDirty(): boolean {
    const snap = dirty.snapshot();
    return snap.needsFullRewrite || snap.dirtyIds.length > 0;
  }

  async function flush(): Promise<void> {
    if (disposed) {
      return;
    }

    if (flushInFlight) {
      pendingFlush = true;
      return;
    }

    flushInFlight = true;
    try {
      do {
        pendingFlush = false;
        // Drop debounce timer without running it — this flush owns the write.
        scheduler.cancel();

        const snap = dirty.snapshot();
        // Consume snapshot now so mutations during await re-accumulate (model B).
        dirty.clear();

        const op = policy.decide(snap);
        switch (op.kind) {
          case "none":
            break;
          case "persistSession":
            await bridge.persistSession(op.sessionId);
            break;
          case "persistRegistry":
            await bridge.persistRegistry();
            break;
          case "clearThenPersistRegistry":
            await adapter.clear();
            await bridge.persistRegistry();
            break;
        }
      } while (pendingFlush && !disposed);
    } finally {
      flushInFlight = false;
    }
  }

  return {
    notifyMutation(event: AutosaveMutationEvent): void {
      if (disposed) {
        return;
      }

      if (event.kind === "unregister") {
        dirty.markRemoved(event.sessionId);
      } else {
        // register | updateState
        dirty.mark(event.sessionId);
      }

      // HR-pause-dirty-continue: dirty already marked; no schedule / no pendingFlush.
      if (paused) {
        return;
      }

      // HR-flush-single-flight (model B): coalesce into re-flush after in-flight write.
      if (flushInFlight) {
        pendingFlush = true;
        return;
      }

      scheduler.schedule(() => {
        void flush();
      });
    },

    pause(): void {
      if (disposed) {
        return;
      }
      paused = true;
      scheduler.cancel();
    },

    resume(): void {
      if (disposed) {
        return;
      }
      paused = false;
      if (hasPendingDirty()) {
        void flush();
      }
    },

    flush,

    dispose(): void {
      if (disposed) {
        return;
      }
      disposed = true;
      paused = false;
      pendingFlush = false;
      scheduler.dispose();
      // NO implicit flush (HR-dispose-no-implicit-flush)
    },
  };
}

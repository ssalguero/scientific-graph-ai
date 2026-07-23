/**
 * D68.2 / D68.8 — Session Autosave Foundation · DirtyTracker.
 * Authority: D68.0 Architecture Freeze · API Freeze.
 * Pure in-memory dirty state — no React, timers, Bridge, Adapter, I/O,
 * Scheduler, FlushPolicy, or Controller (D68.3+).
 *
 * D68.8 edge audit:
 * - mark → Set dedupe · insertion order preserved · needsFullRewrite untouched
 * - markRemoved → needsFullRewrite=true · existing order unchanged for prior ids
 * - clear → empty dirtyIds · needsFullRewrite=false
 * - snapshot → frozen array copy · Set never exposed
 */

import type { SessionId } from "../SessionTypes";

/** API Freeze — immutable view of dirty state. */
export type DirtyTrackerSnapshot = {
  readonly dirtyIds: readonly SessionId[];
  readonly needsFullRewrite: boolean;
};

/**
 * API Freeze — dirty session set + unregister rewrite flag.
 * mark never sets needsFullRewrite; only markRemoved does.
 */
export type DirtyTracker = {
  mark(sessionId: SessionId): void;
  markRemoved(sessionId: SessionId): void;
  clear(): void;
  snapshot(): DirtyTrackerSnapshot;
};

/**
 * Factory — pure DirtyTracker.
 * Uses Set for uniqueness; insertion order preserved on snapshot.
 */
export function createDirtyTracker(): DirtyTracker {
  const dirtyIds = new Set<SessionId>();
  let needsFullRewrite = false;

  return {
    mark(sessionId: SessionId): void {
      dirtyIds.add(sessionId);
      // needsFullRewrite untouched (HR-clear-only-on-unregister)
    },

    markRemoved(sessionId: SessionId): void {
      dirtyIds.add(sessionId);
      needsFullRewrite = true;
    },

    clear(): void {
      dirtyIds.clear();
      needsFullRewrite = false;
    },

    snapshot(): DirtyTrackerSnapshot {
      return {
        dirtyIds: Object.freeze(Array.from(dirtyIds)) as readonly SessionId[],
        needsFullRewrite,
      };
    },
  };
}

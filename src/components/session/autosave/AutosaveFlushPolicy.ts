/**
 * D68.4 / D68.8 — Session Autosave Foundation · AutosaveFlushPolicy.
 * Authority: D68.0 Architecture Freeze · API Freeze · HR-clear-only-on-unregister.
 * Pure decide(snapshot) only — no Bridge, Adapter, Scheduler, Controller, React, or I/O.
 *
 * D68.8 edge audit: decide remains pure · needsFullRewrite ⇒ clearThenPersistRegistry
 * before dirty-count branches · never mutates snapshot.
 */

import type { SessionId } from "../SessionTypes";
import type { DirtyTrackerSnapshot } from "./DirtyTracker";

/**
 * API Freeze — persistence operation chosen from a dirty snapshot.
 * clearThenPersistRegistry only when needsFullRewrite (unregister real).
 */
export type AutosaveFlushOperation =
  | {
      readonly kind: "none";
    }
  | {
      readonly kind: "persistSession";
      readonly sessionId: SessionId;
    }
  | {
      readonly kind: "persistRegistry";
    }
  | {
      readonly kind: "clearThenPersistRegistry";
    };

/** API Freeze — pure flush decision surface. */
export type AutosaveFlushPolicy = {
  decide(snapshot: DirtyTrackerSnapshot): AutosaveFlushOperation;
};

/**
 * Factory — pure FlushPolicy.
 * Order: needsFullRewrite first, then dirty count (0 / 1 / 2+).
 */
export function createAutosaveFlushPolicy(): AutosaveFlushPolicy {
  return {
    decide(snapshot: DirtyTrackerSnapshot): AutosaveFlushOperation {
      if (snapshot.needsFullRewrite) {
        return { kind: "clearThenPersistRegistry" };
      }

      const count = snapshot.dirtyIds.length;

      if (count === 0) {
        return { kind: "none" };
      }

      if (count === 1) {
        return {
          kind: "persistSession",
          sessionId: snapshot.dirtyIds[0]!,
        };
      }

      return { kind: "persistRegistry" };
    },
  };
}

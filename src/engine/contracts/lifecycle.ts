/**
 * ENGINE Domain — Lifecycle contracts (Application API).
 * OWNERSHIP: ENGINE owns application lifecycle transitions (≠ Runtime platform).
 * ENGINE-0: LifecycleApi method names and LifecyclePhase union frozen.
 */

/** Application / workspace / document lifecycle API surface. */
export interface LifecycleApi {
  initializeApplication(payload?: unknown): Promise<void>;
  activateWorkspace(payload?: unknown): Promise<void>;
  activateDocument(payload?: unknown): Promise<void>;
  shutdownApplication(payload?: unknown): Promise<void>;
}

/** Lifecycle phase identifiers. */
export type LifecyclePhase =
  | "uninitialized"
  | "initializing"
  | "ready"
  | "shuttingDown"
  | "shutdown";

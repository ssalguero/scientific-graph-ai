/**
 * UX-5.5 — Runtime feature state (immutable snapshot).
 *
 * FeatureState represents an immutable snapshot of a conceptually mutable
 * runtime status. The object is frozen; future evolution replaces snapshots
 * and never mutates the same object in place (→ UX-5.6 Feature Provider).
 *
 * Separated from FeatureDefinition (metadata) and FeatureRegistry (SSOT).
 * No Store · no Provider · no sync in this phase.
 */

import type { FeatureId } from "./FeatureTypes";

export type FeatureStatus =
  | "enabled"
  | "disabled"
  | "loading"
  | "error";

export type FeatureState = Readonly<{
  readonly id: FeatureId;
  readonly status: FeatureStatus;
}>;

/** Input shape for createFeatureState (freeze-only; no collections). */
export type FeatureStateInit = Readonly<{
  id: FeatureId;
  status: FeatureStatus;
}>;

/**
 * Builds an immutable FeatureState snapshot.
 * Applies Object.freeze only — no array copies (no collections).
 */
export function createFeatureState(init: FeatureStateInit): FeatureState {
  return Object.freeze({
    ...init,
  });
}

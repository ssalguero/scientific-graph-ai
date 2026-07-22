/**
 * D60.1 — Series Alignment Foundation · public type contracts.
 * Authority: docs/D60.0-series-discovery.md · API Freeze D60.
 * Types only — no runtime logic, no UI.
 */

import type { SeriesId } from "./SeriesId";

/**
 * Infrastructure series kind.
 * Additive extensions only in later phases — not a domain-specific kind.
 */
export type SeriesKind = "generic";

/**
 * Infrastructure lifecycle state for a series identity.
 * Distinct from selection focus (selected / active / focused — D60.3).
 */
export type SeriesState = "idle" | "ready" | "active" | "closed";

/** Minimal identity record — id + kind + state. */
export type SeriesIdentity = {
  id: SeriesId;
  kind: SeriesKind;
  state: SeriesState;
};

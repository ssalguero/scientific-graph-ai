/**
 * D60.2 — Series Alignment Foundation · registry contracts.
 * Authority: docs/D60.0-series-discovery.md · API Freeze D60.
 * Types only — no runtime logic, no UI.
 */

import type { SeriesId } from "./SeriesId";
import type { SeriesMetadata } from "./SeriesMetadata";
import type { SeriesKind, SeriesState } from "./SeriesTypes";

/** Registered series record — infrastructure identity + optional metadata. */
export type SeriesDefinition = {
  id: SeriesId;
  kind: SeriesKind;
  state: SeriesState;
  metadata?: SeriesMetadata;
};

/**
 * Frozen registry surface — unique authority for registered series.
 * Operations: register / unregister / has / get / getAll.
 */
export type SeriesRegistry = {
  register(definition: SeriesDefinition): void;
  unregister(id: SeriesId): void;
  has(id: SeriesId): boolean;
  get(id: SeriesId): SeriesDefinition | undefined;
  getAll(): readonly SeriesDefinition[];
};

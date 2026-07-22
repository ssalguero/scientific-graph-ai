/**
 * D60.1 — Series Alignment Foundation · series metadata.
 * Authority: docs/D60.0-series-discovery.md · API Freeze D60.
 * Types only — no state, no factories, no external module imports beyond SeriesTypes.
 */

import type { SeriesKind } from "./SeriesTypes";

/** Frozen metadata shape for a series — infrastructure only. */
export type SeriesMetadata = {
  title?: string;
  description?: string;
  kind?: SeriesKind;
  attributes?: Readonly<Record<string, unknown>>;
};

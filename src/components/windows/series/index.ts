/**
 * D60.1–D60.4 — Series Alignment Foundation · internal barrel.
 * Authority: docs/D60.0-series-discovery.md · Hard Rule: series barrel only.
 * Not re-exported from windows/index.ts.
 */

export type { SeriesId } from "./SeriesId";
export type { SeriesKind, SeriesState, SeriesIdentity } from "./SeriesTypes";
export type { SeriesMetadata } from "./SeriesMetadata";
export type { SeriesDefinition, SeriesRegistry } from "./SeriesRegistryTypes";
export { createSeriesRegistry } from "./SeriesRegistry";
export type {
  SeriesSelectionSnapshot,
  SeriesSelectionListener,
  SeriesSelectionState,
  SeriesSelectionBridge,
} from "./SeriesSelectionTypes";
export { createSeriesSelectionState } from "./SeriesSelectionState";
export { createSeriesSelectionBridge } from "./SeriesSelectionBridge";
export type { WindowId, WindowSeriesBridge } from "./WindowSeriesBridge";
export { createWindowSeriesBridge } from "./WindowSeriesBridge";

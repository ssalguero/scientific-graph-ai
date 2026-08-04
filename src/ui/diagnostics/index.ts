/**
 * UX-6.9 — Diagnostics & Metrics local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 *
 * React pieces (Context / Provider / Hook / Bridge) are intentionally NOT
 * exported — same local-barrel rule as menus / toolbar / context-menus.
 */

export type { UXDiagnosticsInput } from "./UXDiagnosticsTypes";

export type { UXMetricsReport } from "./UXMetrics";
export { createUXMetrics } from "./UXMetrics";

export type { UXDiagnosticsReport } from "./UXDiagnosticsReport";

export { createUXDiagnosticsReport } from "./UXDiagnosticsAggregator";

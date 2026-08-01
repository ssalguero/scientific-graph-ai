/**
 * UX-3.13 — Private runtime health aggregation barrel.
 * Not re-exported from @/ui, theme/index, runtime/index, hooks/index, or providers/index.
 *
 * RuntimeAggregationBuilder remains private to this folder (not re-exported).
 */

export type { RuntimeAggregation } from "./RuntimeAggregation";
export { RuntimeAggregationAccumulator } from "./RuntimeAggregationAccumulator";
export { RuntimeAggregationReporter } from "./RuntimeAggregationReporter";

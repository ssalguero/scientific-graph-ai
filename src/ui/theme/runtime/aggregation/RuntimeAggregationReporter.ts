/**
 * UX-3.13 — Pure RuntimeAggregation reporter facade (private).
 *
 * API: build(accumulator) only.
 * Delegates to accumulator.build() (→ Builder.create). No state or cache.
 */

import type { RuntimeAggregation } from "./RuntimeAggregation";
import type { RuntimeAggregationAccumulator } from "./RuntimeAggregationAccumulator";

function build(
  accumulator: RuntimeAggregationAccumulator,
): RuntimeAggregation {
  return accumulator.build();
}

export const RuntimeAggregationReporter = Object.freeze({
  build,
});

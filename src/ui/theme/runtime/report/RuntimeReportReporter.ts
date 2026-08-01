/**
 * UX-3.16 — Pure RuntimeReport reporter facade (private).
 *
 * API: build(collector) only.
 * Delegates to collector.build() (→ Builder.create). No state or cache.
 * Reporter owns no state.
 */

import type { RuntimeReportSnapshot } from "./RuntimeReportTypes";
import type { RuntimeReportCollector } from "./RuntimeReportCollector";

function build(
  collector: RuntimeReportCollector,
): RuntimeReportSnapshot {
  return collector.build();
}

export const RuntimeReportReporter = Object.freeze({
  build,
});

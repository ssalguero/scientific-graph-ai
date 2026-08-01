/**
 * UX-3.19 — Private Theme Runtime reporting facade.
 *
 * Delegates the full private diagnostics pipeline to RuntimePipeline:
 * Snapshot → Metrics → Health → Aggregation → Telemetry → Report
 * → return report (RuntimeReportSnapshot).
 *
 * Not exported from any public barrel. Knows no internal pipeline steps —
 * only RuntimePipeline.run(...).
 */

import { RuntimePipeline } from "./pipeline/RuntimePipeline";
import type { ThemeRuntime } from "./selectors/ThemeSelector";
import type { RuntimeReportSnapshot } from "./report/RuntimeReportTypes";

function build(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  const report = RuntimePipeline.run(runtime);
  return report;
}

export const RuntimeReporter = Object.freeze({
  build,
});

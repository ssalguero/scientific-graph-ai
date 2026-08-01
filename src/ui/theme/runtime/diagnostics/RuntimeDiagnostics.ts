/**
 * UX-3.20 — Private Theme Runtime diagnostics facade.
 *
 * Sole caller of RuntimePipeline for the private diagnostics sequence:
 * Snapshot → Metrics → Health → Aggregation → Telemetry → Report
 * → return report (RuntimeReportSnapshot).
 *
 * Not exported from any public barrel. No orchestration logic — only
 * RuntimePipeline.run(...).
 */

import { RuntimePipeline } from "../pipeline/RuntimePipeline";
import type { ThemeRuntime } from "../selectors/ThemeSelector";
import type { RuntimeReportSnapshot } from "../report/RuntimeReportTypes";

function collect(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  const report = RuntimePipeline.run(runtime);
  return report;
}

export const RuntimeDiagnostics = Object.freeze({
  collect,
});

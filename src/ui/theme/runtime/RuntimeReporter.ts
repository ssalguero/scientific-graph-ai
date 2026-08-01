/**
 * UX-3.20 — Private Theme Runtime reporting facade.
 *
 * Delegates to RuntimeDiagnostics.collect(...):
 * Snapshot → Metrics → Health → Aggregation → Telemetry → Report
 * → return report (RuntimeReportSnapshot).
 *
 * Not exported from any public barrel. Knows no internal pipeline steps —
 * only RuntimeDiagnostics.collect(...).
 */

import { RuntimeDiagnostics } from "./diagnostics/RuntimeDiagnostics";
import type { ThemeRuntime } from "./selectors/ThemeSelector";
import type { RuntimeReportSnapshot } from "./report/RuntimeReportTypes";

function build(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  const report = RuntimeDiagnostics.collect(runtime);
  return report;
}

export const RuntimeReporter = Object.freeze({
  build,
});

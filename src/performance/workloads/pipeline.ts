/**
 * PERFORMANCE-I4 — Workload → Measure → Baseline → Evidence helper.
 */

import { createBaselineRegistry } from "./baseline";
import { runWorkloadHarness } from "./harness";
import type {
  PerformanceBaseline,
  WorkloadCoreResult,
  WorkloadDefinition,
  WorkloadRunConfig,
} from "./types";

export function runWorkloadAndCreateBaseline(
  workload: WorkloadDefinition,
  config: WorkloadRunConfig,
  baselineId: string,
  registry = createBaselineRegistry(),
): WorkloadCoreResult<{
  readonly baseline: PerformanceBaseline;
  readonly registry: ReturnType<typeof createBaselineRegistry>;
}> {
  const run = runWorkloadHarness(workload, config);
  if (!run.ok) return run;
  const created = registry.createFromRun(baselineId, run.value, {
    reproducible: true,
  });
  if (!created.ok) return created;
  return {
    ok: true,
    value: { baseline: created.value, registry },
  };
}

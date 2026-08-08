/**
 * PERFORMANCE-I4 — C-WL harness (controlled measurement association).
 *
 * Executes a workload configuration by feeding explicit numeric samples into
 * Collect → Aggregate. Does not orchestrate peers or invent peer APIs.
 */

import { collectThenAggregate } from "../measurement/pipeline";
import type { MeasurementObservationInput } from "../measurement/types";
import { isConditionalWorkloadSource, validateWorkloadDefinition } from "./workload";
import type {
  WorkloadCoreResult,
  WorkloadDefinition,
  WorkloadRunConfig,
  WorkloadRunResult,
} from "./types";

export function runWorkloadHarness(
  workload: WorkloadDefinition,
  config: WorkloadRunConfig,
): WorkloadCoreResult<WorkloadRunResult> {
  const validated = validateWorkloadDefinition(workload);
  if (!validated.ok) return validated;

  if (!config.runId || config.runId.trim().length === 0) {
    return { ok: false, error: "runId must be a non-empty string" };
  }
  if (!Number.isFinite(config.collectedAtMs)) {
    return { ok: false, error: "collectedAtMs must be finite" };
  }
  if (!Array.isArray(config.numericValues) || config.numericValues.length === 0) {
    return { ok: false, error: "numericValues must be a non-empty array" };
  }
  if (config.numericValues.some((v) => !Number.isFinite(v))) {
    return { ok: false, error: "numericValues must be finite numbers" };
  }

  if (isConditionalWorkloadSource(validated.value.sourceLabel)) {
    return {
      ok: false,
      error: `EVIDENCE_DEPENDENCY: conditional source '${validated.value.sourceLabel}' is not executable in I4 harness`,
    };
  }

  const inputs: MeasurementObservationInput[] = config.numericValues.map(
    (numericValue, index) => ({
      observationId: `${validated.value.workloadId}.${config.runId}.${index}`,
      sourceLabel: validated.value.sourceLabel,
      signalName: validated.value.signalName,
      numericValue,
      collectedAtMs: config.collectedAtMs + index,
    }),
  );

  const aggregated = collectThenAggregate(
    `wl-${validated.value.workloadId}-${config.runId.trim()}`,
    inputs,
  );
  if (!aggregated.ok) return aggregated;

  return {
    ok: true,
    value: {
      workloadId: validated.value.workloadId,
      runId: config.runId.trim(),
      aggregation: aggregated.value,
      collectedAtMs: config.collectedAtMs,
    },
  };
}

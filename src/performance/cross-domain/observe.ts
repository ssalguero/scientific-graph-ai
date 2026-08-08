/**
 * PERFORMANCE-I6 — Sequential multi-domain observation via existing I2 adapters.
 *
 * Observational only: does not dispatch peer commands or manage peer lifecycle.
 * Reuses I2 observe* surfaces; does not create new adapters.
 */

import { bindAdapterObservations } from "../instrumentation/bind";
import { observeDataPublicSurface } from "../instrumentation/data-adapter";
import { observeEnginePublicSurface } from "../instrumentation/engine-adapter";
import { observeUxPublicSurface } from "../instrumentation/ux-adapter";
import type { AdapterObservationBatch } from "../instrumentation/types";
import type { AggregationView, MeasurementCoreResult } from "../measurement/types";
import type { PerformanceMeasurementDomain } from "../domain-waves/types";
import type { DomainStepObservation } from "./types";

function observeDomainBatch(
  domain: PerformanceMeasurementDomain,
  collectedAtMs: number,
): MeasurementCoreResult<AdapterObservationBatch> {
  switch (domain) {
    case "ux":
      return { ok: true, value: observeUxPublicSurface(collectedAtMs) };
    case "engine":
      return { ok: true, value: observeEnginePublicSurface(collectedAtMs) };
    case "data":
      return { ok: true, value: observeDataPublicSurface(collectedAtMs) };
    case "ai":
    case "collab":
    case "plugins":
      return {
        ok: false,
        error: `EVIDENCE_DEPENDENCY: domain '${domain}' has no I2 adapter for cross-domain observation`,
      };
    default: {
      const _exhaustive: never = domain;
      return { ok: false, error: `unknown domain: ${String(_exhaustive)}` };
    }
  }
}

export type CrossDomainObservationBundle = {
  readonly aggregation: AggregationView;
  readonly steps: readonly DomainStepObservation[];
};

/**
 * Observe domains in explicit order, then Collect → Aggregate once.
 * Partial sequences never silently succeed.
 */
export function observeDomainSequence(
  sequence: readonly PerformanceMeasurementDomain[],
  batchId: string,
  collectedAtMs: number,
): MeasurementCoreResult<CrossDomainObservationBundle> {
  const batches: AdapterObservationBatch[] = [];
  const steps: DomainStepObservation[] = [];

  for (let i = 0; i < sequence.length; i++) {
    const domain = sequence[i]!;
    const batch = observeDomainBatch(domain, collectedAtMs + i * 1000);
    if (!batch.ok) {
      return {
        ok: false,
        error: `step ${i + 1}/${sequence.length} (${domain}): ${batch.error}`,
      };
    }
    batches.push(batch.value);
    steps.push({
      domain,
      order: i + 1,
      observationCount: batch.value.observations.length,
    });
  }

  const aggregated = bindAdapterObservations(batchId, batches);
  if (!aggregated.ok) return aggregated;

  return {
    ok: true,
    value: { aggregation: aggregated.value, steps },
  };
}

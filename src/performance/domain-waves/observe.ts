/**
 * PERFORMANCE-I5 — Single-domain observation via existing I2 adapters.
 *
 * Never aggregates multiple peer seams in one wave (multi-domain is I6).
 * Never imports peer packages — adapters own that boundary.
 */

import { bindAdapterObservations } from "../instrumentation/bind";
import { observeDataPublicSurface } from "../instrumentation/data-adapter";
import { observeEnginePublicSurface } from "../instrumentation/engine-adapter";
import { getSeamDescriptor } from "../instrumentation/seams";
import { observeUxPublicSurface } from "../instrumentation/ux-adapter";
import type { AggregationView, MeasurementCoreResult } from "../measurement/types";
import type { PerformanceMeasurementDomain } from "./types";

/**
 * Observe exactly one active domain seam and aggregate.
 * Conditional domains return EVIDENCE_DEPENDENCY without fabricating data.
 */
export function observeSingleDomainSurface(
  domain: PerformanceMeasurementDomain,
  batchId: string,
  collectedAtMs: number,
): MeasurementCoreResult<AggregationView> {
  const seam = getSeamDescriptor(domain);
  if (!seam || !seam.adapterImplemented) {
    return {
      ok: false,
      error: `EVIDENCE_DEPENDENCY: domain '${domain}' has no implemented I2 adapter (${seam?.availability ?? "unknown"})`,
    };
  }

  switch (domain) {
    case "engine":
      return bindAdapterObservations(batchId, [
        observeEnginePublicSurface(collectedAtMs),
      ]);
    case "data":
      return bindAdapterObservations(batchId, [
        observeDataPublicSurface(collectedAtMs),
      ]);
    case "ux":
      return bindAdapterObservations(batchId, [
        observeUxPublicSurface(collectedAtMs),
      ]);
    case "ai":
    case "collab":
    case "plugins":
      return {
        ok: false,
        error: `EVIDENCE_DEPENDENCY: domain '${domain}' is conditional — not executable in I5`,
      };
    default: {
      const _exhaustive: never = domain;
      return { ok: false, error: `unknown domain: ${String(_exhaustive)}` };
    }
  }
}

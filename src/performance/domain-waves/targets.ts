/**
 * PERFORMANCE-I5 — Domain wave target registry (measurement attribution only).
 *
 * Does not create PERFORMANCE ownership packages under performance/engine|data|….
 */

import { getSeamDescriptor } from "../instrumentation/seams";
import type {
  DomainWaveTargetDescriptor,
  PerformanceMeasurementDomain,
} from "./types";

export const PERFORMANCE_MEASUREMENT_DOMAINS = [
  "engine",
  "data",
  "ux",
  "ai",
  "collab",
  "plugins",
] as const satisfies readonly PerformanceMeasurementDomain[];

export function isPerformanceMeasurementDomain(
  value: string,
): value is PerformanceMeasurementDomain {
  return (PERFORMANCE_MEASUREMENT_DOMAINS as readonly string[]).includes(value);
}

/** Active I5 targets: I2 adapterImplemented seams only. */
export function listActiveDomainWaveTargets(): readonly DomainWaveTargetDescriptor[] {
  return PERFORMANCE_MEASUREMENT_DOMAINS.filter((domain) => {
    const seam = getSeamDescriptor(domain);
    return seam?.adapterImplemented === true;
  }).map((domain) => ({
    domain,
    kind: "active" as const,
    seamId: domain,
    notes: getSeamDescriptor(domain)?.notes ?? "",
  }));
}

/** Conditional / deferred targets — not executable in I5. */
export function listConditionalDomainWaveTargets(): readonly DomainWaveTargetDescriptor[] {
  return PERFORMANCE_MEASUREMENT_DOMAINS.filter((domain) => {
    const seam = getSeamDescriptor(domain);
    return seam?.adapterImplemented !== true;
  }).map((domain) => {
    const seam = getSeamDescriptor(domain);
    return {
      domain,
      kind: "conditional" as const,
      seamId: domain,
      notes: seam?.notes ?? "no implemented I2 adapter",
    };
  });
}

export function getDomainWaveTarget(
  domain: PerformanceMeasurementDomain,
): DomainWaveTargetDescriptor {
  const seam = getSeamDescriptor(domain);
  const active = seam?.adapterImplemented === true;
  return {
    domain,
    kind: active ? "active" : "conditional",
    seamId: domain,
    notes: seam?.notes ?? "unknown seam",
  };
}

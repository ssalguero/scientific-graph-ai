/**
 * PERFORMANCE-I2 — P4 seam registry (availability only; no invented contracts).
 */

import type { PerformanceSeamAvailability, PerformanceSeamId } from "./identity";

export type PerformanceSeamDescriptor = {
  readonly seamId: PerformanceSeamId;
  readonly availability: PerformanceSeamAvailability;
  readonly publicBoundary: string;
  readonly adapterImplemented: boolean;
  readonly notes: string;
};

/** Authoritative I2 seam registry aligned with PERFORMANCE-P4. */
export const PERFORMANCE_SEAM_REGISTRY: readonly PerformanceSeamDescriptor[] = [
  {
    seamId: "engine",
    availability: "supported",
    publicBoundary: "@/engine",
    adapterImplemented: true,
    notes: "Read-only observation of public workflow/lifecycle/command/composition surface.",
  },
  {
    seamId: "data",
    availability: "supported",
    publicBoundary: "@/data",
    adapterImplemented: true,
    notes: "Read-only observation of DataPublicApi catalog / capability groups.",
  },
  {
    seamId: "ux",
    availability: "supported",
    publicBoundary: "@/ui",
    adapterImplemented: true,
    notes: "Read-only observation of Design System public barrel (tokens/theme).",
  },
  {
    seamId: "ai",
    availability: "conditional",
    publicBoundary: "@/ai (status markers only)",
    adapterImplemented: false,
    notes: "EVIDENCE DEPENDENCY — no public runtime assistance API.",
  },
  {
    seamId: "collab",
    availability: "conditional",
    publicBoundary: "absent (no src/collab)",
    adapterImplemented: false,
    notes: "EVIDENCE DEPENDENCY — no public import path.",
  },
  {
    seamId: "plugins",
    availability: "partial",
    publicBoundary: "@/plugins (status markers)",
    adapterImplemented: false,
    notes: "EVIDENCE DEPENDENCY — execution deferred; deep contracts not consumer seams.",
  },
  {
    seamId: "cross-domain",
    availability: "supported",
    publicBoundary: "UX → ENGINE → DATA shape",
    adapterImplemented: false,
    notes: "Shape documented in P4; I6 owns scenario observation (UX→ENGINE→DATA) using active single-domain adapters — no separate cross-domain peer adapter.",
  },
] as const;

export function getSeamDescriptor(
  seamId: PerformanceSeamId,
): PerformanceSeamDescriptor | undefined {
  return PERFORMANCE_SEAM_REGISTRY.find((s) => s.seamId === seamId);
}

export function listImplementedSeams(): readonly PerformanceSeamDescriptor[] {
  return PERFORMANCE_SEAM_REGISTRY.filter((s) => s.adapterImplemented);
}

export function listUnavailableOrDeferredSeams(): readonly PerformanceSeamDescriptor[] {
  return PERFORMANCE_SEAM_REGISTRY.filter((s) => !s.adapterImplemented);
}

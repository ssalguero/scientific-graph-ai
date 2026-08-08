/**
 * PLUGINS-I8 — Observability aggregation (consumes DiagnosticBundle only).
 *
 * Never modifies diagnostics. Never recomputes compatibility/validation/lifecycle.
 * Never consulted by Lifecycle for decisions.
 */

import { PLUGINS_COMPATIBILITY_STATUS } from "../compatibility/status";
import type { DiagnosticBundle } from "../diagnostics/models";
import { PLUGINS_LIFECYCLE_STATUS } from "../lifecycle/status";
import { PLUGINS_REGISTRY_STATUS } from "../registry/status";
import { PLUGINS_VALIDATION_STATUS } from "../validation/status";
import type {
  ObservabilityEvent,
  ObservabilityMetrics,
  ObservabilityView,
  SystemHealth,
} from "./descriptors";

function deriveOverall(
  bundle: DiagnosticBundle,
): SystemHealth["overall"] {
  if (bundle.bySubsystem.some((c) => c.status === "Unhealthy")) {
    return "Unhealthy";
  }
  if (bundle.bySubsystem.some((c) => c.status === "Degraded")) {
    return "Degraded";
  }
  if (bundle.entryCount === 0) return "Unknown";
  return "Healthy";
}

/**
 * Aggregate a diagnostic bundle into a unified observability view.
 * Descriptive only — no architectural decisions.
 */
export function aggregateObservability(
  bundle: DiagnosticBundle,
): ObservabilityView {
  const errorCount = bundle.entries.filter((e) => e.severity === "Error").length;
  const warningCount = bundle.entries.filter(
    (e) => e.severity === "Warning",
  ).length;
  const statusMarkerCount = bundle.entries.filter(
    (e) => e.severity === "Status",
  ).length;

  const systemHealth: SystemHealth = {
    __kind: "SystemHealth",
    __descriptive: true,
    overall: deriveOverall(bundle),
    componentCount: bundle.bySubsystem.length,
    diagnosticEntryCount: bundle.entryCount,
  };

  const metrics: ObservabilityMetrics = {
    __kind: "ObservabilityMetrics",
    __abstractionOnly: true,
    subsystemCount: bundle.bySubsystem.length,
    statusMarkerCount,
    errorCount,
    warningCount,
  };

  const events: ObservabilityEvent[] = [
    {
      __kind: "ObservabilityEvent",
      __transport: false,
      code: "OBSERVABILITY_AGGREGATED",
      message: `aggregated ${bundle.entryCount} diagnostic entries`,
    },
  ];

  // Planning compliance: descriptive projection from validation entries if present
  const validationEntries = bundle.entries.filter(
    (e) => e.subsystem === "Validation",
  );
  const planningComplianceStatus =
    validationEntries.some((e) => e.code === "VALIDATION_OVERALL" && e.message.includes("Fail"))
      ? "NonCompliant"
      : validationEntries.length > 0
        ? "CompliantOrReported"
        : "Unknown";

  return {
    __kind: "ObservabilityView",
    __readOnly: true,
    __descriptive: true,
    __decisionAuthority: false,
    systemHealth,
    componentHealth: bundle.bySubsystem,
    registryStatus: PLUGINS_REGISTRY_STATUS,
    lifecycleStatus: PLUGINS_LIFECYCLE_STATUS,
    compatibilityStatus: PLUGINS_COMPATIBILITY_STATUS,
    validationStatus: PLUGINS_VALIDATION_STATUS,
    planningComplianceStatus,
    metrics,
    events,
    sourceBundle: bundle,
  };
}

/**
 * PLUGINS-I8 — Observability descriptors / views (descriptive only).
 */

import type { ComponentHealth, DiagnosticBundle } from "../diagnostics/models";

export type SystemHealth = {
  readonly __kind: "SystemHealth";
  readonly __descriptive: true;
  readonly overall: "Healthy" | "Degraded" | "Unhealthy" | "Unknown";
  readonly componentCount: number;
  readonly diagnosticEntryCount: number;
};

export type ObservabilityMetrics = {
  readonly __kind: "ObservabilityMetrics";
  readonly __abstractionOnly: true;
  readonly subsystemCount: number;
  readonly statusMarkerCount: number;
  readonly errorCount: number;
  readonly warningCount: number;
};

/** Observational event abstraction — no event bus / transport. */
export type ObservabilityEvent = {
  readonly __kind: "ObservabilityEvent";
  readonly __transport: false;
  readonly code: string;
  readonly message: string;
};

export type ObservabilityView = {
  readonly __kind: "ObservabilityView";
  readonly __readOnly: true;
  readonly __descriptive: true;
  readonly __decisionAuthority: false;
  readonly systemHealth: SystemHealth;
  readonly componentHealth: readonly ComponentHealth[];
  readonly registryStatus: string;
  readonly lifecycleStatus: string;
  readonly compatibilityStatus: string;
  readonly validationStatus: string;
  readonly planningComplianceStatus: string;
  readonly metrics: ObservabilityMetrics;
  readonly events: readonly ObservabilityEvent[];
  readonly sourceBundle: DiagnosticBundle;
};

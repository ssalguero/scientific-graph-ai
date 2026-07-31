/**
 * UX-3.12 — Composed immutable runtime health (private).
 *
 * Distinct from diagnostics/RuntimeHealth (UX-3.11 aggregate).
 * Same basename, different module (coexistence pattern like RuntimeMetrics).
 *
 * generatedAt is BUILD METADATA ONLY. It MUST NOT participate in:
 * fingerprint identity, diagnostics evaluation, equality, comparisons,
 * or future health diffing (UX-3.13+).
 */

import type { RuntimeDiagnostic } from "../diagnostics/RuntimeDiagnostic";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import type { RuntimeHealthStatus } from "./RuntimeHealthStatus";

export type RuntimeHealth = {
  readonly fingerprint: string;
  readonly version: string;
  readonly diagnostics: ReadonlyArray<Readonly<RuntimeDiagnostic>>;
  readonly metrics: RuntimeMetricsSnapshot;
  readonly status: RuntimeHealthStatus;
  readonly generatedAt: number;
};

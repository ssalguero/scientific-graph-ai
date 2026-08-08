/**
 * PLUGINS-I8 — Diagnostics collection (read-only assembly).
 */

import type { CompatibilityReport } from "../compatibility/report";
import type { LifecyclePluginRecord } from "../lifecycle/descriptors";
import type { ValidationReport } from "../validation/report";
import {
  adaptCompatibilityReportDiagnostics,
  adaptLifecycleRecordDiagnostics,
  adaptStructuralStatusDiagnostics,
  adaptValidationReportDiagnostics,
} from "./adapters";
import type { DiagnosticEntry } from "./descriptors";
import {
  createEmptyDiagnosticBundle,
  summarizeBySubsystem,
  type DiagnosticBundle,
} from "./models";

export type DiagnosticsCollectInput = {
  readonly compatibilityReport?: CompatibilityReport;
  readonly validationReport?: ValidationReport;
  readonly lifecycleRecords?: readonly LifecyclePluginRecord[];
};

/**
 * Assemble a read-only diagnostic bundle.
 * Never mutates Registry/Lifecycle. Never evaluates capabilities/permissions.
 */
export function collectDiagnostics(
  input: DiagnosticsCollectInput = {},
): DiagnosticBundle {
  const entries: DiagnosticEntry[] = [
    ...adaptStructuralStatusDiagnostics(),
  ];

  if (input.compatibilityReport) {
    entries.push(
      ...adaptCompatibilityReportDiagnostics(input.compatibilityReport),
    );
  }
  if (input.validationReport) {
    entries.push(...adaptValidationReportDiagnostics(input.validationReport));
  }
  if (input.lifecycleRecords) {
    entries.push(...adaptLifecycleRecordDiagnostics(input.lifecycleRecords));
  }

  return {
    ...createEmptyDiagnosticBundle(),
    entries,
    entryCount: entries.length,
    bySubsystem: summarizeBySubsystem(entries),
  };
}

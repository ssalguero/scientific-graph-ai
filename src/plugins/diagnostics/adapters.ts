/**
 * PLUGINS-I8 — Diagnostic adapters (project existing info → DiagnosticEntry).
 *
 * Adapters never recompute capability/permission/compatibility/lifecycle decisions.
 * They project status markers and already-produced reports only.
 */

import { PLUGINS_FOUNDATION_STATUS } from "../foundation";
import { PLUGINS_FRAMEWORK_STATUS } from "../framework/status";
import { PLUGINS_REGISTRY_STATUS } from "../registry/status";
import { PLUGINS_DISCOVERY_STATUS } from "../discovery/status";
import { PLUGINS_REGISTRATION_STATUS } from "../registration/status";
import { PLUGINS_CAPABILITIES_STATUS } from "../capabilities/status";
import { PLUGINS_PERMISSIONS_STATUS } from "../permissions/status";
import { PLUGINS_CONTRACTS_STATUS } from "../contracts/status";
import { PLUGINS_LIFECYCLE_STATUS } from "../lifecycle/status";
import { PLUGINS_COMPATIBILITY_STATUS } from "../compatibility/status";
import { PLUGINS_VALIDATION_STATUS } from "../validation/status";
import type { CompatibilityReport } from "../compatibility/report";
import type { ValidationReport } from "../validation/report";
import type { LifecyclePluginRecord } from "../lifecycle/descriptors";
import type { DiagnosticEntry } from "./descriptors";

/** Structural status markers from certified I0–I7 subsystems. */
export function adaptStructuralStatusDiagnostics(): readonly DiagnosticEntry[] {
  const rows: Array<[DiagnosticEntry["subsystem"], string, string]> = [
    ["Foundation", "FOUNDATION_STATUS", PLUGINS_FOUNDATION_STATUS],
    ["Framework", "FRAMEWORK_STATUS", PLUGINS_FRAMEWORK_STATUS],
    ["Registry", "REGISTRY_STATUS", PLUGINS_REGISTRY_STATUS],
    ["Discovery", "DISCOVERY_STATUS", PLUGINS_DISCOVERY_STATUS],
    ["Registration", "REGISTRATION_STATUS", PLUGINS_REGISTRATION_STATUS],
    ["Capabilities", "CAPABILITIES_STATUS", PLUGINS_CAPABILITIES_STATUS],
    ["Permissions", "PERMISSIONS_STATUS", PLUGINS_PERMISSIONS_STATUS],
    ["PublicContracts", "CONTRACTS_STATUS", PLUGINS_CONTRACTS_STATUS],
    ["Lifecycle", "LIFECYCLE_STATUS", PLUGINS_LIFECYCLE_STATUS],
    ["Compatibility", "COMPATIBILITY_STATUS", PLUGINS_COMPATIBILITY_STATUS],
    ["Validation", "VALIDATION_STATUS", PLUGINS_VALIDATION_STATUS],
  ];

  return rows.map(([subsystem, code, message]) => ({
    __kind: "DiagnosticEntry" as const,
    __descriptive: true as const,
    __mutable: false as const,
    subsystem,
    code,
    severity: "Status" as const,
    message,
  }));
}

/** Project an existing CompatibilityReport — do not re-evaluate. */
export function adaptCompatibilityReportDiagnostics(
  report: CompatibilityReport,
): readonly DiagnosticEntry[] {
  const entries: DiagnosticEntry[] = [
    {
      __kind: "DiagnosticEntry",
      __descriptive: true,
      __mutable: false,
      subsystem: "Compatibility",
      code: "COMPATIBILITY_OVERALL",
      severity: report.overall === "Incompatible" ? "Error" : "Info",
      message: `overall=${report.overall}`,
    },
  ];
  for (const d of report.diagnostics) {
    entries.push({
      __kind: "DiagnosticEntry",
      __descriptive: true,
      __mutable: false,
      subsystem: "Compatibility",
      code: d.code,
      severity: "Info",
      message: d.message,
    });
  }
  return entries;
}

/** Project an existing ValidationReport — do not re-certify. */
export function adaptValidationReportDiagnostics(
  report: ValidationReport,
): readonly DiagnosticEntry[] {
  const entries: DiagnosticEntry[] = [
    {
      __kind: "DiagnosticEntry",
      __descriptive: true,
      __mutable: false,
      subsystem: "Validation",
      code: "VALIDATION_OVERALL",
      severity: report.overall === "Fail" ? "Error" : "Info",
      message: `overall=${report.overall}`,
    },
  ];
  for (const d of report.diagnostics) {
    entries.push({
      __kind: "DiagnosticEntry",
      __descriptive: true,
      __mutable: false,
      subsystem: "Validation",
      code: d.code,
      severity: "Info",
      message: d.message,
    });
  }
  return entries;
}

/** Project lifecycle records — do not decide transitions. */
export function adaptLifecycleRecordDiagnostics(
  records: readonly LifecyclePluginRecord[],
): readonly DiagnosticEntry[] {
  return records.map((r) => ({
    __kind: "DiagnosticEntry" as const,
    __descriptive: true as const,
    __mutable: false as const,
    subsystem: "Lifecycle" as const,
    code: "LIFECYCLE_RECORD",
    severity: "Info" as const,
    message: `${r.identity}: state=${r.state} eligibility=${r.activationEligibility} executing=${r.activeMeansExecuting}`,
  }));
}

/**
 * PLUGINS-I7 — Validation certification (reports only).
 *
 * Consumes Compatibility reports — does not re-evaluate compatibility logic.
 * Never mutates Registry/Lifecycle. Never activates or executes.
 */

import type { CompatibilityReport } from "../compatibility/report";
import type { PublicPluginContractView } from "../contracts/views";
import type { LifecyclePluginRecord } from "../lifecycle/descriptors";
import type {
  ValidationDiagnostic,
  ValidationFinding,
  ValidationOutcome,
} from "./descriptors";
import {
  createEmptyValidationReport,
  type ValidationReport,
} from "./report";

export type ValidationCertificationInput = {
  readonly compatibilityReport: CompatibilityReport;
  readonly contract: PublicPluginContractView;
  /** Optional lifecycle snapshots for integrity checks — never mutated. */
  readonly lifecycleRecords?: readonly LifecyclePluginRecord[];
};

export type ValidationCertificationResult = {
  readonly ok: true;
  readonly report: ValidationReport;
};

function overallFromFindings(
  findings: readonly ValidationFinding[],
): ValidationOutcome {
  if (findings.some((f) => f.outcome === "Fail")) return "Fail";
  if (findings.length === 0) return "NotApplicable";
  if (findings.every((f) => f.outcome === "Pass" || f.outcome === "NotApplicable")) {
    return findings.some((f) => f.outcome === "Pass") ? "Pass" : "NotApplicable";
  }
  return "Fail";
}

/**
 * Certify compliance by consuming an existing CompatibilityReport.
 * Must not invoke the compatibility evaluation function.
 */
export function certifyCompliance(
  input: ValidationCertificationInput,
): ValidationCertificationResult {
  const findings: ValidationFinding[] = [];
  const diagnostics: ValidationDiagnostic[] = [];
  const { compatibilityReport, contract, lifecycleRecords } = input;

  if (
    compatibilityReport.__kind !== "CompatibilityReport" ||
    compatibilityReport.__advisory !== true
  ) {
    diagnostics.push({
      code: "COMPATIBILITY_REPORT_INVALID",
      message: "input is not a valid advisory CompatibilityReport",
    });
    findings.push({
      __kind: "ValidationFinding",
      concern: "CompatibilityReportIntegrity",
      outcome: "Fail",
      message: "compatibility report integrity failed",
    });
    return {
      ok: true,
      report: {
        ...createEmptyValidationReport(),
        overall: "Fail",
        findings,
        diagnostics,
      },
    };
  }

  diagnostics.push({
    code: "COMPATIBILITY_REPORT_CONSUMED",
    message: "compatibility report consumed without re-evaluation",
  });

  // Compatibility report integrity (consume, do not recreate findings)
  findings.push({
    __kind: "ValidationFinding",
    concern: "CompatibilityReportIntegrity",
    outcome:
      compatibilityReport.__executionImplied === false &&
      compatibilityReport.__mutatesRegistry === false &&
      compatibilityReport.__mutatesLifecycle === false
        ? "Pass"
        : "Fail",
    message: "compatibility report flags remain advisory / non-mutating",
  });

  // Planning compliance — I7 flags on report shape
  findings.push({
    __kind: "ValidationFinding",
    concern: "PlanningCompliance",
    outcome: compatibilityReport.evaluatedAtLabel === "structural" ? "Pass" : "Fail",
    message: "compatibility evaluation remains structural (planning alignment)",
  });

  // Architectural / public contract integrity
  const contractOk =
    contract.__kind === "PublicPluginContractView" &&
    contract.__certifiedPublicSurface === true &&
    contract.__exposesRegistryInternals === false &&
    contract.__exposesStore === false;
  findings.push({
    __kind: "ValidationFinding",
    concern: "PublicContractIntegrity",
    outcome: contractOk ? "Pass" : "Fail",
    message: contractOk
      ? "public contract integrity held"
      : "public contract integrity failed",
  });
  findings.push({
    __kind: "ValidationFinding",
    concern: "ArchitecturalCompliance",
    outcome:
      contract.__activatesPlugins === false && contract.__executesPlugins === false
        ? "Pass"
        : "Fail",
    message: "architecture: contracts do not activate or execute",
  });

  // Ownership / registry isolation — inferred from contract + compat flags
  findings.push({
    __kind: "ValidationFinding",
    concern: "OwnershipCompliance",
    outcome:
      compatibilityReport.__mutatesRegistry === false &&
      compatibilityReport.__mutatesLifecycle === false
        ? "Pass"
        : "Fail",
    message: "ownership: compatibility does not claim Registry/Lifecycle mutation",
  });
  findings.push({
    __kind: "ValidationFinding",
    concern: "RegistryIsolation",
    outcome: contract.__exposesRegistryInternals === false ? "Pass" : "Fail",
    message: "registry internals not exposed via public contract",
  });

  // Lifecycle integrity — consume optional records; Lifecycle remains owner of decisions
  if (lifecycleRecords && lifecycleRecords.length > 0) {
    const lifecycleOk = lifecycleRecords.every(
      (r) =>
        r.__kind === "LifecyclePluginRecord" &&
        r.__executionImplied === false &&
        r.activeMeansExecuting === false,
    );
    findings.push({
      __kind: "ValidationFinding",
      concern: "LifecycleIntegrity",
      outcome: lifecycleOk ? "Pass" : "Fail",
      message: lifecycleOk
        ? "lifecycle records remain non-executing (Active ≠ execution)"
        : "lifecycle records imply execution",
    });
  } else {
    findings.push({
      __kind: "ValidationFinding",
      concern: "LifecycleIntegrity",
      outcome: "NotApplicable",
      message: "no lifecycle records supplied for integrity check",
    });
  }

  // If compatibility overall is Incompatible, compliance fails Compatibility Before Execution intent
  if (compatibilityReport.overall === "Incompatible") {
    findings.push({
      __kind: "ValidationFinding",
      concern: "ArchitecturalCompliance",
      outcome: "Fail",
      message: "incompatible participation is not Execution-eligible (P4/P2)",
    });
    diagnostics.push({
      code: "COMPLIANCE_FAILURE",
      message: "compatibility overall Incompatible",
      concern: "ArchitecturalCompliance",
    });
  }

  const overall = overallFromFindings(findings);
  if (overall === "Pass") {
    diagnostics.push({
      code: "VALIDATION_CERTIFIED",
      message: "validation certification report produced",
    });
  }

  return {
    ok: true,
    report: {
      __kind: "ValidationReport",
      __certification: true,
      __executionImplied: false,
      __mutatesRegistry: false,
      __mutatesLifecycle: false,
      __reEvaluatedCompatibility: false,
      overall,
      findings,
      diagnostics,
      compatibilityOverall: compatibilityReport.overall,
    },
  };
}

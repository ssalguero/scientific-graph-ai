/**
 * PLUGINS-I7 — Compatibility evaluation (C8).
 *
 * Consumes certified Public Plugin Contract views only.
 * Structural compatibility — no capability/permission evaluation,
 * no Registry/Lifecycle mutation, no package manager / dependency resolver.
 */

import type { PublicPluginContractView } from "../contracts/views";
import { PLUGINS_PUBLIC_CONTRACT_CATEGORIES } from "../contracts/catalog";
import type {
  CompatibilityDiagnostic,
  CompatibilityFinding,
  CompatibilityStatus,
} from "./descriptors";
import {
  createEmptyCompatibilityReport,
  type CompatibilityReport,
} from "./report";

export type CompatibilityEvaluationResult = {
  readonly ok: true;
  readonly report: CompatibilityReport;
};

function overallFromFindings(
  findings: readonly CompatibilityFinding[],
): CompatibilityStatus {
  if (findings.some((f) => f.status === "Incompatible")) return "Incompatible";
  if (findings.length === 0) return "Indeterminate";
  if (findings.every((f) => f.status === "Compatible")) return "Compatible";
  if (findings.some((f) => f.status === "Indeterminate")) return "Indeterminate";
  return "Compatible";
}

/**
 * Evaluate structural compatibility of a certified Public Plugin Contract.
 */
export function evaluateCompatibility(
  contract: PublicPluginContractView,
): CompatibilityEvaluationResult {
  const findings: CompatibilityFinding[] = [];
  const diagnostics: CompatibilityDiagnostic[] = [];

  if (
    contract.__kind !== "PublicPluginContractView" ||
    contract.__certifiedPublicSurface !== true
  ) {
    findings.push({
      __kind: "CompatibilityFinding",
      __advisory: true,
      dimension: "PublicPluginContract",
      status: "Incompatible",
      message: "input is not a certified Public Plugin Contract view",
    });
    diagnostics.push({
      code: "MISSING_CONTRACT_SURFACE",
      message: "uncertified contract surface",
    });
    return {
      ok: true,
      report: {
        ...createEmptyCompatibilityReport(),
        overall: "Incompatible",
        findings,
        diagnostics,
      },
    };
  }

  diagnostics.push({
    code: "COMPAT_EVALUATED",
    message: `structural compatibility evaluated for ${contract.contractId}`,
  });

  // Public Plugin Contract surface integrity
  const surfaceOk =
    contract.__exposesRegistryInternals === false &&
    contract.__exposesStore === false &&
    contract.__mutable === false &&
    contract.__activatesPlugins === false &&
    contract.__executesPlugins === false;

  findings.push({
    __kind: "CompatibilityFinding",
    __advisory: true,
    dimension: "PublicPluginContract",
    status: surfaceOk ? "Compatible" : "Incompatible",
    subject: contract.contractId,
    message: surfaceOk
      ? "certified public surface markers intact"
      : "public surface markers violate contract freeze",
  });

  if (!surfaceOk) {
    diagnostics.push({
      code: "INCOMPATIBLE_CONTRACT",
      message: "public contract surface markers invalid",
    });
  }

  // Contract category compatibility (P4 taxonomy)
  const categoryKnown = (
    PLUGINS_PUBLIC_CONTRACT_CATEGORIES as readonly string[]
  ).includes(contract.category);
  findings.push({
    __kind: "CompatibilityFinding",
    __advisory: true,
    dimension: "Contract",
    status: categoryKnown ? "Compatible" : "Incompatible",
    subject: contract.category,
    message: categoryKnown
      ? "contract category is within P4 taxonomy"
      : "unknown contract category",
  });

  // Version compatibility (structural — label present; no semver resolver)
  const versionPresent =
    typeof contract.versionLabel === "string" &&
    contract.versionLabel.trim().length > 0;
  findings.push({
    __kind: "CompatibilityFinding",
    __advisory: true,
    dimension: "Version",
    status: versionPresent ? "Compatible" : "Indeterminate",
    subject: contract.versionLabel,
    message: versionPresent
      ? "version label present (structural)"
      : "version label missing",
  });
  if (!versionPresent) {
    diagnostics.push({
      code: "VERSION_INDETERMINATE",
      message: "version compatibility indeterminate without label",
    });
  }

  // Platform compatibility — advisory metadata must remain non-activating
  const platformOk =
    contract.metadata.advisoryOnly === true &&
    contract.metadata.activatesPlugins === false &&
    contract.metadata.executesPlugins === false;
  findings.push({
    __kind: "CompatibilityFinding",
    __advisory: true,
    dimension: "Platform",
    status: platformOk ? "Compatible" : "Incompatible",
    message: platformOk
      ? "platform metadata remains advisory / non-executing"
      : "platform metadata implies activation or execution",
  });

  // Dependency compatibility — conceptual only (no resolver)
  findings.push({
    __kind: "CompatibilityFinding",
    __advisory: true,
    dimension: "DependencyConceptual",
    status: "Indeterminate",
    message:
      "dependency compatibility is conceptual only — no package manager or resolver in I7",
  });
  diagnostics.push({
    code: "DEPENDENCY_CONCEPTUAL_ONLY",
    message: "dependency dimension not resolved at runtime",
  });

  const overall = overallFromFindings(findings);

  return {
    ok: true,
    report: {
      __kind: "CompatibilityReport",
      __advisory: true,
      __executionImplied: false,
      __mutatesRegistry: false,
      __mutatesLifecycle: false,
      overall,
      findings,
      diagnostics,
      contractId: contract.contractId,
      evaluatedAtLabel: "structural",
    },
  };
}

/**
 * RELEASE-P2 — Readiness summary architecture (D-P2-18) — not definitive artifact.
 */

import type { ReleaseEvidenceId, ReleaseOriginatingDomain } from "../types";
import type { ReleaseExceptionRecord } from "../evidence";
import type { GateResultRecord } from "../gates";
import type { ReleaseWaiverRecord } from "../gates";
import type { ReleaseReadinessState, ReleaseGateId } from "./vocabulary";
import type { PropagatedBlocker } from "./blocking";

export type ReadinessSummaryView = {
  readonly kind: "ARCHITECTURE_SUMMARY";
  readonly definitiveArtifact: false;
  readonly readinessState: ReleaseReadinessState;
  readonly supportingEvidenceIds: readonly ReleaseEvidenceId[];
  readonly satisfiedGates: readonly ReleaseGateId[];
  readonly pendingGates: readonly ReleaseGateId[];
  readonly warnings: readonly ReleaseExceptionRecord[];
  readonly blockers: readonly PropagatedBlocker[];
  readonly limitations: readonly string[];
  readonly contributingDomains: readonly ReleaseOriginatingDomain[];
  readonly remainingRequirements: readonly string[];
  readonly waivers: readonly ReleaseWaiverRecord[];
};

export function createReadinessSummaryView(input: {
  readonly readinessState: ReleaseReadinessState;
  readonly supportingEvidenceIds: readonly ReleaseEvidenceId[];
  readonly gateResults: readonly GateResultRecord[];
  readonly warnings: readonly ReleaseExceptionRecord[];
  readonly blockers: readonly PropagatedBlocker[];
  readonly limitations: readonly string[];
  readonly contributingDomains: readonly ReleaseOriginatingDomain[];
  readonly remainingRequirements: readonly string[];
  readonly waivers?: readonly ReleaseWaiverRecord[];
}): ReadinessSummaryView {
  const satisfiedGates = input.gateResults
    .filter((g) => g.state === "PASS" || g.state === "WAIVED")
    .map((g) => g.gateId);
  const pendingGates = input.gateResults
    .filter(
      (g) => g.state === "NOT_EVALUATED" || g.state === "READY",
    )
    .map((g) => g.gateId);
  return {
    kind: "ARCHITECTURE_SUMMARY",
    definitiveArtifact: false,
    readinessState: input.readinessState,
    supportingEvidenceIds: input.supportingEvidenceIds,
    satisfiedGates,
    pendingGates,
    warnings: input.warnings,
    blockers: input.blockers,
    limitations: input.limitations,
    contributingDomains: input.contributingDomains,
    remainingRequirements: input.remainingRequirements,
    waivers: input.waivers ?? [],
  };
}

export function isDefinitiveReadinessSummary(
  view: ReadinessSummaryView,
): false {
  void view;
  return false;
}

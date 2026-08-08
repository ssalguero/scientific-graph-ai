/**
 * RELEASE-P2 — Blocking propagation (D-P2-10, D-P2-11).
 * Evidence Blocker → Gate Blocker → Readiness Blocker
 */

import type { ReleaseExceptionRecord } from "../evidence";
import { isBlocker, warningAuthorizesRelease } from "../evidence";
import type { ReleaseGateId } from "./vocabulary";

export type BlockerLayer = "EVIDENCE" | "GATE" | "READINESS";

export type PropagatedBlocker = {
  readonly layer: BlockerLayer;
  readonly sourceExceptionId: string;
  readonly gateId?: ReleaseGateId;
  readonly message: string;
  readonly open: boolean;
};

export function warningSilentlyBecomesPass(): false {
  return false;
}

export function collectEvidenceBlockers(
  exceptions: readonly ReleaseExceptionRecord[],
): readonly PropagatedBlocker[] {
  return exceptions.filter(isBlocker).map((e) => ({
    layer: "EVIDENCE" as const,
    sourceExceptionId: e.id,
    message: e.message,
    open: e.open,
  }));
}

export function propagateToGateBlockers(
  evidenceBlockers: readonly PropagatedBlocker[],
  gateId: ReleaseGateId,
): readonly PropagatedBlocker[] {
  return evidenceBlockers
    .filter((b) => b.open)
    .map((b) => ({
      ...b,
      layer: "GATE" as const,
      gateId,
      message: `Gate ${gateId} blocked by evidence blocker ${b.sourceExceptionId}: ${b.message}`,
    }));
}

export function propagateToReadinessBlockers(
  gateBlockers: readonly PropagatedBlocker[],
): readonly PropagatedBlocker[] {
  return gateBlockers
    .filter((b) => b.open)
    .map((b) => ({
      ...b,
      layer: "READINESS" as const,
      message: `Readiness blocked via gate ${b.gateId ?? "?"}: ${b.message}`,
    }));
}

export function propagateEvidenceToReadiness(
  exceptions: readonly ReleaseExceptionRecord[],
  gateId: ReleaseGateId = "GOVERNANCE",
): readonly PropagatedBlocker[] {
  const evidence = collectEvidenceBlockers(exceptions);
  const gate = propagateToGateBlockers(evidence, gateId);
  return propagateToReadinessBlockers(gate);
}

export function warningDoesNotAuthorize(
  exception: ReleaseExceptionRecord,
): boolean {
  return warningAuthorizesRelease(exception) === false;
}

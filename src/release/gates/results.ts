/**
 * RELEASE-P2 — Gate result contracts + evidence traceability (D-P2-09, D-P2-18).
 * No concrete thresholds; no opaque PASS without evidence links.
 */

import type { ReleaseEvidenceId, ReleaseEvidenceRecord } from "../types";
import type { ReleaseGateId, ReleaseGateState } from "../readiness/vocabulary";
import { GATE_ID_TO_P1_CATEGORY } from "../readiness/vocabulary";

export type GateEvidenceTrace = {
  readonly gateId: ReleaseGateId;
  readonly evidenceIds: readonly ReleaseEvidenceId[];
  readonly validationOutcomes: readonly string[];
  readonly provenancePaths: readonly string[];
  readonly limitations: readonly string[];
  readonly exceptionIds: readonly string[];
};

export type GateResultRecord = {
  readonly gateId: ReleaseGateId;
  readonly state: ReleaseGateState;
  readonly evidenceTrace: GateEvidenceTrace;
  readonly impliesGlobalReleaseCertification: false;
  readonly definitiveGateReport: false;
  readonly note: string;
};

export function createGateResult(input: {
  readonly gateId: ReleaseGateId;
  readonly state: ReleaseGateState;
  readonly acceptedEvidence: readonly ReleaseEvidenceRecord[];
  readonly exceptionIds?: readonly string[];
  readonly note?: string;
}): GateResultRecord {
  const category = GATE_ID_TO_P1_CATEGORY[input.gateId];
  const linked = input.acceptedEvidence.filter((e) =>
    e.gateCategories.includes(category),
  );
  return {
    gateId: input.gateId,
    state: input.state,
    evidenceTrace: {
      gateId: input.gateId,
      evidenceIds: linked.map((e) => e.id),
      validationOutcomes: linked.map(
        (e) => `${e.lifecycleState}:${e.validationOutcome}`,
      ),
      provenancePaths: linked.map((e) => e.provenance.authorityPath),
      limitations: linked.flatMap((e) => e.limitations),
      exceptionIds: input.exceptionIds ?? [],
    },
    impliesGlobalReleaseCertification: false,
    definitiveGateReport: false,
    note: input.note ?? "P2 architecture result — criteria deferred",
  };
}

export function gatePassImpliesGlobalCertification(): false {
  return false;
}

export function isOpaqueGateResult(result: GateResultRecord): boolean {
  if (result.state === "PASS" || result.state === "FAIL") {
    return result.evidenceTrace.evidenceIds.length === 0;
  }
  return false;
}

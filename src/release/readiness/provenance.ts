/**
 * RELEASE-P2 — Readiness decision provenance (structure only).
 */

import type { ReleaseEvidenceId } from "../types";
import type { ReleaseGateId, ReleaseReadinessState } from "./vocabulary";

export type ReadinessDecisionProvenanceDraft = {
  readonly evaluatedEvidenceIds: readonly ReleaseEvidenceId[];
  readonly evaluatedGateIds: readonly ReleaseGateId[];
  readonly blockerIds: readonly string[];
  readonly warningIds: readonly string[];
  readonly acceptedExceptionIds: readonly string[];
  readonly resultingReadinessState: ReleaseReadinessState;
  readonly productVersionIdentity: string;
  readonly evaluatedIdentity: string;
  readonly decision: "NOT_EXECUTED_IN_P2";
};

export function createReadinessDecisionProvenanceDraft(input: {
  readonly evaluatedEvidenceIds: readonly ReleaseEvidenceId[];
  readonly evaluatedGateIds: readonly ReleaseGateId[];
  readonly blockerIds: readonly string[];
  readonly warningIds: readonly string[];
  readonly acceptedExceptionIds: readonly string[];
  readonly resultingReadinessState: ReleaseReadinessState;
  readonly productVersionIdentity: string;
  readonly evaluatedIdentity: string;
}): ReadinessDecisionProvenanceDraft {
  return {
    ...input,
    decision: "NOT_EXECUTED_IN_P2",
  };
}

export function readinessDecisionRecordingImplemented(): false {
  return false;
}

export function releaseCandidatePromotionImplemented(): false {
  return false;
}

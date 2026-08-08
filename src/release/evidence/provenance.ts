/**
 * RELEASE-P1 — Release decision provenance contract (P1 §17).
 *
 * Structure only — recording / execution deferred.
 */

import type { ReleaseEvidenceId, ReleaseGateCategory } from "../types";

export type ReleaseDecisionProvenanceDraft = {
  readonly evaluatedIdentity: string;
  readonly consumedEvidenceIds: readonly ReleaseEvidenceId[];
  readonly gatesEvaluated: readonly ReleaseGateCategory[];
  readonly acceptedEvidenceIds: readonly ReleaseEvidenceId[];
  readonly rejectedEvidenceIds: readonly ReleaseEvidenceId[];
  readonly limitations: readonly string[];
  readonly authorityPath: string;
  readonly productVersionIdentity: string;
  readonly decision: "NOT_EXECUTED_IN_P1";
};

export function createDecisionProvenanceDraft(input: {
  readonly evaluatedIdentity: string;
  readonly consumedEvidenceIds: readonly ReleaseEvidenceId[];
  readonly gatesEvaluated: readonly ReleaseGateCategory[];
  readonly acceptedEvidenceIds: readonly ReleaseEvidenceId[];
  readonly rejectedEvidenceIds: readonly ReleaseEvidenceId[];
  readonly limitations: readonly string[];
  readonly authorityPath: string;
  readonly productVersionIdentity: string;
}): ReleaseDecisionProvenanceDraft {
  return {
    ...input,
    decision: "NOT_EXECUTED_IN_P1",
  };
}

export function decisionRecordingImplemented(): false {
  return false;
}

/**
 * RELEASE-P2 — Readiness inputs (D-P2-03: ACCEPTED evidence only).
 */

import type { ReleaseEvidenceRecord } from "../types";
import type { ReleaseExceptionRecord } from "../evidence";

export type ReadinessInputBundle = {
  readonly acceptedEvidence: readonly ReleaseEvidenceRecord[];
  readonly exceptions: readonly ReleaseExceptionRecord[];
  readonly productVersionIdentity: string;
  readonly evaluatedIdentity: string;
};

/**
 * Filter to ACCEPTED evidence only. CONSUMED may still be referenced historically
 * but readiness assessment inputs require ACCEPTED (D-P2-03).
 * DISCOVERED/REGISTERED/NORMALIZED/VALIDATED are rejected.
 */
export function selectAcceptedEvidenceForReadiness(
  records: readonly ReleaseEvidenceRecord[],
): readonly ReleaseEvidenceRecord[] {
  return records.filter((r) => r.lifecycleState === "ACCEPTED");
}

export function assertAcceptedOnly(
  records: readonly ReleaseEvidenceRecord[],
): { readonly ok: true } | { readonly ok: false; readonly rejectedIds: readonly string[] } {
  const rejected = records.filter((r) => r.lifecycleState !== "ACCEPTED");
  if (rejected.length > 0) {
    return {
      ok: false,
      rejectedIds: rejected.map((r) => String(r.id)),
    };
  }
  return { ok: true };
}

export function buildReadinessInputBundle(input: {
  readonly evidence: readonly ReleaseEvidenceRecord[];
  readonly exceptions: readonly ReleaseExceptionRecord[];
  readonly productVersionIdentity: string;
  readonly evaluatedIdentity: string;
}): ReadinessInputBundle {
  return {
    acceptedEvidence: selectAcceptedEvidenceForReadiness(input.evidence),
    exceptions: input.exceptions,
    productVersionIdentity: input.productVersionIdentity,
    evaluatedIdentity: input.evaluatedIdentity,
  };
}

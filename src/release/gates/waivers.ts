/**
 * RELEASE-P2 — Waiver / accepted-exception boundary (D-P2-12).
 * RELEASE governance authority only — no invented organizational roles.
 */

import type { ReleaseEvidenceId } from "../types";
import type { ReleaseGateId, ReleaseReadinessState } from "../readiness/vocabulary";

export type ReleaseWaiverRecord = {
  readonly id: string;
  readonly authorityPath: string;
  readonly supportingEvidenceIds: readonly ReleaseEvidenceId[];
  readonly scope: string;
  readonly gateId?: ReleaseGateId;
  readonly effectOnReadiness: ReleaseReadinessState | "NO_CHANGE";
  readonly auditable: true;
  readonly organizationalRoleInvented: false;
};

let waiverSeq = 0;

export function createReleaseWaiver(input: {
  readonly authorityPath: string;
  readonly supportingEvidenceIds: readonly ReleaseEvidenceId[];
  readonly scope: string;
  readonly gateId?: ReleaseGateId;
  readonly effectOnReadiness: ReleaseReadinessState | "NO_CHANGE";
  readonly id?: string;
}): ReleaseWaiverRecord {
  waiverSeq += 1;
  return {
    id: input.id ?? `rel-waiver-${waiverSeq}`,
    authorityPath: input.authorityPath,
    supportingEvidenceIds: input.supportingEvidenceIds,
    scope: input.scope,
    gateId: input.gateId,
    effectOnReadiness: input.effectOnReadiness,
    auditable: true,
    organizationalRoleInvented: false,
  };
}

export function waiverRequiresProvenance(w: ReleaseWaiverRecord): boolean {
  return w.authorityPath.length > 0 && w.supportingEvidenceIds.length > 0;
}

/**
 * RELEASE-P1 — Evidence record contract (conceptual model materialized).
 *
 * Not a persistence schema. Not a definitive Release Evidence Index artifact.
 */

import type {
  ReleaseEvidenceClass,
  ReleaseEvidenceLifecycleState,
  ReleaseEvidenceTrustClass,
  ReleaseEvidenceValidationOutcome,
  ReleaseExceptionSeverity,
  ReleaseGateCategory,
  ReleaseOriginatingDomain,
} from "./vocabulary";

export type ReleaseEvidenceId = string & {
  readonly __brand: "ReleaseEvidenceId";
};

export type ReleaseEvidenceProvenance = {
  readonly producedBy: string;
  readonly authorityPath: string;
  readonly recordedAt: string;
};

export type ReleaseEvidenceFreshness = {
  readonly versionLabel: string;
  readonly isCurrent: boolean;
  readonly evaluatedAgainstIdentity?: string;
};

export type ReleaseEvidenceBlocking = {
  readonly contributes: boolean;
  readonly severity?: ReleaseExceptionSeverity;
  readonly reason?: string;
};

export type ReleaseEvidenceSupersession = {
  readonly superseded: boolean;
  readonly replacedById?: ReleaseEvidenceId;
  readonly replacesId?: ReleaseEvidenceId;
};

/**
 * Canonical release evidence attributes (P1 §6).
 */
export type ReleaseEvidenceRecord = {
  readonly id: ReleaseEvidenceId;
  readonly source: string;
  readonly artifact: string;
  readonly evidenceClass: ReleaseEvidenceClass;
  readonly originatingDomain: ReleaseOriginatingDomain;
  /** Peer ownership — never transferred to RELEASE. */
  readonly owningDomain: ReleaseOriginatingDomain;
  readonly certificationRelationship: string;
  readonly lifecycleState: ReleaseEvidenceLifecycleState;
  readonly validationOutcome: ReleaseEvidenceValidationOutcome;
  readonly trustClass: ReleaseEvidenceTrustClass;
  readonly freshness: ReleaseEvidenceFreshness;
  readonly provenance: ReleaseEvidenceProvenance;
  readonly scope: string;
  readonly dependencyIds: readonly ReleaseEvidenceId[];
  readonly limitations: readonly string[];
  readonly blocking: ReleaseEvidenceBlocking;
  readonly supersession: ReleaseEvidenceSupersession;
  /** Gates that may consume this evidence (relationship only). */
  readonly gateCategories: readonly ReleaseGateCategory[];
  readonly capabilityRef?: string;
  readonly notes?: string;
};

export type ReleaseEvidenceInput = Omit<
  ReleaseEvidenceRecord,
  "lifecycleState" | "validationOutcome" | "trustClass" | "supersession"
> & {
  readonly lifecycleState?: ReleaseEvidenceLifecycleState;
  readonly validationOutcome?: ReleaseEvidenceValidationOutcome;
  readonly trustClass?: ReleaseEvidenceTrustClass;
  readonly supersession?: ReleaseEvidenceSupersession;
};

export function asReleaseEvidenceId(raw: string): ReleaseEvidenceId {
  return raw as ReleaseEvidenceId;
}

/**
 * RELEASE-P1 — Cross-domain evidence intake (P1 §10).
 *
 * Consumes P0.8 baseline facts as registered evidence posture — no peer imports.
 */

import {
  CROSS_DOMAIN_BASELINE_FACTS,
  type PeerBaselineFact,
} from "../baseline";
import {
  asReleaseEvidenceId,
  type ReleaseEvidenceRecord,
} from "../types";
import {
  createReleaseException,
  evidencePathGapException,
  type ReleaseExceptionRecord,
} from "./gaps";
import { normalizeEvidenceInput } from "./validate";

export type IntakeResult = {
  readonly evidence: readonly ReleaseEvidenceRecord[];
  readonly exceptions: readonly ReleaseExceptionRecord[];
};

function baselineToEvidence(fact: PeerBaselineFact): ReleaseEvidenceRecord {
  const isGap = fact.closedPending === "CLOSED_WITH_EVIDENCE_PATH_GAP";
  const isCollab =
    fact.closedPending === "PLANNING_CLOSED_I_SERIES_NOT_STARTED";
  const isPerfGlobal =
    fact.closedPending === "CLOSED_GLOBAL_RELEASE_NOT_EXECUTED";

  return normalizeEvidenceInput({
    id: asReleaseEvidenceId(`baseline:${fact.domain}`),
    source: "RELEASE-P0 Cross-Domain Baseline",
    artifact: fact.consumableEvidencePath,
    evidenceClass: "DOMAIN_CERTIFICATION",
    originatingDomain: fact.domain,
    owningDomain: fact.domain,
    certificationRelationship: fact.statusLabel,
    freshness: {
      versionLabel: "P0.8",
      isCurrent: true,
    },
    provenance: {
      producedBy: "RELEASE-P0",
      authorityPath:
        "RELEASE Planning Charter → RELEASE-P0 § P0.8 → RELEASE-P1 intake",
      recordedAt: "2026-08-08",
    },
    scope: `${fact.domain} certified baseline`,
    dependencyIds: [],
    limitations: fact.governanceNotes,
    blocking: {
      contributes: isGap || isCollab || isPerfGlobal,
      severity: isGap ? "WARNING" : isCollab ? "WARNING" : "WARNING",
      reason: fact.governanceNotes[0],
    },
    gateCategories: ["Governance", "Documentation", "Final Certification"],
    trustClass: isGap ? "SUPPORTING" : "AUTHORITATIVE",
    validationOutcome: isCollab ? "CONDITIONAL" : "NOT_EVALUATED",
    notes: fact.closedPending,
  });
}

/**
 * Register P0.8 baseline as discovered/registered intake set with visible gaps.
 */
export function intakeCrossDomainBaseline(): IntakeResult {
  const evidence = CROSS_DOMAIN_BASELINE_FACTS.map(baselineToEvidence).map(
    (e) => ({
      ...e,
      lifecycleState: "REGISTERED" as const,
    }),
  );

  const exceptions: ReleaseExceptionRecord[] = [];

  const engine = CROSS_DOMAIN_BASELINE_FACTS.find((f) => f.domain === "ENGINE");
  if (engine) {
    exceptions.push(
      evidencePathGapException(
        "ENGINE",
        "src/engine/certification/CERTIFICATION.md",
      ),
    );
  }

  const collab = CROSS_DOMAIN_BASELINE_FACTS.find((f) => f.domain === "COLLAB");
  if (collab) {
    exceptions.push(
      createReleaseException({
        severity: "WARNING",
        kind: "CONDITIONAL_EVIDENCE",
        message:
          "COLLAB I-series not started; no src/collab/; runtime evidence pending",
        relatedEvidenceIds: [asReleaseEvidenceId("baseline:COLLAB")],
        relatedDomain: "COLLAB",
        open: true,
      }),
    );
  }

  const perf = CROSS_DOMAIN_BASELINE_FACTS.find(
    (f) => f.domain === "PERFORMANCE",
  );
  if (perf) {
    exceptions.push(
      createReleaseException({
        severity: "WARNING",
        kind: "ACCEPTED_LIMITATION",
        message:
          "PERFORMANCE domain certified; global RELEASE has not been executed",
        relatedEvidenceIds: [asReleaseEvidenceId("baseline:PERFORMANCE")],
        relatedDomain: "PERFORMANCE",
        open: true,
      }),
    );
  }

  return { evidence, exceptions };
}

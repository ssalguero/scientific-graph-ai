/**
 * RELEASE-P2 — Gate catalog (D-P2-05). Categories only — no thresholds.
 */

import type { ReleaseGateId } from "../readiness/vocabulary";
import {
  CATEGORY_GATES,
  GATE_ID_TO_P1_CATEGORY,
  RELEASE_GATE_IDS,
} from "../readiness/vocabulary";

export type GateDescriptor = {
  readonly id: ReleaseGateId;
  readonly purpose: string;
  readonly evidenceRelationship: string;
  readonly dependencyRelationship: string;
  readonly ownershipBoundary: string;
  readonly futureEvaluationRole: string;
  readonly p1CategoryLabel: string;
};

const PURPOSE: Record<ReleaseGateId, string> = {
  FUNCTIONAL: "Correct behavior of the certified set",
  ARCHITECTURAL: "Architecture conformance",
  GOVERNANCE: "Rules and validators",
  INTEGRATION: "Domains correctly integrated",
  PERFORMANCE: "Performance criteria (consume PERFORMANCE evidence)",
  PERSISTENCE_DATA: "Integrity and compatibility",
  DOCUMENTATION: "Release documentation adequacy",
  REGRESSION: "Absence of critical regressions",
  SECURITY_SAFETY: "Applicable controls",
  FINAL_CERTIFICATION: "Final RELEASE certification decision gate (future)",
};

export function listGateDescriptors(): readonly GateDescriptor[] {
  return RELEASE_GATE_IDS.map((id) => ({
    id,
    purpose: PURPOSE[id],
    evidenceRelationship: "Consumes ACCEPTED evidence linked to this gate",
    dependencyRelationship:
      id === "FINAL_CERTIFICATION"
        ? "Depends on all preceding category gates"
        : "May depend on accepted evidence, domain certs, readiness conditions, other gates (acyclic)",
    ownershipBoundary:
      "RELEASE evaluates; peers own capabilities — RELEASE does not absorb peer ownership",
    futureEvaluationRole: "Later authorized evaluation with criteria (not in P2)",
    p1CategoryLabel: GATE_ID_TO_P1_CATEGORY[id],
  }));
}

export function getGateDescriptor(id: ReleaseGateId): GateDescriptor {
  return listGateDescriptors().find((g) => g.id === id)!;
}

export function concreteGateThresholdsDefined(): false {
  return false;
}

export function listCategoryGateIds(): readonly ReleaseGateId[] {
  return CATEGORY_GATES;
}

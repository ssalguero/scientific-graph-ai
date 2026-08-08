/**
 * RELEASE-P1 — Evidence → Gate relationships (P1 §15 / P0.6).
 *
 * Categories only — no concrete criteria; Final Certification not executed.
 */

import {
  RELEASE_GATE_CATEGORIES,
  type ReleaseEvidenceRecord,
  type ReleaseGateCategory,
} from "../types";

export function listReleaseGateCategories(): readonly ReleaseGateCategory[] {
  return RELEASE_GATE_CATEGORIES;
}

export function gatesForEvidence(
  record: ReleaseEvidenceRecord,
): readonly ReleaseGateCategory[] {
  return record.gateCategories;
}

export function evidenceForGate(
  records: readonly ReleaseEvidenceRecord[],
  gate: ReleaseGateCategory,
): readonly ReleaseEvidenceRecord[] {
  return records.filter((r) => r.gateCategories.includes(gate));
}

/** Indicative default class→gate map (not thresholds). */
export const INDICATIVE_CLASS_GATE_MAP: Readonly<
  Record<string, readonly ReleaseGateCategory[]>
> = {
  DOMAIN_CERTIFICATION: ["Governance", "Final Certification"],
  ARCHITECTURE_FREEZE: ["Architectural", "Governance"],
  IMPLEMENTATION_GATE: ["Functional", "Integration"],
  VALIDATION_GATE: ["Functional", "Regression"],
  TEST: ["Functional", "Regression"],
  GOVERNANCE_VALIDATOR: ["Governance"],
  COMPATIBILITY: ["Architectural", "Integration"],
  PERFORMANCE: ["Performance", "Regression"],
  PERSISTENCE_DATA: ["Persistence/Data"],
  DOCUMENTATION: ["Documentation"],
  KNOWN_LIMITATION: ["Governance", "Final Certification"],
  RELEASE_SPECIFIC_CHECK: ["Governance", "Final Certification"],
};

/**
 * Final Certification gate criteria and execution are deferred.
 * P1 only preserves the category and relationship slots.
 */
export function finalCertificationGateImplemented(): false {
  return false;
}

export function concreteGateCriteriaDefined(): false {
  return false;
}

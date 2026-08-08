/**
 * RELEASE-P1 — Evidence classification helpers (P1 §8).
 */

import type { ReleaseEvidenceClass, ReleaseEvidenceRecord } from "../types";

export const RELEASE_EVIDENCE_CLASSES: readonly ReleaseEvidenceClass[] = [
  "DOMAIN_CERTIFICATION",
  "ARCHITECTURE_FREEZE",
  "IMPLEMENTATION_GATE",
  "VALIDATION_GATE",
  "TEST",
  "GOVERNANCE_VALIDATOR",
  "COMPATIBILITY",
  "PERFORMANCE",
  "PERSISTENCE_DATA",
  "DOCUMENTATION",
  "KNOWN_LIMITATION",
  "RELEASE_SPECIFIC_CHECK",
] as const;

export function isKnownEvidenceClass(
  value: string,
): value is ReleaseEvidenceClass {
  return (RELEASE_EVIDENCE_CLASSES as readonly string[]).includes(value);
}

export function classifyEvidenceRecord(
  record: ReleaseEvidenceRecord,
): ReleaseEvidenceClass {
  return record.evidenceClass;
}

export function listEvidenceByClass(
  records: readonly ReleaseEvidenceRecord[],
  evidenceClass: ReleaseEvidenceClass,
): readonly ReleaseEvidenceRecord[] {
  return records.filter((r) => r.evidenceClass === evidenceClass);
}

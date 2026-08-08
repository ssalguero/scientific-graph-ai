/**
 * RELEASE-P1 — Evidence validation (RELEASE Validation segment).
 *
 * Validates evidence records for RELEASE consumption — not peer re-certification.
 */

import type {
  ReleaseEvidenceInput,
  ReleaseEvidenceRecord,
  ReleaseEvidenceValidationOutcome,
} from "../types";
import { isKnownEvidenceClass } from "./classification";
import { evaluateEvidenceTrust } from "./trust";

export type EvidenceValidationReport = {
  readonly outcome: ReleaseEvidenceValidationOutcome;
  readonly reasons: readonly string[];
  readonly record: ReleaseEvidenceRecord;
};

export function normalizeEvidenceInput(
  input: ReleaseEvidenceInput,
): ReleaseEvidenceRecord {
  return {
    ...input,
    lifecycleState: input.lifecycleState ?? "DISCOVERED",
    validationOutcome: input.validationOutcome ?? "NOT_EVALUATED",
    trustClass: input.trustClass ?? "SUPPORTING",
    supersession: input.supersession ?? {
      superseded: false,
    },
  };
}

/**
 * Structural RELEASE validation of an evidence record.
 * Does not invent PASS for missing trust class.
 */
export function validateEvidenceRecord(
  input: ReleaseEvidenceInput | ReleaseEvidenceRecord,
): EvidenceValidationReport {
  const record = normalizeEvidenceInput(input as ReleaseEvidenceInput);
  const reasons: string[] = [];

  if (!record.id || String(record.id).length === 0) {
    reasons.push("Evidence id required");
  }
  if (!isKnownEvidenceClass(record.evidenceClass)) {
    reasons.push("Unknown evidence class");
  }
  if (!record.source) reasons.push("Evidence source required");
  if (!record.artifact) reasons.push("Evidence artifact required");
  if (!record.owningDomain) reasons.push("Owning domain required");
  if (record.originatingDomain !== record.owningDomain) {
    // Allowed for derived/cross-cutting, but must be explicit in notes for peers.
    if (
      record.originatingDomain !== "RELEASE" &&
      record.originatingDomain !== "CROSS_CUTTING" &&
      record.trustClass !== "DERIVED"
    ) {
      reasons.push(
        "Originating domain should match owning domain unless DERIVED/CROSS_CUTTING/RELEASE",
      );
    }
  }
  if (!record.provenance.authorityPath) {
    reasons.push("Provenance authorityPath required");
  }
  if (record.trustClass === "MISSING") {
    reasons.push("Missing evidence cannot validate as PASS");
  }

  const trust = evaluateEvidenceTrust({
    trustClass: record.trustClass,
    validationOutcome:
      reasons.length === 0
        ? record.validationOutcome === "NOT_EVALUATED"
          ? "PASS"
          : record.validationOutcome
        : "FAIL",
    isCurrent: record.freshness.isCurrent,
  });

  if (record.trustClass === "MISSING") {
    const failed: ReleaseEvidenceRecord = {
      ...record,
      lifecycleState:
        record.lifecycleState === "DISCOVERED"
          ? "DISCOVERED"
          : record.lifecycleState,
      validationOutcome: "FAIL",
      trustClass: "MISSING",
    };
    return {
      outcome: "FAIL",
      reasons: [...reasons, trust.reason],
      record: failed,
    };
  }

  if (reasons.length > 0 || !trust.maySupportPass) {
    const failed: ReleaseEvidenceRecord = {
      ...record,
      validationOutcome: "FAIL",
      trustClass:
        record.trustClass === "STALE" || !record.freshness.isCurrent
          ? "STALE"
          : record.trustClass === "CONFLICTING"
            ? "CONFLICTING"
            : record.trustClass === "INVALID"
              ? "INVALID"
              : record.trustClass,
    };
    return {
      outcome: "FAIL",
      reasons:
        reasons.length > 0
          ? reasons
          : [trust.reason],
      record: failed,
    };
  }

  const outcome: ReleaseEvidenceValidationOutcome =
    record.validationOutcome === "CONDITIONAL" ? "CONDITIONAL" : "PASS";

  return {
    outcome,
    reasons: ["Structural validation passed"],
    record: {
      ...record,
      validationOutcome: outcome,
    },
  };
}

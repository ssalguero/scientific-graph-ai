/**
 * RELEASE-P1 — Evidence trust / authority model (P1 §9).
 *
 * Missing evidence must NEVER silently become PASS.
 */

import type {
  ReleaseEvidenceRecord,
  ReleaseEvidenceTrustClass,
  ReleaseEvidenceValidationOutcome,
} from "../types";

export type TrustEvaluationInput = {
  readonly trustClass: ReleaseEvidenceTrustClass;
  readonly validationOutcome: ReleaseEvidenceValidationOutcome;
  readonly isCurrent: boolean;
  readonly unresolvedConflict?: boolean;
};

export type TrustEvaluationResult = {
  readonly trustClass: ReleaseEvidenceTrustClass;
  readonly maySupportPass: boolean;
  readonly reason: string;
};

/**
 * Hard rule: missing evidence never becomes PASS.
 * Conflicting / invalid / stale (when currency required) remain visible and non-PASS.
 */
export function evaluateEvidenceTrust(
  input: TrustEvaluationInput,
): TrustEvaluationResult {
  if (input.trustClass === "MISSING") {
    return {
      trustClass: "MISSING",
      maySupportPass: false,
      reason: "Missing evidence must never silently become PASS",
    };
  }
  if (input.trustClass === "INVALID") {
    return {
      trustClass: "INVALID",
      maySupportPass: false,
      reason: "Invalid evidence must not be consumed as supporting PASS",
    };
  }
  if (input.trustClass === "CONFLICTING" || input.unresolvedConflict) {
    return {
      trustClass: "CONFLICTING",
      maySupportPass: false,
      reason: "Unresolved conflicting evidence cannot support PASS",
    };
  }
  if (input.trustClass === "STALE" || !input.isCurrent) {
    return {
      trustClass: "STALE",
      maySupportPass: false,
      reason: "Stale / non-current evidence is distinguishable and non-PASS for currency-required claims",
    };
  }
  if (input.validationOutcome === "FAIL") {
    return {
      trustClass: input.trustClass,
      maySupportPass: false,
      reason: "Failed validation cannot support PASS",
    };
  }
  if (input.validationOutcome === "NOT_EVALUATED") {
    return {
      trustClass: input.trustClass,
      maySupportPass: false,
      reason: "Unevaluated evidence cannot support PASS",
    };
  }
  if (input.trustClass === "DERIVED") {
    return {
      trustClass: "DERIVED",
      maySupportPass: input.validationOutcome === "PASS" || input.validationOutcome === "CONDITIONAL",
      reason: "Derived evidence is weaker than authoritative; never invents peer certification",
    };
  }
  return {
    trustClass: input.trustClass,
    maySupportPass:
      input.validationOutcome === "PASS" ||
      input.validationOutcome === "CONDITIONAL",
    reason: "Trust evaluation complete",
  };
}

export function missingEvidenceBecomesPass(): false {
  return false;
}

export function recordSupportsPass(record: ReleaseEvidenceRecord): boolean {
  return evaluateEvidenceTrust({
    trustClass: record.trustClass,
    validationOutcome: record.validationOutcome,
    isCurrent: record.freshness.isCurrent,
  }).maySupportPass;
}

/** Precedence: authoritative peer claim wins for domain-scoped claims. */
export function preferAuthoritativeForDomainClaim(
  a: ReleaseEvidenceTrustClass,
  b: ReleaseEvidenceTrustClass,
): ReleaseEvidenceTrustClass {
  if (a === "AUTHORITATIVE") return a;
  if (b === "AUTHORITATIVE") return b;
  return a;
}

/**
 * RELEASE-P1 — Gaps / exceptions (P1 §13). WARNING vs BLOCKER.
 *
 * No concrete release thresholds. WARNING never silently authorizes release.
 */

import { asReleaseEvidenceId, type ReleaseEvidenceId } from "../types";
import type { ReleaseExceptionSeverity } from "../types";

export type ReleaseExceptionRecord = {
  readonly id: string;
  readonly severity: ReleaseExceptionSeverity;
  readonly kind:
    | "MISSING_EVIDENCE"
    | "STALE_EVIDENCE"
    | "CONFLICTING_EVIDENCE"
    | "FAILED_VALIDATION"
    | "CONDITIONAL_EVIDENCE"
    | "ACCEPTED_LIMITATION"
    | "BLOCKED_RELEASE_CONDITION"
    | "EVIDENCE_PATH_GAP";
  readonly message: string;
  readonly relatedEvidenceIds: readonly ReleaseEvidenceId[];
  readonly relatedDomain?: string;
  readonly open: boolean;
};

export type ExceptionCreateInput = Omit<ReleaseExceptionRecord, "id"> & {
  readonly id?: string;
};

let exceptionSeq = 0;

export function createReleaseException(
  input: ExceptionCreateInput,
): ReleaseExceptionRecord {
  exceptionSeq += 1;
  return {
    id: input.id ?? `rel-ex-${exceptionSeq}`,
    severity: input.severity,
    kind: input.kind,
    message: input.message,
    relatedEvidenceIds: input.relatedEvidenceIds,
    relatedDomain: input.relatedDomain,
    open: input.open,
  };
}

export function isBlocker(exception: ReleaseExceptionRecord): boolean {
  return exception.severity === "BLOCKER" && exception.open;
}

export function isWarning(exception: ReleaseExceptionRecord): boolean {
  return exception.severity === "WARNING";
}

/** WARNING must not silently authorize release. */
export function warningAuthorizesRelease(
  _exception: ReleaseExceptionRecord,
): false {
  void _exception;
  return false;
}

export function listOpenBlockers(
  exceptions: readonly ReleaseExceptionRecord[],
): readonly ReleaseExceptionRecord[] {
  return exceptions.filter(isBlocker);
}

export function advancementBlockedByExceptions(
  exceptions: readonly ReleaseExceptionRecord[],
): boolean {
  return listOpenBlockers(exceptions).length > 0;
}

export function missingEvidenceException(
  domain: string,
  message: string,
  severity: ReleaseExceptionSeverity = "BLOCKER",
): ReleaseExceptionRecord {
  return createReleaseException({
    severity,
    kind: "MISSING_EVIDENCE",
    message,
    relatedEvidenceIds: [],
    relatedDomain: domain,
    open: true,
  });
}

export function evidencePathGapException(
  domain: string,
  path: string,
): ReleaseExceptionRecord {
  return createReleaseException({
    severity: "WARNING",
    kind: "EVIDENCE_PATH_GAP",
    message: `Evidence-path gap for ${domain}: ${path}`,
    relatedEvidenceIds: [asReleaseEvidenceId(`gap:${domain}`)],
    relatedDomain: domain,
    open: true,
  });
}

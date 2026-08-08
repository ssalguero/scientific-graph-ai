/**
 * RELEASE-P1 — Governance authority model (P1 §5).
 *
 * Describes what RELEASE can decide / request / reject / cannot change.
 * Does not implement promotion or shipping machinery.
 */

export type ReleaseGovernanceCapability =
  | "DECIDE_EVIDENCE_ACCEPTANCE"
  | "DECIDE_COMPLETENESS_JUDGMENT"
  | "DECIDE_PROMOTION_BLOCK_OR_APPROVE"
  | "DECIDE_LIMITATION_ACCEPTANCE"
  | "DECIDE_FINAL_RELEASE_FUTURE"
  | "REQUEST_ADDITIONAL_EVIDENCE"
  | "REQUEST_CLARIFICATION"
  | "REQUEST_BLOCKER_REMEDIATION"
  | "REQUEST_LIMITATION_DOCUMENTATION"
  | "REJECT_INVALID_EVIDENCE"
  | "REJECT_STALE_WHEN_CURRENCY_REQUIRED"
  | "REJECT_UNRESOLVED_CONFLICT"
  | "REJECT_MISSING_REQUIRED"
  | "REJECT_FAILED_VALIDATION"
  | "REJECT_ISOLATED_PASS_AS_GLOBAL_RELEASE"
  | "BLOCK_ON_OPEN_BLOCKERS";

export type ReleaseGovernanceProhibition =
  | "CHANGE_PEER_IMPLEMENTATION"
  | "CHANGE_PEER_CONTRACTS"
  | "CHANGE_PEER_CERTIFICATION"
  | "TRANSFER_PEER_OWNERSHIP"
  | "REOPEN_P0_CONSTITUTION"
  | "INVENT_PEER_EVIDENCE"
  | "SILENT_PASS_FOR_MISSING"
  | "CLAIM_PRODUCTION_RELEASE_IN_P1"
  | "EXECUTE_PROMOTION_MACHINERY_IN_P1"
  | "EXECUTE_DEPLOYMENT_IN_P1";

export const RELEASE_MAY_DECIDE: readonly ReleaseGovernanceCapability[] = [
  "DECIDE_EVIDENCE_ACCEPTANCE",
  "DECIDE_COMPLETENESS_JUDGMENT",
  "DECIDE_PROMOTION_BLOCK_OR_APPROVE",
  "DECIDE_LIMITATION_ACCEPTANCE",
  "DECIDE_FINAL_RELEASE_FUTURE",
] as const;

export const RELEASE_MAY_REQUEST: readonly ReleaseGovernanceCapability[] = [
  "REQUEST_ADDITIONAL_EVIDENCE",
  "REQUEST_CLARIFICATION",
  "REQUEST_BLOCKER_REMEDIATION",
  "REQUEST_LIMITATION_DOCUMENTATION",
] as const;

export const RELEASE_MAY_REJECT_OR_BLOCK: readonly ReleaseGovernanceCapability[] =
  [
    "REJECT_INVALID_EVIDENCE",
    "REJECT_STALE_WHEN_CURRENCY_REQUIRED",
    "REJECT_UNRESOLVED_CONFLICT",
    "REJECT_MISSING_REQUIRED",
    "REJECT_FAILED_VALIDATION",
    "REJECT_ISOLATED_PASS_AS_GLOBAL_RELEASE",
    "BLOCK_ON_OPEN_BLOCKERS",
  ] as const;

export const RELEASE_MUST_NOT: readonly ReleaseGovernanceProhibition[] = [
  "CHANGE_PEER_IMPLEMENTATION",
  "CHANGE_PEER_CONTRACTS",
  "CHANGE_PEER_CERTIFICATION",
  "TRANSFER_PEER_OWNERSHIP",
  "REOPEN_P0_CONSTITUTION",
  "INVENT_PEER_EVIDENCE",
  "SILENT_PASS_FOR_MISSING",
  "CLAIM_PRODUCTION_RELEASE_IN_P1",
  "EXECUTE_PROMOTION_MACHINERY_IN_P1",
  "EXECUTE_DEPLOYMENT_IN_P1",
] as const;

export function releaseMay(
  capability: ReleaseGovernanceCapability,
): boolean {
  return (
    (RELEASE_MAY_DECIDE as readonly string[]).includes(capability) ||
    (RELEASE_MAY_REQUEST as readonly string[]).includes(capability) ||
    (RELEASE_MAY_REJECT_OR_BLOCK as readonly string[]).includes(capability)
  );
}

export function releaseMustNot(
  prohibition: ReleaseGovernanceProhibition,
): true {
  void prohibition;
  return true;
}

/** Peer ownership never transfers via RELEASE requests. */
export function requestTransfersPeerOwnership(): false {
  return false;
}

/**
 * RELEASE-P1 — Traceability chain (P1 §12).
 *
 * P1 stops at evidence/governance boundary — no RC/Decision execution.
 */

import {
  RELEASE_TRACEABILITY_CHAIN,
  type ReleaseEvidenceRecord,
  type ReleaseTraceabilityNode,
} from "../types";

export type TraceabilityLink = {
  readonly from: ReleaseTraceabilityNode;
  readonly to: ReleaseTraceabilityNode;
};

export type EvidenceTraceView = {
  readonly domain: string;
  readonly capability?: string;
  readonly certification: string;
  readonly evidenceId: string;
  readonly validation: string;
  readonly gates: readonly string[];
  /** Present as chain nodes only — execution deferred. */
  readonly releaseCandidateSlot: "DEFERRED";
  readonly releaseDecisionSlot: "DEFERRED";
};

export function listTraceabilityChain(): readonly ReleaseTraceabilityNode[] {
  return RELEASE_TRACEABILITY_CHAIN;
}

export function buildEvidenceTraceView(
  record: ReleaseEvidenceRecord,
): EvidenceTraceView {
  return {
    domain: record.owningDomain,
    capability: record.capabilityRef,
    certification: record.certificationRelationship,
    evidenceId: String(record.id),
    validation: `${record.lifecycleState}:${record.validationOutcome}`,
    gates: record.gateCategories,
    releaseCandidateSlot: "DEFERRED",
    releaseDecisionSlot: "DEFERRED",
  };
}

export function adjacentTraceLinks(): readonly TraceabilityLink[] {
  const chain = RELEASE_TRACEABILITY_CHAIN;
  const links: TraceabilityLink[] = [];
  for (let i = 0; i < chain.length - 1; i += 1) {
    links.push({ from: chain[i], to: chain[i + 1] });
  }
  return links;
}

/** P1 does not execute RC or Release Decision machinery. */
export function releaseCandidateExecutionEnabled(): false {
  return false;
}

export function releaseDecisionExecutionEnabled(): false {
  return false;
}

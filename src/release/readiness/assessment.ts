/**
 * RELEASE-P2 — Readiness assessment contracts (D-P2-01, D-P2-02, D-P2-16).
 * No concrete thresholds — undetermined → PENDING.
 */

import type { ReleaseEvidenceRecord } from "../types";
import type { ReleaseExceptionRecord } from "../evidence";
import { listOpenBlockers, isWarning } from "../evidence";
import { recordSupportsPass } from "../evidence";
import type {
  ReadinessAssessmentAspect,
  ReleaseReadinessState,
} from "./vocabulary";
import {
  propagateEvidenceToReadiness,
  type PropagatedBlocker,
} from "./blocking";
import { assertAcceptedOnly } from "./inputs";

export type AspectObservation = {
  readonly aspect: ReadinessAssessmentAspect;
  readonly present: boolean;
  readonly detail: string;
};

export type ReadinessAssessmentResult = {
  readonly state: ReleaseReadinessState;
  readonly aspects: readonly AspectObservation[];
  readonly readinessBlockers: readonly PropagatedBlocker[];
  readonly impliesReleaseCertification: false;
  readonly impliesReleaseCandidate: false;
  readonly impliesProductionRelease: false;
  readonly reason: string;
};

export function readinessImpliesReleaseCertification(): false {
  return false;
}

export function concreteReadinessThresholdsDefined(): false {
  return false;
}

/**
 * Conceptual assessment without thresholds.
 * Open blockers → BLOCKED.
 * Non-accepted evidence in input → PENDING (cannot invent READY).
 * Otherwise without threshold policy → PENDING (D-P2-16).
 */
export function assessReleaseReadiness(input: {
  readonly acceptedEvidence: readonly ReleaseEvidenceRecord[];
  readonly exceptions: readonly ReleaseExceptionRecord[];
}): ReadinessAssessmentResult {
  const acceptedCheck = assertAcceptedOnly(input.acceptedEvidence);
  const blockers = propagateEvidenceToReadiness(input.exceptions);
  const openBlockers = blockers.filter((b) => b.open);
  const warnings = input.exceptions.filter(isWarning);

  const aspects: AspectObservation[] = [
    {
      aspect: "complete",
      present: input.acceptedEvidence.length > 0,
      detail: "Structural presence of accepted evidence (not a threshold)",
    },
    {
      aspect: "incomplete",
      present: input.acceptedEvidence.length === 0,
      detail: "No accepted evidence in bundle",
    },
    {
      aspect: "valid",
      present: input.acceptedEvidence.some((e) => recordSupportsPass(e)),
      detail: "At least one accepted record maySupportPass",
    },
    {
      aspect: "stale",
      present: input.acceptedEvidence.some(
        (e) => e.trustClass === "STALE" || !e.freshness.isCurrent,
      ),
      detail: "Stale/non-current accepted evidence present",
    },
    {
      aspect: "conflicting",
      present: input.acceptedEvidence.some((e) => e.trustClass === "CONFLICTING"),
      detail: "Conflicting trust class present",
    },
    {
      aspect: "blocker",
      present: openBlockers.length > 0 || listOpenBlockers(input.exceptions).length > 0,
      detail: "Open blockers present",
    },
    {
      aspect: "limitation",
      present: input.acceptedEvidence.some((e) => e.limitations.length > 0),
      detail: "Limitations attached to accepted evidence",
    },
    {
      aspect: "warning",
      present: warnings.length > 0,
      detail: "WARNING exceptions present (≠ PASS)",
    },
  ];

  if (!acceptedCheck.ok) {
    return {
      state: "PENDING",
      aspects,
      readinessBlockers: openBlockers,
      impliesReleaseCertification: false,
      impliesReleaseCandidate: false,
      impliesProductionRelease: false,
      reason: "Non-ACCEPTED evidence present in readiness input — cannot invent READY",
    };
  }

  if (openBlockers.length > 0) {
    return {
      state: "BLOCKED",
      aspects,
      readinessBlockers: openBlockers,
      impliesReleaseCertification: false,
      impliesReleaseCandidate: false,
      impliesProductionRelease: false,
      reason: "Open readiness blockers present",
    };
  }

  // No concrete thresholds (D-P2-16): do not invent READY/NOT_READY from policy.
  return {
    state: "PENDING",
    aspects,
    readinessBlockers: openBlockers,
    impliesReleaseCertification: false,
    impliesReleaseCandidate: false,
    impliesProductionRelease: false,
    reason:
      "Assessment aspects recorded; concrete readiness thresholds deferred — PENDING",
  };
}

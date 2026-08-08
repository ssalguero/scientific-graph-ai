/**
 * RELEASE-P1 — Completeness dimensions (P1 §11). No thresholds.
 */

import type {
  ReleaseCompletenessDimension,
  ReleaseEvidenceRecord,
} from "../types";
import { recordSupportsPass } from "./trust";

export const RELEASE_COMPLETENESS_DIMENSIONS: readonly ReleaseCompletenessDimension[] =
  [
    "EXISTS",
    "VALID",
    "CURRENT",
    "COVERS_SCOPE",
    "TRACEABLE",
    "SUFFICIENT_FOR_CERTIFICATION",
  ] as const;

export type CompletenessProbe = {
  readonly dimension: ReleaseCompletenessDimension;
  readonly satisfied: boolean;
  readonly detail: string;
};

/**
 * Probe completeness dimensions for a single record.
 * SUFFICIENT_FOR_CERTIFICATION is never inferred from existence alone —
 * P1 defers thresholds; this probe only reports structural readiness signals.
 */
export function probeEvidenceCompleteness(
  record: ReleaseEvidenceRecord | null,
  opts?: { readonly requiredScope?: string },
): readonly CompletenessProbe[] {
  if (record === null) {
    return RELEASE_COMPLETENESS_DIMENSIONS.map((dimension) => ({
      dimension,
      satisfied: false,
      detail:
        dimension === "EXISTS"
          ? "Evidence does not exist"
          : "Cannot satisfy dimension without existing evidence",
    }));
  }

  const exists = true;
  const valid =
    record.trustClass !== "INVALID" &&
    record.trustClass !== "MISSING" &&
    record.lifecycleState !== "INVALIDATED";
  const current = record.freshness.isCurrent && record.trustClass !== "STALE";
  const coversScope =
    opts?.requiredScope === undefined ||
    record.scope === opts.requiredScope ||
    record.scope.includes(opts.requiredScope);
  const traceable =
    record.provenance.authorityPath.length > 0 &&
    record.originatingDomain.length > 0;
  // Thresholds deferred — structural signal only: accepted + supports pass ≠ global sufficiency.
  const sufficientSignal =
    record.lifecycleState === "ACCEPTED" ||
    record.lifecycleState === "CONSUMED"
      ? recordSupportsPass(record)
      : false;

  return [
    { dimension: "EXISTS", satisfied: exists, detail: "Artifact present" },
    {
      dimension: "VALID",
      satisfied: valid,
      detail: valid ? "Not invalid/missing" : "Invalid or missing trust",
    },
    {
      dimension: "CURRENT",
      satisfied: current,
      detail: current ? "Marked current" : "Stale or non-current",
    },
    {
      dimension: "COVERS_SCOPE",
      satisfied: coversScope,
      detail: coversScope ? "Scope matches" : "Scope mismatch",
    },
    {
      dimension: "TRACEABLE",
      satisfied: traceable,
      detail: traceable ? "Provenance present" : "Provenance incomplete",
    },
    {
      dimension: "SUFFICIENT_FOR_CERTIFICATION",
      satisfied: false,
      detail: sufficientSignal
        ? "Structural accept signal present — sufficiency thresholds deferred to later authorized phases"
        : "Not structurally accepted for certification sufficiency (thresholds deferred)",
    },
  ];
}

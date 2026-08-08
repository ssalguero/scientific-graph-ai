/**
 * RELEASE-P1 — Cross-Domain Baseline (P0 § P0.8) as consumable governance facts.
 *
 * Does not re-certify peers. Does not import peer packages.
 */

import type { ReleaseOriginatingDomain } from "../types";

export type PeerBaselineClosedPending =
  | "CLOSED_CERTIFIED_BASELINE"
  | "PLANNING_CLOSED_I_SERIES_NOT_STARTED"
  | "CLOSED_WITH_EVIDENCE_PATH_GAP"
  | "CLOSED_GLOBAL_RELEASE_NOT_EXECUTED"
  | "RELEASE_P1_ARCHITECTURE";

export type PeerBaselineFact = {
  readonly domain: Exclude<ReleaseOriginatingDomain, "RELEASE" | "CROSS_CUTTING">;
  readonly statusLabel: string;
  readonly closedPending: PeerBaselineClosedPending;
  readonly consumableEvidencePath: string;
  readonly governanceNotes: readonly string[];
};

export const CROSS_DOMAIN_BASELINE_FACTS: readonly PeerBaselineFact[] = [
  {
    domain: "ENGINE",
    statusLabel: "RELEASE CERTIFIED",
    closedPending: "CLOSED_WITH_EVIDENCE_PATH_GAP",
    consumableEvidencePath: "src/engine/",
    governanceNotes: [
      "Dedicated src/engine/certification/CERTIFICATION.md is missing — evidence-path gap.",
      "Do not reopen ENGINE.",
    ],
  },
  {
    domain: "DATA",
    statusLabel: "RELEASE CERTIFIED",
    closedPending: "CLOSED_CERTIFIED_BASELINE",
    consumableEvidencePath: "src/data/certification/",
    governanceNotes: [],
  },
  {
    domain: "AI",
    statusLabel: "RELEASE CERTIFIED",
    closedPending: "CLOSED_CERTIFIED_BASELINE",
    consumableEvidencePath: "src/ai/certification/",
    governanceNotes: [],
  },
  {
    domain: "COLLAB",
    statusLabel: "Planning RELEASE CERTIFIED",
    closedPending: "PLANNING_CLOSED_I_SERIES_NOT_STARTED",
    consumableEvidencePath: "docs/COLLAB/official-records/",
    governanceNotes: [
      "I-series not started.",
      "No src/collab/.",
      "Runtime/integration evidence pending I*.",
    ],
  },
  {
    domain: "PLUGINS",
    statusLabel: "PRODUCTION / RELEASE CERTIFIED",
    closedPending: "CLOSED_CERTIFIED_BASELINE",
    consumableEvidencePath: "src/plugins/certification/",
    governanceNotes: ["Execution deferred under PLUGINS."],
  },
  {
    domain: "PERFORMANCE",
    statusLabel: "RELEASE CERTIFIED / FROZEN",
    closedPending: "CLOSED_GLOBAL_RELEASE_NOT_EXECUTED",
    consumableEvidencePath: "docs/PERFORMANCE/",
    governanceNotes: [
      "I0–I10 complete / frozen.",
      "Global RELEASE has not been executed.",
    ],
  },
  {
    domain: "UX",
    statusLabel: "RELEASE CERTIFIED",
    closedPending: "CLOSED_CERTIFIED_BASELINE",
    consumableEvidencePath: "docs/UX/certification/",
    governanceNotes: [],
  },
] as const;

export function getPeerBaselineFact(
  domain: PeerBaselineFact["domain"],
): PeerBaselineFact | undefined {
  return CROSS_DOMAIN_BASELINE_FACTS.find((f) => f.domain === domain);
}

export function listEvidencePathGaps(): readonly PeerBaselineFact[] {
  return CROSS_DOMAIN_BASELINE_FACTS.filter(
    (f) => f.closedPending === "CLOSED_WITH_EVIDENCE_PATH_GAP",
  );
}

export function listConditionalPeerBaselines(): readonly PeerBaselineFact[] {
  return CROSS_DOMAIN_BASELINE_FACTS.filter(
    (f) =>
      f.closedPending === "PLANNING_CLOSED_I_SERIES_NOT_STARTED" ||
      f.closedPending === "CLOSED_GLOBAL_RELEASE_NOT_EXECUTED",
  );
}

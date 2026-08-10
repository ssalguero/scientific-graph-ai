/**
 * COLLAB-I8 — DATA public-seam adapter (P4 §4.2 · P9 adapters).
 *
 * Observes `@/data` public contract catalog without configuring DATA runtime
 * or mutating scientific objects / truth.
 */

import { DATA_CAPABILITY_GROUPS, DATA_PUBLIC_CONTRACT_CATALOG } from "@/data";

export const COLLAB_DATA_SEAM_ID = "collab-data" as const;

export type CollabDataSeamObservation = {
  readonly seamId: typeof COLLAB_DATA_SEAM_ID;
  readonly publicContractCount: number;
  readonly capabilityGroupCount: number;
  readonly identityReferenceOnly: true;
  readonly ownsScientificTruth: false;
};

/**
 * Read-only: observe DATA public catalog size.
 * Does not call configureData/getDataApi and does not mutate DATA.
 */
export function observeDataPublicSeam(): CollabDataSeamObservation {
  return {
    seamId: COLLAB_DATA_SEAM_ID,
    publicContractCount: DATA_PUBLIC_CONTRACT_CATALOG.length,
    capabilityGroupCount: DATA_CAPABILITY_GROUPS.length,
    identityReferenceOnly: true,
    ownsScientificTruth: false,
  };
}

/**
 * PERFORMANCE-I2 — DATA public-seam read-only adapter.
 *
 * Observes `@/data` catalog / capability groups without calling getDataApi /
 * configureData (those may configure runtime) or inventing new methods.
 */

import { DATA_CAPABILITY_GROUPS, DATA_PUBLIC_CONTRACT_CATALOG } from "@/data";
import type { MeasurementObservationInput } from "../measurement/types";
import type { AdapterObservationBatch } from "./types";

/**
 * Read-only: observe public contract catalog size and capability-group count.
 * Does not call configureData/getDataApi and does not mutate DATA.
 */
export function observeDataPublicSurface(
  collectedAtMs: number,
): AdapterObservationBatch {
  const observations: MeasurementObservationInput[] = [
    {
      observationId: "data.surface.catalog.size",
      sourceLabel: "data",
      signalName: "public.catalog.size",
      numericValue: DATA_PUBLIC_CONTRACT_CATALOG.length,
      collectedAtMs,
    },
    {
      observationId: "data.surface.capability.groups",
      sourceLabel: "data",
      signalName: "public.capability.groups",
      numericValue: DATA_CAPABILITY_GROUPS.length,
      collectedAtMs: collectedAtMs + 1,
    },
  ];

  return {
    seamId: "data",
    collectedAtMs,
    observations,
  };
}

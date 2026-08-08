/**
 * PERFORMANCE-I2 — UX public-seam read-only adapter.
 *
 * Observes `@/ui` Design System barrel only (tokens/theme). Does not import
 * theme/runtime diagnostics or invent UX→ENGINE call catalogs.
 */

import {
  DEFAULT_THEME,
  THEME_CONTRACT_VERSION,
  THEME_IDS,
  TOKEN_CONTRACT_VERSION,
} from "@/ui";
import type { MeasurementObservationInput } from "../measurement/types";
import type { AdapterObservationBatch } from "./types";

/**
 * Read-only: observe public theme/token contract versions and theme catalog size.
 * Does not render UI, mutate theme state, or call product flows.
 */
export function observeUxPublicSurface(
  collectedAtMs: number,
): AdapterObservationBatch {
  const observations: MeasurementObservationInput[] = [
    {
      observationId: "ux.surface.token.contract.version",
      sourceLabel: "ux",
      signalName: "public.token.contract.version.length",
      numericValue: TOKEN_CONTRACT_VERSION.length,
      collectedAtMs,
    },
    {
      observationId: "ux.surface.theme.contract.version",
      sourceLabel: "ux",
      signalName: "public.theme.contract.version.length",
      numericValue: THEME_CONTRACT_VERSION.length,
      collectedAtMs: collectedAtMs + 1,
    },
    {
      observationId: "ux.surface.theme.ids",
      sourceLabel: "ux",
      signalName: "public.theme.ids.count",
      numericValue: THEME_IDS.length,
      collectedAtMs: collectedAtMs + 2,
    },
    {
      observationId: "ux.surface.default.theme.present",
      sourceLabel: "ux",
      signalName: "public.default.theme.present",
      numericValue: DEFAULT_THEME ? 1 : 0,
      collectedAtMs: collectedAtMs + 3,
    },
  ];

  return {
    seamId: "ux",
    collectedAtMs,
    observations,
  };
}

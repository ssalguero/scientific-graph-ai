/**
 * CRP-6.3 — Capability accent bridge (app-owned).
 *
 * Evidence (product curve / scatter palettes already in repo):
 * - pink  #ec4899 — ScatterPreview GROUP_PALETTE
 * - violet #a855f7 — DEFAULT_CURVE_COLORS / experimentalWorksheet
 * - green  — existing --color-feedback-success
 * - yellow — existing --color-feedback-warning (amber / yellow product use)
 * - coral  #f97316 — experimentalWorksheet series palette (coral/orange)
 *
 * Does not rewrite Theme Contract. Dark product palette remains protected.
 */
import type { CSSProperties } from "react";

import type { SmartStartCardOptionId } from "./types";

export const CAPABILITY_ACCENT_BRIDGE = {
  "--color-capability-pink": "#ec4899",
  "--color-capability-violet": "#a855f7",
  "--color-capability-green": "var(--color-feedback-success)",
  "--color-capability-yellow": "var(--color-feedback-warning)",
  "--color-capability-coral": "#f97316",
  "--color-capability-muted": "var(--color-text-muted)",
} as const satisfies Record<string, string>;

export const capabilityAccentBridgeStyle =
  CAPABILITY_ACCENT_BRIDGE as unknown as CSSProperties;

export type CapabilityAccent =
  | "pink"
  | "violet"
  | "green"
  | "yellow"
  | "coral"
  | "muted";

export const CAPABILITY_ACCENT_BY_OPTION: Record<
  SmartStartCardOptionId,
  CapabilityAccent
> = {
  "analyze-dataset": "pink",
  "compare-datasets": "violet",
  "math-graph": "green",
  "analyze-workspace": "yellow",
  "evaluate-publication": "coral",
  "expert-mode": "muted",
};

export function capabilityAccentCssVar(accent: CapabilityAccent): string {
  return `var(--color-capability-${accent})`;
}

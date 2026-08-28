import type { ChartScaleSample } from "@/lib/graph/curves/types";

import type { AxisScaleMode } from "./types";

export const getAxisScaleModeLabel = (mode: AxisScaleMode): string => {
  if (mode === "logX") return "Semilog X";
  if (mode === "logY") return "Semilog Y";
  if (mode === "logLog") return "Log-Log";
  return "Lineal";
};

export const usesLogXScale = (mode: AxisScaleMode) =>
  mode === "logX" || mode === "logLog";

export const usesLogYScale = (mode: AxisScaleMode) =>
  mode === "logY" || mode === "logLog";

export const getAxisScaleViolations = (
  samples: ChartScaleSample[],
  mode: AxisScaleMode
) => {
  const checkLogX = usesLogXScale(mode);
  const checkLogY = usesLogYScale(mode);

  return {
    hasNonPositiveX: checkLogX && samples.some((sample) => sample.x <= 0),
    hasNonPositiveY: checkLogY && samples.some((sample) => sample.y <= 0),
  };
};

const isPositiveFinite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

export const sanitizeChartDataForLogScale = (
  data: Array<Record<string, unknown>>,
  usesLogX: boolean,
  usesLogY: boolean
): Array<Record<string, unknown>> => {
  if (!usesLogX && !usesLogY) return data;

  const sanitized: Array<Record<string, unknown>> = [];

  for (const row of data) {
    if (usesLogX && !isPositiveFinite(row.x)) continue;

    if (!usesLogY) {
      sanitized.push(row);
      continue;
    }

    const next: Record<string, unknown> = { ...row };
    let hasPlottableY = false;

    for (const key of Object.keys(next)) {
      if (key === "x") continue;
      const value = next[key];
      if (typeof value !== "number") continue;
      if (isPositiveFinite(value)) {
        hasPlottableY = true;
      } else {
        next[key] = null;
      }
    }

    if (hasPlottableY) {
      sanitized.push(next);
    }
  }

  return sanitized;
};

export const getAxisScaleWarnings = (
  mode: AxisScaleMode,
  violations: { hasNonPositiveX: boolean; hasNonPositiveY: boolean }
): string[] => {
  const warnings: string[] = [];

  if (violations.hasNonPositiveX && violations.hasNonPositiveY) {
    warnings.push(
      "Existen valores X o Y ≤ 0 incompatibles con escala logarítmica."
    );
    return warnings;
  }

  if (violations.hasNonPositiveX) {
    warnings.push(
      "Existen valores X ≤ 0 que no pueden mostrarse en escala logarítmica."
    );
  }

  if (violations.hasNonPositiveY) {
    warnings.push(
      "Existen valores Y ≤ 0 que no pueden mostrarse en escala logarítmica."
    );
  }

  return warnings;
};

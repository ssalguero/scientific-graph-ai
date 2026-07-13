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

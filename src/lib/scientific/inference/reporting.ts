import { deduplicateTextLines } from "@/lib/scientific/shared/text";
import {
  EFFECT_SIZE_ALPHA,
  EFFECT_SIZE_TARGET_POWER,
} from "./constants";
import type { EffectSizePowerAnalysis } from "./types";

export const getEffectSizePowerReportLines = (
  analysis: EffectSizePowerAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      "No hay pruebas inferenciales disponibles para calcular Effect Size & Power.",
    ];
  }

  const lines: string[] = [];
  analysis.entries.forEach((entry) => {
    lines.push(
      `${entry.source} (${entry.comparison}): ${entry.metric} = ${entry.valueDisplay}${entry.ciDisplay ? `, ${entry.ciDisplay}` : ""} — efecto ${entry.magnitudeLabel}.`
    );
  });

  if (
    analysis.prospectiveSampleSize !== null &&
    analysis.currentSampleSize !== null
  ) {
    lines.push(
      `Potencia prospectiva: se requieren n = ${analysis.prospectiveSampleSize} observaciones por grupo para detectar el efecto observado con una potencia del ${Math.round(EFFECT_SIZE_TARGET_POWER * 100)}% (α = ${EFFECT_SIZE_ALPHA}); n actual = ${analysis.currentSampleSize}.`
    );
  }

  if (analysis.observedPower !== null) {
    lines.push(
      `Potencia observada (aprox.): ${(analysis.observedPower * 100).toFixed(1)}%.`
    );
    lines.push(analysis.powerDisclaimer);
  }

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

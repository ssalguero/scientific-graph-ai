import {
  GENERIC_RANGE_WARNING,
  KNOWN_FUNCTION_PATTERNS,
  KNOWN_FUNCTION_WARNINGS,
  RANGE_DISCARD_THRESHOLD,
} from "./constants";

export const formatMathWarning = (discardedCount: number) =>
  discardedCount > 0
    ? `⚠ Se omitieron ${discardedCount} valores no válidos para algunas curvas.`
    : null;

const normalizeExpressionForWarning = (expression: string) =>
  expression.trim().toLowerCase().replace(/\s+/g, "");

export const getKnownFunctionWarnings = (expression: string): string[] => {
  const normalized = normalizeExpressionForWarning(expression);
  if (normalized in KNOWN_FUNCTION_WARNINGS) {
    return [KNOWN_FUNCTION_WARNINGS[normalized]];
  }

  return KNOWN_FUNCTION_PATTERNS.filter((pattern) =>
    normalized.includes(pattern)
  ).map((pattern) => KNOWN_FUNCTION_WARNINGS[pattern]);
};

export const getKnownFunctionWarning = (expression: string): string | null =>
  getKnownFunctionWarnings(expression)[0] ?? null;

export const formatRangeWarning = (
  maxPerCurveDiscardRate: number,
  activeExpressions: string[]
): string[] => {
  if (maxPerCurveDiscardRate < RANGE_DISCARD_THRESHOLD) return [];

  const seen = new Set<string>();
  const warnings: string[] = [];

  for (const expression of activeExpressions) {
    for (const message of getKnownFunctionWarnings(expression)) {
      if (!seen.has(message)) {
        seen.add(message);
        warnings.push(message);
      }
    }
  }

  return warnings.length > 0 ? warnings : [GENERIC_RANGE_WARNING];
};

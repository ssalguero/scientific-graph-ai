import type { ComparisonKpiRow } from "@/lib/scientific/comparison";

export const CORE_COMPARISON_KPI_KEYS = [
  "readiness",
  "overallHealth",
  "evidence",
  "publicationStatus",
  "effectDominant",
] as const;

export const METHODOLOGICAL_COMPARISON_KPI_KEYS = [
  "consistency",
  "quality",
  "reproducibility",
  "assumption",
] as const;

export const ENRICHED_COMPARISON_KPI_KEYS = [
  "normalityNonNormal",
  "prospectiveSampleSize",
] as const;

const toKeySet = (keys: readonly string[]) => new Set<string>(keys);

const CORE_SET = toKeySet(CORE_COMPARISON_KPI_KEYS);
const METHODOLOGICAL_SET = toKeySet(METHODOLOGICAL_COMPARISON_KPI_KEYS);
const ENRICHED_SET = toKeySet(ENRICHED_COMPARISON_KPI_KEYS);

export const partitionComparisonKpiRows = (rows: ComparisonKpiRow[]) => ({
  core: rows.filter((row) => CORE_SET.has(row.key)),
  methodological: rows.filter((row) => METHODOLOGICAL_SET.has(row.key)),
  enriched: rows.filter((row) => ENRICHED_SET.has(row.key)),
});

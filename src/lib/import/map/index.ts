import type {
  ColumnDescriptor,
  ColumnMapping,
  ColumnRoleSuggestion,
  TableRegion,
} from "../types";
import { cellToNumber, cellToText } from "../shared/cell";
import {
  normalizeLabel,
  scoreDependentLabel,
  scoreIndependentLabel,
} from "../shared/text";

const REPLICATE_HINTS = ["rep", "replica", "replicate", "replicado", "repeticion"];
const GROUP_HINTS = ["group", "grupo", "condition", "condicion", "tratamiento", "treatment"];

const scoreReplicateLabel = (label: string): number => {
  const normalized = normalizeLabel(label);
  return REPLICATE_HINTS.reduce(
    (score, hint) => (normalized.includes(hint) ? score + 1 : score),
    0
  );
};

const scoreGroupLabel = (label: string): number => {
  const normalized = normalizeLabel(label);
  return GROUP_HINTS.reduce(
    (score, hint) => (normalized.includes(hint) ? score + 1 : score),
    0
  );
};

type PairScore = {
  xColumnIndex: number;
  yColumnIndex: number;
  count: number;
  score: number;
};

export const suggestColumnRoles = (
  descriptors: ColumnDescriptor[]
): ColumnRoleSuggestion[] =>
  descriptors.map((descriptor) => {
    const independentScore = scoreIndependentLabel(descriptor.label);
    const dependentScore = scoreDependentLabel(descriptor.label);
    const replicateScore = scoreReplicateLabel(descriptor.label);
    const groupScore = scoreGroupLabel(descriptor.label);

    if (replicateScore > 0 && descriptor.numericRatio < 0.5) {
      return {
        index: descriptor.index,
        label: descriptor.label,
        role: "replicate" as const,
        confidence: Math.min(0.9, 0.5 + replicateScore * 0.15),
        reason: "Columna textual con señales de réplica experimental",
      };
    }

    if (groupScore > 0 && descriptor.numericRatio < 0.5) {
      return {
        index: descriptor.index,
        label: descriptor.label,
        role: "metadata" as const,
        confidence: Math.min(0.9, 0.5 + groupScore * 0.15),
        reason: "Columna categórica con señales de grupo o condición",
      };
    }

    if (descriptor.numericRatio >= 0.6 && independentScore >= dependentScore) {
      return {
        index: descriptor.index,
        label: descriptor.label,
        role: "independent",
        confidence: Math.min(0.95, 0.4 + descriptor.numericRatio * 0.4 + independentScore * 0.05),
        reason: "Columna numérica con señales de variable independiente",
      };
    }

    if (descriptor.numericRatio >= 0.6 && dependentScore > 0) {
      return {
        index: descriptor.index,
        label: descriptor.label,
        role: "dependent",
        confidence: Math.min(0.95, 0.4 + descriptor.numericRatio * 0.4 + dependentScore * 0.05),
        reason: "Columna numérica con señales de variable dependiente",
      };
    }

    if (descriptor.numericRatio < 0.3) {
      return {
        index: descriptor.index,
        label: descriptor.label,
        role: "label",
        confidence: 0.7,
        reason: "Columna predominantemente textual",
      };
    }

    return {
      index: descriptor.index,
      label: descriptor.label,
      role: "unknown",
      confidence: 0.35,
      reason: "Columna mixta o ambigua",
    };
  });

const scorePair = (
  matrix: unknown[][],
  region: TableRegion,
  xColumnIndex: number,
  yColumnIndex: number,
  xLabel: string,
  yLabel: string
): PairScore & {
  labelScore: number;
  cappedCount: number;
  independentScore: number;
  dependentScore: number;
  bothLabeled: boolean;
} => {
  let count = 0;

  for (
    let rowIndex = region.headerRowIndex + 1;
    rowIndex <= region.endRow;
    rowIndex += 1
  ) {
    const row = matrix[rowIndex];
    if (!Array.isArray(row)) continue;
    const x = cellToNumber(row[xColumnIndex]);
    const y = cellToNumber(row[yColumnIndex]);
    if (x !== null && y !== null) count += 1;
  }

  const independentScore = scoreIndependentLabel(xLabel);
  const dependentScore = scoreDependentLabel(yLabel);
  const cappedCount = Math.min(count, 12);
  const bothLabeled = independentScore > 0 && dependentScore > 0;
  const labelScore = independentScore + dependentScore;

  const score =
    cappedCount * 2 +
    independentScore * 30 +
    dependentScore * 30 +
    (bothLabeled ? 40 : 0) +
    (normalizeLabel(xLabel).includes("mmol") ? 8 : 0) +
    (normalizeLabel(yLabel).includes("mmol") ? 10 : 0);

  return {
    xColumnIndex,
    yColumnIndex,
    count,
    score,
    labelScore,
    cappedCount,
    independentScore,
    dependentScore,
    bothLabeled,
  };
};

export const suggestAxisMapping = (
  matrix: unknown[][],
  region: TableRegion,
  descriptors: ColumnDescriptor[]
): ColumnMapping | null => {
  const candidates: ReturnType<typeof scorePair>[] = [];

  for (let i = 0; i < descriptors.length; i += 1) {
    for (let j = 0; j < descriptors.length; j += 1) {
      if (i === j) continue;
      const xDescriptor = descriptors[i];
      const yDescriptor = descriptors[j];
      if (xDescriptor.numericRatio < 0.15 || yDescriptor.numericRatio < 0.15) {
        continue;
      }
      candidates.push(
        scorePair(
          matrix,
          region,
          xDescriptor.index,
          yDescriptor.index,
          xDescriptor.label,
          yDescriptor.label
        )
      );
    }
  }

  const labeledCandidates = candidates.filter((item) => item.bothLabeled);
  const pool = labeledCandidates.length > 0 ? labeledCandidates : candidates;

  pool.sort((a, b) => b.score - a.score || b.count - a.count);
  const best = pool[0];
  if (!best || best.count < 2) return null;

  const xDescriptor = descriptors.find((item) => item.index === best.xColumnIndex);
  const yDescriptor = descriptors.find((item) => item.index === best.yColumnIndex);
  if (!xDescriptor || !yDescriptor) return null;

  const labelDescriptor = descriptors.find((item) => item.numericRatio < 0.2);

  const replicateDescriptor = descriptors
    .filter((item) => scoreReplicateLabel(item.label) > 0 && item.numericRatio < 0.5)
    .sort((a, b) => scoreReplicateLabel(b.label) - scoreReplicateLabel(a.label))[0];

  const groupDescriptor = descriptors
    .filter(
      (item) =>
        scoreGroupLabel(item.label) > 0 &&
        item.numericRatio < 0.5 &&
        item.index !== replicateDescriptor?.index
    )
    .sort((a, b) => scoreGroupLabel(b.label) - scoreGroupLabel(a.label))[0];

  return {
    xColumnIndex: best.xColumnIndex,
    yColumnIndex: best.yColumnIndex,
    xLabel: xDescriptor.label,
    yLabel: yDescriptor.label,
    labelColumnIndex: labelDescriptor?.index,
    replicateColumnIndex: replicateDescriptor?.index,
    replicateLabel: replicateDescriptor?.label,
    groupColumnIndex: groupDescriptor?.index,
    groupLabel: groupDescriptor?.label,
    rowFilter: "skip-sparse",
  };
};

export type MultiSeriesLayout = {
  xColumnIndex: number;
  xLabel: string;
  yColumns: { index: number; label: string }[];
};

/** Detects side-by-side multi-Y layout (one X + ≥2 numeric Y columns). ÉPICA B.5 */
export const detectMultiSeriesLayout = (
  matrix: unknown[][],
  region: TableRegion,
  descriptors: ColumnDescriptor[]
): MultiSeriesLayout | null => {
  const axisMapping = suggestAxisMapping(matrix, region, descriptors);
  if (!axisMapping) return null;

  const xIndex = axisMapping.xColumnIndex;
  const numericDependents = descriptors.filter(
    (item) =>
      item.index !== xIndex &&
      item.numericRatio >= 0.5 &&
      (scoreDependentLabel(item.label) > 0 || item.numericRatio >= 0.7)
  );

  if (numericDependents.length < 2) return null;

  const yColumns = numericDependents
    .filter((item) => item.index !== axisMapping.replicateColumnIndex)
    .filter((item) => item.index !== axisMapping.groupColumnIndex)
    .map((item) => ({ index: item.index, label: item.label }));

  if (yColumns.length < 2) return null;

  const xDescriptor = descriptors.find((item) => item.index === xIndex);
  if (!xDescriptor) return null;

  return {
    xColumnIndex: xIndex,
    xLabel: xDescriptor.label,
    yColumns,
  };
};

export const suggestMultiSeriesMapping = (
  matrix: unknown[][],
  region: TableRegion,
  descriptors: ColumnDescriptor[]
): ColumnMapping | null => {
  const layout = detectMultiSeriesLayout(matrix, region, descriptors);
  if (!layout) return null;

  const base = suggestAxisMapping(matrix, region, descriptors);
  if (!base) return null;

  return {
    ...base,
    yColumnIndex: layout.yColumns[0]?.index ?? base.yColumnIndex,
    yLabel: layout.yColumns[0]?.label ?? base.yLabel,
    yColumnIndices: layout.yColumns.map((item) => item.index),
  };
};

export const applyColumnMapping = (
  matrix: unknown[][],
  region: TableRegion,
  mapping: ColumnMapping
): { x: number; y: number; sourceRowIndex: number; label?: string }[] => {
  const points: { x: number; y: number; sourceRowIndex: number; label?: string }[] =
    [];

  for (
    let rowIndex = region.headerRowIndex + 1;
    rowIndex <= region.endRow;
    rowIndex += 1
  ) {
    const row = matrix[rowIndex];
    if (!Array.isArray(row)) continue;

    const x = cellToNumber(row[mapping.xColumnIndex]);
    const y = cellToNumber(row[mapping.yColumnIndex]);
    if (x === null || y === null) continue;

    const label =
      mapping.labelColumnIndex !== undefined
        ? cellToText(row[mapping.labelColumnIndex])
        : cellToText(row[region.startCol]);

    points.push({
      x,
      y,
      sourceRowIndex: rowIndex,
      label: label || undefined,
    });
  }

  return points;
};

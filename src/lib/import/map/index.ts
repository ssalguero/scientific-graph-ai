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

  return {
    xColumnIndex: best.xColumnIndex,
    yColumnIndex: best.yColumnIndex,
    xLabel: xDescriptor.label,
    yLabel: yDescriptor.label,
    labelColumnIndex: labelDescriptor?.index,
    rowFilter: "skip-sparse",
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

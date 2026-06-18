import type {
  ColumnDescriptor,
  ImportPreview,
  ImportPreviewStats,
  ImportValidation,
  ImportIssue,
} from "../types";

const pushUniqueIssue = (
  issues: ImportIssue[],
  issue: ImportIssue
): ImportIssue[] => {
  if (issues.some((item) => item.code === issue.code)) return issues;
  return [...issues, issue];
};

export const applyValidationRuleQ01 = (
  preview: ImportPreview,
  errors: ImportIssue[]
): ImportIssue[] => {
  if (preview.points.length >= 2) return errors;
  return pushUniqueIssue(errors, {
    code: "Q-01",
    severity: "error",
    message:
      "Q-01: se requieren al menos 2 puntos importables para generar ExperimentalSeries",
  });
};

export const applyValidationRuleQ02 = (
  stats: ImportPreviewStats,
  warnings: ImportIssue[]
): ImportIssue[] => {
  if (stats.skippedRowCount === 0) return warnings;
  if (stats.coverageRatio >= 0.7) return warnings;

  return pushUniqueIssue(warnings, {
    code: "Q-02",
    severity: "warning",
    message: `Q-02: cobertura baja (${Math.round(stats.coverageRatio * 100)}%) — ${stats.skippedRowCount} filas omitidas`,
  });
};

export const applyValidationRuleQ03 = (
  stats: ImportPreviewStats,
  warnings: ImportIssue[]
): ImportIssue[] => {
  if (stats.skippedRowCount === 0) return warnings;

  const skippedRatio =
    stats.evaluatedRowCount === 0
      ? 0
      : stats.skippedRowCount / stats.evaluatedRowCount;

  if (skippedRatio <= 0.3) return warnings;

  return pushUniqueIssue(warnings, {
    code: "Q-03",
    severity: "warning",
    message: `Q-03: más del 30% de filas evaluadas fueron descartadas (${stats.skippedRowCount}/${stats.evaluatedRowCount})`,
  });
};

export const applyPartialNumericColumnWarnings = (
  descriptors: ColumnDescriptor[] | undefined,
  xColumnIndex: number,
  yColumnIndex: number,
  warnings: ImportIssue[]
): ImportIssue[] => {
  if (!descriptors) return warnings;

  const xDescriptor = descriptors.find((item) => item.index === xColumnIndex);
  const yDescriptor = descriptors.find((item) => item.index === yColumnIndex);

  let next = warnings;
  if (xDescriptor && xDescriptor.numericRatio > 0 && xDescriptor.numericRatio < 0.5) {
    next = pushUniqueIssue(next, {
      code: "PARTIAL_NUMERIC_X",
      severity: "warning",
      message: `Columna X parcialmente numérica (${Math.round(xDescriptor.numericRatio * 100)}%): ${xDescriptor.label}`,
    });
  }
  if (yDescriptor && yDescriptor.numericRatio > 0 && yDescriptor.numericRatio < 0.5) {
    next = pushUniqueIssue(next, {
      code: "PARTIAL_NUMERIC_Y",
      severity: "warning",
      message: `Columna Y parcialmente numérica (${Math.round(yDescriptor.numericRatio * 100)}%): ${yDescriptor.label}`,
    });
  }

  return next;
};

export const applySupplementalValidationRules = (
  preview: ImportPreview,
  descriptors: ColumnDescriptor[] | undefined,
  xColumnIndex: number,
  yColumnIndex: number
): ImportValidation => {
  let errors = applyValidationRuleQ01(preview, []);
  let warnings = [...preview.warnings];

  warnings = applyValidationRuleQ02(preview.stats, warnings);
  warnings = applyValidationRuleQ03(preview.stats, warnings);
  warnings = applyPartialNumericColumnWarnings(
    descriptors,
    xColumnIndex,
    yColumnIndex,
    warnings
  );

  if (preview.stats.importablePointCount < 5) {
    warnings = pushUniqueIssue(warnings, {
      code: "LOW_POINT_COUNT",
      severity: "warning",
      message: `Solo ${preview.stats.importablePointCount} puntos importables detectados`,
    });
  }

  const xs = preview.points.map((point) => point.x);
  const ys = preview.points.map((point) => point.y);
  if (xs.length >= 2 && new Set(xs).size === 1) {
    warnings = pushUniqueIssue(warnings, {
      code: "CONSTANT_X",
      severity: "warning",
      message: "La columna X tiene un valor constante",
    });
  }
  if (ys.length >= 2 && new Set(ys).size === 1) {
    warnings = pushUniqueIssue(warnings, {
      code: "CONSTANT_Y",
      severity: "warning",
      message: "La columna Y tiene un valor constante",
    });
  }

  if (preview.stats.duplicatePointCount > 0) {
    warnings = pushUniqueIssue(warnings, {
      code: "DUPLICATE_POINTS",
      severity: "info",
      message: `${preview.stats.duplicatePointCount} pares (X,Y) duplicados detectados`,
    });
  }

  errors = errors.filter(
    (issue) => !errors.some((other) => other.code === issue.code && other !== issue)
  );

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
};

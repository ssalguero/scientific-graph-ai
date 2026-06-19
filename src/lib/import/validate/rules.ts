import type {
  ColumnDescriptor,
  ImportPreview,
  ImportPreviewStats,
  ImportValidation,
  ImportIssue,
  ImportValidationRule,
  ValidationSeverity,
} from "../types";

export const IMPORT_VALIDATION_RULE_CATALOG: ImportValidationRule[] = [
  {
    id: "Q-01",
    code: "Q-01",
    severity: "error",
    category: "minimum-quality",
    target: "dataset",
    description: "Requiere al menos 2 puntos importables.",
  },
  {
    id: "Q-02",
    code: "Q-02",
    severity: "warning",
    category: "coverage",
    target: "dataset",
    description: "Advierte cuando la cobertura importable cae por debajo de 70%.",
  },
  {
    id: "Q-03",
    code: "Q-03",
    severity: "warning",
    category: "row-audit",
    target: "row",
    description: "Advierte cuando más del 30% de filas evaluadas se descarta.",
  },
  {
    id: "PARTIAL_NUMERIC_X",
    code: "PARTIAL_NUMERIC_X",
    severity: "warning",
    category: "column-quality",
    target: "x-column",
    description: "Advierte cuando la columna X seleccionada es parcialmente numérica.",
  },
  {
    id: "PARTIAL_NUMERIC_Y",
    code: "PARTIAL_NUMERIC_Y",
    severity: "warning",
    category: "column-quality",
    target: "y-column",
    description: "Advierte cuando la columna Y seleccionada es parcialmente numérica.",
  },
  {
    id: "LOW_POINT_COUNT",
    code: "LOW_POINT_COUNT",
    severity: "warning",
    category: "minimum-quality",
    target: "dataset",
    description: "Advierte cuando hay menos de 5 puntos importables.",
  },
  {
    id: "CONSTANT_X",
    code: "CONSTANT_X",
    severity: "warning",
    category: "distribution",
    target: "x-column",
    description: "Advierte cuando X no varía.",
  },
  {
    id: "CONSTANT_Y",
    code: "CONSTANT_Y",
    severity: "warning",
    category: "distribution",
    target: "y-column",
    description: "Advierte cuando Y no varía.",
  },
  {
    id: "DUPLICATE_POINTS",
    code: "DUPLICATE_POINTS",
    severity: "info",
    category: "duplicates",
    target: "dataset",
    description: "Informa pares X/Y duplicados.",
  },
  {
    id: "ROW_DISCARD_REASONS",
    code: "ROW_DISCARD_REASONS",
    severity: "info",
    category: "row-audit",
    target: "row",
    description: "Resume razones estructuradas de filas descartadas.",
  },
];

export const getImportValidationRuleCatalog = (): ImportValidationRule[] => [
  ...IMPORT_VALIDATION_RULE_CATALOG,
];

const getRule = (code: string): ImportValidationRule | undefined =>
  IMPORT_VALIDATION_RULE_CATALOG.find((rule) => rule.code === code);

const buildIssue = (
  code: string,
  message: string,
  context?: ImportIssue["context"]
): ImportIssue => {
  const rule = getRule(code);
  return {
    code,
    severity: rule?.severity ?? "warning",
    message,
    category: rule?.category,
    target: rule?.target,
    ruleId: rule?.id ?? code,
    context,
  };
};

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
  return pushUniqueIssue(
    errors,
    buildIssue(
      "Q-01",
      "Q-01: se requieren al menos 2 puntos importables para generar ExperimentalSeries",
      { importablePointCount: preview.points.length }
    )
  );
};

export const applyValidationRuleQ02 = (
  stats: ImportPreviewStats,
  warnings: ImportIssue[]
): ImportIssue[] => {
  if (stats.skippedRowCount === 0) return warnings;
  if (stats.coverageRatio >= 0.7) return warnings;

  return pushUniqueIssue(
    warnings,
    buildIssue(
      "Q-02",
      `Q-02: cobertura baja (${Math.round(stats.coverageRatio * 100)}%) — ${stats.skippedRowCount} filas omitidas`,
      {
        coverageRatio: stats.coverageRatio,
        skippedRowCount: stats.skippedRowCount,
      }
    )
  );
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

  return pushUniqueIssue(
    warnings,
    buildIssue(
      "Q-03",
      `Q-03: más del 30% de filas evaluadas fueron descartadas (${stats.skippedRowCount}/${stats.evaluatedRowCount})`,
      {
        skippedRatio,
        skippedRowCount: stats.skippedRowCount,
        evaluatedRowCount: stats.evaluatedRowCount,
      }
    )
  );
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
    next = pushUniqueIssue(
      next,
      buildIssue(
        "PARTIAL_NUMERIC_X",
        `Columna X parcialmente numérica (${Math.round(xDescriptor.numericRatio * 100)}%): ${xDescriptor.label}`,
        {
          columnIndex: xColumnIndex,
          numericRatio: xDescriptor.numericRatio,
        }
      )
    );
  }
  if (yDescriptor && yDescriptor.numericRatio > 0 && yDescriptor.numericRatio < 0.5) {
    next = pushUniqueIssue(
      next,
      buildIssue(
        "PARTIAL_NUMERIC_Y",
        `Columna Y parcialmente numérica (${Math.round(yDescriptor.numericRatio * 100)}%): ${yDescriptor.label}`,
        {
          columnIndex: yColumnIndex,
          numericRatio: yDescriptor.numericRatio,
        }
      )
    );
  }

  return next;
};

const applyRowAuditSummaryRule = (
  preview: ImportPreview,
  warnings: ImportIssue[]
): ImportIssue[] => {
  const reasonCounts = preview.audit?.reasonCounts ?? [];
  if (reasonCounts.length === 0) return warnings;

  const summary = reasonCounts
    .map((item) => `${item.label}: ${item.count}`)
    .join("; ");

  return pushUniqueIssue(
    warnings,
    buildIssue("ROW_DISCARD_REASONS", `Filas descartadas por razón: ${summary}`, {
      totalDiscardedRows: preview.audit?.totalDiscardedRows ?? 0,
      truncated: preview.audit?.truncated ?? false,
    })
  );
};

const splitIssuesBySeverity = (
  issues: ImportIssue[],
  severity: ValidationSeverity
): ImportIssue[] => issues.filter((issue) => issue.severity === severity);

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
  warnings = applyRowAuditSummaryRule(preview, warnings);

  if (preview.stats.importablePointCount < 5) {
    warnings = pushUniqueIssue(
      warnings,
      buildIssue(
        "LOW_POINT_COUNT",
        `Solo ${preview.stats.importablePointCount} puntos importables detectados`,
        { importablePointCount: preview.stats.importablePointCount }
      )
    );
  }

  const xs = preview.points.map((point) => point.x);
  const ys = preview.points.map((point) => point.y);
  if (xs.length >= 2 && new Set(xs).size === 1) {
    warnings = pushUniqueIssue(
      warnings,
      buildIssue("CONSTANT_X", "La columna X tiene un valor constante", {
        value: xs[0] ?? null,
      })
    );
  }
  if (ys.length >= 2 && new Set(ys).size === 1) {
    warnings = pushUniqueIssue(
      warnings,
      buildIssue("CONSTANT_Y", "La columna Y tiene un valor constante", {
        value: ys[0] ?? null,
      })
    );
  }

  if (preview.stats.duplicatePointCount > 0) {
    warnings = pushUniqueIssue(
      warnings,
      buildIssue(
        "DUPLICATE_POINTS",
        `${preview.stats.duplicatePointCount} pares (X,Y) duplicados detectados`,
        { duplicatePointCount: preview.stats.duplicatePointCount }
      )
    );
  }

  errors = errors.filter(
    (issue) => !errors.some((other) => other.code === issue.code && other !== issue)
  );
  const issues = [...errors, ...warnings];
  const infos = splitIssuesBySeverity(issues, "info");

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos,
    issues,
    issueSummary: {
      error: splitIssuesBySeverity(issues, "error").length,
      warning: splitIssuesBySeverity(issues, "warning").length,
      info: infos.length,
    },
  };
};

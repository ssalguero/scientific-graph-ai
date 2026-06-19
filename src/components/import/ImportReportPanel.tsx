"use client";

import type { ImportReport, ValidationSeverity } from "@/lib/import";
import { formatImportReportLines } from "@/lib/import";

type ImportReportPanelProps = {
  report: ImportReport;
};

const severityClass: Record<ValidationSeverity, string> = {
  error: "text-[var(--app-danger-text)]",
  warning: "text-[var(--app-warning-text)]",
  info: "text-[var(--app-text-muted)]",
};

const severityBadge: Record<ValidationSeverity, string> = {
  error: "bg-[var(--app-danger-bg)] text-[var(--app-danger-text)] border-[var(--app-danger-border)]",
  warning:
    "bg-[var(--app-surface-muted)] text-[var(--app-warning-text)] border-[var(--app-border)]",
  info: "bg-[var(--app-surface-muted)] text-[var(--app-text-muted)] border-[var(--app-border)]",
};

export function ImportReportPanel({ report }: ImportReportPanelProps) {
  const issues = [...report.errors, ...report.warnings];
  const issueSummary = report.issueSummary ?? {
    error: report.errorCount,
    warning: report.warningCount,
    info: issues.filter((issue) => issue.severity === "info").length,
  };

  return (
    <div className="mt-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--app-heading)]">
          Informe de importación
        </p>
        <span className="rounded-full border border-[var(--app-border)] px-2 py-0.5 text-xs text-[var(--app-text-muted)]">
          {report.importMode === "fast-path" ? "Directa" : "Asistente"} ·{" "}
          {report.version ?? "v1"}
        </span>
      </div>

      {report.executiveSummary && (
        <p className="text-sm text-[var(--app-text-muted)]">
          {report.executiveSummary}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <p className="text-[var(--app-text-muted)]">Puntos importados</p>
          <p className="font-semibold text-[var(--app-heading)]">
            {report.importedPointCount}
          </p>
        </div>
        <div>
          <p className="text-[var(--app-text-muted)]">Filas descartadas</p>
          <p className="font-semibold text-[var(--app-heading)]">
            {report.discardedPointCount}
          </p>
        </div>
        <div>
          <p className="text-[var(--app-text-muted)]">Cobertura</p>
          <p className="font-semibold text-[var(--app-heading)]">
            {Math.round(report.coverageRatio * 100)}%
          </p>
        </div>
        <div>
          <p className="text-[var(--app-text-muted)]">Advertencias</p>
          <p className="font-semibold text-[var(--app-heading)]">
            {issueSummary.warning}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 text-sm">
        <div>
          <p className="text-[var(--app-text-muted)]">Errores</p>
          <p className="font-semibold text-[var(--app-danger-text)]">
            {issueSummary.error}
          </p>
        </div>
        <div>
          <p className="text-[var(--app-text-muted)]">Informativos</p>
          <p className="font-semibold text-[var(--app-heading)]">
            {issueSummary.info}
          </p>
        </div>
        <div>
          <p className="text-[var(--app-text-muted)]">Reglas evaluadas</p>
          <p className="font-semibold text-[var(--app-heading)]">
            {report.ruleCatalog?.length ?? 0}
          </p>
        </div>
      </div>

      <ul className="space-y-1 text-sm text-[var(--app-text-muted)]">
        {formatImportReportLines(report)
          .slice(0, 8)
          .map((line) => (
            <li key={line}>{line}</li>
          ))}
      </ul>

      {report.audit && report.audit.reasonCounts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--app-heading)]">
            Auditoría de filas descartadas
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
            {report.audit.reasonCounts.map((item) => (
              <span
                key={item.code}
                className="rounded-full border border-[var(--app-border)] px-2 py-0.5"
              >
                {item.label}: {item.count}
              </span>
            ))}
          </div>
          <ul className="space-y-1 text-xs text-[var(--app-text-muted)]">
            {report.audit.sampledDiscardedRows.map((row) => (
              <li key={row.rowIndex}>
                Fila {row.rowIndex + 1}: {row.reason}
              </li>
            ))}
          </ul>
          {report.audit.truncated && (
            <p className="text-xs text-[var(--app-text-muted)]">
              Muestra limitada a {report.audit.sampleLimit} filas de{" "}
              {report.audit.totalDiscardedRows} descartadas.
            </p>
          )}
        </div>
      )}

      {issues.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--app-heading)]">
            Validación
          </p>
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li
                key={`${issue.code}-${issue.message}`}
                className={`rounded-md border px-3 py-2 text-sm ${severityBadge[issue.severity]}`}
              >
                <span className="font-medium">
                  [{issue.severity.toUpperCase()} · {issue.code}]
                </span>{" "}
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.stats.duplicatePointCount > 0 && (
        <p className={`text-sm ${severityClass.info}`}>
          Pares duplicados detectados: {report.stats.duplicatePointCount}
        </p>
      )}

      {report.reproducibility && (
        <div className="rounded-md border border-[var(--app-border)] px-3 py-2 text-xs text-[var(--app-text-muted)]">
          <p className="font-medium text-[var(--app-heading)]">
            Auditoría reproducible
          </p>
          <p>
            Hoja {report.reproducibility.sheetName}; X col{" "}
            {report.reproducibility.selectedColumns.xIndex + 1}; Y col{" "}
            {report.reproducibility.selectedColumns.yIndex + 1}; hojas no
            importadas {report.reproducibility.unimportedSheetCount}.
          </p>
        </div>
      )}
    </div>
  );
}

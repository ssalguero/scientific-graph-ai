"use client";

import type { ImportReport, ValidationSeverity } from "@/lib/import";
import { formatImportReportLines } from "@/lib/import";

type ImportReportPanelProps = {
  report: ImportReport;
  /** Default `legacy` keeps Datos unchanged. `destination` is Importar drawer chrome. */
  variant?: "legacy" | "destination";
  seriesCount?: number;
};

const severityClass: Record<ValidationSeverity, string> = {
  error: "text-[var(--app-danger-text)]",
  warning: "text-[var(--app-warning-text)]",
  info: "text-[var(--app-text-muted)]",
};

const severityBadge: Record<ValidationSeverity, string> = {
  error: "bg-[var(--app-danger-bg)] text-[var(--app-danger-text)] border-[var(--app-danger-border)]",
  warning:
    "bg-[var(--app-warning-bg)] text-[var(--app-warning-text)] border-[var(--app-warning-border)]",
  info: "bg-[var(--app-surface-muted)] text-[var(--app-text-muted)] border-[var(--app-border)]",
};

function DestinationImportReport({
  report,
  seriesCount,
}: {
  report: ImportReport;
  seriesCount?: number;
}) {
  const issues = [...report.errors, ...report.warnings];
  const issueSummary = report.issueSummary ?? {
    error: report.errorCount,
    warning: report.warningCount,
    info: issues.filter((issue) => issue.severity === "info").length,
  };
  const importModeLabel =
    report.importMode === "fast-path" ? "Importación directa" : "Asistente";
  const sectionTitle =
    "text-[length:var(--typography-body-lg-font-size)] font-semibold text-[var(--color-text-primary)]";
  const muted =
    "text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]";
  const primaryText =
    "text-[length:var(--typography-body-lg-font-size)] font-semibold text-[var(--color-text-primary)]";
  const headingValue =
    "mt-1 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums text-[var(--color-text-primary)]";

  const stacked = (label: string, value: string | number) => (
    <div className="space-y-0.5">
      <p className={muted}>{label}</p>
      <p className={primaryText}>{value}</p>
    </div>
  );

  const summaryMetric = (
    label: string,
    value: string | number,
    tone?: "warning" | "error"
  ) => (
    <div className="min-w-[5.5rem] text-center">
      <p className={muted}>{label}</p>
      <p
        className={
          tone === "warning"
            ? "mt-1 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums text-[var(--color-feedback-warning)]"
            : tone === "error"
              ? "mt-1 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums text-[var(--color-feedback-danger)]"
              : headingValue
        }
      >
        {value}
      </p>
    </div>
  );

  return (
    <div className="space-y-8 text-left" role="region" aria-label="Detalle del informe">
      <section className="space-y-3" aria-label="Resumen">
        <h3 className={sectionTitle}>Resumen</h3>
        <div
          className="flex w-full flex-wrap items-start justify-start gap-x-6 gap-y-3 rounded-2xl px-4 py-3"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-capability-pink, #ec4899) 8%, var(--color-surface-default, #0f172a))",
          }}
        >
          {summaryMetric("Puntos importados", report.importedPointCount)}
          {summaryMetric(
            "Series",
            typeof seriesCount === "number" ? seriesCount : "—"
          )}
          {summaryMetric("Cobertura", `${Math.round(report.coverageRatio * 100)}%`)}
          {summaryMetric(
            "Advertencias",
            issueSummary.warning,
            issueSummary.warning > 0 ? "warning" : undefined
          )}
          {summaryMetric(
            "Errores",
            issueSummary.error,
            issueSummary.error > 0 ? "error" : undefined
          )}
        </div>
        {report.executiveSummary ? (
          <p className="text-[length:var(--typography-body-lg-font-size)] leading-[var(--typography-body-lg-line-height)] text-[var(--color-text-muted)]">
            {report.executiveSummary}
          </p>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <section className="space-y-3" aria-label="Origen">
          <h3 className={sectionTitle}>Origen</h3>
          {stacked("Archivo", report.fileName)}
          {stacked("Hoja", report.selectedSheet)}
          {stacked("Modo", importModeLabel)}
          {report.unimportedSheetCount > 0
            ? stacked("Hojas no importadas", report.unimportedSheetCount)
            : null}
        </section>
        <section className="space-y-3" aria-label="Columnas">
          <h3 className={sectionTitle}>Columnas</h3>
          {stacked(
            "Columna X",
            `${report.selectedColumns.xLabel} (col ${report.selectedColumns.xIndex + 1})`
          )}
          {stacked(
            "Columna Y",
            `${report.selectedColumns.yLabel} (col ${report.selectedColumns.yIndex + 1})`
          )}
          {report.stats.xMin !== null && report.stats.xMax !== null
            ? stacked("Rango X", `${report.stats.xMin} → ${report.stats.xMax}`)
            : null}
          {report.stats.yMin !== null && report.stats.yMax !== null
            ? stacked("Rango Y", `${report.stats.yMin} → ${report.stats.yMax}`)
            : null}
        </section>
      </div>

      <section className="space-y-3" aria-label="Validación">
        <h3 className={sectionTitle}>Validación</h3>
        <div className="flex w-full flex-wrap items-start gap-x-8 gap-y-3">
          {stacked("Reglas evaluadas", report.ruleCatalog?.length ?? 0)}
          {stacked("Filas descartadas", report.discardedPointCount)}
          {stacked("Informativos", issueSummary.info)}
          <div className="space-y-0.5">
            <p className={muted}>Advertencias</p>
            <p
              className={
                issueSummary.warning > 0
                  ? "text-[length:var(--typography-body-lg-font-size)] font-semibold text-[var(--color-feedback-warning)]"
                  : primaryText
              }
            >
              {issueSummary.warning}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className={muted}>Errores</p>
            <p
              className={
                issueSummary.error > 0
                  ? "text-[length:var(--typography-body-lg-font-size)] font-semibold text-[var(--color-feedback-danger)]"
                  : primaryText
              }
            >
              {issueSummary.error}
            </p>
          </div>
        </div>
        {issues.length > 0 ? (
          <ul className="space-y-3 pt-1">
            {issues.map((issue) => (
              <li key={`${issue.code}-${issue.message}`} className="space-y-1">
                <p className="text-[length:var(--typography-body-lg-font-size)] text-[var(--color-text-primary)]">
                  {issue.message}
                </p>
                <p className={muted}>{issue.code}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="space-y-2" aria-label="Auditoría">
        <h3 className={sectionTitle}>Auditoría</h3>
        <details className="group">
          <summary
            className={[
              "cursor-pointer list-none text-[length:var(--typography-body-lg-font-size)] font-medium",
              "text-[var(--color-text-muted)]",
              "[&::-webkit-details-marker]:hidden",
            ].join(" ")}
          >
            Detalles técnicos disponibles
          </summary>
          <div className="mt-3 space-y-3">
            {report.reproducibility ? (
              <p className={muted}>
                Hoja {report.reproducibility.sheetName}; X col{" "}
                {report.reproducibility.selectedColumns.xIndex + 1}; Y col{" "}
                {report.reproducibility.selectedColumns.yIndex + 1}; hojas no
                importadas {report.reproducibility.unimportedSheetCount}.
              </p>
            ) : null}
            {report.audit && report.audit.reasonCounts.length > 0
              ? report.audit.reasonCounts.map((item) =>
                  stacked(item.label, item.count)
                )
              : null}
            {report.audit?.sampledDiscardedRows.map((row) => (
              <p key={row.rowIndex} className={muted}>
                Fila {row.rowIndex + 1}: {row.reason}
              </p>
            ))}
            {report.audit?.truncated ? (
              <p className={muted}>
                Muestra limitada a {report.audit.sampleLimit} filas de{" "}
                {report.audit.totalDiscardedRows} descartadas.
              </p>
            ) : null}
            {report.auditPartial ? (
              <p className={muted}>Auditoría parcial</p>
            ) : null}
            {report.stats.duplicatePointCount > 0 ? (
              <p className={muted}>
                Pares duplicados detectados: {report.stats.duplicatePointCount}
              </p>
            ) : null}
            <p className={muted}>
              {[
                report.importMode === "fast-path" ? "Directa" : "Asistente",
                report.version ?? "v1",
                report.ruleCatalogVersion
                  ? `reglas ${report.ruleCatalogVersion}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </details>
      </section>
    </div>
  );
}

export function ImportReportPanel({
  report,
  variant = "legacy",
  seriesCount,
}: ImportReportPanelProps) {
  if (variant === "destination") {
    return <DestinationImportReport report={report} seriesCount={seriesCount} />;
  }

  const issues = [...report.errors, ...report.warnings];
  const issueSummary = report.issueSummary ?? {
    error: report.errorCount,
    warning: report.warningCount,
    info: issues.filter((issue) => issue.severity === "info").length,
  };
  const hasErrors = issueSummary.error > 0;
  const hasWarnings = issueSummary.warning > 0;

  return (
    <div
      className="mt-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 space-y-3"
      role="region"
      aria-label="Informe de importación"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-[var(--app-heading)]">
            Informe de importación
          </p>
          {hasErrors ? (
            <p className="text-[11px] font-medium text-[var(--app-danger-text)]">
              Hay errores de validación en este informe
            </p>
          ) : hasWarnings ? (
            <p className="text-[11px] font-medium text-[var(--app-warning-text)]">
              Hay avisos de validación en este informe
            </p>
          ) : (
            <p className="text-[11px] font-medium text-[var(--app-success-text)]">
              Importación sin avisos de validación
            </p>
          )}
        </div>
        <span className="rounded-full border border-[var(--app-border)] px-2 py-0.5 text-xs text-[var(--app-text-muted)]">
          {report.importMode === "fast-path" ? "Directa" : "Asistente"} ·{" "}
          {report.version ?? "v1"}
          {report.ruleCatalogVersion
            ? ` · reglas ${report.ruleCatalogVersion}`
            : ""}
          {report.auditPartial ? " · auditoría parcial" : ""}
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

"use client";

import type { ImportPreview, ImportValidation } from "@/lib/import";

type ImportPreviewPanelProps = {
  preview: ImportPreview;
  validation: ImportValidation;
  xLabel: string;
  yLabel: string;
  highlightedRowIndex?: number | null;
  onDiscardedRowSelect?: (rowIndex: number) => void;
};

const severityClass = {
  error: "text-[var(--color-feedback-danger)]",
  warning: "text-[var(--color-feedback-warning)]",
  info: "text-[var(--color-text-muted)]",
};

const formatMetric = (value: number | null | undefined): string =>
  value === null || value === undefined ? "N/D" : Number(value.toFixed(4)).toString();

export function ImportPreviewPanel({
  preview,
  validation,
  xLabel,
  yLabel,
  highlightedRowIndex,
  onDiscardedRowSelect,
}: ImportPreviewPanelProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-canvas)] px-4 py-3">
        <div>
          <p className="text-[var(--color-text-muted)]">Puntos importables</p>
          <p className="font-semibold">{preview.stats.importablePointCount}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)]">Filas descartadas</p>
          <p className="font-semibold">{preview.stats.skippedRowCount}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)]">Filas evaluadas</p>
          <p className="font-semibold">{preview.stats.evaluatedRowCount}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)]">Cobertura</p>
          <p className="font-semibold">
            {Math.round(preview.stats.coverageRatio * 100)}%
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm rounded-lg border border-[var(--color-border-default)] px-4 py-3">
        <div>
          <p className="text-[var(--color-text-muted)]">Media X</p>
          <p className="font-semibold">{formatMetric(preview.stats.xMean)}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)]">Media Y</p>
          <p className="font-semibold">{formatMetric(preview.stats.yMean)}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)]">X distintos</p>
          <p className="font-semibold">{preview.stats.xDistinctCount ?? 0}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)]">Y distintos</p>
          <p className="font-semibold">{preview.stats.yDistinctCount ?? 0}</p>
        </div>
      </div>

      <div className="text-sm text-[var(--color-text-muted)]">
        <p>
          <strong className="text-[var(--color-text-primary)]">X:</strong> {xLabel}
          {preview.stats.xMin !== null && preview.stats.xMax !== null
            ? ` (${preview.stats.xMin} → ${preview.stats.xMax})`
            : ""}
        </p>
        <p>
          <strong className="text-[var(--color-text-primary)]">Y:</strong> {yLabel}
          {preview.stats.yMin !== null && preview.stats.yMax !== null
            ? ` (${preview.stats.yMin} → ${preview.stats.yMax})`
            : ""}
        </p>
      </div>

      {validation.issueSummary && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[var(--color-border-default)] px-2 py-0.5 text-[var(--color-feedback-danger)]">
            Errores: {validation.issueSummary.error}
          </span>
          <span className="rounded-full border border-[var(--color-border-default)] px-2 py-0.5 text-[var(--color-feedback-warning)]">
            Warnings: {validation.issueSummary.warning}
          </span>
          <span className="rounded-full border border-[var(--color-border-default)] px-2 py-0.5 text-[var(--color-text-muted)]">
            Info: {validation.issueSummary.info}
          </span>
        </div>
      )}

      {[...validation.errors, ...validation.warnings].map((issue) => (
        <p
          key={`${issue.code}-${issue.message}`}
          className={`text-sm ${severityClass[issue.severity]}`}
        >
          [{issue.severity.toUpperCase()} · {issue.code}] {issue.message}
        </p>
      ))}

      {preview.audit && preview.audit.reasonCounts.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border-default)] px-3 py-2">
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Razones de descarte
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
            {preview.audit.reasonCounts.map((item) => (
              <span
                key={item.code}
                className="rounded-full border border-[var(--color-border-default)] px-2 py-0.5"
              >
                {item.label}: {item.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {preview.discardedRows.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Filas descartadas (muestra)
          </p>
          <ul className="text-xs text-[var(--color-text-muted)] space-y-1">
            {(preview.audit?.sampledDiscardedRows ?? preview.discardedRows.slice(0, 5)).map((row) => (
              <li key={row.rowIndex}>
                <button
                  type="button"
                  className={`text-left hover:underline ${
                    highlightedRowIndex === row.rowIndex
                      ? "font-semibold text-[var(--color-feedback-warning)]"
                      : ""
                  }`}
                  onClick={() => onDiscardedRowSelect?.(row.rowIndex)}
                >
                  Fila {row.rowIndex + 1}: {row.reason}
                </button>
              </li>
            ))}
          </ul>
          {preview.audit?.truncated && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Muestra limitada a {preview.audit.sampleLimit} filas de{" "}
              {preview.audit.totalDiscardedRows} descartadas.
            </p>
          )}
        </div>
      )}

      <div className="overflow-auto rounded-lg border border-[var(--color-border-default)]">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-[var(--color-surface-canvas)]">
              <th className="px-2 py-1 text-left">X</th>
              <th className="px-2 py-1 text-left">Y</th>
              <th className="px-2 py-1 text-left">Fila</th>
              <th className="px-2 py-1 text-left">Etiqueta</th>
            </tr>
          </thead>
          <tbody>
            {preview.points
              .slice(0, preview.samplePolicy?.previewPointSampleLimit ?? 10)
              .map((point) => (
              <tr key={`${point.sourceRowIndex}-${point.x}-${point.y}`} className="border-t border-[var(--color-border-default)]">
                <td className="px-2 py-1">{point.x}</td>
                <td className="px-2 py-1">{point.y}</td>
                <td className="px-2 py-1">{point.sourceRowIndex + 1}</td>
                <td className="px-2 py-1">{point.label ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

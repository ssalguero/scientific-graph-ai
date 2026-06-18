"use client";

import type { ImportPreview, ImportValidation } from "@/lib/import";

type ImportPreviewPanelProps = {
  preview: ImportPreview;
  validation: ImportValidation;
  xLabel: string;
  yLabel: string;
};

const severityClass = {
  error: "text-[var(--app-danger-text)]",
  warning: "text-[var(--app-warning-text)]",
  info: "text-[var(--app-text-muted)]",
};

export function ImportPreviewPanel({
  preview,
  validation,
  xLabel,
  yLabel,
}: ImportPreviewPanelProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
        <div>
          <p className="text-[var(--app-text-muted)]">Puntos importables</p>
          <p className="font-semibold">{preview.stats.importablePointCount}</p>
        </div>
        <div>
          <p className="text-[var(--app-text-muted)]">Filas descartadas</p>
          <p className="font-semibold">{preview.stats.skippedRowCount}</p>
        </div>
        <div>
          <p className="text-[var(--app-text-muted)]">Filas evaluadas</p>
          <p className="font-semibold">{preview.stats.evaluatedRowCount}</p>
        </div>
        <div>
          <p className="text-[var(--app-text-muted)]">Cobertura</p>
          <p className="font-semibold">
            {Math.round(preview.stats.coverageRatio * 100)}%
          </p>
        </div>
      </div>

      <div className="text-sm text-[var(--app-text-muted)]">
        <p>
          <strong className="text-[var(--app-heading)]">X:</strong> {xLabel}
          {preview.stats.xMin !== null && preview.stats.xMax !== null
            ? ` (${preview.stats.xMin} → ${preview.stats.xMax})`
            : ""}
        </p>
        <p>
          <strong className="text-[var(--app-heading)]">Y:</strong> {yLabel}
          {preview.stats.yMin !== null && preview.stats.yMax !== null
            ? ` (${preview.stats.yMin} → ${preview.stats.yMax})`
            : ""}
        </p>
      </div>

      {[...validation.errors, ...validation.warnings].map((issue) => (
        <p
          key={`${issue.code}-${issue.message}`}
          className={`text-sm ${severityClass[issue.severity]}`}
        >
          [{issue.code}] {issue.message}
        </p>
      ))}

      {preview.discardedRows.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[var(--app-heading)] mb-1">
            Filas descartadas (muestra)
          </p>
          <ul className="text-xs text-[var(--app-text-muted)] space-y-1">
            {preview.discardedRows.slice(0, 5).map((row) => (
              <li key={row.rowIndex}>
                Fila {row.rowIndex + 1}: {row.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-auto rounded-lg border border-[var(--app-border)]">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-[var(--app-surface-muted)]">
              <th className="px-2 py-1 text-left">X</th>
              <th className="px-2 py-1 text-left">Y</th>
              <th className="px-2 py-1 text-left">Fila</th>
              <th className="px-2 py-1 text-left">Etiqueta</th>
            </tr>
          </thead>
          <tbody>
            {preview.points.slice(0, 10).map((point) => (
              <tr key={`${point.sourceRowIndex}-${point.x}-${point.y}`} className="border-t border-[var(--app-border)]">
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

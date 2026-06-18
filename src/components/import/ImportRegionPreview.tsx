"use client";

import type { TableRegion } from "@/lib/import";
import { cellToText } from "@/lib/import/shared/cell";
import {
  classifyRegionRow,
  columnIndexToLetter,
  formatRegionSummary,
  getConfidenceLevel,
  getConfidenceReasons,
  rowKindClass,
  sliceRegionMatrix,
  confidenceLevelClass,
} from "./regionPreviewUtils";

type ImportRegionPreviewProps = {
  matrix: unknown[][];
  region: TableRegion;
  highlightColumns?: { xIndex: number; yIndex: number };
  showConfidence?: boolean;
};

export function ImportRegionPreview({
  matrix,
  region,
  highlightColumns,
  showConfidence = true,
}: ImportRegionPreviewProps) {
  const summary = formatRegionSummary(region);
  const rows = sliceRegionMatrix(matrix, region);
  const confidenceLevel = getConfidenceLevel(region.confidence);
  const confidenceReasons = getConfidenceReasons(matrix, region);

  const isHighlightedCol = (colIndex: number) =>
    highlightColumns !== undefined &&
    (colIndex === highlightColumns.xIndex ||
      colIndex === highlightColumns.yIndex);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm">
        <p className="font-medium text-[var(--app-heading)]">Región detectada</p>
        <ul className="mt-1 space-y-0.5 text-[var(--app-text-muted)]">
          <li>Filas {summary.rowRange}</li>
          <li>
            Metadatos: {summary.metadataRowCount}{" "}
            {summary.metadataRowCount === 1 ? "fila" : "filas"}
          </li>
          <li>
            Datos: {summary.dataRowCount}{" "}
            {summary.dataRowCount === 1 ? "fila" : "filas"}
          </li>
          <li>Columnas: {summary.columnRange}</li>
        </ul>
      </div>

      {showConfidence && (
        <div className="text-sm">
          <p className="text-[var(--app-text-muted)]">
            Confianza:{" "}
            <span className={`font-semibold ${confidenceLevelClass[confidenceLevel]}`}>
              {confidenceLevel}
            </span>
          </p>
          <ul className="mt-1 space-y-0.5 text-[var(--app-text-muted)]">
            {confidenceReasons.map((reason) => (
              <li key={reason}>✓ {reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-[var(--app-text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)]/80" />
          Metadatos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-[var(--app-border)] bg-[var(--app-accent-soft)]" />
          Encabezados
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-[var(--app-border)] bg-[var(--app-surface)]" />
          Datos
        </span>
        {highlightColumns && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border-2 border-[var(--app-accent)] bg-[var(--app-accent-soft)]/40" />
            Columna X/Y
          </span>
        )}
      </div>

      <div className="overflow-auto rounded-lg border border-[var(--app-border)]">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]">
              <th className="sticky left-0 z-10 bg-[var(--app-surface-muted)] px-2 py-1 text-left font-medium text-[var(--app-text-muted)]">
                #
              </th>
              {Array.from(
                { length: region.endCol - region.startCol + 1 },
                (_, offset) => region.startCol + offset
              ).map((colIndex) => (
                <th
                  key={colIndex}
                  className={`px-2 py-1 text-left font-medium whitespace-nowrap ${
                    isHighlightedCol(colIndex)
                      ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                      : "text-[var(--app-text-muted)]"
                  }`}
                >
                  {columnIndexToLetter(colIndex)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ rowIndex, cells }) => {
              const kind = classifyRegionRow(rowIndex, region);
              return (
                <tr
                  key={rowIndex}
                  className={`border-b border-[var(--app-border)] ${rowKindClass[kind]}`}
                >
                  <td className="sticky left-0 z-10 px-2 py-1 font-medium text-[var(--app-text-muted)] bg-inherit">
                    {rowIndex + 1}
                  </td>
                  {cells.map((cell, cellOffset) => {
                    const colIndex = region.startCol + cellOffset;
                    return (
                      <td
                        key={colIndex}
                        className={`px-2 py-1 whitespace-nowrap ${
                          isHighlightedCol(colIndex)
                            ? "ring-1 ring-inset ring-[var(--app-accent)]/50"
                            : ""
                        }`}
                      >
                        {cellToText(cell)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

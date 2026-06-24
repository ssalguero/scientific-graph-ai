"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  applyWorksheetModelUpdate,
  createWorksheetRowKey,
  getWorksheetDimensions,
  parseWorksheetNumericInput,
  seriesToWorksheet,
  sortWorksheetRows,
  type WorksheetSortColumn,
  type WorksheetSortDirection,
} from "@/lib/experimentalWorksheet";

type ScientificWorksheetPanelProps = {
  series: ExperimentalSeries[];
  modified: boolean;
  onSeriesChange: (nextSeries: ExperimentalSeries[]) => void;
  btnOutlineSm: string;
  btnPrimary: string;
  inputField: string;
  fieldLabel: string;
  dataEmptyState: string;
};

type EditingCell = {
  rowKey: string;
  column: "x" | string;
  draft: string;
};

type RenamingColumn = {
  seriesId: string;
  draft: string;
};

export function ScientificWorksheetPanel({
  series,
  modified,
  onSeriesChange,
  btnOutlineSm,
  btnPrimary,
  inputField,
  fieldLabel,
  dataEmptyState,
}: ScientificWorksheetPanelProps) {
  const baseModel = useMemo(() => seriesToWorksheet(series), [series]);
  const [sortColumn, setSortColumn] = useState<WorksheetSortColumn | null>(
    null
  );
  const [sortDirection, setSortDirection] =
    useState<WorksheetSortDirection>("asc");
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [renamingColumn, setRenamingColumn] =
    useState<RenamingColumn | null>(null);

  const displayRows = useMemo(() => {
    if (!sortColumn) return baseModel.rows;
    return sortWorksheetRows(baseModel.rows, sortColumn, sortDirection);
  }, [baseModel.rows, sortColumn, sortDirection]);

  const dimensions = getWorksheetDimensions(baseModel);

  const commitSeriesUpdate = (
    updater: Parameters<typeof applyWorksheetModelUpdate>[1]
  ) => {
    onSeriesChange(applyWorksheetModelUpdate(series, updater));
  };

  const toggleSort = (column: WorksheetSortColumn) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection("asc");
      return;
    }
    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }
    setSortColumn(null);
  };

  const sortIndicator = (column: WorksheetSortColumn) => {
    if (sortColumn !== column) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const startEditCell = (
    rowKey: string,
    column: "x" | string,
    currentValue: number | null
  ) => {
    setEditingCell({
      rowKey,
      column,
      draft:
        currentValue === null || !Number.isFinite(currentValue)
          ? ""
          : String(currentValue),
    });
  };

  const cancelEditCell = () => setEditingCell(null);

  const commitEditCell = () => {
    if (!editingCell) return;

    const numericValue = parseWorksheetNumericInput(editingCell.draft);
    commitSeriesUpdate((model) => ({
      ...model,
      rows: model.rows.map((row) => {
        if (row.rowKey !== editingCell.rowKey) return row;
        if (editingCell.column === "x") {
          if (numericValue === null) return row;
          return { ...row, x: numericValue };
        }
        return {
          ...row,
          values: {
            ...row.values,
            [editingCell.column]: numericValue,
          },
        };
      }),
    }));
    setEditingCell(null);
  };

  const handleCellKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEditCell();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditCell();
    }
  };

  const startRenameColumn = (seriesId: string, currentLabel: string) => {
    setRenamingColumn({ seriesId, draft: currentLabel });
  };

  const commitRenameColumn = () => {
    if (!renamingColumn) return;
    const nextLabel = renamingColumn.draft.trim();
    if (nextLabel.length === 0) {
      setRenamingColumn(null);
      return;
    }
    commitSeriesUpdate((model) => ({
      ...model,
      columns: model.columns.map((column) =>
        column.seriesId === renamingColumn.seriesId
          ? { ...column, label: nextLabel }
          : column
      ),
    }));
    setRenamingColumn(null);
  };

  const handleAddRow = () => {
    commitSeriesUpdate((model) => {
      const nextX =
        model.rows.length === 0
          ? 0
          : Math.max(...model.rows.map((row) => row.x)) + 1;
      return {
        ...model,
        rows: [
          ...model.rows,
          {
            rowKey: createWorksheetRowKey(),
            x: nextX,
            values: Object.fromEntries(
              model.columns.map((column) => [column.seriesId, null])
            ),
          },
        ],
      };
    });
  };

  const handleDeleteRow = (rowKey: string) => {
    if (!window.confirm("¿Eliminar esta observación del worksheet?")) return;
    commitSeriesUpdate((model) => ({
      ...model,
      rows: model.rows.filter((row) => row.rowKey !== rowKey),
    }));
  };

  if (series.length === 0) {
    return (
      <p className={dataEmptyState}>
        Importe un dataset para editarlo en la worksheet científica.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--app-text-muted)]">
        <span>
          Filas: <strong className="text-[var(--app-text)]">{dimensions.rowCount}</strong>
        </span>
        <span>
          Columnas:{" "}
          <strong className="text-[var(--app-text)]">{dimensions.columnCount}</strong>
        </span>
        {modified ? (
          <span className="inline-flex rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Modificado
          </span>
        ) : null}
      </div>

      <div className="overflow-x-auto max-h-[28rem] overflow-y-auto rounded-lg border border-[var(--app-border)]">
        <table className="min-w-full text-xs sm:text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--app-surface-muted)]">
            <tr>
              <th className="px-2 py-1.5 text-left font-semibold text-[var(--app-text-muted)] border-b border-[var(--app-border)] whitespace-nowrap">
                ID
              </th>
              <th className="px-2 py-1.5 text-left border-b border-[var(--app-border)] whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleSort("x")}
                  className="font-semibold text-[var(--app-heading)] hover:text-[var(--app-accent)]"
                  title="Ordenar por eje X"
                >
                  {baseModel.xColumnLabel}{" "}
                  <span aria-hidden>{sortIndicator("x")}</span>
                </button>
              </th>
              {baseModel.columns.map((column) => (
                <th
                  key={column.seriesId}
                  className="px-2 py-1.5 text-left border-b border-[var(--app-border)] whitespace-nowrap min-w-[7rem]"
                >
                  {renamingColumn?.seriesId === column.seriesId ? (
                    <input
                      type="text"
                      value={renamingColumn.draft}
                      onChange={(event) =>
                        setRenamingColumn({
                          seriesId: column.seriesId,
                          draft: event.target.value,
                        })
                      }
                      onBlur={commitRenameColumn}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          commitRenameColumn();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setRenamingColumn(null);
                        }
                      }}
                      autoFocus
                      className={`${inputField} h-7 text-xs font-semibold`}
                      aria-label="Renombrar columna"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        toggleSort(column.seriesId);
                      }}
                      onDoubleClick={() =>
                        startRenameColumn(column.seriesId, column.label)
                      }
                      className="font-semibold text-[var(--app-heading)] hover:text-[var(--app-accent)] text-left"
                      title="Click: ordenar · Doble click: renombrar"
                    >
                      {column.label}{" "}
                      <span aria-hidden>{sortIndicator(column.seriesId)}</span>
                    </button>
                  )}
                </th>
              ))}
              <th className="px-2 py-1.5 text-right border-b border-[var(--app-border)] whitespace-nowrap">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rowIndex) => (
              <tr
                key={row.rowKey}
                className="border-b border-[var(--app-border)]/70 hover:bg-[var(--app-surface-muted)]/50"
              >
                <td className="px-2 py-1 text-[var(--app-text-muted)] tabular-nums">
                  {rowIndex + 1}
                </td>
                <td className="px-2 py-1 tabular-nums">
                  {editingCell?.rowKey === row.rowKey &&
                  editingCell.column === "x" ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editingCell.draft}
                      onChange={(event) =>
                        setEditingCell({
                          ...editingCell,
                          draft: event.target.value,
                        })
                      }
                      onBlur={commitEditCell}
                      onKeyDown={handleCellKeyDown}
                      autoFocus
                      className={`${inputField} h-7 w-24 text-xs`}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditCell(row.rowKey, "x", row.x)}
                      className="w-full text-left rounded px-1 py-0.5 hover:bg-[var(--app-accent)]/10"
                    >
                      {Number.isFinite(row.x) ? row.x : "—"}
                    </button>
                  )}
                </td>
                {baseModel.columns.map((column) => {
                  const cellValue = row.values[column.seriesId] ?? null;
                  const isEditing =
                    editingCell?.rowKey === row.rowKey &&
                    editingCell.column === column.seriesId;

                  return (
                    <td key={column.seriesId} className="px-2 py-1 tabular-nums">
                      {isEditing ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editingCell.draft}
                          onChange={(event) =>
                            setEditingCell({
                              ...editingCell,
                              draft: event.target.value,
                            })
                          }
                          onBlur={commitEditCell}
                          onKeyDown={handleCellKeyDown}
                          autoFocus
                          className={`${inputField} h-7 w-24 text-xs`}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startEditCell(
                              row.rowKey,
                              column.seriesId,
                              cellValue
                            )
                          }
                          className="w-full text-left rounded px-1 py-0.5 hover:bg-[var(--app-accent)]/10"
                        >
                          {cellValue === null || !Number.isFinite(cellValue)
                            ? "—"
                            : cellValue}
                        </button>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(row.rowKey)}
                    className={`${btnOutlineSm} text-[var(--app-danger-text)] border-[var(--app-danger-border)] hover:bg-[var(--app-danger-bg)]`}
                    aria-label={`Eliminar fila ${rowIndex + 1}`}
                    title="Eliminar fila"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleAddRow} className={btnPrimary}>
          Agregar fila
        </button>
        <p className={`${fieldLabel} mb-0 normal-case tracking-normal text-[var(--app-text-muted)]`}>
          Click en celda para editar · Enter confirma · Escape cancela · Doble
          click en encabezado para renombrar columna
        </p>
      </div>
    </div>
  );
}

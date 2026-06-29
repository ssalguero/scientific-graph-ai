"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportAuxiliaryColumn } from "@/lib/import/types";
import {
  applyWorksheetModelUpdate,
  buildColumnRegistryFromImportAuxiliary,
  cloneColumnMetadata,
  createDefaultColumnRegistry,
  createFormulaColumnMetadata,
  createFormulaWorksheetColumn,
  createTransformColumnMetadata,
  createWorksheetRowKey,
  DEFAULT_COLUMN_METADATA,
  deleteWorksheetColumn,
  duplicateWorksheetColumn,
  formatWorksheetSelectionAsTsv,
  getWorksheetStatusSummary,
  insertWorksheetColumn,
  parseTabularClipboard,
  parseWorksheetNumericInput,
  pasteTabularDataIntoModel,
  renameWorksheetColumn,
  seriesToWorksheet,
  sortWorksheetRows,
  transformWorksheetColumn,
  WORKSHEET_COLUMN_TYPE_BADGES,
  WORKSHEET_COLUMN_TYPE_LABELS,
  WORKSHEET_TRANSFORM_MENU_LABELS,
  type WorksheetColumnRegistry,
  type WorksheetColumnTransform,
  type WorksheetColumnType,
  type WorksheetPasteAnchor,
  type WorksheetPresetTransformKind,
  type WorksheetSortColumn,
  type WorksheetSortDirection,
} from "@/lib/experimentalWorksheet";
import {
  getWorksheetColumnLineage,
  isFormulaDerivedColumnFromMetadata,
  isTransformDerivedColumn,
} from "@/lib/worksheetLineage";
import { WorksheetFormulaBuilderModal } from "@/components/data/WorksheetFormulaBuilderModal";
import { WorksheetColumnHistoryModal } from "@/components/data/WorksheetColumnHistoryModal";

type ScientificWorksheetPanelProps = {
  series: ExperimentalSeries[];
  modified: boolean;
  onSeriesChange: (nextSeries: ExperimentalSeries[]) => void;
  onWorksheetPayloadChange?: (payload: {
    columnRegistry: WorksheetColumnRegistry;
    modified?: boolean;
  }) => void;
  auxiliaryColumns?: ImportAuxiliaryColumn[];
  initialColumnRegistry?: WorksheetColumnRegistry;
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

type OpenColumnMenu = {
  seriesId: string;
} | null;

type FormulaBuilderState = {
  insertAfterSeriesId: string;
  anchorColumnLabel: string;
} | null;

type ColumnHistoryState = {
  seriesId: string;
} | null;

export function ScientificWorksheetPanel({
  series,
  modified,
  onSeriesChange,
  onWorksheetPayloadChange,
  auxiliaryColumns = [],
  initialColumnRegistry,
  btnOutlineSm,
  btnPrimary,
  inputField,
  fieldLabel,
  dataEmptyState,
}: ScientificWorksheetPanelProps) {
  const baseModel = useMemo(() => seriesToWorksheet(series), [series]);
  const tableRef = useRef<HTMLDivElement>(null);
  const skipEditCommitRef = useRef(false);
  const [sortColumn, setSortColumn] = useState<WorksheetSortColumn | null>(
    null
  );
  const [sortDirection, setSortDirection] =
    useState<WorksheetSortDirection>("asc");
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [renamingColumn, setRenamingColumn] =
    useState<RenamingColumn | null>(null);
  const [openColumnMenu, setOpenColumnMenu] = useState<OpenColumnMenu>(null);
  const [columnRegistry, setColumnRegistry] = useState<WorksheetColumnRegistry>(
    {}
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<Array<"x" | string>>(
    []
  );
  const [pasteAnchor, setPasteAnchor] = useState<WorksheetPasteAnchor | null>(
    null
  );
  const [clipboardMessage, setClipboardMessage] = useState<string | null>(null);
  const [formulaBuilder, setFormulaBuilder] = useState<FormulaBuilderState>(null);
  const [formulaBuilderError, setFormulaBuilderError] = useState<string | null>(
    null
  );
  const [columnHistory, setColumnHistory] = useState<ColumnHistoryState>(null);

  useEffect(() => {
    if (initialColumnRegistry && Object.keys(initialColumnRegistry).length > 0) {
      setColumnRegistry({ ...initialColumnRegistry });
      return;
    }
    setColumnRegistry((previous) =>
      buildColumnRegistryFromImportAuxiliary(
        baseModel.columns,
        auxiliaryColumns,
        previous
      )
    );
  }, [baseModel.columns, auxiliaryColumns, initialColumnRegistry]);

  useEffect(() => {
    if (!clipboardMessage) return;
    const timer = window.setTimeout(() => setClipboardMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [clipboardMessage]);

  const displayRows = useMemo(() => {
    if (!sortColumn) return baseModel.rows;
    return sortWorksheetRows(baseModel.rows, sortColumn, sortDirection);
  }, [baseModel.rows, sortColumn, sortDirection]);

  const statusSummary = useMemo(
    () => getWorksheetStatusSummary(baseModel, columnRegistry),
    [baseModel, columnRegistry]
  );

  const commitSeriesUpdate = (
    updater: Parameters<typeof applyWorksheetModelUpdate>[1]
  ) => {
    onSeriesChange(applyWorksheetModelUpdate(series, updater));
  };

  const commitColumnRegistryChange = (nextRegistry: WorksheetColumnRegistry) => {
    setColumnRegistry(nextRegistry);
    onWorksheetPayloadChange?.({ columnRegistry: nextRegistry, modified: true });
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
    setPasteAnchor({ rowKey, column, kind: "cell" });
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
    if (skipEditCommitRef.current) {
      skipEditCommitRef.current = false;
      return;
    }
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
    setOpenColumnMenu(null);
    setRenamingColumn({ seriesId, draft: currentLabel });
  };

  const commitRenameColumn = () => {
    if (!renamingColumn) return;
    const nextLabel = renamingColumn.draft.trim();
    if (nextLabel.length === 0) {
      setRenamingColumn(null);
      return;
    }
    commitSeriesUpdate((model) =>
      renameWorksheetColumn(model, renamingColumn.seriesId, nextLabel)
    );
    setRenamingColumn(null);
  };

  const handleInsertColumn = () => {
    commitSeriesUpdate((model) => insertWorksheetColumn(model));
  };

  const handleDuplicateColumn = (seriesId: string) => {
    const sourceMeta = columnRegistry[seriesId] ?? DEFAULT_COLUMN_METADATA;
    const nextSeries = applyWorksheetModelUpdate(series, (model) =>
      duplicateWorksheetColumn(model, seriesId)
    );
    const nextModel = seriesToWorksheet(nextSeries);
    const previousIds = new Set(baseModel.columns.map((column) => column.seriesId));
    const duplicatedColumn = nextModel.columns.find(
      (column) => !previousIds.has(column.seriesId)
    );

    const nextRegistry = createDefaultColumnRegistry(nextModel.columns, columnRegistry);
    if (duplicatedColumn) {
      nextRegistry[duplicatedColumn.seriesId] = cloneColumnMetadata(sourceMeta);
    }
    commitColumnRegistryChange(nextRegistry);
    onSeriesChange(nextSeries);
    setOpenColumnMenu(null);
  };

  const handleDeleteColumn = (seriesId: string) => {
    if (
      !window.confirm(
        "¿Eliminar esta columna del worksheet? Los valores asociados se perderán."
      )
    ) {
      return;
    }
    commitSeriesUpdate((model) => deleteWorksheetColumn(model, seriesId));
    const nextRegistry = { ...columnRegistry };
    delete nextRegistry[seriesId];
    commitColumnRegistryChange(nextRegistry);
    setSelectedColumns((previous) =>
      previous.filter((column) => column !== seriesId)
    );
    setOpenColumnMenu(null);
  };

  const handleColumnTypeChange = (
    seriesId: string,
    columnType: WorksheetColumnType
  ) => {
    commitColumnRegistryChange({
      ...columnRegistry,
      [seriesId]: {
        ...(columnRegistry[seriesId] ?? DEFAULT_COLUMN_METADATA),
        columnType,
        transforms: columnRegistry[seriesId]?.transforms ?? [],
      },
    });
    setOpenColumnMenu(null);
  };

  const handleTransformColumn = (
    seriesId: string,
    kind: WorksheetPresetTransformKind,
    params?: Record<string, number>
  ) => {
    const transform: WorksheetColumnTransform = {
      kind,
      enabled: true,
      params,
    };
    const sourceMeta = columnRegistry[seriesId] ?? DEFAULT_COLUMN_METADATA;
    const previousIds = new Set(baseModel.columns.map((column) => column.seriesId));

    const nextSeries = applyWorksheetModelUpdate(series, (model) => {
      const nextModel = transformWorksheetColumn(model, seriesId, transform);
      return nextModel ?? model;
    });

    const nextModel = seriesToWorksheet(nextSeries);
    const transformedColumn = nextModel.columns.find(
      (column) => !previousIds.has(column.seriesId)
    );

    if (!transformedColumn) {
      setClipboardMessage("No se pudo crear la columna transformada.");
      setOpenColumnMenu(null);
      return;
    }

    const nextRegistry = createDefaultColumnRegistry(nextModel.columns, columnRegistry);
    nextRegistry[transformedColumn.seriesId] = createTransformColumnMetadata(
      seriesId,
      sourceMeta,
      transform
    );
    commitColumnRegistryChange(nextRegistry);
    onSeriesChange(nextSeries);
    setClipboardMessage(`Columna "${transformedColumn.label}" creada.`);
    setOpenColumnMenu(null);
  };

  const promptTransformParam = (
    seriesId: string,
    kind: "scale" | "power",
    label: string,
    defaultValue: string,
    paramKey: "factor" | "exponent"
  ) => {
    const raw = window.prompt(label, defaultValue);
    if (raw === null) return;
    const value = parseWorksheetNumericInput(raw);
    if (value === null) {
      window.alert("Introduzca un valor numérico válido.");
      return;
    }
    handleTransformColumn(seriesId, kind, { [paramKey]: value });
  };

  const openFormulaBuilder = (seriesId: string, anchorColumnLabel: string) => {
    setFormulaBuilderError(null);
    setFormulaBuilder({ insertAfterSeriesId: seriesId, anchorColumnLabel });
    setOpenColumnMenu(null);
  };

  const closeFormulaBuilder = () => {
    setFormulaBuilder(null);
    setFormulaBuilderError(null);
  };

  const openColumnHistory = (seriesId: string) => {
    setColumnHistory({ seriesId });
    setOpenColumnMenu(null);
  };

  const closeColumnHistory = () => {
    setColumnHistory(null);
  };

  const activeColumnLineage = useMemo(() => {
    if (!columnHistory) return null;
    return getWorksheetColumnLineage(
      baseModel,
      columnRegistry,
      columnHistory.seriesId
    );
  }, [baseModel, columnHistory, columnRegistry]);

  const handleFormulaSubmit = (columnLabel: string, expression: string) => {
    if (!formulaBuilder) return;

    let creationError: string | null = null;
    let createdTransform: WorksheetColumnTransform | null = null;
    let createdSeriesId: string | null = null;

    const nextSeries = applyWorksheetModelUpdate(series, (model) => {
      const result = createFormulaWorksheetColumn(
        model,
        columnLabel,
        expression,
        formulaBuilder.insertAfterSeriesId
      );
      if ("error" in result) {
        creationError = result.error;
        return model;
      }
      createdTransform = result.transform;
      createdSeriesId = result.seriesId;
      return result.model;
    });

    if (creationError) {
      setFormulaBuilderError(creationError);
      return;
    }

    if (!createdTransform || !createdSeriesId) {
      setFormulaBuilderError("No se pudo crear la columna derivada.");
      return;
    }

    const nextModel = seriesToWorksheet(nextSeries);
    const formulaColumn = nextModel.columns.find(
      (column) => column.seriesId === createdSeriesId
    );

    if (!formulaColumn) {
      setFormulaBuilderError("No se pudo crear la columna derivada.");
      return;
    }

    const nextRegistry = createDefaultColumnRegistry(nextModel.columns, columnRegistry);
    nextRegistry[formulaColumn.seriesId] = createFormulaColumnMetadata(createdTransform!);
    commitColumnRegistryChange(nextRegistry);
    onSeriesChange(nextSeries);
    setClipboardMessage(`Columna "${formulaColumn.label}" creada.`);
    closeFormulaBuilder();
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
    setSelectedRowKeys((previous) => previous.filter((key) => key !== rowKey));
  };

  const toggleRowSelection = (rowKey: string, extend: boolean) => {
    setSelectedRowKeys((previous) => {
      if (extend && previous.length > 0) {
        const orderedKeys = displayRows.map((row) => row.rowKey);
        const anchor = previous[previous.length - 1];
        const start = orderedKeys.indexOf(anchor);
        const end = orderedKeys.indexOf(rowKey);
        if (start < 0 || end < 0) {
          return [rowKey];
        }
        const [from, to] = start < end ? [start, end] : [end, start];
        return orderedKeys.slice(from, to + 1);
      }
      if (previous.includes(rowKey)) {
        return previous.filter((key) => key !== rowKey);
      }
      return [...previous, rowKey];
    });
  };

  const toggleColumnSelection = (column: "x" | string, extend: boolean) => {
    setSelectedColumns((previous) => {
      if (extend && previous.length > 0) {
        const ordered: Array<"x" | string> = [
          "x",
          ...baseModel.columns.map((item) => item.seriesId),
        ];
        const anchor = previous[previous.length - 1];
        const start = ordered.indexOf(anchor);
        const end = ordered.indexOf(column);
        if (start < 0 || end < 0) {
          return [column];
        }
        const [from, to] = start < end ? [start, end] : [end, start];
        return ordered.slice(from, to + 1);
      }
      if (previous.includes(column)) {
        return previous.filter((item) => item !== column);
      }
      return [...previous, column];
    });
  };

  const copySelectionToClipboard = async () => {
    const tsv = formatWorksheetSelectionAsTsv(baseModel, {
      rowKeys: selectedRowKeys,
      columns: selectedColumns,
    });
    try {
      await navigator.clipboard.writeText(tsv);
      setClipboardMessage("Selección copiada al portapapeles (TSV).");
    } catch {
      setClipboardMessage("No se pudo copiar al portapapeles.");
    }
  };

  const handleTableCopy = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const tsv = formatWorksheetSelectionAsTsv(baseModel, {
      rowKeys: selectedRowKeys,
      columns: selectedColumns,
    });
    event.clipboardData.setData("text/plain", tsv);
    setClipboardMessage("Selección copiada (compatible con Excel).");
  };

  const applyPasteFromClipboard = (text: string) => {
    const grid = parseTabularClipboard(text);
    if (grid.length === 0) {
      setClipboardMessage("Portapapeles vacío o sin datos tabulares.");
      return;
    }

    skipEditCommitRef.current = true;
    setEditingCell(null);

    let pasteChanged = false;
    onSeriesChange(
      applyWorksheetModelUpdate(series, (model) => {
        const result = pasteTabularDataIntoModel(model, grid, pasteAnchor);
        pasteChanged = result.changed;
        return result.model;
      })
    );

    if (!pasteChanged) {
      skipEditCommitRef.current = false;
      setClipboardMessage(
        "No se aplicaron cambios. Seleccione la celda destino e intente de nuevo."
      );
      return;
    }

    setClipboardMessage(
      `Pegadas ${grid.length} fila${grid.length === 1 ? "" : "s"} desde portapapeles.`
    );
  };

  const handleTablePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    applyPasteFromClipboard(event.clipboardData.getData("text/plain"));
  };

  const handleCellPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    applyPasteFromClipboard(event.clipboardData.getData("text/plain"));
  };

  const handleTableKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      event.preventDefault();
      void copySelectionToClipboard();
    }
  };

  const handleCopyColumn = async (seriesId: string) => {
    const tsv = formatWorksheetSelectionAsTsv(baseModel, {
      rowKeys: [],
      columns: [seriesId],
    });
    try {
      await navigator.clipboard.writeText(tsv);
      setClipboardMessage("Columna copiada al portapapeles.");
    } catch {
      setClipboardMessage("No se pudo copiar la columna.");
    }
    setOpenColumnMenu(null);
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--app-text-muted)] rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)]/40 px-2.5 py-1.5">
        <span>
          Filas:{" "}
          <strong className="text-[var(--app-text)]">
            {statusSummary.rowCount}
          </strong>
        </span>
        <span>
          Columnas:{" "}
          <strong className="text-[var(--app-text)]">
            {statusSummary.columnCount}
          </strong>
        </span>
        <span>
          Variables numéricas:{" "}
          <strong className="text-[var(--app-text)]">
            {statusSummary.numericVariables}
          </strong>
        </span>
        <span>
          Variables categóricas:{" "}
          <strong className="text-[var(--app-text)]">
            {statusSummary.categoricalVariables}
          </strong>
        </span>
        {modified ? (
          <span className="inline-flex rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Modificado
          </span>
        ) : null}
        {clipboardMessage ? (
          <span className="text-[10px] text-[var(--app-accent)]">
            {clipboardMessage}
          </span>
        ) : null}
      </div>

      {auxiliaryColumns.length > 0 ? (
        <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)]/40 px-2.5 py-2 space-y-2">
          <p className="text-xs font-semibold text-[var(--app-heading)]">
            Columnas auxiliares importadas
          </p>
          {auxiliaryColumns.map((column) => (
            <div key={column.id} className="text-xs text-[var(--app-text-muted)]">
              <span className="font-medium text-[var(--app-text)]">
                {column.label}
              </span>{" "}
              ({column.role === "replicate" ? "Réplica" : column.role === "group" ? "Grupo" : "Condición"}) ·{" "}
              {Object.keys(column.valuesByRowIndex).length} valores
            </div>
          ))}
        </div>
      ) : null}

      <div
        ref={tableRef}
        tabIndex={0}
        onCopy={handleTableCopy}
        onPaste={handleTablePaste}
        onKeyDown={handleTableKeyDown}
        className="overflow-x-auto max-h-[28rem] overflow-y-auto rounded-lg border border-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
        aria-label="Worksheet científica"
      >
        <table className="min-w-full text-xs sm:text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--app-surface-muted)]">
            <tr>
              <th className="px-2 py-1.5 text-left font-semibold text-[var(--app-text-muted)] border-b border-[var(--app-border)] whitespace-nowrap">
                ID
              </th>
              <th
                className={`px-2 py-1.5 text-left border-b border-[var(--app-border)] whitespace-nowrap ${
                  selectedColumns.includes("x")
                    ? "bg-[var(--app-accent)]/10"
                    : ""
                }`}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    toggleColumnSelection("x", event.shiftKey);
                    setPasteAnchor({ rowKey: displayRows[0]?.rowKey ?? "", column: "x", kind: "header" });
                  }}
                  onDoubleClick={() => toggleSort("x")}
                  className="font-semibold text-[var(--app-heading)] hover:text-[var(--app-accent)]"
                  title="Click: seleccionar · Shift+click: rango · Doble click: ordenar"
                >
                  {baseModel.xColumnLabel}{" "}
                  <span aria-hidden>{sortIndicator("x")}</span>
                </button>
              </th>
              {baseModel.columns.map((column) => {
                const metadata =
                  columnRegistry[column.seriesId] ?? DEFAULT_COLUMN_METADATA;
                const isMenuOpen = openColumnMenu?.seriesId === column.seriesId;

                return (
                  <th
                    key={column.seriesId}
                    className={`px-2 py-1.5 text-left border-b border-[var(--app-border)] whitespace-nowrap min-w-[8rem] relative ${
                      selectedColumns.includes(column.seriesId)
                        ? "bg-[var(--app-accent)]/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-1">
                      <div className="min-w-0 flex-1">
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
                            onClick={(event) => {
                              toggleColumnSelection(column.seriesId, event.shiftKey);
                              setPasteAnchor({
                                rowKey: displayRows[0]?.rowKey ?? "",
                                column: column.seriesId,
                                kind: "header",
                              });
                            }}
                            onDoubleClick={() => toggleSort(column.seriesId)}
                            className="font-semibold text-[var(--app-heading)] hover:text-[var(--app-accent)] text-left"
                            title="Click: seleccionar · Shift+click: rango · Doble click: ordenar"
                          >
                            {column.label}{" "}
                            <span aria-hidden>
                              {sortIndicator(column.seriesId)}
                            </span>
                          </button>
                        )}
                        <span
                          className="ml-1 inline-flex rounded border border-[var(--app-border)] bg-[var(--app-surface)] px-1 py-0 text-[9px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]"
                          title={WORKSHEET_COLUMN_TYPE_LABELS[metadata.columnType]}
                        >
                          {WORKSHEET_COLUMN_TYPE_BADGES[metadata.columnType]}
                        </span>
                        {isFormulaDerivedColumnFromMetadata(metadata) ? (
                          <span
                            className="ml-1 inline-flex rounded border border-[var(--app-accent)]/30 bg-[var(--app-accent)]/10 px-1 py-0 text-[9px] font-semibold text-[var(--app-accent)]"
                            title="Creada mediante fórmula"
                          >
                            ƒx
                          </span>
                        ) : null}
                        {isTransformDerivedColumn(metadata) ? (
                          <span
                            className="ml-1 inline-flex rounded border border-[var(--app-warning)]/30 bg-[var(--app-warning-bg)] px-1 py-0 text-[9px] font-semibold text-[var(--app-warning-text)]"
                            title="Creada mediante transformación"
                          >
                            ⇄
                          </span>
                        ) : null}
                      </div>
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenColumnMenu(
                              isMenuOpen ? null : { seriesId: column.seriesId }
                            )
                          }
                          className={`${btnOutlineSm} h-7 px-1.5`}
                          aria-label={`Menú columna ${column.label}`}
                          title="Operaciones de columna"
                        >
                          ⋮
                        </button>
                        {isMenuOpen ? (
                          <div className="absolute right-0 mt-1 z-20 min-w-[10rem] rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-lg">
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--app-surface-muted)]"
                              onClick={() =>
                                startRenameColumn(column.seriesId, column.label)
                              }
                            >
                              Renombrar
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--app-surface-muted)]"
                              onClick={() => handleDuplicateColumn(column.seriesId)}
                            >
                              Duplicar
                            </button>
                            <div className="my-1 border-t border-[var(--app-border)]" />
                            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                              Transformar columna
                            </p>
                            {(
                              Object.keys(
                                WORKSHEET_TRANSFORM_MENU_LABELS
                              ) as WorksheetPresetTransformKind[]
                            ).map((kind) => (
                              <button
                                key={kind}
                                type="button"
                                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--app-surface-muted)]"
                                onClick={() => {
                                  if (kind === "scale") {
                                    promptTransformParam(
                                      column.seriesId,
                                      "scale",
                                      "Factor de escala (ej. 10):",
                                      "10",
                                      "factor"
                                    );
                                    return;
                                  }
                                  if (kind === "power") {
                                    promptTransformParam(
                                      column.seriesId,
                                      "power",
                                      "Exponente (ej. 2):",
                                      "2",
                                      "exponent"
                                    );
                                    return;
                                  }
                                  handleTransformColumn(column.seriesId, kind);
                                }}
                              >
                                {WORKSHEET_TRANSFORM_MENU_LABELS[kind]}
                              </button>
                            ))}
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--app-surface-muted)]"
                              onClick={() =>
                                openFormulaBuilder(column.seriesId, column.label)
                              }
                            >
                              Crear fórmula...
                            </button>
                            <div className="my-1 border-t border-[var(--app-border)]" />
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--app-surface-muted)]"
                              onClick={() => openColumnHistory(column.seriesId)}
                            >
                              Ver historial
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--app-surface-muted)]"
                              onClick={() => void handleCopyColumn(column.seriesId)}
                            >
                              Copiar columna
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs text-[var(--app-danger-text)] hover:bg-[var(--app-danger-bg)]"
                              onClick={() => handleDeleteColumn(column.seriesId)}
                            >
                              Eliminar
                            </button>
                            <div className="my-1 border-t border-[var(--app-border)]" />
                            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                              Tipo
                            </p>
                            {(
                              Object.keys(
                                WORKSHEET_COLUMN_TYPE_LABELS
                              ) as WorksheetColumnType[]
                            ).map((columnType) => (
                              <button
                                key={columnType}
                                type="button"
                                className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--app-surface-muted)] ${
                                  metadata.columnType === columnType
                                    ? "font-semibold text-[var(--app-accent)]"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleColumnTypeChange(
                                    column.seriesId,
                                    columnType
                                  )
                                }
                              >
                                {WORKSHEET_COLUMN_TYPE_LABELS[columnType]}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </th>
                );
              })}
              <th className="px-2 py-1.5 text-right border-b border-[var(--app-border)] whitespace-nowrap">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rowIndex) => (
              <tr
                key={row.rowKey}
                className={`border-b border-[var(--app-border)]/70 hover:bg-[var(--app-surface-muted)]/50 ${
                  selectedRowKeys.includes(row.rowKey)
                    ? "bg-[var(--app-accent)]/10"
                    : ""
                }`}
              >
                <td className="px-2 py-1 text-[var(--app-text-muted)] tabular-nums">
                  <button
                    type="button"
                    onClick={(event) =>
                      toggleRowSelection(row.rowKey, event.shiftKey)
                    }
                    className="rounded px-1 hover:bg-[var(--app-accent)]/10"
                    title="Click: seleccionar fila · Shift+click: rango"
                  >
                    {rowIndex + 1}
                  </button>
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
                      onPaste={handleCellPaste}
                      onKeyDown={handleCellKeyDown}
                      autoFocus
                      className={`${inputField} h-7 w-24 text-xs`}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPasteAnchor({ rowKey: row.rowKey, column: "x", kind: "cell" });
                        startEditCell(row.rowKey, "x", row.x);
                      }}
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
                          onPaste={handleCellPaste}
                          onKeyDown={handleCellKeyDown}
                          autoFocus
                          className={`${inputField} h-7 w-24 text-xs`}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPasteAnchor({
                              rowKey: row.rowKey,
                              column: column.seriesId,
                              kind: "cell",
                            });
                            startEditCell(
                              row.rowKey,
                              column.seriesId,
                              cellValue
                            );
                          }}
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
        <button type="button" onClick={handleInsertColumn} className={btnOutlineSm}>
          Columna
        </button>
        <button
          type="button"
          onClick={() => void copySelectionToClipboard()}
          className={btnOutlineSm}
        >
          Copiar selección
        </button>
        <p
          className={`${fieldLabel} mb-0 normal-case tracking-normal text-[var(--app-text-muted)]`}
        >
          Ctrl+V pega desde Excel · Ctrl+C copia TSV · Menú ⋮ por columna ·
          Click en ID/encabezado para seleccionar
        </p>
      </div>

      <WorksheetFormulaBuilderModal
        open={formulaBuilder !== null}
        anchorColumnLabel={formulaBuilder?.anchorColumnLabel ?? ""}
        xColumnLabel={baseModel.xColumnLabel}
        columns={baseModel.columns}
        errorMessage={formulaBuilderError}
        onClose={closeFormulaBuilder}
        onSubmit={handleFormulaSubmit}
        btnOutlineSm={btnOutlineSm}
        btnPrimary={btnPrimary}
        inputField={inputField}
        fieldLabel={fieldLabel}
      />

      <WorksheetColumnHistoryModal
        open={columnHistory !== null}
        lineage={activeColumnLineage}
        onClose={closeColumnHistory}
        btnOutlineSm={btnOutlineSm}
        fieldLabel={fieldLabel}
      />
    </div>
  );
}

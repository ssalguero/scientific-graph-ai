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
  applyWorksheetModelUpdatePreservingEmptyRows,
  buildColumnRegistryFromImportAuxiliary,
  experimentalSeriesPointsEqual,
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
import { DS_FOCUS_RING } from "@/lib/ui/focus-ring";

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
  datasetResetKey?: string | null;
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
  datasetResetKey = null,
}: ScientificWorksheetPanelProps) {
  const [emptyRowXs, setEmptyRowXs] = useState<number[]>([]);
  const baseModel = useMemo(
    () => seriesToWorksheet(series, emptyRowXs),
    [series, emptyRowXs]
  );
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
    setEmptyRowXs([]);
  }, [datasetResetKey]);

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

  const applyPreservingUpdate = (
    updater: Parameters<typeof applyWorksheetModelUpdatePreservingEmptyRows>[1]
  ) => {
    const previousExtraXs = emptyRowXs;
    const result = applyWorksheetModelUpdatePreservingEmptyRows(
      series,
      updater,
      previousExtraXs
    );
    setEmptyRowXs(result.extraXs);
    return { ...result, previousExtraXs };
  };

  const extraXsChanged = (previous: readonly number[], next: readonly number[]) => {
    if (previous.length !== next.length) {
      return true;
    }
    const sortedPrevious = [...previous].sort((left, right) => left - right);
    const sortedNext = [...next].sort((left, right) => left - right);
    return sortedPrevious.some((value, index) => value !== sortedNext[index]);
  };

  const commitSeriesUpdate = (
    updater: Parameters<typeof applyWorksheetModelUpdatePreservingEmptyRows>[1]
  ) => {
    const result = applyPreservingUpdate(updater);
    if (!experimentalSeriesPointsEqual(series, result.series)) {
      onSeriesChange(result.series);
      return;
    }
    if (extraXsChanged(result.previousExtraXs, result.extraXs)) {
      onWorksheetPayloadChange?.({
        columnRegistry,
        modified: true,
      });
    }
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
    const result = applyPreservingUpdate((model) =>
      duplicateWorksheetColumn(model, seriesId)
    );
    const nextSeries = result.series;
    const nextModel = seriesToWorksheet(nextSeries, result.extraXs);
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

    const result = applyPreservingUpdate((model) => {
      const nextModel = transformWorksheetColumn(model, seriesId, transform);
      return nextModel ?? model;
    });
    const nextSeries = result.series;
    const nextModel = seriesToWorksheet(nextSeries, result.extraXs);
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

    const updateResult = applyPreservingUpdate((model) => {
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
    const nextSeries = updateResult.series;

    if (creationError) {
      setFormulaBuilderError(creationError);
      return;
    }

    if (!createdTransform || !createdSeriesId) {
      setFormulaBuilderError("No se pudo crear la columna derivada.");
      return;
    }

    const nextModel = seriesToWorksheet(nextSeries, updateResult.extraXs);
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
    const pasteResult = applyPreservingUpdate((model) => {
      const result = pasteTabularDataIntoModel(model, grid, pasteAnchor);
      pasteChanged = result.changed;
      return result.model;
    });
    if (!experimentalSeriesPointsEqual(series, pasteResult.series)) {
      onSeriesChange(pasteResult.series);
    } else if (extraXsChanged(pasteResult.previousExtraXs, pasteResult.extraXs)) {
      onWorksheetPayloadChange?.({
        columnRegistry,
        modified: true,
      });
    }

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
      <div
        className={`${dataEmptyState} text-center space-y-1`}
        role="status"
      >
        <p className="text-xs font-medium text-[var(--color-text-primary)]">
          Worksheet sin datos
        </p>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Importe un dataset experimental o active uno de la sesión para
          editarlo aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={tableRef}
        tabIndex={0}
        onCopy={handleTableCopy}
        onPaste={handleTablePaste}
        onKeyDown={handleTableKeyDown}
        className={`overflow-x-auto rounded-lg border border-[var(--color-border-default)] ${DS_FOCUS_RING}`}
        aria-label="Worksheet científica"
      >
        <table className="min-w-full text-xs sm:text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--color-surface-canvas)]">
            <tr>
              <th className="px-2 py-1.5 text-left font-semibold text-[var(--color-text-muted)] border-b border-[var(--color-border-default)] whitespace-nowrap">
                ID
              </th>
              <th
                className={`px-2 py-1.5 text-left border-b border-[var(--color-border-default)] whitespace-nowrap ${
                  selectedColumns.includes("x")
                    ? "bg-[var(--color-brand-primary)]/10"
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
                  className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-primary)]"
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
                    className={`px-2 py-1.5 text-left border-b border-[var(--color-border-default)] whitespace-nowrap min-w-[8rem] relative ${
                      selectedColumns.includes(column.seriesId)
                        ? "bg-[var(--color-brand-primary)]/10"
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
                            className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-primary)] text-left"
                            title="Click: seleccionar · Shift+click: rango · Doble click: ordenar"
                          >
                            {column.label}{" "}
                            <span aria-hidden>
                              {sortIndicator(column.seriesId)}
                            </span>
                          </button>
                        )}
                        <span
                          className="ml-1 inline-flex rounded border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-1 py-0 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
                          title={WORKSHEET_COLUMN_TYPE_LABELS[metadata.columnType]}
                        >
                          {WORKSHEET_COLUMN_TYPE_BADGES[metadata.columnType]}
                        </span>
                        {isFormulaDerivedColumnFromMetadata(metadata) ? (
                          <span
                            className="ml-1 inline-flex rounded border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/10 px-1 py-0 text-[9px] font-semibold text-[var(--color-brand-primary)]"
                            title="Creada mediante fórmula"
                          >
                            ƒx
                          </span>
                        ) : null}
                        {isTransformDerivedColumn(metadata) ? (
                          <span
                            className="ml-1 inline-flex rounded border border-[var(--color-feedback-warning)]/30 bg-[color-mix(in_srgb,var(--color-feedback-warning)_16%,var(--color-surface-default))] px-1 py-0 text-[9px] font-semibold text-[var(--color-feedback-warning)]"
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
                          <div className="absolute right-0 mt-1 z-20 min-w-[10rem] rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-default)] py-1 shadow-lg">
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--color-surface-canvas)]"
                              onClick={() =>
                                startRenameColumn(column.seriesId, column.label)
                              }
                            >
                              Renombrar
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--color-surface-canvas)]"
                              onClick={() => handleDuplicateColumn(column.seriesId)}
                            >
                              Duplicar
                            </button>
                            <div className="my-1 border-t border-[var(--color-border-default)]" />
                            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
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
                                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--color-surface-canvas)]"
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
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--color-surface-canvas)]"
                              onClick={() =>
                                openFormulaBuilder(column.seriesId, column.label)
                              }
                            >
                              Crear fórmula...
                            </button>
                            <div className="my-1 border-t border-[var(--color-border-default)]" />
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--color-surface-canvas)]"
                              onClick={() => openColumnHistory(column.seriesId)}
                            >
                              Ver historial
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--color-surface-canvas)]"
                              onClick={() => void handleCopyColumn(column.seriesId)}
                            >
                              Copiar columna
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs text-[var(--color-feedback-danger)] hover:bg-[color-mix(in_srgb,var(--color-feedback-danger)_14%,var(--color-surface-default))]"
                              onClick={() => handleDeleteColumn(column.seriesId)}
                            >
                              Eliminar
                            </button>
                            <div className="my-1 border-t border-[var(--color-border-default)]" />
                            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
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
                                className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--color-surface-canvas)] ${
                                  metadata.columnType === columnType
                                    ? "font-semibold text-[var(--color-brand-primary)]"
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
              <th className="px-2 py-1.5 text-right border-b border-[var(--color-border-default)] whitespace-nowrap">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rowIndex) => (
              <tr
                key={row.rowKey}
                className={`border-b border-[var(--color-border-default)]/70 hover:bg-[var(--color-surface-canvas)]/50 ${
                  selectedRowKeys.includes(row.rowKey)
                    ? "bg-[var(--color-brand-primary)]/10"
                    : ""
                }`}
              >
                <td className="px-2 py-1 text-[var(--color-text-muted)] tabular-nums">
                  <button
                    type="button"
                    onClick={(event) =>
                      toggleRowSelection(row.rowKey, event.shiftKey)
                    }
                    className="rounded px-1 hover:bg-[var(--color-brand-primary)]/10"
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
                      className="w-full text-left rounded px-1 py-0.5 hover:bg-[var(--color-brand-primary)]/10"
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
                          className="w-full text-left rounded px-1 py-0.5 hover:bg-[var(--color-brand-primary)]/10"
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
                    className={`${btnOutlineSm} text-[var(--color-feedback-danger)] border-[color-mix(in_srgb,var(--color-feedback-danger)_35%,var(--color-border-default))] hover:bg-[color-mix(in_srgb,var(--color-feedback-danger)_14%,var(--color-surface-default))]`}
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
          className={`${fieldLabel} mb-0 normal-case tracking-normal text-[var(--color-text-muted)]`}
        >
          Ctrl+V pega desde Excel · Ctrl+C copia TSV · Menú ⋮ por columna ·
          Click en ID/encabezado para seleccionar
        </p>
      </div>

      <p
        className="text-[11px] text-[var(--color-text-muted)]"
        role="status"
        aria-label="Resumen de worksheet"
      >
        {statusSummary.rowCount} filas · {statusSummary.columnCount} columnas ·{" "}
        {statusSummary.numericVariables} numéricas
        {statusSummary.categoricalVariables > 0
          ? ` · ${statusSummary.categoricalVariables} categóricas`
          : ""}
        {modified ? " · modificado" : ""}
        {clipboardMessage ? ` · ${clipboardMessage}` : ""}
      </p>

      {auxiliaryColumns.length > 0 ? (
        <details className="text-xs text-[var(--color-text-muted)]">
          <summary className="cursor-pointer font-medium text-[var(--color-text-primary)]">
            Columnas auxiliares ({auxiliaryColumns.length})
          </summary>
          <div className="mt-1 space-y-1">
            {auxiliaryColumns.map((column) => (
              <div key={column.id}>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {column.label}
                </span>{" "}
                ({column.role === "replicate"
                  ? "Réplica"
                  : column.role === "group"
                    ? "Grupo"
                    : "Condición"}
                ) · {Object.keys(column.valuesByRowIndex).length} valores
              </div>
            ))}
          </div>
        </details>
      ) : null}

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

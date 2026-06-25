"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExperimentalDataSourceId } from "@/lib/experimentalData";
import {
  buildInitialWizardState,
  refreshWizardState,
  runWizardImport,
  type WorkbookAnalysis,
  type WizardImportState,
  type WizardStep,
  type ImportReport,
  type ImportAuxiliaryColumn,
} from "@/lib/import";
import { detectTableRegion } from "@/lib/import/detect-table";
import { buildColumnDescriptors } from "@/lib/import/detect-header";
import { suggestAxisMapping, suggestMultiSeriesMapping } from "@/lib/import/map";
import { ImportPreviewPanel } from "./ImportPreviewPanel";
import { ImportRegionPreview } from "./ImportRegionPreview";

type WorkbookImportWizardProps = {
  open: boolean;
  analysis: WorkbookAnalysis;
  sourceId: ExperimentalDataSourceId;
  onClose: () => void;
  onComplete: (payload: {
    series: import("@/lib/experimentalData").ExperimentalSeries[];
    report: ImportReport;
    auxiliaryColumns?: ImportAuxiliaryColumn[];
  }) => void;
};

const STEPS: WizardStep[] = ["sheet", "table", "columns", "confirm"];

const stepLabel: Record<WizardStep, string> = {
  sheet: "Hoja",
  table: "Tabla",
  columns: "Columnas",
  confirm: "Confirmar",
};

const inputClass =
  "w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]";
const btnPrimary =
  "rounded-lg bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
const btnSecondary =
  "rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-text)]";

export function WorkbookImportWizard({
  open,
  analysis,
  sourceId,
  onClose,
  onComplete,
}: WorkbookImportWizardProps) {
  const [state, setState] = useState<WizardImportState | null>(() =>
    buildInitialWizardState(analysis, sourceId)
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [highlightedRowIndex, setHighlightedRowIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (open) {
      setState(buildInitialWizardState(analysis, sourceId));
      setSubmitError(null);
    }
  }, [analysis, open, sourceId]);

  const stepIndex = state ? STEPS.indexOf(state.step) : 0;

  const updateState = useCallback(
    (updater: (current: WizardImportState) => WizardImportState) => {
      setState((current) => {
        if (!current) return current;
        const next = updater(current);
        return refreshWizardState(next, sourceId);
      });
    },
    [sourceId]
  );

  const selectedSheetMatrix = useMemo(() => {
    return (
      analysis.snapshot.sheets.find(
        (item) => item.name === state?.selectedSheetName
      )?.matrix ?? []
    );
  }, [analysis.snapshot.sheets, state?.selectedSheetName]);

  const xSuggestion = useMemo(
    () =>
      state?.suggestions.find(
        (item) => item.index === state.mapping.xColumnIndex
      ),
    [state?.suggestions, state?.mapping.xColumnIndex]
  );

  const ySuggestion = useMemo(
    () =>
      state?.suggestions.find(
        (item) => item.index === state.mapping.yColumnIndex
      ),
    [state?.suggestions, state?.mapping.yColumnIndex]
  );

  if (!open || !state) return null;

  const goNext = () => {
    const next = STEPS[Math.min(stepIndex + 1, STEPS.length - 1)];
    updateState((current) => ({ ...current, step: next }));
  };

  const goBack = () => {
    const prev = STEPS[Math.max(stepIndex - 1, 0)];
    updateState((current) => ({ ...current, step: prev }));
  };

  const handleImport = () => {
    const result = runWizardImport(state, sourceId);
    if (!result || result.series.length === 0) {
      setSubmitError(
        result?.validation.errors[0]?.message ??
          "No se pudo importar con la configuración actual"
      );
      return;
    }
    onComplete({
      series: result.series,
      report: result.report,
      auxiliaryColumns: result.auxiliaryColumns,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl">
        <div className="border-b border-[var(--app-border)] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--app-heading)]">
                Asistente de importación
              </h2>
              <p className="text-sm text-[var(--app-text-muted)]">
                {analysis.snapshot.fileName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            >
              Cerrar
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {STEPS.map((step, index) => (
              <span
                key={step}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  index === stepIndex
                    ? "bg-[var(--app-accent)] text-white"
                    : "bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]"
                }`}
              >
                {index + 1}. {stepLabel[step]}
              </span>
            ))}
          </div>
        </div>

        <div className="max-h-[55vh] overflow-auto px-5 py-4 space-y-4">
          {state.step === "sheet" && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--app-text-muted)]">
                Seleccione la hoja que contiene la tabla experimental.
              </p>
              <div className="space-y-2">
                {analysis.sheets.map((sheet) => (
                  <label
                    key={sheet.name}
                    className={`flex cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2 ${
                      state.selectedSheetName === sheet.name
                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                        : "border-[var(--app-border)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sheet"
                        checked={state.selectedSheetName === sheet.name}
                        onChange={() => {
                          const selectedSheet = analysis.snapshot.sheets.find(
                            (item) => item.name === sheet.name
                          );
                          if (!selectedSheet) return;
                          const region = detectTableRegion(selectedSheet.matrix);
                          if (!region) return;
                          const columnDescriptors = buildColumnDescriptors(
                            selectedSheet.matrix,
                            region
                          );
                          const mapping =
                            suggestMultiSeriesMapping(
                              selectedSheet.matrix,
                              region,
                              columnDescriptors
                            ) ??
                            suggestAxisMapping(
                              selectedSheet.matrix,
                              region,
                              columnDescriptors
                            ) ??
                            state.mapping;
                          setState(
                            refreshWizardState(
                              {
                                ...state,
                                selectedSheetName: sheet.name,
                                region,
                                mapping,
                                seriesName: sheet.name,
                                columnDescriptors,
                              },
                              sourceId
                            )
                          );
                        }}
                      />
                      <span className="font-medium text-[var(--app-heading)]">
                        {sheet.name}
                      </span>
                      <span className="text-xs text-[var(--app-text-muted)]">
                        {sheet.kind} · {sheet.rowCount} filas
                      </span>
                    </div>
                    {sheet.warnings[0] && (
                      <span className="text-xs text-[var(--app-text-muted)]">
                        {sheet.warnings[0]}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {state.step === "table" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--app-heading)]">
                Fila de encabezados
              </label>
              <input
                type="number"
                min={0}
                max={Math.max(0, state.region.endRow)}
                value={state.region.headerRowIndex}
                className={inputClass}
                onChange={(event) => {
                  const headerRowIndex = Number(event.target.value);
                  const sheet = analysis.snapshot.sheets.find(
                    (item) => item.name === state.selectedSheetName
                  );
                  if (!sheet) return;
                  const region = detectTableRegion(sheet.matrix, headerRowIndex);
                  if (!region) return;
                  updateState((current) => ({ ...current, region }));
                }}
              />
              <ImportRegionPreview
                matrix={selectedSheetMatrix}
                region={state.region}
                highlightedRowIndex={highlightedRowIndex}
              />
            </div>
          )}

          {state.step === "columns" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--app-heading)]">
                  Columna X
                </label>
                <select
                  className={inputClass}
                  value={state.mapping.xColumnIndex}
                  onChange={(event) => {
                    const index = Number(event.target.value);
                    const descriptor = state.columnDescriptors.find(
                      (item) => item.index === index
                    );
                    updateState((current) => ({
                      ...current,
                      mapping: {
                        ...current.mapping,
                        xColumnIndex: index,
                        xLabel: descriptor?.label ?? current.mapping.xLabel,
                      },
                    }));
                  }}
                >
                  {state.columnDescriptors.map((descriptor) => (
                    <option key={descriptor.index} value={descriptor.index}>
                      {descriptor.label}
                    </option>
                  ))}
                </select>
                {xSuggestion && (
                  <p className="mt-1.5 text-xs text-[var(--app-text-muted)]">
                    Razón de selección: {xSuggestion.reason}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--app-heading)]">
                  Columna Y
                </label>
                <select
                  className={inputClass}
                  value={state.mapping.yColumnIndex}
                  onChange={(event) => {
                    const index = Number(event.target.value);
                    const descriptor = state.columnDescriptors.find(
                      (item) => item.index === index
                    );
                    updateState((current) => ({
                      ...current,
                      mapping: {
                        ...current.mapping,
                        yColumnIndex: index,
                        yLabel: descriptor?.label ?? current.mapping.yLabel,
                      },
                    }));
                  }}
                >
                  {state.columnDescriptors.map((descriptor) => (
                    <option key={descriptor.index} value={descriptor.index}>
                      {descriptor.label}
                    </option>
                  ))}
                </select>
                {ySuggestion && (
                  <p className="mt-1.5 text-xs text-[var(--app-text-muted)]">
                    Razón de selección: {ySuggestion.reason}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <ImportRegionPreview
                  matrix={selectedSheetMatrix}
                  region={state.region}
                  highlightColumns={{
                    xIndex: state.mapping.xColumnIndex,
                    yIndex: state.mapping.yColumnIndex,
                  }}
                  highlightedRowIndex={highlightedRowIndex}
                  showConfidence={false}
                />
              </div>
              {state.mapping.yColumnIndices &&
              state.mapping.yColumnIndices.length >= 2 ? (
                <p className="sm:col-span-2 text-xs text-[var(--app-accent)]">
                  Layout multi-serie detectado:{" "}
                  {state.mapping.yColumnIndices.length} series Y side-by-side.
                </p>
              ) : null}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[var(--app-heading)]">
                  Nombre de la serie
                </label>
                <input
                  className={inputClass}
                  value={state.seriesName}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      seriesName: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}

          {state.step === "confirm" && (
            <div className="space-y-3">
              {state.mapping.yColumnIndices &&
              state.mapping.yColumnIndices.length >= 2 ? (
                <p className="text-sm text-[var(--app-accent)]">
                  Se importarán {state.mapping.yColumnIndices.length} series desde
                  columnas Y side-by-side.
                </p>
              ) : null}
              <ImportPreviewPanel
                preview={state.preview}
                validation={state.validation}
                xLabel={state.mapping.xLabel}
                yLabel={state.mapping.yLabel}
                highlightedRowIndex={highlightedRowIndex}
                onDiscardedRowSelect={setHighlightedRowIndex}
              />
              {submitError && (
                <p className="text-sm text-[var(--app-danger-text)]">{submitError}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--app-border)] px-5 py-4">
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button type="button" className={btnSecondary} onClick={goBack}>
                Atrás
              </button>
            )}
            {state.step !== "confirm" ? (
              <button type="button" className={btnPrimary} onClick={goNext}>
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                className={btnPrimary}
                disabled={!state.validation.ok}
                onClick={handleImport}
              >
                Importar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

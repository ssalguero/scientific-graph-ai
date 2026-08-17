"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { ImportReportPanel } from "@/components/import/ImportReportPanel";
import { DestinationReportDrawer } from "@/components/import/DestinationReportDrawer";
import { WorkbookImportWizard } from "@/components/import/WorkbookImportWizard";
import { WorkspaceIcon } from "@/components/workspace/iconography/WorkspaceIcon";
import {
  formatImportReportLines,
  type ImportAuxiliaryColumn,
  type ImportReport,
  type WorkbookAnalysis,
} from "@/lib/import";
import type {
  ExperimentalDataSourceId,
  ExperimentalSeries,
} from "@/lib/graph/series";
import type { ComparisonDatasetInfo } from "@/lib/scientific/comparison";
import {
  capabilityAccentBridgeStyle,
  capabilityAccentCssVar,
} from "@/lib/smart-start/capability-accents";
import { alertError } from "@/lib/ui";
import {
  DS_FOCUS_RING,
  DS_MOTION_ENTER,
  DS_MOTION_FEEDBACK,
} from "@/lib/ui/focus-ring";

const SUPPORTED_FORMATS = ["CSV", "TXT", "XLSX", "XLS", "ODS"] as const;
type ImportarFormat = (typeof SUPPORTED_FORMATS)[number];

const FORMAT_SOURCE: Record<ImportarFormat, ExperimentalDataSourceId> = {
  CSV: "csv",
  TXT: "txt",
  XLSX: "xlsx",
  XLS: "xlsx",
  ODS: "ods",
};

const FORMAT_ACCEPT: Record<ImportarFormat, string> = {
  CSV: ".csv,text/csv",
  TXT: ".txt,text/plain",
  XLSX: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  XLS: ".xls,application/vnd.ms-excel",
  ODS: ".ods,application/vnd.oasis.opendocument.spreadsheet",
};

const FORMAT_EXTENSIONS: Record<ImportarFormat, readonly string[]> = {
  CSV: [".csv"],
  TXT: [".txt"],
  XLSX: [".xlsx"],
  XLS: [".xls"],
  ODS: [".ods"],
};

const PINK = capabilityAccentCssVar("pink");

const continueSecondaryClass = [
  "inline-flex h-11 items-center justify-center rounded-2xl",
  "bg-transparent px-5",
  "text-[length:var(--typography-body-lg-font-size)] font-medium",
  "text-[var(--color-text-muted)]",
  "disabled:cursor-not-allowed disabled:opacity-40",
  DS_FOCUS_RING,
  DS_MOTION_FEEDBACK,
].join(" ");

const continuePrimaryClass = [
  "inline-flex h-12 items-center justify-center rounded-2xl",
  "px-10 text-[length:var(--typography-body-lg-font-size)] font-semibold",
  "text-[var(--color-text-inverse)] min-w-[14rem]",
  "disabled:cursor-not-allowed disabled:opacity-50",
  DS_FOCUS_RING,
  DS_MOTION_FEEDBACK,
].join(" ");

const importPrimaryClass = [
  "inline-flex h-12 items-center justify-center rounded-2xl",
  "px-10 text-[length:var(--typography-body-lg-font-size)] font-semibold",
  "text-[var(--color-text-inverse)] min-w-[14rem]",
  "disabled:opacity-45 disabled:cursor-not-allowed",
  DS_FOCUS_RING,
  DS_MOTION_FEEDBACK,
].join(" ");

const selectFileClass = [
  "inline-flex h-11 items-center justify-center rounded-2xl px-6",
  "text-[length:var(--typography-body-lg-font-size)] font-semibold",
  "text-[var(--color-text-primary)]",
  "bg-[var(--color-surface-default)]",
  DS_FOCUS_RING,
  DS_MOTION_FEEDBACK,
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const reportToggleClass = [
  "inline-flex h-11 items-center justify-center rounded-2xl px-5",
  "text-[length:var(--typography-body-font-size)] font-medium",
  "text-[var(--color-text-muted)] bg-transparent",
  DS_FOCUS_RING,
  DS_MOTION_FEEDBACK,
].join(" ");

const changeFileClass = [
  "inline-flex h-11 items-center justify-center rounded-2xl px-5",
  "text-[length:var(--typography-body-lg-font-size)] font-semibold",
  "text-[var(--color-text-primary)] bg-transparent",
  DS_FOCUS_RING,
  DS_MOTION_FEEDBACK,
].join(" ");

function formatFromSource(sourceId: ExperimentalDataSourceId): ImportarFormat {
  if (sourceId === "txt") return "TXT";
  if (sourceId === "ods") return "ODS";
  if (sourceId === "xlsx") return "XLSX";
  return "CSV";
}

function fileMatchesFormat(fileName: string, format: ImportarFormat): boolean {
  const lower = fileName.toLowerCase();
  return FORMAT_EXTENSIONS[format].some((ext) => lower.endsWith(ext));
}

const PREVIEW_ROW_LIMIT = 6;

type ImportPreviewRow = {
  x: number;
  y: number;
  seriesName: string;
};

function buildImportPreview(series: readonly ExperimentalSeries[]): {
  rows: ImportPreviewRow[];
  showSeries: boolean;
} {
  const rows: ImportPreviewRow[] = [];
  for (const item of series) {
    for (const point of item.points) {
      if (rows.length >= PREVIEW_ROW_LIMIT) {
        return { rows, showSeries: series.length > 1 };
      }
      rows.push({ x: point.x, y: point.y, seriesName: item.name });
    }
  }
  return { rows, showSeries: series.length > 1 };
}

function formatPreviewNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Number.isInteger(value) ? String(value) : String(value);
}

type ImportarDestinationProps = {
  selectedDataSourceId: ExperimentalDataSourceId;
  onSourceChange: (sourceId: ExperimentalDataSourceId) => void;
  canImport: boolean;
  isImporting: boolean;
  importError: string | null;
  lastImportReport: ImportReport | null;
  importReportHasIssues: boolean;
  currentDatasetInfo: ComparisonDatasetInfo | null;
  experimentalSeries: readonly ExperimentalSeries[];
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onContinueToDatos: () => void;
  workbookWizard: {
    open: boolean;
    analysis: WorkbookAnalysis | null;
  };
  onCloseWizard: () => void;
  onWizardComplete: (result: {
    series: ExperimentalSeries[];
    report: ImportReport;
    auxiliaryColumns?: ImportAuxiliaryColumn[];
  }) => void;
};

/**
 * CRP-6.4.D.7.3 — Importar destination; READY rhythm calibration. Report lives in drawer.
 */
export function ImportarDestination({
  selectedDataSourceId,
  onSourceChange,
  canImport,
  isImporting,
  importError,
  lastImportReport,
  importReportHasIssues,
  currentDatasetInfo,
  experimentalSeries,
  onImportFile,
  onContinueToDatos,
  workbookWizard,
  onCloseWizard,
  onWizardComplete,
}: ImportarDestinationProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectFileButtonRef = useRef<HTMLButtonElement | null>(null);
  const importInFlightRef = useRef(false);
  const [selectedFormat, setSelectedFormat] = useState<ImportarFormat>(() =>
    formatFromSource(selectedDataSourceId)
  );
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [formatReject, setFormatReject] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reacquiring, setReacquiring] = useState(false);
  const reportToggleRef = useRef<HTMLButtonElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const datasetReady = Boolean(currentDatasetInfo) && !reacquiring;
  const accept = FORMAT_ACCEPT[selectedFormat];

  useEffect(() => {
    if (!reacquiring) {
      importInFlightRef.current = false;
      return;
    }
    if (isImporting) {
      importInFlightRef.current = true;
      return;
    }
    if (!importInFlightRef.current) return;
    importInFlightRef.current = false;
    if (!importError && currentDatasetInfo) {
      setReacquiring(false);
    }
  }, [reacquiring, isImporting, importError, currentDatasetInfo]);

  useEffect(() => {
    if (!reacquiring || datasetReady) return;
    selectFileButtonRef.current?.focus();
  }, [reacquiring, datasetReady]);

  const changeFile = () => {
    setDetailsOpen(false);
    setStagedFile(null);
    setFormatReject(null);
    setIsDragOver(false);
    importInFlightRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (workbookWizard.open) onCloseWizard();
    setReacquiring(true);
  };

  const stageFile = (file: File | undefined) => {
    if (!file) return;
    if (!fileMatchesFormat(file.name, selectedFormat)) {
      setStagedFile(null);
      setFormatReject(
        `El archivo no coincide con ${selectedFormat}. Seleccione un archivo ${selectedFormat}.`
      );
      return;
    }
    setFormatReject(null);
    setStagedFile(file);
  };

  const commitImport = () => {
    const input = fileInputRef.current;
    if (!input || !stagedFile || !canImport || isImporting) return;
    const transfer = new DataTransfer();
    transfer.items.add(stagedFile);
    input.files = transfer.files;
    onImportFile({
      target: input,
      currentTarget: input,
    } as ChangeEvent<HTMLInputElement>);
  };

  const onFormatSelect = (format: ImportarFormat) => {
    setSelectedFormat(format);
    onSourceChange(FORMAT_SOURCE[format]);
    if (stagedFile && !fileMatchesFormat(stagedFile.name, format)) {
      setStagedFile(null);
    }
    setFormatReject(null);
  };

  const onHiddenFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    stageFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    stageFile(event.dataTransfer.files?.[0]);
  };

  const formatHint = useMemo(
    () => `Formato seleccionado: ${selectedFormat}`,
    [selectedFormat]
  );

  const preview = useMemo(
    () => buildImportPreview(experimentalSeries ?? []),
    [experimentalSeries]
  );

  const readyMeta = useMemo(() => {
    const points =
      lastImportReport?.importedPointCount ??
      currentDatasetInfo?.observationCount;
    const seriesCount = currentDatasetInfo?.seriesCount;
    const parts: string[] = [selectedFormat];
    if (typeof points === "number") parts.push(`${points} puntos`);
    if (typeof seriesCount === "number") parts.push(`${seriesCount} series`);
    return parts.join(" · ");
  }, [
    currentDatasetInfo?.observationCount,
    currentDatasetInfo?.seriesCount,
    lastImportReport?.importedPointCount,
    selectedFormat,
  ]);

  const downloadImportReport = () => {
    if (!lastImportReport) return;
    const fileName =
      currentDatasetInfo?.fileName ?? lastImportReport.fileName ?? "importacion";
    const stem = fileName.replace(/\.[^.]+$/, "") || "importacion";
    const body = [
      "Informe de importación",
      importReportHasIssues
        ? "Importación con avisos"
        : "Importación completada",
      fileName,
      readyMeta,
      "",
      ...formatImportReportLines(lastImportReport),
    ].join("\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${stem}-informe-importacion.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const identity = (
    <header className="flex flex-col items-center text-center">
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-2xl ${
          datasetReady ? "size-10 [&_svg]:size-6" : "size-14 [&_svg]:size-9"
        }`}
        style={{
          color: PINK,
          backgroundColor: `color-mix(in srgb, ${PINK} 14%, var(--color-surface-default))`,
        }}
      >
        <WorkspaceIcon name="cap-import" size="lg" />
      </span>
      <div
        className={
          datasetReady
            ? "mt-1.5 space-y-0.5 [@media(max-height:720px)]:mt-1 [@media(max-height:720px)]:space-y-0"
            : "mt-4 space-y-2"
        }
      >
        <h2 className="text-[36px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
          {datasetReady ? "Datos listos" : "Importar"}
        </h2>
        {datasetReady ? (
          <>
            <p className="text-[length:var(--typography-body-lg-font-size)] font-semibold leading-[var(--typography-body-lg-line-height)] text-[var(--color-text-primary)]">
              {currentDatasetInfo?.fileName}
            </p>
            <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
              {readyMeta}
            </p>
          </>
        ) : (
          <p className="text-[length:var(--typography-body-lg-font-size)] leading-[var(--typography-body-lg-line-height)] text-[var(--color-text-muted)]">
            Elija el formato y suba su archivo.
          </p>
        )}
      </div>
    </header>
  );

  const formatButtons = (
    <div className="flex flex-wrap items-center justify-center gap-3" role="group" aria-label="Formato">
      {SUPPORTED_FORMATS.map((format) => {
        const selected = selectedFormat === format;
        return (
          <button
            key={format}
            type="button"
            aria-pressed={selected}
            aria-label={format}
            disabled={isImporting}
            onClick={() => onFormatSelect(format)}
            className={[
              "cursor-pointer rounded-2xl h-11 px-5",
              "text-[length:var(--typography-body-lg-font-size)] font-semibold tracking-tight",
              DS_FOCUS_RING,
              DS_MOTION_FEEDBACK,
              "disabled:cursor-not-allowed disabled:opacity-50",
            ].join(" ")}
            style={
              selected
                ? {
                    color: "var(--color-text-inverse)",
                    backgroundColor: PINK,
                  }
                : {
                    color: PINK,
                    backgroundColor: `color-mix(in srgb, ${PINK} 10%, var(--color-surface-default))`,
                  }
            }
          >
            {format}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className={`mx-auto flex w-full max-w-[48rem] flex-col items-center px-[var(--spacing-default)] py-2 text-center ${DS_MOTION_ENTER}`}
      data-importar-destination=""
      aria-label="Importar"
      style={capabilityAccentBridgeStyle}
    >
      {identity}

      {!datasetReady ? (
        <>
          <div className="mt-5 flex w-full flex-col items-center">
          {formatButtons}

          <div
            className={`mt-3 flex w-full min-h-[10rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-8 py-7 ${DS_MOTION_FEEDBACK}`}
            style={{
              borderColor: isDragOver
                ? PINK
                : `color-mix(in srgb, ${PINK} 32%, transparent)`,
              backgroundColor: isDragOver
                ? `color-mix(in srgb, ${PINK} 14%, var(--color-surface-default))`
                : `color-mix(in srgb, ${PINK} 8%, var(--color-surface-default))`,
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            aria-describedby="importar-format-hint"
          >
            <p className="text-[length:var(--typography-body-lg-font-size)] font-medium text-[var(--color-text-primary)]">
              Arrastre su archivo aquí
            </p>
            <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
              o
            </p>
            <button
              ref={selectFileButtonRef}
              type="button"
              className={selectFileClass}
              onClick={() => fileInputRef.current?.click()}
              disabled={!canImport || isImporting}
            >
              Seleccionar archivo
            </button>
            <p
              id="importar-format-hint"
              className={`text-[length:var(--typography-body-lg-font-size)] ${
                stagedFile
                  ? "font-semibold text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {stagedFile ? stagedFile.name : formatHint}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={onHiddenFileChange}
              disabled={isImporting}
            />
          </div>

          <button
            type="button"
            onClick={commitImport}
            disabled={!canImport || isImporting || !stagedFile}
            className={`mt-5 ${importPrimaryClass}`}
            style={{ backgroundColor: PINK }}
            aria-busy={isImporting}
          >
            {isImporting ? "Importando…" : "Importar datos"}
          </button>
          </div>

          {isImporting ? (
            <p
              className="text-[length:var(--typography-body-font-size)] font-medium"
              style={{ color: PINK }}
              role="status"
              aria-live="polite"
            >
              Leyendo archivo…
            </p>
          ) : null}

          {formatReject || importError ? (
            <p className={`${alertError} text-left`} role="alert">
              {formatReject ?? importError}
            </p>
          ) : null}

          <button
            type="button"
            className={`mt-2 ${continueSecondaryClass}`}
            onClick={onContinueToDatos}
            disabled
          >
            Continuar a Datos
          </button>
        </>
      ) : (
        <div
          className={`mt-2 flex w-full flex-col items-center [@media(max-height:720px)]:mt-0 ${DS_MOTION_ENTER}`}
        >
          <div
            className="w-full overflow-hidden rounded-2xl"
            style={{
              backgroundColor: `color-mix(in srgb, ${PINK} 8%, var(--color-surface-default))`,
            }}
          >
          {preview.rows.length > 0 ? (
            <div className="px-5 pt-3 pb-2 [@media(max-height:720px)]:pt-1.5 [@media(max-height:720px)]:pb-1">
              <table className="w-full border-collapse text-left" aria-label="Vista previa de datos importados">
                <thead>
                  <tr>
                    <th className="pb-1 text-[length:var(--typography-body-font-size)] font-semibold text-[var(--color-text-muted)] [@media(max-height:720px)]:pb-0.5">
                      X
                    </th>
                    <th className="pb-1 text-[length:var(--typography-body-font-size)] font-semibold text-[var(--color-text-muted)] [@media(max-height:720px)]:pb-0.5">
                      Y
                    </th>
                    {preview.showSeries ? (
                      <th className="pb-1 text-[length:var(--typography-body-font-size)] font-semibold text-[var(--color-text-muted)] [@media(max-height:720px)]:pb-0.5">
                        Serie
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, index) => (
                    <tr key={`${row.seriesName}-${index}`}>
                      <td className="py-0.5 text-[length:var(--typography-body-lg-font-size)] tabular-nums text-[var(--color-text-primary)] [@media(max-height:720px)]:py-0">
                        {formatPreviewNumber(row.x)}
                      </td>
                      <td className="py-0.5 text-[length:var(--typography-body-lg-font-size)] tabular-nums text-[var(--color-text-primary)] [@media(max-height:720px)]:py-0">
                        {formatPreviewNumber(row.y)}
                      </td>
                      {preview.showSeries ? (
                        <td className="py-0.5 text-[length:var(--typography-body-font-size)] text-[var(--color-text-primary)] [@media(max-height:720px)]:py-0">
                          {row.seriesName}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {lastImportReport ? (
            <div
              className="flex w-full flex-wrap items-start justify-center gap-x-6 gap-y-2 px-5 py-2 [@media(max-height:720px)]:py-1"
              role="status"
            >
              <div className="min-w-[5.5rem] text-center">
                <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
                  Puntos importados
                </p>
                <p className="mt-1 [@media(max-height:720px)]:mt-0.5 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {lastImportReport.importedPointCount}
                </p>
              </div>
              {currentDatasetInfo ? (
                <div className="min-w-[5.5rem] text-center">
                  <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
                    Series
                  </p>
                  <p className="mt-1 [@media(max-height:720px)]:mt-0.5 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums text-[var(--color-text-primary)]">
                    {currentDatasetInfo.seriesCount}
                  </p>
                </div>
              ) : null}
              <div className="min-w-[5.5rem] text-center">
                <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
                  Cobertura
                </p>
                <p className="mt-1 [@media(max-height:720px)]:mt-0.5 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {Math.round(lastImportReport.coverageRatio * 100)}%
                </p>
              </div>
              <div className="min-w-[5.5rem] text-center">
                <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
                  Advertencias
                </p>
                <p
                  className={`mt-1 [@media(max-height:720px)]:mt-0.5 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums ${
                    lastImportReport.warningCount > 0
                      ? "text-[var(--app-warning-text)]"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {lastImportReport.warningCount}
                </p>
              </div>
              <div className="min-w-[5.5rem] text-center">
                <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
                  Errores
                </p>
                <p
                  className={`mt-1 [@media(max-height:720px)]:mt-0.5 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums ${
                    lastImportReport.errorCount > 0
                      ? "text-[var(--app-danger-text)]"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {lastImportReport.errorCount}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-wrap items-start justify-center gap-x-6 gap-y-2 px-5 py-2 [@media(max-height:720px)]:py-1">
              <div className="min-w-[5.5rem] text-center">
                <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
                  Observaciones
                </p>
                <p className="mt-1 [@media(max-height:720px)]:mt-0.5 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {currentDatasetInfo?.observationCount}
                </p>
              </div>
              <div className="min-w-[5.5rem] text-center">
                <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
                  Series
                </p>
                <p className="mt-1 [@media(max-height:720px)]:mt-0.5 text-[length:var(--typography-heading-sm-font-size)] font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {currentDatasetInfo?.seriesCount}
                </p>
              </div>
            </div>
          )}
          </div>

          <p
            className={`mt-2 text-[length:var(--typography-body-lg-font-size)] font-semibold [@media(max-height:720px)]:mt-1 ${
              importReportHasIssues
                ? "text-[var(--app-warning-text)]"
                : "text-[var(--color-text-primary)]"
            }`}
            role="status"
          >
            {importReportHasIssues
              ? "Importación con avisos"
              : "Importación completada"}
          </p>

          <button
            type="button"
            className={`mt-2 [@media(max-height:720px)]:mt-1 ${continuePrimaryClass}`}
            style={{ backgroundColor: PINK }}
            onClick={onContinueToDatos}
          >
            Continuar a Datos
          </button>

          <button
            type="button"
            className={`mt-1 [@media(max-height:720px)]:mt-0 ${changeFileClass}`}
            onClick={changeFile}
          >
            Cambiar archivo
          </button>

          {lastImportReport ? (
            <>
              <button
                ref={reportToggleRef}
                type="button"
                onClick={() => setDetailsOpen(true)}
                className={`mt-1 [@media(max-height:720px)]:mt-0 ${reportToggleClass}`}
                aria-expanded={detailsOpen}
                aria-controls="importar-report-window"
              >
                Ver informe de importación
              </button>
              <DestinationReportDrawer
                open={detailsOpen}
                title="Informe de importación"
                status={
                  importReportHasIssues
                    ? "Importación con avisos"
                    : "Importación completada"
                }
                statusHasIssues={importReportHasIssues}
                fileName={
                  currentDatasetInfo?.fileName ?? lastImportReport.fileName
                }
                meta={readyMeta}
                onClose={() => setDetailsOpen(false)}
                onDownload={downloadImportReport}
                returnFocusRef={reportToggleRef}
              >
                <div id="importar-report-window">
                  <ImportReportPanel
                    report={lastImportReport}
                    variant="destination"
                    seriesCount={currentDatasetInfo?.seriesCount}
                  />
                </div>
              </DestinationReportDrawer>
            </>
          ) : null}

          {formatReject || importError ? (
            <p className={`${alertError} w-full text-left`} role="alert">
              {formatReject ?? importError}
            </p>
          ) : null}
        </div>
      )}

      {workbookWizard.open && workbookWizard.analysis ? (
        <WorkbookImportWizard
          open={workbookWizard.open}
          analysis={workbookWizard.analysis}
          sourceId={selectedDataSourceId}
          onClose={onCloseWizard}
          onComplete={onWizardComplete}
        />
      ) : null}
    </div>
  );
}

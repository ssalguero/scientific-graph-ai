"use client";

import type { ComparisonSlotId } from "@/lib/scientific/comparison";
import {
  sessionDatasetIdentityKey,
  type SessionDataset,
} from "@/lib/sessionDatasetRegistry";

type SessionDatasetPanelProps = {
  datasets: SessionDataset[];
  activeDatasetId: string | null;
  slotADatasetKey: string | null;
  slotBDatasetKey: string | null;
  onActivate: (datasetId: string) => void;
  onSendToSlot: (datasetId: string, slotId: ComparisonSlotId) => void;
  onRemove: (datasetId: string) => void;
  onViewReport?: (datasetId: string) => void;
  btnOutlineSm: string;
  btnPrimary: string;
  dataEmptyState: string;
  persistenceBadge: string;
};

function datasetKey(dataset: SessionDataset): string {
  return sessionDatasetIdentityKey(dataset.name, dataset.importedAt);
}

function reportHasWarnings(dataset: SessionDataset): boolean {
  const report = dataset.datasetPayload.importReport;
  if (!report) return false;
  return (
    report.warningCount > 0 ||
    report.errorCount > 0 ||
    (report.issueSummary?.warning ?? 0) > 0 ||
    (report.issueSummary?.error ?? 0) > 0
  );
}

export function SessionDatasetPanel({
  datasets,
  activeDatasetId,
  slotADatasetKey,
  slotBDatasetKey,
  onActivate,
  onSendToSlot,
  onRemove,
  onViewReport,
  btnOutlineSm,
  btnPrimary,
  dataEmptyState,
  persistenceBadge,
}: SessionDatasetPanelProps) {
  if (datasets.length === 0) {
    return (
      <p className={dataEmptyState}>
        Importe uno o más archivos para gestionarlos en sesión.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {datasets.map((dataset) => {
        const isActive = dataset.id === activeDatasetId;
        const key = datasetKey(dataset);
        const inSlotA = slotADatasetKey === key;
        const inSlotB = slotBDatasetKey === key;
        const hasReport = dataset.datasetPayload.importReport !== null;
        const hasWarnings = reportHasWarnings(dataset);

        return (
          <li
            key={dataset.id}
            className={`rounded-md border px-2.5 py-2 ${
              isActive
                ? "border-[var(--app-accent)]/40 bg-[var(--app-accent)]/5"
                : "border-[var(--app-border)] bg-[var(--app-surface)]"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                      isActive
                        ? "bg-[var(--app-accent)]"
                        : "bg-[var(--app-text-muted)]/50"
                    }`}
                    aria-hidden
                  />
                  <p className="text-xs sm:text-sm font-semibold text-[var(--app-heading)] truncate">
                    {dataset.name}
                  </p>
                  {isActive ? (
                    <span className={persistenceBadge}>ACTIVO</span>
                  ) : null}
                  {inSlotA ? (
                    <span className={persistenceBadge}>SLOT A</span>
                  ) : null}
                  {inSlotB ? (
                    <span className={persistenceBadge}>SLOT B</span>
                  ) : null}
                  {hasWarnings ? (
                    <span className="inline-flex rounded-full border border-amber-300/70 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                      Informe con avisos
                    </span>
                  ) : null}
                  {dataset.worksheetModified ? (
                    <span className="inline-flex rounded-full border border-amber-300/70 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                      Modificado
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">
                  {dataset.seriesCount} series · {dataset.observationCount}{" "}
                  observaciones · {dataset.importedAt}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {!isActive ? (
                  <button
                    type="button"
                    onClick={() => onActivate(dataset.id)}
                    className={btnPrimary}
                  >
                    Activar
                  </button>
                ) : null}
                {hasReport && onViewReport ? (
                  <button
                    type="button"
                    onClick={() => onViewReport(dataset.id)}
                    className={btnOutlineSm}
                  >
                    Ver informe
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onSendToSlot(dataset.id, "A")}
                  className={btnOutlineSm}
                >
                  Enviar a Slot A
                </button>
                <button
                  type="button"
                  onClick={() => onSendToSlot(dataset.id, "B")}
                  className={btnOutlineSm}
                >
                  Enviar a Slot B
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(dataset.id)}
                  className={`${btnOutlineSm} text-[var(--app-danger-text)] border-[var(--app-danger-border)] hover:bg-[var(--app-danger-bg)]`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export { datasetKey as sessionDatasetKey };

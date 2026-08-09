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

const warningBadgeClass =
  "inline-flex rounded-full border border-[var(--app-warning-border)] bg-[var(--app-warning-bg)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--app-warning-text)]";

const actionGroupLabelClass =
  "block w-full text-[9px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]";

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
      <div
        className={`${dataEmptyState} text-center space-y-1`}
        role="status"
      >
        <p className="text-xs font-medium text-[var(--app-text)]">
          No hay datasets en esta sesión
        </p>
        <p className="text-[11px] text-[var(--app-text-muted)]">
          Use &quot;Importar datos experimentales&quot; para cargar el primero.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Datasets en sesión">
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
                ? "border-[var(--app-accent)] bg-[var(--app-accent)]/5"
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
                    <span className={warningBadgeClass}>
                      Informe con avisos
                    </span>
                  ) : null}
                  {dataset.worksheetModified ? (
                    <span className={warningBadgeClass}>Modificado</span>
                  ) : null}
                </div>
                <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">
                  {dataset.seriesCount} series · {dataset.observationCount}{" "}
                  observaciones · {dataset.importedAt}
                </p>
              </div>

              <div className="flex flex-col items-stretch sm:items-end gap-1.5 shrink-0 min-w-[9.5rem]">
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <span className={actionGroupLabelClass}>Sesión</span>
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
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <span className={actionGroupLabelClass}>Comparación</span>
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
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onRemove(dataset.id)}
                    className={`${btnOutlineSm} text-[var(--app-danger-text)] border-[var(--app-danger-border)] hover:bg-[var(--app-danger-bg)]`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export { datasetKey as sessionDatasetKey };

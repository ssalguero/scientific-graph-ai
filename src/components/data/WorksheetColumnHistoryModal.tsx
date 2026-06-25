"use client";

import type { WorksheetColumnLineage } from "@/lib/worksheetLineage";

type WorksheetColumnHistoryModalProps = {
  open: boolean;
  lineage: WorksheetColumnLineage | null;
  onClose: () => void;
  btnOutlineSm: string;
  fieldLabel: string;
};

export function WorksheetColumnHistoryModal({
  open,
  lineage,
  onClose,
  btnOutlineSm,
  fieldLabel,
}: WorksheetColumnHistoryModalProps) {
  if (!open || !lineage) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="worksheet-column-history-title"
      >
        <div className="border-b border-[var(--app-border)] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="worksheet-column-history-title"
                className="text-lg font-semibold text-[var(--app-heading)]"
              >
                Historial de la columna
              </h2>
              <p className="text-sm text-[var(--app-text-muted)]">
                Trazabilidad y dependencias de la variable.
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
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
              {lineage.badge}
            </span>
          </div>

          <div>
            <p className={fieldLabel}>Nombre</p>
            <p className="text-sm text-[var(--app-text)]">{lineage.label}</p>
          </div>

          <div>
            <p className={fieldLabel}>Tipo</p>
            <p className="text-sm text-[var(--app-text)]">{lineage.typeLabel}</p>
          </div>

          {lineage.sourceLabels.length > 0 ? (
            <div>
              <p className={fieldLabel}>Origen</p>
              <ul className="list-disc pl-5 text-sm text-[var(--app-text)]">
                {lineage.sourceLabels.map((sourceLabel) => (
                  <li key={sourceLabel}>{sourceLabel}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {lineage.expression ? (
            <div>
              <p className={fieldLabel}>Fórmula</p>
              <pre className="overflow-x-auto rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 font-mono text-xs text-[var(--app-text)]">
                {lineage.expression}
              </pre>
            </div>
          ) : null}

          {lineage.transformLabel ? (
            <div>
              <p className={fieldLabel}>Transformación</p>
              <p className="text-sm text-[var(--app-text)]">
                {lineage.transformLabel}
              </p>
            </div>
          ) : null}

          {lineage.createdAtFormatted ? (
            <div>
              <p className={fieldLabel}>Creada</p>
              <p className="text-sm text-[var(--app-text)]">
                {lineage.createdAtFormatted.date}
              </p>
              <p className="text-sm text-[var(--app-text-muted)]">
                {lineage.createdAtFormatted.time}
              </p>
            </div>
          ) : null}

          <div>
            <p className={fieldLabel}>Árbol de dependencia</p>
            <pre className="overflow-x-auto rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 font-mono text-xs text-[var(--app-text)] whitespace-pre-wrap">
              {lineage.dependencyTree}
            </pre>
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--app-border)] px-5 py-4">
          <button type="button" className={btnOutlineSm} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

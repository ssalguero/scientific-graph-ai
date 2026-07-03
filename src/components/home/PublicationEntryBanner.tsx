import { btnPrimary } from "@/app/projectFileUiStyles";

const contentPanel =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-xs sm:text-sm text-[var(--app-text)] transition-colors duration-200";

type PublicationEntryBannerProps = {
  canStartWorkflow: boolean;
  onStartWorkflow: () => void;
  onGoToImport: () => void;
  onDismiss: () => void;
};

export function PublicationEntryBanner({
  canStartWorkflow,
  onStartWorkflow,
  onGoToImport,
  onDismiss,
}: PublicationEntryBannerProps) {
  return (
    <div
      className={`${contentPanel} border border-[var(--app-accent)]/30 mb-3`}
      role="status"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Evaluar publicación (SCI-59 → SCI-56 / SCI-60)
          </p>
          <p className="text-xs text-[var(--app-text-muted)] mt-1">
            Workflow guiado hacia dashboards metodológicos y de preparación
            editorial. Resalte los toggles SCI-56 y SCI-60 abajo.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs text-[var(--app-text-muted)] hover:text-[var(--app-heading)]"
          aria-label="Cerrar guía"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {canStartWorkflow ? (
          <button type="button" onClick={onStartWorkflow} className={btnPrimary}>
            Iniciar workflow
          </button>
        ) : (
          <button type="button" onClick={onGoToImport} className={btnPrimary}>
            Ir a importación de datos
          </button>
        )}
      </div>
    </div>
  );
}

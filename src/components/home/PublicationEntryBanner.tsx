import { btnPrimary } from "@/app/projectFileUiStyles";
import { contentPanel } from "@/lib/ui/theme";

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
      className={`${contentPanel} border border-[var(--color-brand-primary)]/30 mb-3`}
      role="status"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Evaluar metodología
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Active los indicadores SCI-50→60 y prepare la revisión metodológica.
            Esto no publica una figura VGB. Importe datos si aún no hay evidencia
            suficiente.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          aria-label="Cerrar guía"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {canStartWorkflow ? (
          <button type="button" onClick={onStartWorkflow} className={btnPrimary}>
            Iniciar evaluación
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

"use client";

import type { GeneratedTextReviewRecord } from "@/lib/scientific/contracts";
import type {
  VgbFigureLifecyclePhase,
  VgbPublicationFigureArtifact,
} from "@/lib/scientific/contracts";
import { btnOutlineSm, btnPrimary } from "@/lib/ui/theme";

const PHASE_LABEL: Record<VgbFigureLifecyclePhase, string> = {
  WORKING: "Figura de trabajo",
  RESEARCHER_REVIEW: "Revisión de la persona investigadora",
  PUBLICATION: "Figura de publicación",
};

type VgbFigureLifecyclePanelProps = {
  phase: VgbFigureLifecyclePhase;
  review: GeneratedTextReviewRecord | null;
  publication: VgbPublicationFigureArtifact | null;
  eligibilityReasons: readonly string[];
  onSubmitForReview: () => void;
  onReview: () => void;
  onApprove: () => void;
  onPublish: () => void;
  onExportNumeric?: () => void;
};

export function VgbFigureLifecyclePanel({
  phase,
  review,
  publication,
  eligibilityReasons,
  onSubmitForReview,
  onReview,
  onApprove,
  onPublish,
  onExportNumeric,
}: VgbFigureLifecyclePanelProps) {
  const reviewState = review?.state ?? "GENERATED";
  const reviewValidity = review?.validity ?? "UNKNOWN";
  const canSubmit = phase === "WORKING";
  const canReview =
    phase === "RESEARCHER_REVIEW" &&
    reviewState === "GENERATED" &&
    reviewValidity === "CURRENT";
  const canApprove =
    phase === "RESEARCHER_REVIEW" &&
    reviewState === "RESEARCHER_REVIEWED" &&
    reviewValidity === "CURRENT";
  const canPublish =
    phase === "RESEARCHER_REVIEW" &&
    reviewState === "RESEARCHER_APPROVED" &&
    reviewValidity === "CURRENT" &&
    eligibilityReasons.length === 0;

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-heading)]">
          Ciclo de figura
        </p>
        <span className="rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
          {PHASE_LABEL[phase]}
        </span>
      </div>
      <p className="text-[11px] text-[var(--app-text-muted)]">
        Figura de trabajo → Revisión → Figura de publicación. Una figura
        mostrada o generada no es automáticamente publicable.
      </p>
      {review ? (
        <p className="text-[11px] text-[var(--app-text)]">
          Revisión CTR-08: {reviewState} · vigencia {reviewValidity}
        </p>
      ) : (
        <p className="text-[11px] text-[var(--app-text-muted)]">
          Sin autoridad de revisión vinculada.
        </p>
      )}
      {publication ? (
        <p className="text-[11px] text-[var(--app-text)]">
          Figura de publicación inmutable: {publication.publicationId}
        </p>
      ) : null}
      {eligibilityReasons.length > 0 && phase !== "WORKING" ? (
        <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-[var(--app-text-muted)]">
          {eligibilityReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canSubmit ? (
          <button
            type="button"
            className={btnOutlineSm}
            onClick={onSubmitForReview}
          >
            Enviar a revisión
          </button>
        ) : null}
        {canReview ? (
          <button type="button" className={btnOutlineSm} onClick={onReview}>
            Revisar
          </button>
        ) : null}
        {canApprove ? (
          <button type="button" className={btnOutlineSm} onClick={onApprove}>
            Aprobar
          </button>
        ) : null}
        {canPublish ? (
          <button type="button" className={btnPrimary} onClick={onPublish}>
            Publicar figura
          </button>
        ) : null}
        {publication && onExportNumeric ? (
          <button
            type="button"
            className={btnOutlineSm}
            onClick={onExportNumeric}
          >
            Exportar valores numéricos
          </button>
        ) : null}
      </div>
    </div>
  );
}

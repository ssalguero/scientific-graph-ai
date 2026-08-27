"use client";

import type { GeneratedTextReviewRecord } from "@/lib/scientific/contracts";
import type {
  VgbFigureLifecyclePhase,
  VgbPublicationFigureArtifact,
} from "@/lib/scientific/contracts";
import { btnOutlineSm, btnPrimary } from "@/lib/ui/theme";
import { describeVgbReviewValidity } from "@/lib/project/pr5-researcher-continuity";

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
  onContinueEdit?: () => void;
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
  onContinueEdit,
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
  const validityDisclosure = review
    ? describeVgbReviewValidity(review.validity, Boolean(publication))
    : null;

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-primary)]">
          Ciclo de figura
        </p>
        <span className="rounded border border-[var(--color-border-default)] bg-[var(--color-surface-canvas)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          {PHASE_LABEL[phase]}
        </span>
      </div>
      <p className="text-[11px] text-[var(--color-text-muted)]">
        Figura de trabajo → Revisión → Figura de publicación. Una figura
        mostrada o generada no es automáticamente publicable.
      </p>
      {review ? (
        <div className="space-y-1">
          <p className="text-[11px] text-[var(--color-text-primary)]">
            Revisión CTR-08: {reviewState} · vigencia {reviewValidity}
          </p>
          {validityDisclosure?.body ? (
            <p className="text-[11px] text-[var(--color-text-primary)]">
              {validityDisclosure.body}
            </p>
          ) : null}
          {validityDisclosure?.nextAction ? (
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {validityDisclosure.nextAction}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Sin autoridad de revisión vinculada.
        </p>
      )}
      {publication ? (
        <p className="text-[11px] text-[var(--color-text-primary)]">
          Figura de publicación inmutable: {publication.publicationId}. La
          vigencia de la figura de trabajo no modifica esa identidad.
        </p>
      ) : null}
      {eligibilityReasons.length > 0 && phase !== "WORKING" ? (
        <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-[var(--color-text-muted)]">
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
        {onContinueEdit ? (
          <button type="button" className={btnOutlineSm} onClick={onContinueEdit}>
            Continuar en Constructor Visual
          </button>
        ) : null}
      </div>
    </div>
  );
}

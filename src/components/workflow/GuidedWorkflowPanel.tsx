"use client";

import type {
  GuidedWorkflowPlan,
  GuidedWorkflowSession,
} from "@/lib/scientific/workflow";
import { btnOutlineSm, btnPrimary, contentPanel } from "@/lib/ui/theme";

type GuidedWorkflowPanelProps = {
  plan: GuidedWorkflowPlan;
  session: GuidedWorkflowSession;
  onApplyStep: () => void;
  onSkipStep: () => void;
  onCancel: () => void;
};

export function GuidedWorkflowPanel({
  plan,
  session,
  onApplyStep,
  onSkipStep,
  onCancel,
}: GuidedWorkflowPanelProps) {
  const currentStep = plan.steps[session.currentStepIndex];
  const progressLabel = currentStep
    ? `Paso ${session.currentStepIndex + 1}/${plan.steps.length} · ${plan.templateTitle}`
    : `${plan.templateTitle} · completado`;

  return (
    <div className={`${contentPanel} border border-[var(--color-brand-primary)]/25`}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            🧭 Guided Scientific Workflow
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {progressLabel}
          </p>
        </div>
        {session.status === "active" ? (
          <button type="button" onClick={onCancel} className={btnOutlineSm}>
            Cancelar workflow
          </button>
        ) : null}
      </div>

      {session.status === "completed" ? (
        <p className="text-sm text-[var(--color-text-primary)]">
          Workflow &quot;{plan.templateTitle}&quot; completado. Puede continuar
          en modo experto o exportar reportes.
        </p>
      ) : currentStep ? (
        <>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {currentStep.title}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {currentStep.explanation}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button type="button" onClick={onApplyStep} className={btnPrimary}>
              Aplicar paso
            </button>
            <button type="button" onClick={onSkipStep} className={btnOutlineSm}>
              Omitir paso
            </button>
          </div>
        </>
      ) : null}

      {session.completedStepIds.length > 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          Completados: {session.completedStepIds.length} · Omitidos:{" "}
          {session.skippedStepIds.length}
        </p>
      ) : null}
    </div>
  );
}

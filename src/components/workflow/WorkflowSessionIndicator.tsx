"use client";

import type {
  GuidedWorkflowPlan,
  GuidedWorkflowSession,
  GuidedWorkflowWorkspaceTab,
} from "@/lib/scientific/workflow";

const WORKSPACE_TAB_LABELS: Record<GuidedWorkflowWorkspaceTab, string> = {
  data: "Datos",
  analysis: "Análisis",
  results: "Resultados",
  reports: "Reportes",
};

const panelClassName =
  "rounded-lg border border-[var(--color-brand-primary)]/25 bg-[var(--color-surface-default)] px-2.5 py-2 text-xs sm:text-sm text-[var(--color-text-primary)] transition-colors duration-200";

const cancelButtonClassName =
  "inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-2 text-xs text-[var(--color-text-primary)] shadow-sm transition-colors duration-200 hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface-canvas)]";

export type WorkflowSessionIndicatorProps = {
  plan: GuidedWorkflowPlan;
  session: GuidedWorkflowSession;
  hostTab: GuidedWorkflowWorkspaceTab | null;
  /** Product Face label for the step host. Not a Tab name. */
  hostContinuityLabel?: string | null;
  activeTab: GuidedWorkflowWorkspaceTab;
  onCancel: () => void;
};

const buildProgressLabel = (
  plan: GuidedWorkflowPlan,
  session: GuidedWorkflowSession
): string => {
  if (session.status === "completed") {
    return `${plan.templateTitle} · completado`;
  }

  const currentStep = plan.steps[session.currentStepIndex];
  if (!currentStep) {
    return plan.templateTitle;
  }

  return `Paso ${session.currentStepIndex + 1}/${plan.steps.length} · ${plan.templateTitle}`;
};

export function WorkflowSessionIndicator({
  plan,
  session,
  hostTab,
  hostContinuityLabel,
  activeTab,
  onCancel,
}: WorkflowSessionIndicatorProps) {
  if (session.status !== "active" && session.status !== "completed") {
    return null;
  }

  const progressLabel = buildProgressLabel(plan, session);
  const showOffHostHint =
    session.status === "active" &&
    hostTab !== null &&
    activeTab !== hostTab;

  return (
    <aside
      className={panelClassName}
      role="status"
      aria-live="polite"
      aria-label="Sesión de workflow científico activa"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            🧭 Guided Scientific Workflow
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {progressLabel}
          </p>
        </div>
        {session.status === "active" ? (
          <button
            type="button"
            onClick={onCancel}
            className={cancelButtonClassName}
          >
            Cancelar workflow
          </button>
        ) : null}
      </div>

      {session.status === "completed" ? (
        <p className="mt-2 text-sm text-[var(--color-text-primary)]">
          Workflow &quot;{plan.templateTitle}&quot; completado. Puede continuar
          en modo experto o exportar reportes.
        </p>
      ) : showOffHostHint ? (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Continúe en {hostContinuityLabel ?? WORKSPACE_TAB_LABELS[hostTab!]} para aplicar u omitir el
          paso actual.
        </p>
      ) : null}

      {session.completedStepIds.length > 0 ? (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Completados: {session.completedStepIds.length} · Omitidos:{" "}
          {session.skippedStepIds.length}
        </p>
      ) : null}
    </aside>
  );
}

import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import type { GuidedWorkflowSession } from "@/lib/scientific/workflow/types";

import {
  CONTROL_PANEL_TABS,
  INSPECTOR_SECTIONS,
  WORKSPACE_SECTIONS,
} from "./constants";
import { issue, pushIssue } from "./guards";
import {
  MODULE_KEYS_V1,
  VISIBILITY_KEYS_V1,
  type VisibilityKeyV1,
} from "./keys";
import type {
  ComparisonSlotIdV1,
  DatasetAnalysisProfileV1,
  ProjectAnalysisSelectionsV1,
  ProjectComparisonV1,
  ProjectValidationIssue,
  ProjectWorkspaceV1,
  ScientificProjectV1,
} from "./types";
import {
  GUIDED_WORKFLOW_TEMPLATE_IDS,
  GUIDED_WORKFLOW_STATUS_VALUES,
} from "./types";

const INSPECTOR_MODULE_GATE: Record<
  ProjectWorkspaceV1["inspectorSection"],
  (typeof MODULE_KEYS_V1)[number]
> = {
  visualization: "basic",
  mathematics: "mathematics",
  statistics: "statistics",
  inference: "inference",
  advisor: "assistant",
};

const WORKFLOW_TEMPLATE_STEP_COUNT: Record<
  (typeof GUIDED_WORKFLOW_TEMPLATE_IDS)[number],
  number
> = {
  "compare-groups": 7,
  "explore-structure": 6,
  "evaluate-publication": 6,
};

export const sanitizeSelections = (
  selections: ProjectAnalysisSelectionsV1,
  seriesIds: Set<string>,
  warnings: ProjectValidationIssue[]
): ProjectAnalysisSelectionsV1 => {
  const sanitizeRef = (
    value: string | null,
    path: string
  ): string | null => {
    if (value === null) return null;
    if (seriesIds.has(value)) return value;
    pushIssue(
      warnings,
      issue(
        "H-SEL-ORPHAN",
        path,
        `Series id "${value}" not found — cleared`,
        "warning"
      )
    );
    return null;
  };

  return {
    tTestSeriesA: sanitizeRef(
      selections.tTestSeriesA,
      "analysisConfig.selections.tTestSeriesA"
    ),
    tTestSeriesB: sanitizeRef(
      selections.tTestSeriesB,
      "analysisConfig.selections.tTestSeriesB"
    ),
    mannWhitneySeriesA: sanitizeRef(
      selections.mannWhitneySeriesA,
      "analysisConfig.selections.mannWhitneySeriesA"
    ),
    mannWhitneySeriesB: sanitizeRef(
      selections.mannWhitneySeriesB,
      "analysisConfig.selections.mannWhitneySeriesB"
    ),
  };
};

export const sanitizeWorkflowSession = (
  session: GuidedWorkflowSession,
  seriesCount: number,
  warnings: ProjectValidationIssue[]
): GuidedWorkflowSession => {
  if (
    !GUIDED_WORKFLOW_STATUS_VALUES.includes(
      session.status as (typeof GUIDED_WORKFLOW_STATUS_VALUES)[number]
    )
  ) {
    pushIssue(
      warnings,
      issue(
        "H-WF-STATUS",
        "workflow.session.status",
        "Invalid workflow status — reset to idle",
        "warning"
      )
    );
    return { ...GUIDED_WORKFLOW_IDLE_SESSION };
  }

  if (session.status === "idle") {
    return { ...GUIDED_WORKFLOW_IDLE_SESSION };
  }

  if (
    session.templateId === null ||
    !GUIDED_WORKFLOW_TEMPLATE_IDS.includes(session.templateId)
  ) {
    pushIssue(
      warnings,
      issue(
        "H-WF-TEMPLATE",
        "workflow.session.templateId",
        "Invalid workflow template — reset to idle",
        "warning"
      )
    );
    return { ...GUIDED_WORKFLOW_IDLE_SESSION };
  }

  if (seriesCount < 2 && session.status === "active") {
    pushIssue(
      warnings,
      issue(
        "H-WF-DATA",
        "workflow.session",
        "Active workflow with insufficient series — reset to idle",
        "warning"
      )
    );
    return { ...GUIDED_WORKFLOW_IDLE_SESSION };
  }

  const maxIndex = WORKFLOW_TEMPLATE_STEP_COUNT[session.templateId] - 1;
  let currentStepIndex = session.currentStepIndex;
  if (currentStepIndex < 0) {
    currentStepIndex = 0;
    pushIssue(
      warnings,
      issue(
        "H-WF-STEP",
        "workflow.session.currentStepIndex",
        "Step index below zero — clamped to 0",
        "warning"
      )
    );
  }
  if (currentStepIndex > maxIndex) {
    pushIssue(
      warnings,
      issue(
        "H-WF-STEP",
        "workflow.session.currentStepIndex",
        `Step index above plan length — clamped to ${maxIndex}`,
        "warning"
      )
    );
    currentStepIndex = maxIndex;
  }

  return {
    ...session,
    currentStepIndex,
    completedStepIds: [...session.completedStepIds],
    skippedStepIds: [...session.skippedStepIds],
  };
};

export const sanitizeWorkspace = (
  workspace: ProjectWorkspaceV1,
  warnings: ProjectValidationIssue[]
): ProjectWorkspaceV1 => {
  const enabledModules = { ...workspace.enabledModules };
  for (const key of MODULE_KEYS_V1) {
    if (typeof enabledModules[key] !== "boolean") {
      enabledModules[key] = true;
    }
  }

  let activeSection = workspace.activeSection;
  if (!WORKSPACE_SECTIONS.includes(activeSection)) {
    activeSection = "data";
    pushIssue(
      warnings,
      issue(
        "H-WS-SECTION",
        "workspace.activeSection",
        "Invalid section — fallback to data",
        "warning"
      )
    );
  }

  if (activeSection === "reports" && enabledModules.reports === false) {
    activeSection = "data";
    pushIssue(
      warnings,
      issue(
        "H-WS-REPORTS",
        "workspace.activeSection",
        "Reports section unavailable — fallback to data",
        "warning"
      )
    );
  }

  let inspectorSection = workspace.inspectorSection;
  if (!INSPECTOR_SECTIONS.includes(inspectorSection)) {
    inspectorSection = "visualization";
    pushIssue(
      warnings,
      issue(
        "H-WS-INSPECTOR",
        "workspace.inspectorSection",
        "Invalid inspector — fallback to visualization",
        "warning"
      )
    );
  }

  const requiredModule = INSPECTOR_MODULE_GATE[inspectorSection];
  if (enabledModules[requiredModule] === false) {
    const fallback = INSPECTOR_SECTIONS.find(
      (section) => enabledModules[INSPECTOR_MODULE_GATE[section]] !== false
    );
    inspectorSection = fallback ?? "visualization";
    pushIssue(
      warnings,
      issue(
        "H-WS-INSPECTOR-MOD",
        "workspace.inspectorSection",
        "Inspector unavailable for enabled modules — adjusted",
        "warning"
      )
    );
  }

  let controlPanelTab = workspace.controlPanelTab;
  if (
    controlPanelTab !== undefined &&
    !CONTROL_PANEL_TABS.includes(controlPanelTab)
  ) {
    controlPanelTab = "graph";
    pushIssue(
      warnings,
      issue(
        "H-WS-TAB",
        "workspace.controlPanelTab",
        "Invalid control panel tab — fallback to graph",
        "warning"
      )
    );
  }

  return {
    activeSection,
    inspectorSection,
    enabledModules,
    controlPanelTab,
  };
};

const sanitizeComparisonProfile = (
  profile: DatasetAnalysisProfileV1 | null,
  slotId: ComparisonSlotIdV1,
  warnings: ProjectValidationIssue[]
): DatasetAnalysisProfileV1 | null => {
  if (!profile) return null;

  if (profile.slotLabel !== slotId) {
    pushIssue(
      warnings,
      issue(
        "H-CMP-LABEL",
        `comparison.slots.${slotId}.profile.slotLabel`,
        `Corrected slotLabel to "${slotId}"`,
        "warning"
      )
    );
  }

  return {
    ...profile,
    slotLabel: slotId,
  };
};

export const sanitizeComparison = (
  comparison: ProjectComparisonV1,
  warnings: ProjectValidationIssue[]
): ProjectComparisonV1 => ({
  slots: {
    A: {
      label: comparison.slots.A.label || "Slot A",
      profile: sanitizeComparisonProfile(
        comparison.slots.A.profile,
        "A",
        warnings
      ),
    },
    B: {
      label: comparison.slots.B.label || "Slot B",
      profile: sanitizeComparisonProfile(
        comparison.slots.B.profile,
        "B",
        warnings
      ),
    },
  },
});

export const sanitizeVisibility = (
  visibility: Partial<Record<string, boolean>>
): Partial<Record<VisibilityKeyV1, boolean>> => {
  const sanitized: Partial<Record<VisibilityKeyV1, boolean>> = {};
  for (const key of VISIBILITY_KEYS_V1) {
    if (typeof visibility[key] === "boolean") {
      sanitized[key] = visibility[key];
    }
  }
  for (const [key, value] of Object.entries(visibility)) {
    if (!(key in sanitized) && typeof value === "boolean") {
      sanitized[key as VisibilityKeyV1] = value;
    }
  }
  return sanitized;
};

/** Sanitize validated project input — no SCI output recompute. */
export const sanitizeProjectSnapshot = (
  project: ScientificProjectV1
): { project: ScientificProjectV1; warnings: ProjectValidationIssue[] } => {
  const warnings: ProjectValidationIssue[] = [];
  const seriesIds = new Set(project.dataset.series.map((item) => item.id));

  const sanitized: ScientificProjectV1 = {
    metadata: { ...project.metadata },
    dataset: {
      series: project.dataset.series.map((item) => ({
        ...item,
        points: item.points.map((point) => ({ x: point.x, y: point.y })),
      })),
      info: project.dataset.info ? { ...project.dataset.info } : null,
      checksum: project.dataset.checksum ?? null,
    },
    importProvenance: {
      report: project.importProvenance.report,
      preserveAnalysisOnReimport:
        project.importProvenance.preserveAnalysisOnReimport,
    },
    analysisConfig: {
      visibility: sanitizeVisibility(project.analysisConfig.visibility),
      modes: { ...project.analysisConfig.modes },
      selections: sanitizeSelections(
        project.analysisConfig.selections,
        seriesIds,
        warnings
      ),
      legend: {
        hiddenKeys: project.analysisConfig.legend.hiddenKeys.filter((key) =>
          seriesIds.has(key)
        ),
      },
    },
    workflow: {
      session: sanitizeWorkflowSession(
        project.workflow.session,
        project.dataset.series.length,
        warnings
      ),
    },
    comparison: sanitizeComparison(project.comparison, warnings),
    workspace: sanitizeWorkspace(project.workspace, warnings),
    graphContext: project.graphContext
      ? {
          ...project.graphContext,
          curves: project.graphContext.curves.map((curve) => ({
            expression: curve.expression.trim(),
            color: curve.color,
          })),
        }
      : null,
  };

  return { project: sanitized, warnings };
};

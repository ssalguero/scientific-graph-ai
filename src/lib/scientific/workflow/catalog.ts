import type {
  GuidedWorkflowSession,
  GuidedWorkflowTemplateId,
} from "./types";

export const GUIDED_WORKFLOW_IDLE_SESSION: GuidedWorkflowSession = {
  status: "idle",
  templateId: null,
  currentStepIndex: 0,
  completedStepIds: [],
  skippedStepIds: [],
  startedAt: null,
  completedAt: null,
};

export type GuidedWorkflowCatalogEntry = {
  id: GuidedWorkflowTemplateId;
  title: string;
  description: string;
};

export const GUIDED_WORKFLOW_TEMPLATE_CATALOG: GuidedWorkflowCatalogEntry[] =
  [
    {
      id: "compare-groups",
      title: "Comparar grupos",
      description:
        "Descriptiva, normalidad, inferencia recomendada, effect size e interpretación.",
    },
    {
      id: "explore-structure",
      title: "Explorar estructura",
      description:
        "Correlación, PCA, clustering y dashboard multivariante (SCI-40).",
    },
    {
      id: "evaluate-publication",
      title: "Evaluar publicación",
      description:
        "Motores metodológicos SCI-50→55, SCI-56, SCI-57 y Executive Publication Dashboard.",
    },
  ];

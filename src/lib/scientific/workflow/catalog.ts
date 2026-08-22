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
        "Descriptiva, normalidad, inferencia recomendada, effect size, interpretación y reporte científico en Informes.",
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
        "Indicadores compuestos SCI-50→56, inferencia SCI-57 y resumen compuesto SCI-60 para revisión humana.",
    },
  ];

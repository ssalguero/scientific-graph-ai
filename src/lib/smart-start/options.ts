import type { SmartStartCardOptionId } from "./types";

export type SmartStartOption = {
  id: SmartStartCardOptionId;
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
};

export const SMART_START_OPTIONS: SmartStartOption[] = [
  {
    id: "analyze-dataset",
    icon: "📥",
    title: "Analizar un dataset",
    description:
      "Importe CSV, Excel, TXT u ODS para análisis científico descriptivo e inferencial.",
    actionLabel: "Ir a importación",
  },
  {
    id: "compare-datasets",
    icon: "📊",
    title: "Comparar datasets",
    description:
      "Capture perfiles en Slot A y Slot B con comparación multi-dataset (SCI-59 / ARCH-5).",
    actionLabel: "Abrir comparación A/B",
  },
  {
    id: "evaluate-publication",
    icon: "📰",
    title: "Evaluar publicación",
    description:
      "Workflow guiado hacia SCI-60 Publication Readiness y dashboards ejecutivos.",
    actionLabel: "Iniciar workflow",
  },
  {
    id: "math-graph",
    icon: "📐",
    title: "Crear gráfico matemático",
    description: "Trabaje con expresiones y=f(x) en el constructor de curvas.",
    actionLabel: "Abrir constructor",
  },
  {
    id: "open-project",
    icon: "📁",
    title: "Abrir proyecto existente",
    description:
      "Recupere un archivo .sgproj con dataset, análisis y curvas guardados.",
    actionLabel: "Usar panel de proyecto",
  },
];

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
      "Importe CSV, Excel, TXT u ODS y luego use el workflow «Comparar grupos» hacia resultados e Informes.",
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
    description:
      "Abre Datos → Constructor y=f(x) para escribir expresiones (ej. x^2) y ver el gráfico.",
    actionLabel: "Abrir constructor y=f(x)",
  },
  {
    id: "open-project",
    icon: "📁",
    title: "Abrir o recuperar proyecto",
    description:
      "Use «Proyectos locales» para recuperar lo guardado en este navegador, o «Abrir proyecto» para un archivo .sgproj.",
    actionLabel: "Ir al panel Proyecto",
  },
];

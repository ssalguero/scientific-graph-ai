import type { SmartStartCardOptionId } from "./types";

export type SmartStartOption = {
  id: SmartStartCardOptionId;
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  /** Product Face hierarchy hint — presentation only (CRP-6.1). */
  prominence?: "primary" | "secondary" | "supporting";
};

export const SMART_START_OPTIONS: SmartStartOption[] = [
  {
    id: "analyze-dataset",
    icon: "📥",
    title: "Importar datos",
    description:
      "Importe CSV, Excel, TXT u ODS y continúe hacia análisis, resultados e informes.",
    actionLabel: "Ir a importación",
    prominence: "primary",
  },
  {
    id: "compare-datasets",
    icon: "📊",
    title: "Comparar datasets",
    description:
      "Compare dos conjuntos de datos (perfiles A y B) para contraste científico.",
    actionLabel: "Abrir comparación A/B",
    prominence: "secondary",
  },
  {
    id: "evaluate-publication",
    icon: "📰",
    title: "Evaluar para publicar",
    description:
      "Prepare la evidencia y la calidad del análisis antes de generar el reporte o Pack.",
    actionLabel: "Iniciar evaluación",
    prominence: "secondary",
  },
  {
    id: "math-graph",
    icon: "📐",
    title: "Crear gráfico matemático",
    description:
      "Abra Datos → Constructor y=f(x) para escribir expresiones (por ejemplo x^2) y ver el gráfico.",
    actionLabel: "Abrir constructor y=f(x)",
    prominence: "secondary",
  },
  {
    id: "open-project",
    icon: "📁",
    title: "Abrir proyecto reciente",
    description:
      "Recupere un proyecto guardado en este navegador o abra un archivo .sgproj.",
    actionLabel: "Ir al panel Proyecto",
    prominence: "supporting",
  },
];

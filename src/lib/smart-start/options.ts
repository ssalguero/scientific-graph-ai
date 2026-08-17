import type { SmartStartCardOptionId } from "./types";

export type SmartStartOption = {
  id: SmartStartCardOptionId;
  title: string;
  description: string;
  actionLabel: string;
  /** Product Face hierarchy hint — presentation only (CRP-6.1 / 6.3). */
  prominence?: "primary" | "secondary" | "supporting";
};

export const SMART_START_OPTIONS: SmartStartOption[] = [
  {
    id: "analyze-dataset",
    title: "Importar / Datos",
    description: "Incorpora tus datos para comenzar.",
    actionLabel: "Empezar con datos",
    prominence: "primary",
  },
  {
    id: "compare-datasets",
    title: "Comparar",
    description: "Compara grupos, conjuntos o resultados.",
    actionLabel: "Abrir comparación",
    prominence: "secondary",
  },
  {
    id: "math-graph",
    title: "Crear gráfico",
    description: "Crea y explora visualizaciones.",
    actionLabel: "Abrir constructor",
    prominence: "secondary",
  },
  {
    id: "analyze-workspace",
    title: "Analizar",
    description: "Analiza tus datos y encuentra patrones.",
    actionLabel: "Ir a Análisis",
    prominence: "secondary",
  },
  {
    id: "evaluate-publication",
    title: "Evaluar / Publicar",
    description: "Revisa, valida y prepara tus resultados.",
    actionLabel: "Iniciar evaluación",
    prominence: "secondary",
  },
  {
    id: "expert-mode",
    title: "Avanzado",
    description: "Accede a herramientas y opciones avanzadas.",
    actionLabel: "Abrir avanzado",
    prominence: "supporting",
  },
];

import type { SmartStartCardOptionId } from "./types";

export type SmartStartOption = {
  id: SmartStartCardOptionId;
  title: string;
  description: string;
  actionLabel: string;
  /** Visible Home hint: which Product Screen the Card opens. */
  destinationHint: string;
  /** Product Face hierarchy hint — presentation only (CRP-6.1 / 6.3). */
  prominence?: "primary" | "secondary" | "supporting";
};

export const SMART_START_OPTIONS: SmartStartOption[] = [
  {
    id: "analyze-dataset",
    title: "Importar datos",
    description: "Incorporá un archivo experimental y empezá el flujo de datos.",
    actionLabel: "Empezar con datos",
    destinationHint: "Abre Importar",
    prominence: "primary",
  },
  {
    id: "compare-datasets",
    title: "Comparar datos",
    description: "Compará grupos o datasets. La revisión queda en Resultados.",
    actionLabel: "Abrir comparación",
    destinationHint: "Abre Comparar",
    prominence: "secondary",
  },
  {
    id: "math-graph",
    title: "Gráfico y=f(x)",
    description:
      "Formulá expresiones matemáticas y=f(x). Distinto del Constructor Visual.",
    actionLabel: "Abrir y=f(x)",
    destinationHint: "Abre Gráfico y=f(x)",
    prominence: "secondary",
  },
  {
    id: "constructor-visual",
    title: "Constructor Visual",
    description:
      "Armá una figura visual de trabajo desde datos. Distinto de y=f(x).",
    actionLabel: "Abrir Constructor Visual",
    destinationHint: "Abre Constructor Visual",
    prominence: "secondary",
  },
  {
    id: "analyze-workspace",
    title: "Analizar",
    description: "Configurá métodos y parámetros. La lectura está en Resultados.",
    actionLabel: "Ir a Análisis",
    destinationHint: "Abre Analizar",
    prominence: "secondary",
  },
  {
    id: "evaluate-publication",
    title: "Evaluar metodología",
    description:
      "Indicadores SCI-50→60 de preparación metodológica. No publica una figura VGB.",
    actionLabel: "Iniciar evaluación",
    destinationHint: "Abre Evaluar metodología",
    prominence: "secondary",
  },
];

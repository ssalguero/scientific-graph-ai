import type { AnalyzeConversationContext } from "./contract";
import type { SystemContext } from "./architecture";
import type { ConversationOrientation, ConversationProductArea } from "./orientation";
import { productAreasAreRelated } from "./relations";

/**
 * Deterministic Conversation Core output. Not a Home Card decision.
 * Orientation is semantic: display / explain only.
 */
export type ConversationTurnResult = {
  interpretation: string;
  explanation: string;
  orientation: ConversationOrientation;
  continuationPrompt: string | null;
  turnCount: number;
};

export type ConversationCoreInput = {
  text: string;
  system: SystemContext;
  analyzeContext: AnalyzeConversationContext | null;
  previous: ConversationTurnResult | null;
};

const PRODUCT_AREA_MEANING: Record<ConversationProductArea, string> = {
  home_launcher_cards: "el lanzador de Inicio",
  scientific_mathematics: "Análisis, en el área de Matemáticas",
  scientific_statistics: "Análisis, en el área de Estadística",
  scientific_visualization: "Análisis, en el área de Visualización",
  scientific_inference: "Análisis, en el área de Inferencia",
  scientific_advisor: "Análisis, en el área de Advisor",
  data_compare_groups: "Datos, en la comparación de datasets / grupos",
  data_graphs_math: "Datos, en el constructor de curvas y gráficos",
  data_advanced_tools: "Datos, en herramientas avanzadas",
  publication_evaluation: "Análisis, en la evaluación de publicación",
  existing_results: "Resultados ya calculados en el workspace",
  existing_reports: "Reportes ya existentes en el workspace",
};

function normalizeConversationText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:()"'“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, needles: readonly string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

function scientificAreaFromAnalyze(
  analyze: AnalyzeConversationContext | null
): ConversationProductArea {
  switch (analyze?.scientificArea) {
    case "mathematics_area":
      return "scientific_mathematics";
    case "visualization_area":
      return "scientific_visualization";
    case "inference_area":
      return "scientific_inference";
    case "advisor_area":
      return "scientific_advisor";
    default:
      return "scientific_statistics";
  }
}

function orientationFor(
  kind: ConversationOrientation["kind"],
  productArea: ConversationProductArea,
  meaning: string
): ConversationOrientation {
  return { kind, productArea, meaning };
}

function currentSurfaceLabel(system: SystemContext): string {
  switch (system.activeConversationDomain) {
    case "analyze":
      return "Análisis";
    case "math":
      return "el constructor de curvas (Datos)";
    case "compare":
      return "la comparación de datasets (Datos)";
    case "advanced":
      return "herramientas avanzadas (Datos)";
    default:
      return "una superficie sin un dominio conversacional específico";
  }
}

/**
 * Single Conversation Core. Interprets user text with system + domain
 * context. Does not navigate, execute, or choose scientific methods.
 * activeConversationDomain is current location, not a question whitelist.
 */
export function runConversationCore(
  input: ConversationCoreInput
): ConversationTurnResult {
  const turnCount = (input.previous?.turnCount ?? 0) + 1;
  const text = normalizeConversationText(input.text);
  const here = input.system.activeConversationDomain;

  if (!text) {
    const area = scientificAreaFromAnalyze(input.analyzeContext);
    return {
      interpretation: "No hay una pregunta todavía.",
      explanation: `Está en ${currentSurfaceLabel(input.system)}. Puede consultar cómo se relaciona con otras capacidades del producto. La decisión de usar controles sigue siendo suya.`,
      orientation: orientationFor(
        "scientific_area",
        area,
        PRODUCT_AREA_MEANING[area]
      ),
      continuationPrompt: null,
      turnCount,
    };
  }

  if (includesAny(text, ["donde hago", "donde esta", "donde queda", "y donde"])) {
    const previousOrientation = input.previous?.orientation ?? null;
    if (!previousOrientation) {
      return {
        interpretation: "No hay un referente previo que localizar.",
        explanation:
          "Dígame primero qué quiere hacer (por ejemplo comparar grupos o analizar curvas). No asumo una tarjeta ni un destino fijo.",
        orientation: orientationFor(
          "scientific_area",
          "scientific_statistics",
          PRODUCT_AREA_MEANING.scientific_statistics
        ),
        continuationPrompt: null,
        turnCount,
      };
    }
    return {
      interpretation: "Quiere localizar lo que acabamos de tratar.",
      explanation: `Eso se encuentra en ${previousOrientation.meaning}. Usted decide si abre ese lugar con los controles del workspace. La conversación no navega ni ejecuta.`,
      orientation: {
        kind: previousOrientation.kind,
        productArea: previousOrientation.productArea,
        meaning: previousOrientation.meaning,
      },
      continuationPrompt: "¿Quiere consultarme algo más sobre esto?",
      turnCount,
    };
  }

  if (
    includesAny(text, [
      "ejecuta",
      "ejecutar",
      "calcula",
      "calcular",
      "corre el",
      "elige el metodo",
      "que metodo",
      "que metodologia",
    ])
  ) {
    const area = scientificAreaFromAnalyze(input.analyzeContext);
    return {
      interpretation: "Pide una acción automática que la conversación no realiza.",
      explanation:
        "La IA no ejecuta análisis ni elige un método científico. Usted usa los controles del inspector o de Datos. Puedo orientar dónde está una capacidad.",
      orientation: orientationFor(
        "scientific_area",
        area,
        PRODUCT_AREA_MEANING[area]
      ),
      continuationPrompt: "¿Quiere que le indique dónde está una capacidad?",
      turnCount,
    };
  }

  if (includesAny(text, ["reporte", "reportes", "informe de publicacion"])) {
    return {
      interpretation: "Pregunta por reportes.",
      explanation:
        "Puedo hablar de reportes que ya existan. La conversación no genera un reporte ni sustituye el motor de publicación. Los reportes viven en la sección Reportes.",
      orientation: orientationFor(
        "existing_dashboard",
        "existing_reports",
        PRODUCT_AREA_MEANING.existing_reports
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre reportes existentes?",
      turnCount,
    };
  }

  if (includesAny(text, ["resultado existente", "resultados existentes", "interpretar resultado"])) {
    return {
      interpretation: "Pregunta por resultados ya obtenidos.",
      explanation:
        "Puedo ayudar a situar resultados que ya se calcularon. No genero resultados científicos desde la conversación.",
      orientation: orientationFor(
        "existing_dashboard",
        "existing_results",
        PRODUCT_AREA_MEANING.existing_results
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre resultados existentes?",
      turnCount,
    };
  }

  if (includesAny(text, ["comparar", "comparacion", "grupos", "otro grupo"])) {
    const relatedNote = productAreasAreRelated(here, "compare")
      ? here && here !== "compare"
        ? " Esa capacidad está relacionada con la superficie donde está ahora."
        : ""
      : " Aun así puede referirse a comparar desde aquí; el contexto actual no limita el referente.";
    return {
      interpretation: "La pregunta se refiere a comparar grupos o datasets.",
      explanation: `Está en ${currentSurfaceLabel(input.system)}. La comparación de grupos es una capacidad de Datos (comparar datasets), no una orden de ejecución.${relatedNote} Usted decide si usa esa superficie. La conversación no inicia el flujo ni selecciona grupos.`,
      orientation: orientationFor(
        "data_area",
        "data_compare_groups",
        PRODUCT_AREA_MEANING.data_compare_groups
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre comparar grupos?",
      turnCount,
    };
  }

  if (includesAny(text, ["analizar", "analisis", "analizo"])) {
    const area = scientificAreaFromAnalyze(input.analyzeContext);
    const relatedNote = productAreasAreRelated(here, "analyze")
      ? here && here !== "analyze"
        ? " El análisis es una capacidad relacionada con la superficie actual."
        : ""
      : " El contexto actual no impide referirse a Análisis.";
    return {
      interpretation: "La pregunta se refiere a analizar en el workspace.",
      explanation: `Está en ${currentSurfaceLabel(input.system)}. Analizar es una capacidad de Análisis (controles del inspector).${relatedNote} La conversación no cambia de sección ni ejecuta el análisis. Usted decide si usa esos controles.`,
      orientation: orientationFor(
        "scientific_area",
        area,
        PRODUCT_AREA_MEANING[area]
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre analizar?",
      turnCount,
    };
  }

  if (includesAny(text, ["curva", "curvas", "graficar", "grafico", "constructor"])) {
    return {
      interpretation: "La pregunta se refiere a curvas o gráficos.",
      explanation: `Está en ${currentSurfaceLabel(input.system)}. El constructor de curvas está en Datos. La conversación no navega ni reescribe expresiones.`,
      orientation: orientationFor(
        "data_area",
        "data_graphs_math",
        PRODUCT_AREA_MEANING.data_graphs_math
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre curvas y gráficos?",
      turnCount,
    };
  }

  const area = scientificAreaFromAnalyze(input.analyzeContext);
  return {
    interpretation: "Consulta general sobre el producto.",
    explanation: `Está en ${currentSurfaceLabel(input.system)}. Puede relacionar esta superficie con otras capacidades (comparar, analizar, curvas, resultados existentes). No ejecuto ni elijo métodos. ¿Qué quiere localizar?`,
    orientation: orientationFor(
      "scientific_area",
      area,
      PRODUCT_AREA_MEANING[area]
    ),
    continuationPrompt: "¿Quiere consultarme algo más?",
    turnCount,
  };
}

import type {
  AnalyzeConversationContext,
  CompareConversationContext,
  MathConversationContext,
} from "./contract";
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
  compareContext: CompareConversationContext | null;
  mathContext: MathConversationContext | null;
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

function slotOccupancyPhrase(
  occupied: boolean | null,
  fileName: string | null,
  slot: "A" | "B"
): string {
  if (occupied !== true) return `Slot ${slot} está vacío`;
  if (fileName) return `Slot ${slot} tiene «${fileName}»`;
  return `Slot ${slot} está ocupado`;
}

function occupancySummary(
  compare: CompareConversationContext | null
): string {
  if (!compare) {
    return "No hay ocupación de slots de comparación en el contexto. La conversación no captura datasets.";
  }
  const a = slotOccupancyPhrase(
    compare.slotAOccupied,
    compare.slotAFileName,
    "A"
  );
  const b = slotOccupancyPhrase(
    compare.slotBOccupied,
    compare.slotBFileName,
    "B"
  );
  const aOn = compare.slotAOccupied === true;
  const bOn = compare.slotBOccupied === true;
  if (!aOn && !bOn) {
    return `${a}. ${b}. Usted decide si usa los controles de Datos. La conversación no captura ni llena slots.`;
  }
  if (aOn && !bOn) {
    return `${a}. ${b}. Usted decide si llena B. La conversación no llena el slot vacío.`;
  }
  if (!aOn && bOn) {
    return `${a}. ${b}. Usted decide si llena A. La conversación no llena el slot vacío.`;
  }
  return `${a}. ${b}. Hay información en ambos slots. La revisión de esa comparación está en Resultados; usted decide si abre esa sección. La conversación no ejecuta el análisis ni genera resultados.`;
}

function occupancyFootnote(
  compare: CompareConversationContext | null
): string {
  if (!compare) return "";
  const aOn = compare.slotAOccupied === true;
  const bOn = compare.slotBOccupied === true;
  if (!aOn && !bOn) return " Slot A y Slot B están vacíos.";
  if (aOn && !bOn) {
    const name = compare.slotAFileName ? ` (${compare.slotAFileName})` : "";
    return ` Slot A está ocupado${name}; Slot B está vacío.`;
  }
  if (!aOn && bOn) {
    const name = compare.slotBFileName ? ` (${compare.slotBFileName})` : "";
    return ` Slot B está ocupado${name}; Slot A está vacío.`;
  }
  return " Slot A y Slot B están ocupados.";
}

function isOccupancyQuestion(text: string): boolean {
  return includesAny(text, [
    "estoy comparando",
    "que estoy comparando",
    "otro grupo",
    "que hay en a",
    "que hay en b",
    "que hay en el slot",
    "hay en a",
    "hay en b",
    "slot a",
    "slot b",
  ]);
}

function mathOccupancySummary(
  math: MathConversationContext | null
): string {
  if (!math) {
    return "No hay un contexto de constructor de curvas disponible. La conversación no escribe expresiones ni grafica.";
  }
  const hasExpr = math.hasNonEmptyExpressions === true;
  const graphed = math.hasGraphedCurves === true;
  const panel = math.constructorPanelOpen === true;
  const panelNote = panel
    ? " El panel del constructor está abierto."
    : " El panel del constructor puede usarse en Datos.";
  if (!hasExpr) {
    return `El constructor no tiene expresiones no vacías.${panelNote} Usted decide si escribe una expresión. La conversación no escribe expresiones.`;
  }
  if (!graphed) {
    return `Hay expresiones en el constructor, pero aún no se han graficado.${panelNote} Usted decide si usa Graficar. La conversación no llama a Graficar ni reescribe expresiones.`;
  }
  return `Hay contenido de curvas graficado.${panelNote} La revisión de ese gráfico está en Resultados; usted decide si abre esa sección. La conversación no genera resultados ni reescribe expresiones.`;
}

function mathOccupancyFootnote(
  math: MathConversationContext | null
): string {
  if (!math) return "";
  const parts: string[] = [];
  if (math.constructorPanelOpen === true) parts.push("el constructor está abierto");
  if (math.hasGraphedCurves === true) parts.push("hay curvas graficadas");
  else if (math.hasNonEmptyExpressions === true) {
    parts.push("hay expresiones aún no graficadas");
  }
  if (parts.length === 0) return "";
  return ` Ahora ${parts.join(" y ")}.`;
}

function mathCompareHonesty(
  here: SystemContext["activeConversationDomain"],
  math: MathConversationContext | null
): string {
  if (
    here !== "math" &&
    math?.hasNonEmptyExpressions !== true &&
    math?.hasGraphedCurves !== true
  ) {
    return "";
  }
  return " Las curvas y=f(x) del constructor no se capturan en Slot A/B. Comparar usa datasets experimentales. La conversación no llena slots ni inicia el flujo de comparación.";
}

function refersToVisualBuilder(text: string): boolean {
  return includesAny(text, [
    "constructor visual",
    "visual builder",
    "builder visual",
    "graficos visuales",
  ]);
}

function isWhereQuestion(text: string): boolean {
  return includesAny(text, [
    "donde hago",
    "donde esta",
    "donde queda",
    "donde veo",
    "donde evaluo",
    "y donde",
  ]);
}

function isMathLocationQuestion(text: string): boolean {
  if (refersToVisualBuilder(text)) return false;
  return (
    isWhereQuestion(text) &&
    includesAny(text, ["constructor", "curva", "curvas", "y f x"])
  );
}

function isMathOccupancyQuestion(text: string): boolean {
  if (refersToVisualBuilder(text)) return false;
  return includesAny(text, [
    "estoy graficando",
    "que estoy graficando",
    "hay curvas",
    "que hay graficado",
    "hay graficado",
    "el constructor",
  ]);
}

function isResultsLocationQuestion(text: string): boolean {
  return (
    isWhereQuestion(text) && includesAny(text, ["resultado", "resultados"])
  );
}

function isReportsLocationQuestion(text: string): boolean {
  return (
    isWhereQuestion(text) &&
    includesAny(text, ["reporte", "reportes", "informe"])
  );
}

function isEvaluateLocationQuestion(text: string): boolean {
  return (
    isWhereQuestion(text) &&
    includesAny(text, ["metodologia", "publicacion", "evaluar publicacion"])
  );
}

function isMathCurveCapabilityQuestion(text: string): boolean {
  if (refersToVisualBuilder(text)) return false;
  return includesAny(text, ["curva", "curvas", "graficar", "grafico", "constructor"]);
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

  if (isMathLocationQuestion(text)) {
    return {
      interpretation: "Quiere localizar el constructor de curvas.",
      explanation: `El constructor de curvas y=f(x) está en Datos.${mathOccupancyFootnote(input.mathContext)} Usted decide si abre ese constructor con los controles del workspace. La conversación no abre el constructor ni reescribe expresiones.`,
      orientation: orientationFor(
        "data_area",
        "data_graphs_math",
        PRODUCT_AREA_MEANING.data_graphs_math
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre el constructor de curvas?",
      turnCount,
    };
  }

  if (isResultsLocationQuestion(text)) {
    return {
      interpretation: "Quiere localizar resultados ya calculados.",
      explanation:
        "La revisión de resultados que ya se calcularon está en Resultados. Usted decide si abre esa sección. La conversación no genera resultados científicos ni ejecuta el análisis.",
      orientation: orientationFor(
        "existing_dashboard",
        "existing_results",
        PRODUCT_AREA_MEANING.existing_results
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre resultados existentes?",
      turnCount,
    };
  }

  if (isReportsLocationQuestion(text)) {
    return {
      interpretation: "Quiere localizar reportes existentes.",
      explanation:
        "Los reportes que ya existan viven en la sección Reportes. Usted decide si abre esa sección. La conversación no genera un reporte ni sustituye el motor de publicación.",
      orientation: orientationFor(
        "existing_dashboard",
        "existing_reports",
        PRODUCT_AREA_MEANING.existing_reports
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre reportes existentes?",
      turnCount,
    };
  }

  if (isEvaluateLocationQuestion(text)) {
    return {
      interpretation: "Quiere localizar la evaluación de metodología o publicación.",
      explanation:
        "La evaluación de metodología y publicación es una capacidad de Análisis. Usted decide si usa el inspector. La conversación no inicia un flujo, no elige un método científico ni ejecuta indicadores.",
      orientation: orientationFor(
        "scientific_area",
        "publication_evaluation",
        PRODUCT_AREA_MEANING.publication_evaluation
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre evaluar metodología?",
      turnCount,
    };
  }

  if (!refersToVisualBuilder(text) && isWhereQuestion(text)) {
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

  if (isOccupancyQuestion(text)) {
    const previousMeaning = input.previous?.orientation.meaning;
    const referentNote =
      previousMeaning && includesAny(text, ["otro grupo", "y esto"])
        ? ` Se refiere a lo anterior (${previousMeaning}).`
        : "";
    return {
      interpretation: "Pregunta por los datasets en los slots de comparación.",
      explanation: `${occupancySummary(input.compareContext)}.${referentNote} Usted decide si usa los controles de Datos. La conversación no captura, no llena slots ni ejecuta.`,
      orientation: orientationFor(
        "data_area",
        "data_compare_groups",
        PRODUCT_AREA_MEANING.data_compare_groups
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre los slots de comparación?",
      turnCount,
    };
  }

  if (includesAny(text, ["comparar", "comparacion", "grupos"])) {
    const relatedNote = productAreasAreRelated(here, "compare")
      ? here && here !== "compare"
        ? " Esa capacidad está relacionada con la superficie donde está ahora."
        : ""
      : " Aun así puede referirse a comparar desde aquí; el contexto actual no limita el referente.";
    const occupancyNote = occupancyFootnote(input.compareContext);
    const mathHonesty = mathCompareHonesty(here, input.mathContext);
    return {
      interpretation: "La pregunta se refiere a comparar grupos o datasets.",
      explanation: `Está en ${currentSurfaceLabel(input.system)}. La comparación de grupos es una capacidad de Datos (comparar datasets), no una orden de ejecución.${relatedNote}${occupancyNote}${mathHonesty} Usted decide si usa esa superficie. La conversación no inicia el flujo ni selecciona grupos.`,
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

  if (isMathOccupancyQuestion(text)) {
    const previousMeaning = input.previous?.orientation.meaning;
    const referentNote =
      previousMeaning && includesAny(text, ["y esto", "y eso"])
        ? ` Se refiere a lo anterior (${previousMeaning}).`
        : "";
    return {
      interpretation: "Pregunta por el estado del constructor de curvas.",
      explanation: `${mathOccupancySummary(input.mathContext)}.${referentNote} Usted decide si usa los controles de Datos. La conversación no escribe expresiones, no grafica ni navega.`,
      orientation: orientationFor(
        "data_area",
        "data_graphs_math",
        PRODUCT_AREA_MEANING.data_graphs_math
      ),
      continuationPrompt: "¿Quiere consultarme algo más sobre el constructor de curvas?",
      turnCount,
    };
  }

  if (isMathCurveCapabilityQuestion(text)) {
    return {
      interpretation: "La pregunta se refiere a curvas o gráficos.",
      explanation: `Está en ${currentSurfaceLabel(input.system)}. El constructor de curvas está en Datos.${mathOccupancyFootnote(input.mathContext)} La conversación no navega ni reescribe expresiones.`,
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

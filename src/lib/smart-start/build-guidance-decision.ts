import { CAPABILITY_IDENTITY } from "./capability-identity";
import { classifyIntent, matchingIntentIds } from "./classify-intent";
import { extractMethodInterest } from "./method-interest";
import { keywordMatches, normalizeIntentText } from "./normalize-intent-text";
import type {
  GuidanceDataSource,
  GuidanceDecision,
  GuidanceGoal,
  HomeGuidanceContext,
  HomeGuidanceConversationState,
  MethodInterest,
  SmartStartCardOptionId,
  SmartStartIntentId,
} from "./types";
import { EMPTY_HOME_GUIDANCE_CONVERSATION } from "./types";

const FILE_TOKENS = ["csv", "excel", "xlsx", "xls", "ods", "txt"] as const;
const ANALYZE_TOKENS = ["analizar", "analisis"] as const;
const EXPLORE_PHRASES = ["que puedo hacer", "descubrir"] as const;

const METHOD_LOCATION_COPY =
  "Las herramientas de ajuste o regresión están en Análisis (Matemáticas), después de incorporar los datos. No se elige ni se ejecuta un método por usted.";

type GuidancePath = Omit<
  GuidanceDecision,
  "goal" | "dataSource" | "methodInterest"
>;

function sessionStatus(
  context: HomeGuidanceContext
): "loaded" | "empty" | "unknown" {
  if (context.hasDataset === true || context.hasExperimentalSeries === true) {
    return "loaded";
  }
  if (context.hasDataset === null || context.hasExperimentalSeries === null) {
    return "unknown";
  }
  return "empty";
}

function anyToken(text: string, tokens: readonly string[]): boolean {
  return tokens.some((token) => keywordMatches(text, token));
}

function hasImportLanguage(text: string): boolean {
  return keywordMatches(text, "importar") || keywordMatches(text, "archivo de datos");
}

function isCompoundFileAndAnalyze(text: string): boolean {
  return anyToken(text, ANALYZE_TOKENS) && anyToken(text, FILE_TOKENS) && !hasImportLanguage(text);
}

function isExploreRequest(text: string): boolean {
  return EXPLORE_PHRASES.some((phrase) => text.includes(phrase));
}

function isImportFollowUp(text: string): boolean {
  return (
    anyToken(text, FILE_TOKENS) ||
    keywordMatches(text, "importar") ||
    keywordMatches(text, "archivo") ||
    keywordMatches(text, "cargar")
  );
}

function isLoadedFollowUp(text: string): boolean {
  return (
    keywordMatches(text, "cargados") ||
    keywordMatches(text, "cargado") ||
    keywordMatches(text, "ya tengo") ||
    keywordMatches(text, "ya estan") ||
    keywordMatches(text, "ya está") ||
    keywordMatches(text, "ya esta")
  );
}

function isUnrelatedConcreteRequest(text: string): boolean {
  const winner = classifyIntent(text);
  if (!winner) return false;
  return (
    winner.intentId === "compare-datasets" ||
    winner.intentId === "math-graph" ||
    winner.intentId === "evaluate-publication" ||
    winner.intentId === "expert-mode" ||
    winner.intentId === "open-project"
  );
}

function inferDataSource(
  text: string,
  status: "loaded" | "empty" | "unknown"
): GuidanceDataSource {
  if (keywordMatches(text, "csv")) return "csv";
  if (anyToken(text, FILE_TOKENS)) return "file";
  if (status === "loaded") return "session";
  return "unspecified";
}

function uniqueCards(
  ids: SmartStartCardOptionId[]
): SmartStartCardOptionId[] {
  const seen = new Set<SmartStartCardOptionId>();
  const result: SmartStartCardOptionId[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}

function resolveMethodInterest(
  input: string,
  previous: HomeGuidanceConversationState
): MethodInterest | null {
  if (isUnrelatedConcreteRequest(input)) {
    return extractMethodInterest(input);
  }
  return extractMethodInterest(input) ?? previous.methodInterest;
}

function acknowledgeMethodInterest(
  path: GuidancePath,
  methodInterest: MethodInterest | null
): GuidancePath {
  if (!methodInterest) return path;
  return {
    ...path,
    interpretation: `${path.interpretation} Mencionó interés en ${methodInterest.userTerm}.`,
    explanation: `${path.explanation} ${METHOD_LOCATION_COPY}`,
  };
}

function decision(
  partial: GuidancePath,
  goal: GuidanceGoal,
  dataSource: GuidanceDataSource,
  methodInterest: MethodInterest | null
): GuidanceDecision {
  const path = acknowledgeMethodInterest(
    {
      ...partial,
      suggestedCardIds: uniqueCards(partial.suggestedCardIds),
    },
    methodInterest
  );
  return {
    ...path,
    goal,
    dataSource,
    methodInterest,
  };
}

function importThenAnalyze(
  interpretation: string,
  dataSource: GuidanceDataSource,
  methodInterest: MethodInterest | null
): GuidanceDecision {
  return decision(
    {
      interpretation,
      explanation:
        "Para analizar un archivo CSV primero hay que incorporarlo. Use la tarjeta Importar. Después podrá continuar con Analizar.",
      prerequisite: "Hace falta incorporar los datos antes de analizarlos.",
      suggestedCardIds: ["analyze-dataset", "analyze-workspace"],
      primaryCardId: "analyze-dataset",
      clarification: null,
      uncertainty: "none",
      candidateIntentIds: ["analyze-dataset", "analyze-workspace"],
    },
    "analyze",
    dataSource,
    methodInterest
  );
}

function analyzeAvailable(
  interpretation: string,
  dataSource: GuidanceDataSource,
  methodInterest: MethodInterest | null
): GuidanceDecision {
  return decision(
    {
      interpretation,
      explanation:
        "Los datos ya están disponibles. Use la tarjeta Analizar para continuar en el espacio de análisis.",
      prerequisite: "Dataset o series ya disponibles en la sesión.",
      suggestedCardIds: ["analyze-workspace"],
      primaryCardId: "analyze-workspace",
      clarification: null,
      uncertainty: "none",
      candidateIntentIds: ["analyze-workspace"],
    },
    "analyze",
    dataSource,
    methodInterest
  );
}

function importFirstForAnalyze(
  interpretation: string,
  dataSource: GuidanceDataSource,
  methodInterest: MethodInterest | null
): GuidanceDecision {
  return decision(
    {
      interpretation,
      explanation:
        "Primero hay que incorporar los datos. Use la tarjeta Importar. Importar sirve para traer datos al producto; Analizar es el espacio de análisis.",
      prerequisite: "No hay dataset ni series cargadas.",
      suggestedCardIds: ["analyze-dataset", "analyze-workspace"],
      primaryCardId: "analyze-dataset",
      clarification: null,
      uncertainty: "none",
      candidateIntentIds: ["analyze-workspace", "analyze-dataset"],
    },
    "analyze",
    dataSource,
    methodInterest
  );
}

function askDataSource(
  interpretation: string,
  dataSource: GuidanceDataSource,
  methodInterest: MethodInterest | null
): GuidanceDecision {
  return decision(
    {
      interpretation,
      explanation:
        "Puedo orientar el siguiente paso cuando sepa si los datos ya están en Scientific Graph AI.",
      prerequisite: null,
      suggestedCardIds: ["analyze-dataset", "analyze-workspace"],
      primaryCardId: null,
      clarification:
        "¿Ya tiene los datos cargados en Scientific Graph AI o necesita importar un archivo?",
      uncertainty: "unknown_context",
      candidateIntentIds: ["analyze-workspace", "analyze-dataset"],
    },
    "analyze",
    dataSource,
    methodInterest
  );
}

function guidanceForWinner(
  winnerId: SmartStartIntentId,
  status: "loaded" | "empty" | "unknown",
  candidates: SmartStartIntentId[],
  dataSource: GuidanceDataSource,
  methodInterest: MethodInterest | null
): GuidanceDecision {
  if (winnerId === "compare-datasets") {
    return decision(
      {
        interpretation: "Quiere comparar grupos o conjuntos.",
        explanation:
          "Use la tarjeta Comparar. Es el punto de entrada visible para esa comparación.",
        prerequisite: null,
        suggestedCardIds: ["compare-datasets"],
        primaryCardId: "compare-datasets",
        clarification: null,
        uncertainty: "none",
        candidateIntentIds: candidates,
      },
      "compare",
      dataSource,
      methodInterest
    );
  }
  if (winnerId === "math-graph") {
    return decision(
      {
        interpretation: "Quiere graficar una función matemática.",
        explanation:
          "Use la tarjeta Gráfico y=f(x) para abrir el constructor de expresiones.",
        prerequisite: null,
        suggestedCardIds: ["math-graph"],
        primaryCardId: "math-graph",
        clarification: null,
        uncertainty: "none",
        candidateIntentIds: candidates,
      },
      "plot",
      dataSource,
      methodInterest
    );
  }
  if (winnerId === "evaluate-publication") {
    return decision(
      {
        interpretation: "Quiere evaluar la metodología o preparación de publicación.",
        explanation:
          "Use la tarjeta Evaluar metodología. No elige un test estadístico por usted.",
        prerequisite: null,
        suggestedCardIds: ["evaluate-publication"],
        primaryCardId: "evaluate-publication",
        clarification: null,
        uncertainty: "none",
        candidateIntentIds: candidates,
      },
      "evaluate",
      dataSource,
      methodInterest
    );
  }
  if (winnerId === "expert-mode") {
    return decision(
      {
        interpretation: "Busca herramientas avanzadas.",
        explanation:
          "Si lo necesita, la tarjeta Avanzado abre ese conjunto de opciones. No es el camino habitual.",
        prerequisite: null,
        suggestedCardIds: ["expert-mode"],
        primaryCardId: "expert-mode",
        clarification: null,
        uncertainty: "none",
        candidateIntentIds: candidates,
      },
      "unknown",
      dataSource,
      methodInterest
    );
  }
  if (winnerId === "open-project") {
    return decision(
      {
        interpretation: "Quiere continuar un proyecto guardado.",
        explanation:
          "Eso no es una tarjeta de Inicio. Las tarjetas visibles siguen siendo Importar, Comparar, Gráfico y=f(x), Analizar, Evaluar metodología y Avanzado.",
        prerequisite: null,
        suggestedCardIds: [],
        primaryCardId: null,
        clarification: null,
        uncertainty: "low",
        candidateIntentIds: candidates,
      },
      "unknown",
      dataSource,
      methodInterest
    );
  }
  if (winnerId === "analyze-dataset") {
    const subsequent: SmartStartCardOptionId[] = [
      "analyze-dataset",
      "analyze-workspace",
    ];
    return decision(
      {
        interpretation:
          "Quiere incorporar datos (por ejemplo un CSV) para poder analizarlos.",
        explanation:
          "Use la tarjeta Importar para cargar el archivo. Después podrá continuar con Analizar. Resultados es donde se revisan salidas; Reportes, donde se empaqueta el documento.",
        prerequisite: null,
        suggestedCardIds: subsequent,
        primaryCardId: "analyze-dataset",
        clarification: null,
        uncertainty: "none",
        candidateIntentIds: candidates,
      },
      "import",
      dataSource,
      methodInterest
    );
  }
  if (status === "loaded") {
    return analyzeAvailable(
      "Quiere analizar los datos de la sesión.",
      dataSource,
      methodInterest
    );
  }
  if (status === "empty") {
    return importFirstForAnalyze(
      "Quiere analizar datos y la sesión está vacía.",
      dataSource,
      methodInterest
    );
  }
  return askDataSource(
    "Quiere analizar, pero no está claro si ya hay datos cargados.",
    dataSource,
    methodInterest
  );
}

export function nextGuidanceConversation(
  decisionValue: GuidanceDecision,
  userText: string
): HomeGuidanceConversationState {
  return {
    lastUserText: userText,
    candidateIntentIds: decisionValue.candidateIntentIds,
    pendingSlot: decisionValue.clarification ? "data_source" : null,
    suggestedCardIds: decisionValue.suggestedCardIds,
    clarificationAsked: Boolean(decisionValue.clarification),
    methodInterest: decisionValue.methodInterest,
  };
}

export function buildGuidanceDecision(
  input: string,
  context: HomeGuidanceContext,
  previous: HomeGuidanceConversationState = EMPTY_HOME_GUIDANCE_CONVERSATION
): GuidanceDecision {
  const text = normalizeIntentText(input);
  const methodInterest = resolveMethodInterest(input, previous);
  const status = sessionStatus(context);
  const dataSource = inferDataSource(text, status);

  if (text.trim().length === 0) {
    return decision(
      {
        interpretation: "No hay un objetivo descrito.",
        explanation:
          "Escriba qué desea hacer. Las tarjetas de abajo son las entradas visibles.",
        prerequisite: null,
        suggestedCardIds: [],
        primaryCardId: null,
        clarification: null,
        uncertainty: "low",
        candidateIntentIds: [],
      },
      "unknown",
      "unspecified",
      null
    );
  }

  if (
    previous.pendingSlot === "data_source" &&
    previous.clarificationAsked &&
    !isUnrelatedConcreteRequest(input)
  ) {
    if (isLoadedFollowUp(text) || (status === "loaded" && !isImportFollowUp(text))) {
      return analyzeAvailable(
        "Indicó que los datos ya están disponibles.",
        dataSource === "unspecified" ? "session" : dataSource,
        methodInterest
      );
    }
    if (isImportFollowUp(text) || status === "empty") {
      return importThenAnalyze(
        "Indicó que necesita incorporar un archivo.",
        dataSource,
        methodInterest
      );
    }
    return decision(
      {
        interpretation: "Sigue sin estar claro si los datos ya están cargados.",
        explanation:
          "Puede usar Importar para incorporar un archivo o Analizar si ya tiene datos en la sesión. No navegaré por usted.",
        prerequisite: null,
        suggestedCardIds: ["analyze-dataset", "analyze-workspace"],
        primaryCardId: null,
        clarification: null,
        uncertainty: "unknown_context",
        candidateIntentIds: ["analyze-workspace", "analyze-dataset"],
      },
      "analyze",
      dataSource,
      methodInterest
    );
  }

  if (
    previous.methodInterest !== null &&
    !isUnrelatedConcreteRequest(input) &&
    isLoadedFollowUp(text)
  ) {
    return analyzeAvailable(
      "Indicó que los datos ya están disponibles.",
      dataSource === "unspecified" ? "session" : dataSource,
      methodInterest
    );
  }

  const candidates = matchingIntentIds(input);
  const winner = classifyIntent(input);

  if (isExploreRequest(text)) {
    if (status === "loaded") {
      return decision(
        {
          interpretation: "Quiere ver qué puede hacer con los datos ya disponibles.",
          explanation:
            "Las tarjetas son las entradas visibles. Con datos cargados puede usar Analizar, Comparar o Evaluar metodología. Resultados y Reportes aparecen después, al revisar y documentar.",
          prerequisite: "Datos ya disponibles.",
          suggestedCardIds: [
            "analyze-workspace",
            "compare-datasets",
            "evaluate-publication",
          ],
          primaryCardId: "analyze-workspace",
          clarification: null,
          uncertainty: "none",
          candidateIntentIds: candidates,
        },
        "explore",
        dataSource,
        methodInterest
      );
    }
    if (status === "empty") {
      return decision(
        {
          interpretation: "Quiere ver qué puede hacer, y la sesión está vacía.",
          explanation:
            "Empiece por Importar para traer datos. Luego podrá usar Analizar, Comparar u otras tarjetas. No invento un dataset.",
          prerequisite: "No hay datos cargados.",
          suggestedCardIds: [
            "analyze-dataset",
            "analyze-workspace",
            "compare-datasets",
          ],
          primaryCardId: "analyze-dataset",
          clarification: null,
          uncertainty: "none",
          candidateIntentIds: candidates,
        },
        "explore",
        dataSource,
        methodInterest
      );
    }
    return askDataSource(
      "Quiere explorar qué puede hacer, pero no está claro si hay datos.",
      dataSource,
      methodInterest
    );
  }

  if (isCompoundFileAndAnalyze(text)) {
    if (status === "loaded") {
      return decision(
        {
          interpretation:
            "Quiere analizar y menciona un CSV, y ya hay datos en la sesión.",
          explanation:
            "Si son los datos ya cargados, use Analizar. Si es un CSV nuevo, use Importar y después Analizar.",
          prerequisite: "Hay datos en la sesión; un CSV nuevo requeriría Importar.",
          suggestedCardIds: ["analyze-workspace", "analyze-dataset"],
          primaryCardId: "analyze-workspace",
          clarification:
            previous.clarificationAsked
              ? null
              : "¿Quiere analizar los datos ya cargados o incorporar un CSV nuevo?",
          uncertainty: "low",
          candidateIntentIds: ["analyze-workspace", "analyze-dataset"],
        },
        "analyze",
        dataSource,
        methodInterest
      );
    }
    if (status === "unknown") {
      return askDataSource(
        "Quiere analizar un CSV, pero no está claro si ya hay datos cargados.",
        dataSource,
        methodInterest
      );
    }
    return importThenAnalyze(
      "Quiere analizar un CSV: hay que incorporarlo y luego analizarlo.",
      dataSource,
      methodInterest
    );
  }

  if (!winner) {
    return decision(
      {
        interpretation: "No hay una intención clara.",
        explanation:
          "Pruebe describir el objetivo o use una tarjeta: Importar, Comparar, Gráfico y=f(x), Analizar, Evaluar metodología o Avanzado.",
        prerequisite: null,
        suggestedCardIds: [],
        primaryCardId: null,
        clarification: null,
        uncertainty: "low",
        candidateIntentIds: [],
      },
      "unknown",
      dataSource,
      null
    );
  }

  return guidanceForWinner(
    winner.intentId,
    status,
    [winner.intentId, ...candidates.filter((id) => id !== winner.intentId)],
    dataSource,
    methodInterest
  );
}

export function cardLauncherTitle(id: SmartStartCardOptionId): string {
  return (
    CAPABILITY_IDENTITY.find((item) => item.id === id)?.launcherTitle ?? id
  );
}

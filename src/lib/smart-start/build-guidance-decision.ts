import { CAPABILITY_IDENTITY } from "./capability-identity";
import { classifyIntent, matchingIntentIds } from "./classify-intent";
import {
  extractUserConcepts,
  deriveMethodInterest,
  formatConceptLocationCopy,
  formatConceptMention,
  knownAnalysisConcepts,
} from "./concept-vocabulary";
import { detectSpeechAct } from "./speech-act";
import { resolveTurnType } from "./resolve-turn";
import { keywordMatches, normalizeIntentText } from "./normalize-intent-text";
import type {
  ContinuationKind,
  GuidanceDataSource,
  GuidanceDecision,
  GuidanceGoal,
  GuidanceSpeechAct,
  GuidanceTurnType,
  HomeGuidanceContext,
  HomeGuidanceConversationState,
  MethodInterest,
  SmartStartCardOptionId,
  SmartStartIntentId,
  UserConcept,
} from "./types";
import { EMPTY_HOME_GUIDANCE_CONVERSATION } from "./types";

const FILE_TOKENS = ["csv", "excel", "xlsx", "xls", "ods", "txt"] as const;
const ANALYZE_TOKENS = ["analizar", "analisis"] as const;

const DISPLAY_ONLY_CONTINUATION =
  "Las tarjetas de Inicio siguen siendo el punto de entrada. No inicio un flujo ni elijo un método.";

type GuidancePath = Omit<
  GuidanceDecision,
  | "goal"
  | "dataSource"
  | "methodInterest"
  | "speechAct"
  | "userConcepts"
  | "continuationPrompt"
  | "turnType"
  | "turnCount"
  | "continuationKind"
>;

type GuidanceEnrichment = {
  speechAct: GuidanceSpeechAct;
  userConcepts: UserConcept[];
  methodInterest: MethodInterest | null;
  continuationPrompt: string | null;
  turnType: GuidanceTurnType;
  turnCount: number;
};

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

function isClassifierOwnedAction(
  winnerId: SmartStartIntentId | undefined
): boolean {
  return (
    winnerId === "compare-datasets" ||
    winnerId === "math-graph" ||
    winnerId === "evaluate-publication" ||
    winnerId === "expert-mode" ||
    winnerId === "open-project"
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

function emptyEnrichment(
  turnType: GuidanceTurnType,
  turnCount: number
): GuidanceEnrichment {
  return {
    speechAct: "unknown",
    userConcepts: [],
    methodInterest: null,
    continuationPrompt: null,
    turnType,
    turnCount,
  };
}

function resolveUserConcepts(
  input: string,
  previous: HomeGuidanceConversationState,
  speechAct: GuidanceSpeechAct
): UserConcept[] {
  const extracted = extractUserConcepts(input);
  if (isUnrelatedConcreteRequest(input) || speechAct === "explore") {
    return extracted;
  }
  return extracted.length > 0 ? extracted : previous.userConcepts;
}

function continuationKindFromPrompt(
  prompt: string | null
): ContinuationKind {
  return prompt ? "ask_before_continue" : "none";
}

function withContinuation(
  enrichment: GuidanceEnrichment,
  prompt: string | null
): GuidanceEnrichment {
  return { ...enrichment, continuationPrompt: prompt };
}

function acknowledgeConcepts(
  path: GuidancePath,
  userConcepts: UserConcept[]
): GuidancePath {
  if (userConcepts.length === 0) return path;
  const mention = formatConceptMention(userConcepts);
  const location = formatConceptLocationCopy(userConcepts);
  return {
    ...path,
    interpretation: mention
      ? `${path.interpretation} ${mention}`
      : path.interpretation,
    explanation: location
      ? `${path.explanation} ${location}`
      : path.explanation,
  };
}

function decision(
  partial: GuidancePath,
  goal: GuidanceGoal,
  dataSource: GuidanceDataSource,
  enrichment: GuidanceEnrichment
): GuidanceDecision {
  const path = acknowledgeConcepts(
    {
      ...partial,
      suggestedCardIds: uniqueCards(partial.suggestedCardIds),
    },
    enrichment.userConcepts
  );
  return {
    ...path,
    goal,
    dataSource,
    methodInterest: enrichment.methodInterest,
    speechAct: enrichment.speechAct,
    userConcepts: enrichment.userConcepts,
    continuationPrompt: enrichment.continuationPrompt,
    turnType: enrichment.turnType,
    turnCount: enrichment.turnCount,
    continuationKind: continuationKindFromPrompt(enrichment.continuationPrompt),
  };
}

function importThenAnalyze(
  interpretation: string,
  dataSource: GuidanceDataSource,
  enrichment: GuidanceEnrichment
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
    enrichment
  );
}

function analyzeAvailable(
  interpretation: string,
  dataSource: GuidanceDataSource,
  enrichment: GuidanceEnrichment
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
    enrichment
  );
}

function importFirstForAnalyze(
  interpretation: string,
  dataSource: GuidanceDataSource,
  enrichment: GuidanceEnrichment
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
    enrichment
  );
}

function askDataSource(
  interpretation: string,
  dataSource: GuidanceDataSource,
  enrichment: GuidanceEnrichment
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
    withContinuation(enrichment, null)
  );
}

function sessionAwareAnalyze(
  interpretation: string,
  status: "loaded" | "empty" | "unknown",
  dataSource: GuidanceDataSource,
  enrichment: GuidanceEnrichment
): GuidanceDecision {
  if (status === "loaded") {
    return analyzeAvailable(interpretation, dataSource, enrichment);
  }
  if (status === "empty") {
    return importFirstForAnalyze(interpretation, dataSource, enrichment);
  }
  return askDataSource(interpretation, dataSource, enrichment);
}

function defineConceptGuidance(
  dataSource: GuidanceDataSource,
  enrichment: GuidanceEnrichment
): GuidanceDecision {
  const known = knownAnalysisConcepts(enrichment.userConcepts);
  const suggested: SmartStartCardOptionId[] =
    known.length > 0 ? ["analyze-workspace"] : [];
  return decision(
    {
      interpretation: "Quiere una explicación de un término científico.",
      explanation:
        "Puedo indicar dónde vive esa idea en el producto, si hay un área verificada. No indico si un método es el adecuado para sus datos.",
      prerequisite: null,
      suggestedCardIds: suggested,
      primaryCardId: null,
      clarification: null,
      uncertainty: known.length > 0 ? "none" : "low",
      candidateIntentIds: suggested,
    },
    known.length > 0 ? "analyze" : "unknown",
    dataSource,
    withContinuation(enrichment, DISPLAY_ONLY_CONTINUATION)
  );
}

function unknownConceptGuidance(
  dataSource: GuidanceDataSource,
  enrichment: GuidanceEnrichment
): GuidanceDecision {
  return decision(
    {
      interpretation: "Mencionó un término científico que no corresponde a una capacidad verificada.",
      explanation:
        "No invento una herramienta, una tarjeta ni un área de producto. Las entradas visibles siguen siendo las tarjetas de Inicio.",
      prerequisite: null,
      suggestedCardIds: [],
      primaryCardId: null,
      clarification: null,
      uncertainty: "low",
      candidateIntentIds: [],
    },
    "unknown",
    dataSource,
    withContinuation(enrichment, DISPLAY_ONLY_CONTINUATION)
  );
}

function guidanceForWinner(
  winnerId: SmartStartIntentId,
  status: "loaded" | "empty" | "unknown",
  candidates: SmartStartIntentId[],
  dataSource: GuidanceDataSource,
  enrichment: GuidanceEnrichment
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
      enrichment
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
      enrichment
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
      enrichment
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
      enrichment
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
      enrichment
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
      enrichment
    );
  }
  if (status === "loaded") {
    return analyzeAvailable(
      "Quiere analizar los datos de la sesión.",
      dataSource,
      enrichment
    );
  }
  if (status === "empty") {
    return importFirstForAnalyze(
      "Quiere analizar datos y la sesión está vacía.",
      dataSource,
      enrichment
    );
  }
  return askDataSource(
    "Quiere analizar, pero no está claro si ya hay datos cargados.",
    dataSource,
    enrichment
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
    userConcepts: decisionValue.userConcepts,
    speechAct: decisionValue.speechAct,
    lastDecision: decisionValue,
    turnCount: decisionValue.turnCount,
    continuationKind: decisionValue.continuationKind,
  };
}

export function buildGuidanceDecision(
  input: string,
  context: HomeGuidanceContext,
  previous: HomeGuidanceConversationState = EMPTY_HOME_GUIDANCE_CONVERSATION
): GuidanceDecision {
  const text = normalizeIntentText(input);
  const turnType = resolveTurnType(input, previous);
  const turnCount =
    text.trim().length === 0 ? previous.turnCount : previous.turnCount + 1;
  const speechAct = detectSpeechAct(input);
  const extractedConcepts = extractUserConcepts(input);
  const userConcepts = resolveUserConcepts(input, previous, speechAct);
  const methodInterest = deriveMethodInterest(userConcepts);
  const status = sessionStatus(context);
  const dataSource = inferDataSource(text, status);
  const enrichment: GuidanceEnrichment = {
    speechAct,
    userConcepts,
    methodInterest,
    continuationPrompt: null,
    turnType,
    turnCount,
  };
  const extractedEnrichment: GuidanceEnrichment = {
    speechAct,
    userConcepts: extractedConcepts,
    methodInterest: deriveMethodInterest(extractedConcepts),
    continuationPrompt: null,
    turnType,
    turnCount,
  };

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
      emptyEnrichment(turnType, turnCount)
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
        enrichment
      );
    }
    if (isImportFollowUp(text) || status === "empty") {
      return importThenAnalyze(
        "Indicó que necesita incorporar un archivo.",
        dataSource,
        enrichment
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
      enrichment
    );
  }

  if (
    (previous.methodInterest !== null || previous.userConcepts.length > 0) &&
    !isUnrelatedConcreteRequest(input) &&
    isLoadedFollowUp(text)
  ) {
    return analyzeAvailable(
      "Indicó que los datos ya están disponibles.",
      dataSource === "unspecified" ? "session" : dataSource,
      enrichment
    );
  }

  const candidates = matchingIntentIds(input);
  const winner = classifyIntent(input);
  const winnerId = winner?.intentId;

  if (speechAct === "explore") {
    if (status === "loaded") {
      return decision(
        {
          interpretation: "Quiere ver qué puede hacer con los datos ya disponibles.",
          explanation:
            "Las tarjetas son las entradas visibles. Con datos cargados puede usar Analizar, Comparar o Evaluar metodología. Resultados y Reportes aparecen después, al revisar y documentar. No elijo un método estadístico por usted.",
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
        enrichment
      );
    }
    if (status === "empty") {
      return decision(
        {
          interpretation: "Quiere ver qué puede hacer, y la sesión está vacía.",
          explanation:
            "Empiece por Importar para traer datos. Luego podrá usar Analizar, Comparar u otras tarjetas. No invento un dataset ni elijo un método estadístico.",
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
        enrichment
      );
    }
    return askDataSource(
      "Quiere explorar qué puede hacer, pero no está claro si hay datos.",
      dataSource,
      enrichment
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
        enrichment
      );
    }
    if (status === "unknown") {
      return askDataSource(
        "Quiere analizar un CSV, pero no está claro si ya hay datos cargados.",
        dataSource,
        enrichment
      );
    }
    return importThenAnalyze(
      "Quiere analizar un CSV: hay que incorporarlo y luego analizarlo.",
      dataSource,
      enrichment
    );
  }

  if (winner && isClassifierOwnedAction(winner.intentId)) {
    return guidanceForWinner(
      winner.intentId,
      status,
      [winner.intentId, ...candidates.filter((id) => id !== winner.intentId)],
      dataSource,
      enrichment
    );
  }

  if (speechAct === "define" && extractedConcepts.length > 0) {
    return defineConceptGuidance(dataSource, extractedEnrichment);
  }

  const knownNow = knownAnalysisConcepts(extractedConcepts);
  const hasExplicitImportOrFile =
    hasImportLanguage(text) || anyToken(text, FILE_TOKENS);

  if (
    knownNow.length > 0 &&
    !hasExplicitImportOrFile &&
    (speechAct === "use" ||
      !winner ||
      winnerId === "analyze-workspace" ||
      winnerId === "analyze-dataset")
  ) {
    const conceptUse = withContinuation(
      extractedEnrichment,
      winner ? null : DISPLAY_ONLY_CONTINUATION
    );
    return sessionAwareAnalyze(
      "Quiere usar una capacidad de análisis mencionada en el texto.",
      status,
      dataSource,
      conceptUse
    );
  }

  if (
    !winner &&
    extractedConcepts.some((item) => item.conceptId === "unknown")
  ) {
    return unknownConceptGuidance(dataSource, extractedEnrichment);
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
      emptyEnrichment(turnType, turnCount)
    );
  }

  return guidanceForWinner(
    winner.intentId,
    status,
    [winner.intentId, ...candidates.filter((id) => id !== winner.intentId)],
    dataSource,
    enrichment
  );
}

export function cardLauncherTitle(id: SmartStartCardOptionId): string {
  return (
    CAPABILITY_IDENTITY.find((item) => item.id === id)?.launcherTitle ?? id
  );
}

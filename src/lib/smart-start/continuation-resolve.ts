import { normalizeGuidanceText } from "./normalize-intent-text";
import { knownAnalysisConcepts } from "./concept-vocabulary";
import type {
  ContinuationKind,
  GuidanceDecision,
  HomeGuidanceContext,
  HomeGuidanceConversationState,
  SmartStartCardOptionId,
  UserConcept,
} from "./types";

export type ContinuationPolarity = "yes" | "no" | "ambiguous";

const CONTINUATION_CUES: readonly { cue: string; polarity: ContinuationPolarity }[] =
  [
    { cue: "si por favor", polarity: "yes" },
    { cue: "si quiero", polarity: "yes" },
    { cue: "ahora no", polarity: "no" },
    { cue: "no gracias", polarity: "no" },
    { cue: "nada mas", polarity: "no" },
    { cue: "eso es todo", polarity: "no" },
    { cue: "puede ser", polarity: "ambiguous" },
    { cue: "no se", polarity: "ambiguous" },
    { cue: "adelante", polarity: "yes" },
    { cue: "quizas", polarity: "ambiguous" },
    { cue: "depende", polarity: "ambiguous" },
    { cue: "claro", polarity: "yes" },
    { cue: "no", polarity: "no" },
    { cue: "si", polarity: "yes" },
  ];

const CONTINUATION_REST = new Set([
  "por",
  "favor",
  "que",
  "y",
  "el",
  "la",
  "un",
  "una",
  "de",
  "del",
  "a",
  "al",
  "me",
  "lo",
  "las",
  "los",
]);

export type ContinuationAnswerResult = {
  interpretation: string;
  explanation: string;
  continuationPrompt: string | null;
  continuationKind: ContinuationKind;
  suggestedCardIds: SmartStartCardOptionId[];
  primaryCardId: SmartStartCardOptionId | null;
  userConcepts: UserConcept[];
};

function leftoverTokensOk(text: string, cue: string): boolean {
  const leftover = text.replace(` ${cue} `, " ");
  const tokens = leftover.trim().split(/\s+/).filter(Boolean);
  return tokens.every((token) => CONTINUATION_REST.has(token));
}

export function matchContinuationAnswer(
  input: string
): ContinuationPolarity | null {
  const text = normalizeGuidanceText(input);
  for (const entry of CONTINUATION_CUES) {
    if (!text.includes(` ${entry.cue} `)) continue;
    if (!leftoverTokensOk(text, entry.cue)) continue;
    return entry.polarity;
  }
  return null;
}

export function isActionableContinuation(decision: GuidanceDecision): boolean {
  if (decision.clarification !== null) return false;
  if (!decision.continuationPrompt) return false;
  return (
    decision.continuationKind === "deepen_concept" ||
    decision.continuationKind === "next_step"
  );
}

export function isExhaustedContinuationYes(
  input: string,
  previous: HomeGuidanceConversationState
): boolean {
  return (
    previous.pendingSlot === null &&
    previous.lastDecision?.turnType === "continuation_answer" &&
    matchContinuationAnswer(input) === "yes"
  );
}

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

function analyzeCards(status: "loaded" | "empty" | "unknown"): {
  suggestedCardIds: SmartStartCardOptionId[];
  primaryCardId: SmartStartCardOptionId | null;
} {
  if (status === "loaded") {
    return {
      suggestedCardIds: ["analyze-workspace"],
      primaryCardId: "analyze-workspace",
    };
  }
  if (status === "empty") {
    return {
      suggestedCardIds: ["analyze-dataset", "analyze-workspace"],
      primaryCardId: "analyze-dataset",
    };
  }
  return {
    suggestedCardIds: ["analyze-dataset", "analyze-workspace"],
    primaryCardId: null,
  };
}

function previousConcepts(
  previous: HomeGuidanceConversationState
): UserConcept[] {
  if (previous.lastDecision?.userConcepts.length) {
    return previous.lastDecision.userConcepts;
  }
  return previous.userConcepts;
}

function closeResult(concepts: UserConcept[]): ContinuationAnswerResult {
  return {
    interpretation: "De acuerdo.",
    explanation:
      "Cuando quiera, las tarjetas de Inicio siguen siendo el punto de entrada.",
    continuationPrompt: null,
    continuationKind: "none",
    suggestedCardIds: [],
    primaryCardId: null,
    userConcepts: concepts,
  };
}

function deepenExplanation(ids: Set<string>): string {
  const parts: string[] = [];
  if (ids.has("pearson") || ids.has("correlation")) {
    parts.push(
      "Puedo ampliar el contexto de Pearson: describe la asociación lineal entre dos variables numéricas, no una instrucción de análisis."
    );
  }
  if (ids.has("regression")) {
    parts.push(
      "Puedo ampliar el contexto de la regresión: describe un ajuste entre variables, no una orden de análisis."
    );
  }
  if (ids.has("anova")) {
    parts.push(
      "Puedo ampliar el contexto de ANOVA: describe una comparación de medias cuando esa herramienta está en el producto."
    );
  }
  if (ids.has("descriptive") || ids.has("distribution")) {
    parts.push(
      "Puedo ampliar el contexto descriptivo: sirve para resumir y observar, no para elegir un método por usted."
    );
  }
  if (parts.length === 0) {
    return "Puedo ampliar solo el contexto ya verificado. No invento una capacidad ni elijo un método.";
  }
  return `${parts.join(" ")} No se elige ni se ejecuta un método por usted.`;
}

function nextStepExplanation(status: "loaded" | "empty" | "unknown"): string {
  if (status === "loaded") {
    return "El siguiente paso visible es usar la tarjeta Analizar. Esta orientación no verifica el archivo ni inicia el análisis por usted.";
  }
  if (status === "empty") {
    return "El siguiente paso visible es Importar si aún no hay datos, o Analizar si ya los incorporó. No navegaré ni iniciaré un flujo por usted.";
  }
  return "El siguiente paso visible es Importar o Analizar, según si los datos ya están en la sesión. No asumo un dataset ni ejecuto un flujo.";
}

function shouldOfferNextStep(
  previous: HomeGuidanceConversationState,
  kind: ContinuationKind
): boolean {
  if (kind !== "deepen_concept") return false;
  if (previous.turnCount >= 3) return false;
  if (previous.lastDecision?.turnType === "continuation_answer") return false;
  return true;
}

export function buildContinuationAnswerResult(
  input: string,
  previous: HomeGuidanceConversationState,
  context: HomeGuidanceContext
): ContinuationAnswerResult | null {
  const polarity = matchContinuationAnswer(input);
  if (!polarity) return null;

  const concepts = previousConcepts(previous);
  const known = knownAnalysisConcepts(concepts);
  const unknownOnly =
    concepts.length > 0 &&
    known.length === 0 &&
    concepts.every((item) => item.conceptId === "unknown");
  const ambiguousConcepts = known.length > 1;
  const ids = new Set(concepts.map((item) => item.conceptId));
  const kind = previous.continuationKind;
  const status = sessionStatus(context);

  if (polarity === "no") return closeResult(concepts);

  if (polarity === "ambiguous") {
    return {
      interpretation: "La respuesta no es un sí ni un no claro.",
      explanation:
        "No indico un método ni inicio un flujo. Puede preguntar de forma específica o usar una tarjeta de Inicio.",
      continuationPrompt: null,
      continuationKind: "none",
      suggestedCardIds: [],
      primaryCardId: null,
      userConcepts: concepts,
    };
  }

  if (unknownOnly) {
    return {
      interpretation: "Sigue sin haber una capacidad verificada para ese término.",
      explanation:
        "No invento una herramienta, una tarjeta ni un área de producto. Las entradas visibles siguen siendo las tarjetas de Inicio.",
      continuationPrompt: null,
      continuationKind: "none",
      suggestedCardIds: [],
      primaryCardId: null,
      userConcepts: concepts,
    };
  }

  if (ambiguousConcepts) {
    const terms = known.map((item) => item.userTerm).join(" y ");
    return {
      interpretation: "La continuación podría referirse a más de un concepto mencionado.",
      explanation: `Mencionó ${terms}. No elijo un método. Puede preguntar de forma específica por uno de ellos.`,
      continuationPrompt: null,
      continuationKind: "none",
      suggestedCardIds: [],
      primaryCardId: null,
      userConcepts: concepts,
    };
  }

  if (kind === "next_step") {
    const cards = analyzeCards(status);
    return {
      interpretation: "Pidió continuar con el siguiente paso visible.",
      explanation: nextStepExplanation(status),
      continuationPrompt: null,
      continuationKind: "none",
      suggestedCardIds: cards.suggestedCardIds,
      primaryCardId: cards.primaryCardId,
      userConcepts: concepts,
    };
  }

  const offerNext = shouldOfferNextStep(previous, kind);
  return {
    interpretation: "Pidió profundizar en el contexto anterior.",
    explanation: deepenExplanation(ids),
    continuationPrompt: offerNext
      ? "¿Quieres que te indique qué puedes hacer desde aquí?"
      : null,
    continuationKind: offerNext ? "next_step" : "none",
    suggestedCardIds: [],
    primaryCardId: null,
    userConcepts: concepts,
  };
}

import { normalizeGuidanceText } from "./normalize-intent-text";
import { knownAnalysisConcepts } from "./concept-vocabulary";
import type {
  ContinuationKind,
  HomeGuidanceContext,
  HomeGuidanceConversationState,
  SmartStartCardOptionId,
  UserConcept,
} from "./types";

export type FollowUpKind =
  | "when_used"
  | "where"
  | "how"
  | "why"
  | "and_that"
  | "named_concept"
  | "already_have_data";

export type FollowUpMatch = {
  kind: FollowUpKind;
  namedConceptId: "pearson" | "regression" | null;
};

/** Longest first so "y si ya tengo los datos" wins over "y si ya tengo". */
export const FOLLOW_UP_CUES: readonly {
  cue: string;
  kind: FollowUpKind;
  namedConceptId: FollowUpMatch["namedConceptId"];
}[] = [
  { cue: "y si ya tengo los datos", kind: "already_have_data", namedConceptId: null },
  { cue: "y si ya tengo", kind: "already_have_data", namedConceptId: null },
  { cue: "cuando se utiliza", kind: "when_used", namedConceptId: null },
  { cue: "cuando se usa", kind: "when_used", namedConceptId: null },
  { cue: "y la regresion", kind: "named_concept", namedConceptId: "regression" },
  { cue: "como se usa", kind: "how", namedConceptId: null },
  { cue: "donde esta", kind: "where", namedConceptId: null },
  { cue: "y eso que", kind: "and_that", namedConceptId: null },
  { cue: "y pearson", kind: "named_concept", namedConceptId: "pearson" },
  { cue: "por que", kind: "why", namedConceptId: null },
  { cue: "y eso", kind: "and_that", namedConceptId: null },
  { cue: "donde", kind: "where", namedConceptId: null },
  { cue: "como", kind: "how", namedConceptId: null },
];

export const FOLLOW_UP_REST = new Set([
  "y",
  "eso",
  "que",
  "los",
  "datos",
  "el",
  "la",
  "un",
  "una",
  "de",
  "del",
  "a",
  "al",
  "me",
  "mi",
  "mis",
  "lo",
  "las",
]);

export type FollowUpCatalogResult = {
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
  return tokens.every((token) => FOLLOW_UP_REST.has(token));
}

export function matchFollowUpCue(input: string): FollowUpMatch | null {
  const text = normalizeGuidanceText(input);
  for (const entry of FOLLOW_UP_CUES) {
    if (!text.includes(` ${entry.cue} `)) continue;
    if (!leftoverTokensOk(text, entry.cue)) continue;
    return { kind: entry.kind, namedConceptId: entry.namedConceptId };
  }
  return null;
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

function previousConcepts(
  previous: HomeGuidanceConversationState
): UserConcept[] {
  if (previous.lastDecision?.userConcepts.length) {
    return previous.lastDecision.userConcepts;
  }
  return previous.userConcepts;
}

function focusConcepts(
  concepts: UserConcept[],
  namedConceptId: FollowUpMatch["namedConceptId"]
): UserConcept[] {
  if (namedConceptId === "pearson") {
    const focused = concepts.filter(
      (item) => item.conceptId === "pearson" || item.conceptId === "correlation"
    );
    return focused.length > 0
      ? focused
      : [
          {
            userTerm: "Pearson",
            conceptId: "pearson",
            productAreaId: "analysis/statistics",
          },
        ];
  }
  if (namedConceptId === "regression") {
    const focused = concepts.filter((item) => item.conceptId === "regression");
    return focused.length > 0
      ? focused
      : [
          {
            userTerm: "regresión",
            conceptId: "regression",
            productAreaId: "analysis/mathematics",
          },
        ];
  }
  return concepts;
}

function whenUsedSentence(ids: Set<string>): string {
  const parts: string[] = [];
  if (ids.has("pearson") || ids.has("correlation")) {
    parts.push(
      "Pearson se utiliza para describir la asociación lineal entre dos variables numéricas."
    );
  }
  if (ids.has("regression")) {
    parts.push(
      "La regresión se utiliza para describir cómo se relaciona una variable con otra mediante un ajuste."
    );
  }
  if (ids.has("anova")) {
    parts.push(
      "ANOVA se utiliza para comparar medias entre grupos cuando el producto ofrece esa herramienta."
    );
  }
  if (ids.has("descriptive") || ids.has("distribution")) {
    parts.push(
      "Las herramientas descriptivas y de distribución se utilizan para resumir y observar los datos."
    );
  }
  if (parts.length === 0) {
    return "Puedo indicar el uso solo para conceptos con un área de producto verificada.";
  }
  return `${parts.join(" ")} No indico si un método es adecuado para sus datos.`;
}

function howSentence(): string {
  return "No se ejecuta desde esta caja. Después de tener datos disponibles, use la tarjeta Analizar y abra el área indicada. No elijo un método por usted.";
}

function whySentence(): string {
  return "En esta orientación no se afirma una causa ni una conclusión científica. Solo se indica qué describe el término y dónde vive en el producto.";
}

function andThatSentence(ids: Set<string>): string {
  if (ids.has("unknown") && ids.size === 1) {
    return "Sigue sin haber una capacidad verificada para ese término.";
  }
  return "Sigue siendo contexto semántico de lo que mencionó, no una instrucción de ejecución.";
}

function continuationFor(
  kind: FollowUpKind,
  omit: boolean,
  unknownOnly: boolean,
  ambiguous: boolean
): { prompt: string | null; kind: ContinuationKind } {
  if (omit || unknownOnly || ambiguous) {
    return { prompt: null, kind: "none" };
  }
  if (kind === "when_used" || kind === "why" || kind === "and_that") {
    return {
      prompt: "¿Quieres que profundicemos en este concepto?",
      kind: "deepen_concept",
    };
  }
  if (kind === "where" || kind === "how") {
    return {
      prompt: "¿Quieres que te indique qué puedes hacer desde aquí?",
      kind: "next_step",
    };
  }
  if (kind === "named_concept") {
    return {
      prompt: "¿Quieres que profundicemos en este concepto?",
      kind: "deepen_concept",
    };
  }
  return {
    prompt: "¿Quieres que revisemos el siguiente paso?",
    kind: "next_step",
  };
}

function analyzeCards(status: "loaded" | "empty" | "unknown"): {
  suggestedCardIds: SmartStartCardOptionId[];
  primaryCardId: SmartStartCardOptionId | null;
} {
  if (status === "loaded") {
    return { suggestedCardIds: ["analyze-workspace"], primaryCardId: "analyze-workspace" };
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

export function buildFollowUpCatalogResult(
  input: string,
  previous: HomeGuidanceConversationState,
  context: HomeGuidanceContext
): FollowUpCatalogResult | null {
  const match = matchFollowUpCue(input);
  if (!match) return null;

  const concepts = focusConcepts(previousConcepts(previous), match.namedConceptId);
  const known = knownAnalysisConcepts(concepts);
  const unknownOnly =
    concepts.length > 0 && known.length === 0 && concepts.every((item) => item.conceptId === "unknown");
  const ambiguous =
    match.namedConceptId === null &&
    match.kind !== "already_have_data" &&
    known.length > 1;
  const ids = new Set(concepts.map((item) => item.conceptId));
  const status = sessionStatus(context);
  const omitContinuation = previous.turnCount >= 3;
  const offer = continuationFor(match.kind, omitContinuation, unknownOnly, ambiguous);

  if (match.kind === "already_have_data") {
    const cards = analyzeCards(status);
    let explanation: string;
    if (status === "loaded") {
      explanation =
        "Si se refiere a los datos ya disponibles en la sesión, use la tarjeta Analizar. Esta orientación no verifica el contenido del archivo.";
    } else if (status === "empty") {
      explanation =
        "Inicio no muestra datos cargados. Si ya los incorporó en otro paso, use Analizar; si aún no, use Importar. No invento un dataset.";
    } else {
      explanation =
        "No asumo si los datos ya están cargados. Use Importar para incorporar un archivo o Analizar si ya están en la sesión.";
    }
    return {
      interpretation: "Pregunta qué hacer si los datos ya están disponibles.",
      explanation,
      continuationPrompt: offer.prompt,
      continuationKind: offer.kind,
      suggestedCardIds: cards.suggestedCardIds,
      primaryCardId: cards.primaryCardId,
      userConcepts: concepts,
    };
  }

  if (unknownOnly) {
    return {
      interpretation: "Pregunta por un término sin ubicación verificada.",
      explanation:
        "No hay una ubicación de producto verificada para ese término. No invento una tarjeta ni una capacidad.",
      continuationPrompt: null,
      continuationKind: "none",
      suggestedCardIds: [],
      primaryCardId: null,
      userConcepts: concepts,
    };
  }

  if (ambiguous) {
    const terms = known.map((item) => item.userTerm).join(" y ");
    return {
      interpretation: "La pregunta podría referirse a más de un concepto mencionado.",
      explanation: `Mencionó ${terms}. No elijo un método. Puede preguntar de forma específica por uno de ellos.`,
      continuationPrompt: null,
      continuationKind: "none",
      suggestedCardIds: [],
      primaryCardId: null,
      userConcepts: concepts,
    };
  }

  let interpretation = "Continúa la conversación sobre el contexto anterior.";
  let explanation = andThatSentence(ids);

  if (match.kind === "when_used") {
    interpretation = "Pregunta por el uso en el contexto anterior.";
    explanation = whenUsedSentence(ids);
  } else if (match.kind === "where") {
    interpretation = "Pregunta por la ubicación en el producto.";
    explanation =
      "La ubicación verificada, si existe, se indica a continuación. No se abre ningún panel por usted.";
  } else if (match.kind === "how") {
    interpretation = "Pregunta cómo usarlo en el producto.";
    explanation = howSentence();
  } else if (match.kind === "why") {
    interpretation = "Pregunta por el sentido de lo mencionado.";
    explanation = whySentence();
  } else if (match.kind === "named_concept") {
    interpretation = "Pregunta por un concepto mencionado de forma específica.";
    explanation = `${whenUsedSentence(ids)} ${andThatSentence(ids)}`;
  }

  const cards = known.length > 0 ? analyzeCards(status) : { suggestedCardIds: [] as SmartStartCardOptionId[], primaryCardId: null };

  return {
    interpretation,
    explanation,
    continuationPrompt: offer.prompt,
    continuationKind: offer.kind,
    suggestedCardIds: cards.suggestedCardIds,
    primaryCardId: match.kind === "how" ? cards.primaryCardId : null,
    userConcepts: concepts,
  };
}

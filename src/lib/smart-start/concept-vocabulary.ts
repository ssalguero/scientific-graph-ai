import { extractDefineTerm } from "./speech-act";
import { keywordMatches, normalizeGuidanceText } from "./normalize-intent-text";
import type { MethodInterest, UserConcept } from "./types";

type ConceptEntry = {
  conceptId: string;
  userTerm: string;
  productAreaId: "analysis/mathematics" | "analysis/statistics";
  aliases: readonly string[];
};

/**
 * Bounded allowlist. Tokens are unaccented; NFD matching covers accents.
 * Do not add funcion/curva (math-graph) or standalone ajuste.
 * MANOVA is omitted: the product must not claim a MANOVA test.
 */
const CONCEPT_CATALOG: readonly ConceptEntry[] = [
  {
    conceptId: "regression",
    userTerm: "regresión",
    productAreaId: "analysis/mathematics",
    aliases: ["regresion", "regression"],
  },
  {
    conceptId: "pearson",
    userTerm: "Pearson",
    productAreaId: "analysis/statistics",
    aliases: ["pearson"],
  },
  {
    conceptId: "correlation",
    userTerm: "correlación",
    productAreaId: "analysis/statistics",
    aliases: ["correlacion"],
  },
  {
    conceptId: "anova",
    userTerm: "ANOVA",
    productAreaId: "analysis/statistics",
    aliases: ["anova"],
  },
  {
    conceptId: "descriptive",
    userTerm: "descriptivo",
    productAreaId: "analysis/statistics",
    aliases: ["descriptivo", "descriptiva"],
  },
  {
    conceptId: "distribution",
    userTerm: "distribución",
    productAreaId: "analysis/statistics",
    aliases: ["distribucion"],
  },
];

/** Scientific tokens with no verified product location. Not capabilities. */
const UNKNOWN_SCIENTIFIC_TOKENS: readonly { token: string; userTerm: string }[] =
  [{ token: "manova", userTerm: "MANOVA" }];

const KNOWN_ALIAS_SET = new Set(
  CONCEPT_CATALOG.flatMap((entry) => entry.aliases)
);

function isKnownAlias(token: string): boolean {
  return KNOWN_ALIAS_SET.has(token);
}

function joinUserTerms(terms: string[]): string {
  if (terms.length === 0) return "";
  if (terms.length === 1) return terms[0];
  if (terms.length === 2) return `${terms[0]} y ${terms[1]}`;
  return `${terms.slice(0, -1).join(", ")} y ${terms[terms.length - 1]}`;
}

/**
 * Deterministic concept lookup. Never returns a Card ID or handler.
 */
export function extractUserConcepts(input: string): UserConcept[] {
  const text = normalizeGuidanceText(input);
  const concepts: UserConcept[] = [];
  const seen = new Set<string>();

  for (const entry of CONCEPT_CATALOG) {
    if (!entry.aliases.some((alias) => keywordMatches(text, alias))) continue;
    if (seen.has(entry.conceptId)) continue;
    seen.add(entry.conceptId);
    concepts.push({
      userTerm: entry.userTerm,
      conceptId: entry.conceptId,
      productAreaId: entry.productAreaId,
    });
  }

  for (const unknown of UNKNOWN_SCIENTIFIC_TOKENS) {
    if (!keywordMatches(text, unknown.token)) continue;
    if (seen.has("unknown")) continue;
    seen.add("unknown");
    concepts.push({
      userTerm: unknown.userTerm,
      conceptId: "unknown",
      productAreaId: null,
    });
  }

  if (!concepts.some((item) => item.conceptId !== "unknown")) {
    const defineTerm = extractDefineTerm(input);
    if (
      defineTerm &&
      !isKnownAlias(defineTerm) &&
      defineTerm !== "manova" &&
      !seen.has("unknown")
    ) {
      concepts.push({
        userTerm: defineTerm,
        conceptId: "unknown",
        productAreaId: null,
      });
    }
  }

  return concepts;
}

export function deriveMethodInterest(
  concepts: UserConcept[]
): MethodInterest | null {
  const regression = concepts.find((item) => item.conceptId === "regression");
  if (!regression) return null;
  return {
    userTerm: "regresión",
    productLocation: "analysis/mathematics",
  };
}

export function knownAnalysisConcepts(concepts: UserConcept[]): UserConcept[] {
  return concepts.filter(
    (item) => item.conceptId !== "unknown" && item.productAreaId !== null
  );
}

export function formatConceptMention(concepts: UserConcept[]): string | null {
  if (concepts.length === 0) return null;
  const known = concepts.filter((item) => item.conceptId !== "unknown");
  const unknown = concepts.filter((item) => item.conceptId === "unknown");
  const parts: string[] = [];
  if (known.length > 0) {
    parts.push(`Mencionó interés en ${joinUserTerms(known.map((item) => item.userTerm))}.`);
  }
  if (unknown.length > 0) {
    parts.push(
      `Mencionó el término ${joinUserTerms(unknown.map((item) => item.userTerm))}.`
    );
  }
  return parts.join(" ");
}

export function formatConceptLocationCopy(concepts: UserConcept[]): string {
  const ids = new Set(concepts.map((item) => item.conceptId));
  const sentences: string[] = [];

  if (ids.has("regression")) {
    sentences.push(
      "Las herramientas de ajuste o regresión están en Análisis (Matemáticas), después de incorporar los datos."
    );
  }
  if (ids.has("pearson") || ids.has("correlation")) {
    sentences.push(
      "Pearson es una opción de método en Análisis (Estadística), dentro de correlación."
    );
  }
  if (ids.has("anova")) {
    sentences.push("ANOVA está en Análisis → Estadística → Esencial.");
  }
  if (ids.has("descriptive") || ids.has("distribution")) {
    sentences.push(
      "Las herramientas descriptivas y de distribución están en Análisis (Estadística)."
    );
  }
  if (ids.has("unknown")) {
    sentences.push(
      "No hay una capacidad verificada con ese nombre en las tarjetas ni un área de producto que pueda señalar con honestidad."
    );
  }

  if (sentences.length === 0) return "";
  const closer = ids.has("unknown") && !ids.has("regression") && !ids.has("pearson") && !ids.has("correlation") && !ids.has("anova") && !ids.has("descriptive") && !ids.has("distribution")
    ? " No invento una herramienta ni un método."
    : " No se elige ni se ejecuta un método por usted.";
  return `${sentences.join(" ")}${closer}`;
}

/**
 * P3 compatibility mapper. Returns regression location semantics only.
 */
export function extractMethodInterest(input: string): MethodInterest | null {
  return deriveMethodInterest(extractUserConcepts(input));
}

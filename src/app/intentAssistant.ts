import type { LabUsageProfile } from "./labUsageProfile";
import { LAB_USAGE_PROFILE_META } from "./labUsageProfile";

export type SmartStartIntentId =
  | "analyze-dataset"
  | "compare-datasets"
  | "math-graph"
  | "evaluate-publication"
  | "open-project"
  | "expert-mode";

export type IntentConfidence = "high" | "medium" | "low";

export type IntentRecommendation = {
  intentId: SmartStartIntentId;
  flowLabel: string;
  destinationLabel: string;
  recommendedProfile: LabUsageProfile;
  profileLabel: string;
  confidence: IntentConfidence;
  matchedKeywords: string[];
};

type IntentRule = {
  id: SmartStartIntentId;
  keywords: string[];
  recommendedProfile: LabUsageProfile;
  flowLabel: string;
  destinationLabel: string;
  priority: number;
};

const INTENT_RULES: IntentRule[] = [
  {
    id: "expert-mode",
    keywords: [
      "avanzado",
      "experto",
      "laboratorio completo",
      "todas las herramientas",
      "acceso completo",
      "modo experto",
    ],
    recommendedProfile: "expert",
    flowLabel: "Modo experto",
    destinationLabel: "Datos → Avanzado (laboratorio completo)",
    priority: 60,
  },
  {
    id: "open-project",
    keywords: [
      "proyecto",
      "sgproj",
      "abrir proyecto",
      "archivo proyecto",
      "recuperar proyecto",
      "continuar proyecto",
    ],
    recommendedProfile: "standard",
    flowLabel: "Abrir proyecto",
    destinationLabel: "Panel de proyecto (.sgproj)",
    priority: 55,
  },
  {
    id: "compare-datasets",
    keywords: [
      "comparar",
      "comparacion",
      "compare",
      "a/b",
      "slot",
      "multi-dataset",
      "multivariante",
      "experimento",
      "grupos",
      "versus",
      " vs ",
      "control",
      "tratamiento",
    ],
    recommendedProfile: "standard",
    flowLabel: "Comparar datasets",
    destinationLabel: "Datos → Experimental → Multi-Dataset",
    priority: 50,
  },
  {
    id: "evaluate-publication",
    keywords: [
      "paper",
      "publicacion",
      "revista",
      "journal",
      "readiness",
      "sci-60",
      "sci-56",
      "metodologia",
      "evidence",
      "manuscrito",
      "artículo",
      "articulo",
      "publicar",
    ],
    recommendedProfile: "standard",
    flowLabel: "Evaluar publicación",
    destinationLabel: "Análisis → Estadística / Workflow de publicación",
    priority: 45,
  },
  {
    id: "math-graph",
    keywords: [
      "funcion",
      "función",
      "grafico matematico",
      "gráfico matemático",
      "curva",
      "ecuacion",
      "ecuación",
      "seno",
      "coseno",
      "tangente",
      "parabola",
      "parábola",
      "expresion",
      "expresión",
      "y=f",
      "matematica",
      "matemática",
      "plot",
      "sin(",
      "cos(",
    ],
    recommendedProfile: "standard",
    flowLabel: "Crear gráfico matemático",
    destinationLabel: "Datos → Curvas → Constructor",
    priority: 40,
  },
  {
    id: "analyze-dataset",
    keywords: [
      "csv",
      "excel",
      "xlsx",
      "xls",
      "ods",
      "txt",
      "datos",
      "dataset",
      "analisis",
      "análisis",
      "analizar",
      "importar",
      "tabla",
      "experimental",
      "observaciones",
      "series",
      "archivo de datos",
    ],
    recommendedProfile: "basic",
    flowLabel: "Analizar dataset",
    destinationLabel: "Datos → Experimental → Importación",
    priority: 30,
  },
];

function normalizeIntentText(text: string): string {
  return ` ${text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function keywordMatches(text: string, keyword: string): boolean {
  const normalizedKeyword = normalizeIntentText(keyword).trim();
  if (!normalizedKeyword) return false;
  if (normalizedKeyword.includes(" ")) {
    return text.includes(normalizedKeyword);
  }
  return text.includes(` ${normalizedKeyword} `);
}

function scoreRule(text: string, rule: IntentRule): {
  score: number;
  matchedKeywords: string[];
} {
  let score = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of rule.keywords) {
    if (keywordMatches(text, keyword)) {
      matchedKeywords.push(keyword);
      score += keyword.trim().length >= 5 ? 2 : 1;
    }
  }

  return { score, matchedKeywords };
}

export function classifyIntent(input: string): IntentRecommendation | null {
  const text = normalizeIntentText(input);
  if (text.trim().length === 0) {
    return null;
  }

  let best:
    | {
        rule: IntentRule;
        score: number;
        matchedKeywords: string[];
      }
    | undefined;

  for (const rule of INTENT_RULES) {
    const { score, matchedKeywords } = scoreRule(text, rule);
    if (score <= 0) continue;

    if (
      !best ||
      score > best.score ||
      (score === best.score && rule.priority > best.rule.priority)
    ) {
      best = { rule, score, matchedKeywords };
    }
  }

  if (!best) {
    return null;
  }

  const confidence: IntentConfidence =
    best.score >= 4 ? "high" : best.score >= 2 ? "medium" : "low";

  return {
    intentId: best.rule.id,
    flowLabel: best.rule.flowLabel,
    destinationLabel: best.rule.destinationLabel,
    recommendedProfile: best.rule.recommendedProfile,
    profileLabel: LAB_USAGE_PROFILE_META[best.rule.recommendedProfile].label,
    confidence,
    matchedKeywords: best.matchedKeywords,
  };
}

export function formatIntentRecommendationSummary(
  recommendation: IntentRecommendation
): string {
  return `Recomendación: ${recommendation.flowLabel} (perfil ${recommendation.profileLabel})`;
}

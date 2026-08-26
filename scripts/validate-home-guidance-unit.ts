import { classifyIntent } from "../src/lib/smart-start";
import {
  buildGuidanceDecision,
  nextGuidanceConversation,
} from "../src/lib/smart-start/build-guidance-decision";
import { EMPTY_HOME_GUIDANCE_CONVERSATION } from "../src/lib/smart-start/types";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const results: CaseResult[] = [];

function assertCase(id: string, pass: boolean, detail?: string) {
  results.push({ id, pass, detail });
}

const emptyCtx = { hasDataset: false, hasExperimentalSeries: false };
const loadedCtx = { hasDataset: true, hasExperimentalSeries: true };
const unknownCtx = { hasDataset: null, hasExperimentalSeries: null };

const compound = buildGuidanceDecision(
  "quiero analizar un CSV",
  emptyCtx
);
assertCase(
  "p2.compound-csv.empty.primary-importar",
  compound.primaryCardId === "analyze-dataset" &&
    compound.suggestedCardIds.includes("analyze-workspace") &&
    compound.clarification === null,
  `${compound.primaryCardId} / ${compound.suggestedCardIds.join(",")}`
);

assertCase(
  "p2.compound-csv.empty.does-not-follow-scorer-winner-alone",
  classifyIntent("quiero analizar un CSV")?.intentId === "analyze-workspace" &&
    compound.primaryCardId === "analyze-dataset",
  `scorer=${classifyIntent("quiero analizar un CSV")?.intentId}`
);

const compoundLoaded = buildGuidanceDecision(
  "Quiero analizar un CSV",
  loadedCtx
);
assertCase(
  "p2.compound-csv.loaded.primary-analizar",
  compoundLoaded.primaryCardId === "analyze-workspace" &&
    compoundLoaded.suggestedCardIds.includes("analyze-dataset"),
  `${compoundLoaded.primaryCardId}`
);

const explicitImport = buildGuidanceDecision(
  "Quiero importar un CSV para análisis",
  emptyCtx
);
assertCase(
  "p2.explicit-import.primary-importar",
  explicitImport.primaryCardId === "analyze-dataset" &&
    classifyIntent("Quiero importar un CSV para análisis")?.intentId ===
      "analyze-dataset" &&
    classifyIntent("Quiero importar un CSV para análisis")
      ?.recommendedProfile === "standard",
  `${explicitImport.primaryCardId}`
);

const analizarEmpty = buildGuidanceDecision("analizar", emptyCtx);
assertCase(
  "p2.analizar.empty.import-first",
  analizarEmpty.primaryCardId === "analyze-dataset" &&
    classifyIntent("analizar")?.intentId === "analyze-workspace",
  `${analizarEmpty.primaryCardId}`
);

const analizarLoaded = buildGuidanceDecision("quiero analizar", loadedCtx);
assertCase(
  "p2.analizar.loaded.analizar-card",
  analizarLoaded.primaryCardId === "analyze-workspace",
  `${analizarLoaded.primaryCardId}`
);

const compare = buildGuidanceDecision(
  "comparar grupos A/B en un experimento",
  emptyCtx
);
assertCase(
  "p2.compare.card",
  compare.primaryCardId === "compare-datasets" &&
    classifyIntent("comparar grupos A/B en un experimento")?.intentId ===
      "compare-datasets",
  `${compare.primaryCardId}`
);

const math = buildGuidanceDecision("Quiero graficar una función", emptyCtx);
assertCase(
  "p2.math.card",
  math.primaryCardId === "math-graph",
  `${math.primaryCardId}`
);

const unknownAnalyze = buildGuidanceDecision(
  "quiero analizar mis datos",
  unknownCtx
);
assertCase(
  "p2.unknown.asks-once",
  Boolean(unknownAnalyze.clarification) &&
    unknownAnalyze.primaryCardId === null,
  unknownAnalyze.clarification ?? "none"
);

const afterAsk = nextGuidanceConversation(
  unknownAnalyze,
  "quiero analizar mis datos"
);
const followUpImport = buildGuidanceDecision("tengo un CSV", unknownCtx, afterAsk);
assertCase(
  "p2.follow-up.csv.importar",
  followUpImport.primaryCardId === "analyze-dataset" &&
    followUpImport.clarification === null,
  `${followUpImport.primaryCardId}`
);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const assistantSource = readFileSync(
  join(repoRoot, "src/components/home/SmartStartIntentAssistant.tsx"),
  "utf8"
);
assertCase(
  "p2.no-ai-execute-cta",
  !assistantSource.includes("Iniciar flujo recomendado") &&
    !assistantSource.includes("onStartRecommendation") &&
    !assistantSource.includes("handleIntentRecommendationStart"),
  "cta detached"
);
assertCase(
  "p2.no-classify-navigation-in-assistant",
  !assistantSource.includes("handleSmartStartSelect"),
  "no select handler"
);

const summary = {
  phase: "home-guidance-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

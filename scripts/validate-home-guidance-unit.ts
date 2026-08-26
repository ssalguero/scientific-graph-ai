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

const phraseA = "quiero analizar un csv";
const phraseB = "quiero analizar un csv utilizando funciones de regresión";
const guidanceA = buildGuidanceDecision(phraseA, emptyCtx);
const guidanceB = buildGuidanceDecision(phraseB, emptyCtx);

assertCase(
  "p3.a.analyze-csv.slots",
  guidanceA.goal === "analyze" &&
    guidanceA.dataSource === "csv" &&
    guidanceA.methodInterest === null &&
    guidanceA.primaryCardId === "analyze-dataset" &&
    guidanceA.suggestedCardIds.includes("analyze-workspace"),
  `${guidanceA.goal}/${guidanceA.dataSource}/${guidanceA.primaryCardId}`
);

assertCase(
  "p3.b.regression-interest.same-cards",
  guidanceB.goal === "analyze" &&
    guidanceB.dataSource === "csv" &&
    guidanceB.methodInterest !== null &&
    guidanceB.methodInterest.productLocation === "analysis/mathematics" &&
    /regresi/i.test(guidanceB.methodInterest.userTerm) &&
    guidanceB.primaryCardId === guidanceA.primaryCardId &&
    guidanceB.suggestedCardIds.includes("analyze-workspace") &&
    /regresi/i.test(guidanceB.interpretation + guidanceB.explanation) &&
    /matem[aá]ticas/i.test(guidanceB.explanation),
  `${guidanceB.primaryCardId}/${guidanceB.methodInterest?.userTerm}`
);

assertCase(
  "p3.b.no-overreach",
  !/recomend|debes usar|es correcta|ejecutar regresi/i.test(
    `${guidanceB.interpretation} ${guidanceB.explanation}`
  ),
  "copy"
);

const intentRulesSource = readFileSync(
  join(repoRoot, "src/lib/smart-start/intent-rules.ts"),
  "utf8"
);
assertCase(
  "p3.no-regression-intent-rule",
  !/regresi[oó]n/i.test(intentRulesSource),
  "intent-rules"
);

assertCase(
  "p3.c.p0-import",
  classifyIntent("Quiero importar un CSV para análisis")?.intentId ===
    "analyze-dataset" &&
    classifyIntent("Quiero importar un CSV para análisis")
      ?.recommendedProfile === "standard" &&
    explicitImport.primaryCardId === "analyze-dataset" &&
    explicitImport.goal === "import",
  explicitImport.goal
);

assertCase(
  "p3.d.p1-analizar",
  classifyIntent("analizar")?.intentId === "analyze-workspace",
  classifyIntent("analizar")?.intentId
);

assertCase(
  "p3.e.p1-import-para-analizar",
  classifyIntent("importar un CSV para analizar")?.intentId ===
    "analyze-dataset" &&
    classifyIntent("importar un CSV para analizar")?.recommendedProfile ===
      "standard",
  classifyIntent("importar un CSV para analizar")?.intentId
);

const compareP3 = buildGuidanceDecision("quiero comparar dos grupos", emptyCtx);
assertCase(
  "p3.f.compare",
  compareP3.primaryCardId === "compare-datasets" &&
    compareP3.goal === "compare" &&
    classifyIntent("quiero comparar dos grupos")?.intentId ===
      "compare-datasets",
  `${compareP3.primaryCardId}`
);

const mathP3 = buildGuidanceDecision("quiero graficar una función", emptyCtx);
assertCase(
  "p3.g.math",
  mathP3.primaryCardId === "math-graph" && mathP3.goal === "plot",
  `${mathP3.primaryCardId}`
);

const unknownMethod = buildGuidanceDecision(
  "No sé qué análisis necesito",
  emptyCtx
);
assertCase(
  "p3.h.no-invented-method",
  unknownMethod.methodInterest === null &&
    !/regresi|pearson|anova|manova/i.test(
      `${unknownMethod.interpretation} ${unknownMethod.explanation}`
    ),
  unknownMethod.methodInterest?.userTerm ?? "null"
);

const messy = buildGuidanceDecision("analisar un archvo", emptyCtx);
assertCase(
  "p3.i.no-fake-method-interest",
  messy.methodInterest === null,
  messy.methodInterest?.userTerm ?? "null"
);

const afterB = nextGuidanceConversation(guidanceB, phraseB);
const followUpLoaded = buildGuidanceDecision(
  "sí, ya tengo el archivo",
  emptyCtx,
  afterB
);
assertCase(
  "p3.j.follow-up-keeps-method-interest",
  followUpLoaded.methodInterest !== null &&
    followUpLoaded.methodInterest.productLocation === "analysis/mathematics" &&
    followUpLoaded.clarification === null &&
    (followUpLoaded.primaryCardId === "analyze-workspace" ||
      followUpLoaded.primaryCardId === "analyze-dataset") &&
    !/qu[eé] modelo|qu[eé] regresi/i.test(
      followUpLoaded.clarification ?? followUpLoaded.explanation
    ),
  `${followUpLoaded.primaryCardId}/${followUpLoaded.methodInterest?.userTerm}`
);

const afterBThenCompare = buildGuidanceDecision(
  "quiero comparar dos grupos",
  emptyCtx,
  afterB
);
assertCase(
  "p3.unrelated-clears-method-interest",
  afterBThenCompare.methodInterest === null &&
    afterBThenCompare.primaryCardId === "compare-datasets",
  `${afterBThenCompare.methodInterest}/${afterBThenCompare.primaryCardId}`
);

const summary = {
  phase: "home-guidance-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

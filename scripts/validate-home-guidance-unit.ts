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

const regressionOnly = "Quiero hacer una regresión";
const regressionEmpty = buildGuidanceDecision(regressionOnly, emptyCtx);
assertCase(
  "p4.1.regression-only.classifier-null",
  classifyIntent(regressionOnly) === null,
  String(classifyIntent(regressionOnly)?.intentId)
);
assertCase(
  "p4.1.regression-only.empty.understands-concept",
  regressionEmpty.speechAct === "use" &&
    regressionEmpty.goal === "analyze" &&
    regressionEmpty.primaryCardId === "analyze-dataset" &&
    regressionEmpty.suggestedCardIds.includes("analyze-workspace") &&
    regressionEmpty.userConcepts.some((item) => item.conceptId === "regression") &&
    regressionEmpty.methodInterest?.productLocation === "analysis/mathematics" &&
    !/no hay una intenci[oó]n clara/i.test(
      `${regressionEmpty.interpretation} ${regressionEmpty.explanation}`
    ) &&
    /matem[aá]ticas/i.test(regressionEmpty.explanation) &&
    !/recomend|debes usar|es correcta|ejecutar regresi/i.test(
      `${regressionEmpty.interpretation} ${regressionEmpty.explanation}`
    ),
  `${regressionEmpty.speechAct}/${regressionEmpty.primaryCardId}`
);

const regressionLoaded = buildGuidanceDecision(regressionOnly, loadedCtx);
assertCase(
  "p4.1.regression-only.loaded.analizar",
  regressionLoaded.primaryCardId === "analyze-workspace" &&
    regressionLoaded.speechAct === "use",
  `${regressionLoaded.primaryCardId}`
);

const pearsonDefine = buildGuidanceDecision("¿Qué es Pearson?", emptyCtx);
assertCase(
  "p4.2.pearson-define",
  classifyIntent("¿Qué es Pearson?") === null &&
    pearsonDefine.speechAct === "define" &&
    pearsonDefine.userConcepts.some((item) => item.conceptId === "pearson") &&
    pearsonDefine.userConcepts.every((item) => item.conceptId !== "unknown") &&
    pearsonDefine.primaryCardId === null &&
    /estad[ií]stica/i.test(pearsonDefine.explanation) &&
    /correlaci/i.test(pearsonDefine.explanation) &&
    !/recomend|es correcta|debes usar|el m[eé]todo correcto/i.test(
      `${pearsonDefine.interpretation} ${pearsonDefine.explanation} ${pearsonDefine.continuationPrompt ?? ""}`
    ),
  `${pearsonDefine.speechAct}/${pearsonDefine.primaryCardId}`
);

const pearsonUseEmpty = buildGuidanceDecision(
  "Quiero usar Pearson con mis datos",
  emptyCtx
);
const pearsonUseLoaded = buildGuidanceDecision(
  "Quiero usar Pearson con mis datos",
  loadedCtx
);
assertCase(
  "p4.3.pearson-use.session-aware",
  pearsonUseEmpty.speechAct === "use" &&
    pearsonUseEmpty.userConcepts.some((item) => item.conceptId === "pearson") &&
    pearsonUseEmpty.primaryCardId === "analyze-dataset" &&
    pearsonUseEmpty.suggestedCardIds.includes("analyze-workspace") &&
    pearsonUseLoaded.primaryCardId === "analyze-workspace" &&
    pearsonUseEmpty.suggestedCardIds.every((id) =>
      ["analyze-dataset", "analyze-workspace"].includes(id)
    ),
  `${pearsonUseEmpty.primaryCardId}/${pearsonUseLoaded.primaryCardId}`
);

const exploreNeed = buildGuidanceDecision(
  "No sé qué análisis necesito",
  emptyCtx
);
assertCase(
  "p4.4.explore.overrides-guidance-not-classifier",
  classifyIntent("No sé qué análisis necesito")?.intentId ===
    "analyze-workspace" &&
    exploreNeed.speechAct === "explore" &&
    exploreNeed.userConcepts.length === 0 &&
    exploreNeed.goal === "explore" &&
    exploreNeed.primaryCardId === "analyze-dataset" &&
    !/regresi|pearson|anova|manova/i.test(
      `${exploreNeed.interpretation} ${exploreNeed.explanation}`
    ),
  `${exploreNeed.speechAct}/${exploreNeed.primaryCardId}/${classifyIntent("No sé qué análisis necesito")?.intentId}`
);

const compareP4 = buildGuidanceDecision("Quiero comparar dos grupos", emptyCtx);
assertCase(
  "p4.5.compare.no-anova-from-grupos",
  classifyIntent("Quiero comparar dos grupos")?.intentId ===
    "compare-datasets" &&
    compareP4.primaryCardId === "compare-datasets" &&
    compareP4.goal === "compare" &&
    !compareP4.userConcepts.some((item) => item.conceptId === "anova"),
  `${compareP4.primaryCardId}/${compareP4.userConcepts.map((item) => item.conceptId).join(",")}`
);

const mathP4 = buildGuidanceDecision("Quiero graficar una función", emptyCtx);
assertCase(
  "p4.6.math.no-regression-from-funcion",
  classifyIntent("Quiero graficar una función")?.intentId === "math-graph" &&
    mathP4.primaryCardId === "math-graph" &&
    mathP4.goal === "plot" &&
    !mathP4.userConcepts.some((item) => item.conceptId === "regression"),
  `${mathP4.primaryCardId}/${mathP4.userConcepts.map((item) => item.conceptId).join(",")}`
);

assertCase(
  "p4.7.csv-regression.p3-preserved",
  guidanceB.primaryCardId === guidanceA.primaryCardId &&
    guidanceB.userConcepts.some((item) => item.conceptId === "regression") &&
    guidanceB.methodInterest !== null,
  `${guidanceB.primaryCardId}`
);

const multi = buildGuidanceDecision(
  "Quiero analizar mis datos con Pearson y regresión",
  emptyCtx
);
assertCase(
  "p4.8.pearson-and-regression.one-primary",
  multi.userConcepts.some((item) => item.conceptId === "pearson") &&
    multi.userConcepts.some((item) => item.conceptId === "regression") &&
    multi.primaryCardId === "analyze-dataset" &&
    multi.suggestedCardIds.includes("analyze-workspace") &&
    /pearson/i.test(`${multi.interpretation} ${multi.explanation}`) &&
    /regresi/i.test(`${multi.interpretation} ${multi.explanation}`) &&
    /estad[ií]stica/i.test(multi.explanation) &&
    /matem[aá]ticas/i.test(multi.explanation) &&
    !/recomend|m[eé]todo correcto|elija Pearson|elija regresi|mejor m[eé]todo/i.test(
      `${multi.interpretation} ${multi.explanation}`
    ),
  `${multi.primaryCardId}/${multi.userConcepts.map((item) => item.conceptId).join(",")}`
);

const unknownTerm = buildGuidanceDecision("¿Qué es Kruskal?", emptyCtx);
assertCase(
  "p4.9.unknown-scientific-term",
  unknownTerm.speechAct === "define" &&
    unknownTerm.userConcepts.some(
      (item) => item.conceptId === "unknown" && item.productAreaId === null
    ) &&
    unknownTerm.primaryCardId === null &&
    !/an[aá]lisis →|est[aá] en an[aá]lisis/i.test(unknownTerm.explanation),
  `${unknownTerm.userConcepts.map((item) => `${item.conceptId}:${item.productAreaId}`).join(",")}`
);

const manovaUse = buildGuidanceDecision("Quiero hacer MANOVA", emptyCtx);
const manovaCopy = `${manovaUse.interpretation} ${manovaUse.explanation} ${manovaUse.continuationPrompt ?? ""}`;
assertCase(
  "p4.10.manova-safety",
  manovaUse.userConcepts.some(
    (item) =>
      item.conceptId === "unknown" &&
      item.productAreaId === null &&
      /manova/i.test(item.userTerm)
  ) &&
    manovaUse.primaryCardId === null &&
    !/prueba manova|ejecuta manova|disponible.*manova|manova explorer|indicador heur[ií]stico/i.test(
      manovaCopy
    ) &&
    !/analysis\/multivariate/i.test(manovaCopy) &&
    /no invento|no hay una capacidad verificada/i.test(manovaCopy),
  manovaCopy
);

const anovaUse = buildGuidanceDecision("Quiero hacer una ANOVA", emptyCtx);
const anovaCopy = `${anovaUse.interpretation} ${anovaUse.explanation}`;
assertCase(
  "p4.11.anova-location-statistics",
  anovaUse.userConcepts.some(
    (item) =>
      item.conceptId === "anova" && item.productAreaId === "analysis/statistics"
  ) &&
    /estad[ií]stica/i.test(anovaCopy) &&
    /esencial/i.test(anovaCopy) &&
    !/inferencia/i.test(anovaCopy) &&
    anovaUse.primaryCardId === "analyze-dataset",
  anovaCopy
);

assertCase(
  "p4.12.intent-rules.no-method-tokens",
  !/pearson|anova|manova|correlacion|descriptivo|distribucion|regresi/i.test(
    intentRulesSource
  ),
  "intent-rules"
);

const afterRegressionOnly = nextGuidanceConversation(
  regressionEmpty,
  regressionOnly
);
assertCase(
  "p4.13.continuation-display-only",
  typeof regressionEmpty.continuationPrompt === "string" &&
    regressionEmpty.continuationPrompt.length > 0 &&
    regressionEmpty.clarification === null &&
    afterRegressionOnly.pendingSlot === null &&
    afterRegressionOnly.clarificationAsked === false,
  `${regressionEmpty.continuationPrompt}/${afterRegressionOnly.pendingSlot}`
);

const afterContinuationYes = buildGuidanceDecision(
  "sí",
  emptyCtx,
  afterRegressionOnly
);
assertCase(
  "p4.13.continuation-does-not-parse-next-as-answer",
  afterContinuationYes.primaryCardId === null &&
    /no hay una intenci[oó]n clara/i.test(afterContinuationYes.interpretation),
  `${afterContinuationYes.primaryCardId}/${afterContinuationYes.interpretation}`
);

assertCase(
  "p4.14.no-execute-cta",
  !assistantSource.includes("Iniciar flujo recomendado") &&
    !assistantSource.includes("onStartRecommendation") &&
    !assistantSource.includes("handleIntentRecommendationStart") &&
    !assistantSource.includes("handleSmartStartSelect") &&
    !assistantSource.includes("selectWorkspaceSection") &&
    !assistantSource.includes("setAnalysisInspectorSection"),
  "assistant handlers"
);

const classifySource = readFileSync(
  join(repoRoot, "src/lib/smart-start/classify-intent.ts"),
  "utf8"
);
const guidanceSource = readFileSync(
  join(repoRoot, "src/lib/smart-start/build-guidance-decision.ts"),
  "utf8"
);
assertCase(
  "p4.15.classifier-untouched-by-vocabulary",
  !classifySource.includes("concept-vocabulary") &&
    !classifySource.includes("speech-act") &&
    !classifySource.includes("detectSpeechAct") &&
    !classifySource.includes("extractUserConcepts") &&
    classifySource.includes("INTENT_RULES"),
  "classify-intent"
);

assertCase(
  "p4.16.no-navigation-in-guidance",
  !guidanceSource.includes("handleSmartStartSelect") &&
    !guidanceSource.includes("handleIntentRecommendationStart") &&
    !guidanceSource.includes("selectWorkspaceSection") &&
    !guidanceSource.includes("setAnalysisInspectorSection"),
  "build-guidance-decision"
);

assertCase(
  "p4.p0-import-still-standard",
  classifyIntent("Quiero importar un CSV para análisis")?.intentId ===
    "analyze-dataset" &&
    classifyIntent("Quiero importar un CSV para análisis")
      ?.recommendedProfile === "standard" &&
    explicitImport.primaryCardId === "analyze-dataset",
  "p0"
);

assertCase(
  "p4.p1-analizar-still-workspace",
  classifyIntent("analizar")?.intentId === "analyze-workspace" &&
    classifyIntent("análisis")?.intentId === "analyze-workspace",
  `${classifyIntent("analizar")?.intentId}/${classifyIntent("análisis")?.intentId}`
);

const afterPearsonDefine = nextGuidanceConversation(
  pearsonDefine,
  "¿Qué es Pearson?"
);
const whenUsed = buildGuidanceDecision(
  "¿Y cuándo se usa?",
  emptyCtx,
  afterPearsonDefine
);
assertCase(
  "p5.1.resolver.define-then-cuando",
  afterPearsonDefine.lastDecision !== null &&
    whenUsed.turnType === "follow_up" &&
    /no hay una intenci[oó]n clara/i.test(whenUsed.interpretation) &&
    whenUsed.primaryCardId === null,
  `${whenUsed.turnType}/${whenUsed.interpretation}`
);

const afterRegressionTopic = nextGuidanceConversation(
  regressionEmpty,
  regressionOnly
);
const topicChange = buildGuidanceDecision(
  "Quiero comparar dos grupos",
  emptyCtx,
  afterRegressionTopic
);
assertCase(
  "p5.1.resolver.topic-change",
  topicChange.turnType === "topic_change" &&
    topicChange.primaryCardId === "compare-datasets" &&
    classifyIntent("Quiero comparar dos grupos")?.intentId ===
      "compare-datasets",
  `${topicChange.turnType}/${topicChange.primaryCardId}`
);

assertCase(
  "p5.1.resolver.clarification",
  afterAsk.pendingSlot === "data_source" &&
    followUpImport.turnType === "clarification" &&
    followUpImport.primaryCardId === "analyze-dataset",
  `${followUpImport.turnType}/${followUpImport.primaryCardId}`
);

assertCase(
  "p5.1.resolver.si-without-slot",
  afterRegressionOnly.pendingSlot === null &&
    afterContinuationYes.turnType === "new_intent" &&
    afterContinuationYes.primaryCardId === null &&
    /no hay una intenci[oó]n clara/i.test(afterContinuationYes.interpretation),
  `${afterContinuationYes.turnType}/${afterContinuationYes.interpretation}`
);

const closing = buildGuidanceDecision("Gracias.", emptyCtx);
assertCase(
  "p5.1.resolver.closing",
  closing.turnType === "closing" &&
    closing.primaryCardId === null &&
    !guidanceSource.includes("handleSmartStartSelect"),
  `${closing.turnType}/${closing.primaryCardId}`
);

const secondTurn = buildGuidanceDecision(
  "¿Qué es Pearson?",
  emptyCtx,
  afterRegressionTopic
);
assertCase(
  "p5.1.state.turnCount",
  regressionEmpty.turnCount === 1 &&
    afterRegressionTopic.turnCount === 1 &&
    afterRegressionTopic.lastDecision !== null &&
    secondTurn.turnCount === 2,
  `${regressionEmpty.turnCount}/${secondTurn.turnCount}`
);

const afterSecond = nextGuidanceConversation(secondTurn, "¿Qué es Pearson?");
assertCase(
  "p5.1.state.lastDecision-is-latest",
  afterSecond.lastDecision === secondTurn && afterSecond.turnCount === 2,
  `${afterSecond.turnCount}`
);

assertCase(
  "p5.1.state.kind-from-p4-prompt",
  regressionEmpty.continuationPrompt !== null &&
    regressionEmpty.continuationKind === "ask_before_continue" &&
    afterRegressionTopic.continuationKind === "ask_before_continue" &&
    afterRegressionTopic.pendingSlot === null,
  `${regressionEmpty.continuationKind}/${afterRegressionTopic.pendingSlot}`
);

assertCase(
  "p5.1.no-behavior-change.p4-regression",
  regressionEmpty.primaryCardId === "analyze-dataset" &&
    regressionEmpty.suggestedCardIds.includes("analyze-workspace") &&
    regressionEmpty.speechAct === "use" &&
    regressionEmpty.goal === "analyze" &&
    regressionEmpty.turnType === "new_intent",
  `${regressionEmpty.primaryCardId}/${regressionEmpty.turnType}`
);

assertCase(
  "p5.1.protected.classifier",
  !classifySource.includes("resolve-turn") &&
    !classifySource.includes("resolveTurnType"),
  "classify-intent"
);

assertCase(
  "p5.1.protected.assistant-no-handlers",
  !assistantSource.includes("Iniciar flujo recomendado") &&
    !assistantSource.includes("handleSmartStartSelect") &&
    !assistantSource.includes("selectWorkspaceSection") &&
    !assistantSource.includes("setAnalysisInspectorSection"),
  "assistant"
);

const summary = {
  phase: "home-guidance-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

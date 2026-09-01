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
    /descripci[oó]n y relaci[oó]n/i.test(pearsonDefine.explanation) &&
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
    /descripci[oó]n y relaci[oó]n/i.test(multi.explanation) &&
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
  "p4.11.anova-location-inference",
  anovaUse.userConcepts.some(
    (item) =>
      item.conceptId === "anova" && item.productAreaId === "analysis/inference"
  ) &&
    /inferencia/i.test(anovaCopy) &&
    /pruebas de grupos/i.test(anovaCopy) &&
    !/esencial/i.test(anovaCopy) &&
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
const whenUsedCopy = `${whenUsed.interpretation} ${whenUsed.explanation} ${whenUsed.continuationPrompt ?? ""}`;
assertCase(
  "p5.1.resolver.define-then-cuando",
  afterPearsonDefine.lastDecision !== null &&
    whenUsed.turnType === "follow_up" &&
    /pearson/i.test(whenUsedCopy) &&
    !/no hay una intenci[oó]n clara/i.test(whenUsedCopy) &&
    !/debes usar pearson/i.test(whenUsedCopy) &&
    whenUsed.primaryCardId === null &&
    whenUsed.clarification === null,
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

assertCase(
  "p5.2.a.pearson-when-used",
  whenUsed.turnType === "follow_up" &&
    whenUsed.continuationKind === "deepen_concept" &&
    /asociaci[oó]n lineal|correlaci/i.test(whenUsedCopy) &&
    /profundicemos en este concepto/i.test(whenUsed.explanation) &&
    whenUsed.clarification === null &&
    !/no hay una intenci[oó]n clara/i.test(whenUsedCopy) &&
    !/debes usar pearson/i.test(whenUsedCopy),
  `${whenUsed.turnType}/${whenUsed.continuationKind}/${whenUsed.explanation}`
);

const afterRegressionWhereState = nextGuidanceConversation(
  regressionEmpty,
  regressionOnly
);
const whereRegression = buildGuidanceDecision(
  "¿Dónde está?",
  emptyCtx,
  afterRegressionWhereState
);
const whereRegressionCopy = `${whereRegression.interpretation} ${whereRegression.explanation}`;
assertCase(
  "p5.2.b.regression-where",
  whereRegression.turnType === "follow_up" &&
    /matem[aá]ticas/i.test(whereRegressionCopy) &&
    /an[aá]lisis/i.test(whereRegressionCopy) &&
    whereRegression.primaryCardId === null &&
    whereRegression.clarification === null &&
    whereRegression.suggestedCardIds.every((id) =>
      ["analyze-dataset", "analyze-workspace"].includes(id)
    ) &&
    whereRegression.continuationKind === "next_step",
  `${whereRegression.turnType}/${whereRegression.primaryCardId}/${whereRegressionCopy}`
);

const afterCsvAnalyze = nextGuidanceConversation(guidanceA, phraseA);
const alreadyHaveEmpty = buildGuidanceDecision(
  "¿Y si ya tengo los datos?",
  emptyCtx,
  afterCsvAnalyze
);
const alreadyHaveLoaded = buildGuidanceDecision(
  "¿Y si ya tengo los datos?",
  loadedCtx,
  afterCsvAnalyze
);
const alreadyHaveEmptyCopy = `${alreadyHaveEmpty.interpretation} ${alreadyHaveEmpty.explanation}`;
const alreadyHaveLoadedCopy = `${alreadyHaveLoaded.interpretation} ${alreadyHaveLoaded.explanation}`;
assertCase(
  "p5.2.c.already-have-data",
  alreadyHaveEmpty.turnType === "follow_up" &&
    alreadyHaveLoaded.turnType === "follow_up" &&
    /importar/i.test(alreadyHaveEmptyCopy) &&
    /analizar/i.test(alreadyHaveEmptyCopy) &&
    /analizar/i.test(alreadyHaveLoadedCopy) &&
    alreadyHaveEmpty.clarification === null &&
    alreadyHaveLoaded.primaryCardId === "analyze-workspace" &&
    alreadyHaveEmpty.continuationKind === "next_step" &&
    /no invento un dataset/i.test(alreadyHaveEmptyCopy) &&
    /no verifica el contenido del archivo/i.test(alreadyHaveLoadedCopy) &&
    !/no hay una intenci[oó]n clara/i.test(alreadyHaveEmptyCopy),
  `${alreadyHaveEmpty.primaryCardId}/${alreadyHaveLoaded.primaryCardId}/${alreadyHaveEmptyCopy}`
);

const topicChangeFromPearson = buildGuidanceDecision(
  "Quiero graficar una función",
  emptyCtx,
  afterPearsonDefine
);
assertCase(
  "p5.2.d.topic-change-math",
  topicChangeFromPearson.turnType === "topic_change" &&
    topicChangeFromPearson.primaryCardId === "math-graph" &&
    topicChangeFromPearson.goal === "plot" &&
    classifyIntent("Quiero graficar una función")?.intentId === "math-graph",
  `${topicChangeFromPearson.turnType}/${topicChangeFromPearson.primaryCardId}`
);

const afterMultiConcepts = nextGuidanceConversation(
  multi,
  "Quiero analizar mis datos con Pearson y regresión"
);
const whenUsedAmbiguous = buildGuidanceDecision(
  "¿Y cuándo se usa?",
  emptyCtx,
  afterMultiConcepts
);
const whenUsedAmbiguousCopy = `${whenUsedAmbiguous.interpretation} ${whenUsedAmbiguous.explanation}`;
assertCase(
  "p5.2.e.multi-concept-no-winner",
  whenUsedAmbiguous.turnType === "follow_up" &&
    /pearson/i.test(whenUsedAmbiguousCopy) &&
    /regresi/i.test(whenUsedAmbiguousCopy) &&
    /no elijo un m[eé]todo/i.test(whenUsedAmbiguousCopy) &&
    whenUsedAmbiguous.primaryCardId === null &&
    whenUsedAmbiguous.clarification === null &&
    whenUsedAmbiguous.userConcepts.some((item) => item.conceptId === "pearson") &&
    whenUsedAmbiguous.userConcepts.some((item) => item.conceptId === "regression") &&
    !/debes usar|m[eé]todo correcto|elija pearson|elija regresi/i.test(
      whenUsedAmbiguousCopy
    ),
  whenUsedAmbiguousCopy
);

const afterKruskal = nextGuidanceConversation(unknownTerm, "¿Qué es Kruskal?");
const whereKruskal = buildGuidanceDecision("¿Dónde está?", emptyCtx, afterKruskal);
const whereKruskalCopy = `${whereKruskal.interpretation} ${whereKruskal.explanation}`;
assertCase(
  "p5.2.f.kruskal-unknown",
  whereKruskal.turnType === "follow_up" &&
    whereKruskal.userConcepts.some((item) => item.conceptId === "unknown") &&
    whereKruskal.primaryCardId === null &&
    whereKruskal.clarification === null &&
    !/matem[aá]ticas|est[aá] en an[aá]lisis →|analysis\/multivariate/i.test(
      whereKruskalCopy
    ) &&
    /no hay una ubicaci[oó]n|no hay una capacidad verificada|no invento/i.test(
      whereKruskalCopy
    ),
  whereKruskalCopy
);

const closingCopy = `${closing.interpretation} ${closing.explanation} ${closing.continuationPrompt ?? ""}`;
assertCase(
  "p5.2.g.closing",
  closing.turnType === "closing" &&
    closing.primaryCardId === null &&
    closing.clarification === null &&
    closing.continuationPrompt === null &&
    closing.continuationKind === "none" &&
    !/no hay una intenci[oó]n clara/i.test(closingCopy) &&
    !/handleSmartStartSelect|selectWorkspaceSection/.test(guidanceSource),
  `${closing.turnType}/${closing.interpretation}`
);

const overreachCorpus = [
  whenUsedCopy,
  whereRegressionCopy,
  alreadyHaveEmptyCopy,
  alreadyHaveLoadedCopy,
  whenUsedAmbiguousCopy,
  whereKruskalCopy,
  closingCopy,
].join(" ");
assertCase(
  "p5.2.i.overreach",
  !/recomend|debes usar|es correcta|ejecutar/i.test(overreachCorpus),
  overreachCorpus
);

const followUpCatalogSource = readFileSync(
  join(repoRoot, "src/lib/smart-start/follow-up-catalog.ts"),
  "utf8"
);
assertCase(
  "p5.2.no-continuation-slot",
  whenUsed.clarification === null &&
    whereRegression.clarification === null &&
    alreadyHaveEmpty.clarification === null &&
    afterPearsonDefine.pendingSlot === null &&
    afterRegressionOnly.pendingSlot === null &&
    !followUpCatalogSource.includes("openai") &&
    !followUpCatalogSource.includes("handleSmartStartSelect"),
  "slot/llm"
);

const afterWhenUsed = nextGuidanceConversation(whenUsed, "¿Y cuándo se usa?");
assertCase(
  "p5.2.yes-not-parsed",
  afterContinuationYes.turnType === "new_intent" &&
    afterContinuationYes.primaryCardId === null &&
    /no hay una intenci[oó]n clara/i.test(afterContinuationYes.interpretation) &&
    afterRegressionOnly.pendingSlot === null,
  `${afterContinuationYes.turnType}/${afterRegressionOnly.pendingSlot}`
);

const pearsonYes = buildGuidanceDecision("sí", emptyCtx, afterWhenUsed);
const pearsonYesCopy = `${pearsonYes.interpretation} ${pearsonYes.explanation}`;
assertCase(
  "p5.3.a.pearson-yes",
  afterWhenUsed.pendingSlot === "continuation" &&
    afterWhenUsed.clarificationAsked === false &&
    pearsonYes.turnType === "continuation_answer" &&
    pearsonYes.clarification === null &&
    /pearson/i.test(pearsonYesCopy) &&
    !/no hay una intenci[oó]n clara/i.test(pearsonYesCopy) &&
    !/debes usar pearson/i.test(pearsonYesCopy) &&
    pearsonYes.userConcepts.some((item) => item.conceptId === "pearson") &&
    pearsonYes.primaryCardId === null,
  `${afterWhenUsed.pendingSlot}/${pearsonYes.turnType}/${pearsonYesCopy}`
);

const afterWhereRegression = nextGuidanceConversation(
  whereRegression,
  "¿Dónde está?"
);
const regressionYes = buildGuidanceDecision("sí", emptyCtx, afterWhereRegression);
const regressionYesCopy = `${regressionYes.interpretation} ${regressionYes.explanation}`;
assertCase(
  "p5.3.b.regression-where-yes",
  afterWhereRegression.pendingSlot === "continuation" &&
    regressionYes.turnType === "continuation_answer" &&
    /importar|analizar|matem[aá]ticas/i.test(regressionYesCopy) &&
    regressionYes.clarification === null &&
    regressionYes.continuationKind === "none" &&
    !/handleSmartStartSelect/.test(guidanceSource),
  `${regressionYes.turnType}/${regressionYes.primaryCardId}/${regressionYesCopy}`
);

const continuationNo = buildGuidanceDecision("no", emptyCtx, afterWhenUsed);
assertCase(
  "p5.3.c.continuation-no",
  continuationNo.turnType === "continuation_answer" &&
    continuationNo.continuationKind === "none" &&
    continuationNo.continuationPrompt === null &&
    continuationNo.clarification === null &&
    /de acuerdo/i.test(continuationNo.interpretation) &&
    continuationNo.userConcepts.some((item) => item.conceptId === "pearson") &&
    nextGuidanceConversation(continuationNo, "no").pendingSlot === null,
  `${continuationNo.turnType}/${continuationNo.continuationKind}`
);

const compareWhileSlot = buildGuidanceDecision(
  "sí, quiero comparar dos grupos",
  emptyCtx,
  afterWhenUsed
);
assertCase(
  "p5.3.d.yes-compare-topic-change",
  compareWhileSlot.turnType === "topic_change" &&
    compareWhileSlot.primaryCardId === "compare-datasets" &&
    compareWhileSlot.goal === "compare" &&
    !compareWhileSlot.userConcepts.some((item) => item.conceptId === "pearson"),
  `${compareWhileSlot.turnType}/${compareWhileSlot.primaryCardId}`
);

const mathWhileSlot = buildGuidanceDecision(
  "sí, pero quiero graficar una función",
  emptyCtx,
  afterWhenUsed
);
assertCase(
  "p5.3.e.yes-math-topic-change",
  mathWhileSlot.turnType === "topic_change" &&
    mathWhileSlot.primaryCardId === "math-graph" &&
    mathWhileSlot.goal === "plot",
  `${mathWhileSlot.turnType}/${mathWhileSlot.primaryCardId}`
);

assertCase(
  "p5.3.f.no-slot-si-p4",
  afterRegressionOnly.pendingSlot === null &&
    afterContinuationYes.turnType === "new_intent" &&
    /no hay una intenci[oó]n clara/i.test(afterContinuationYes.interpretation) &&
    regressionEmpty.continuationKind === "ask_before_continue",
  `${afterRegressionOnly.pendingSlot}/${afterContinuationYes.turnType}`
);

const noWithoutSlot = buildGuidanceDecision("no", emptyCtx, afterRegressionOnly);
assertCase(
  "p5.3.g.no-slot-no-closing",
  noWithoutSlot.turnType === "closing" &&
    noWithoutSlot.primaryCardId === null &&
    noWithoutSlot.continuationKind === "none" &&
    afterRegressionOnly.pendingSlot === null,
  `${noWithoutSlot.turnType}/${noWithoutSlot.continuationKind}`
);

const depende = buildGuidanceDecision("depende", emptyCtx, afterWhenUsed);
const dependeCopy = `${depende.interpretation} ${depende.explanation}`;
assertCase(
  "p5.3.h.ambiguous-depende",
  depende.turnType === "continuation_answer" &&
    depende.clarification === null &&
    depende.continuationKind === "none" &&
    depende.primaryCardId === null &&
    !/debes usar|m[eé]todo correcto|ejecutar/i.test(dependeCopy) &&
    !/\bs[ií] o no\b/i.test(dependeCopy) &&
    nextGuidanceConversation(depende, "depende").pendingSlot === null,
  dependeCopy
);

const afterPearsonYes = nextGuidanceConversation(pearsonYes, "sí");
const pearsonYes2 = buildGuidanceDecision("sí", emptyCtx, afterPearsonYes);
const afterPearsonYes2 = nextGuidanceConversation(pearsonYes2, "sí");
const pearsonYes3 = buildGuidanceDecision("sí", emptyCtx, afterPearsonYes2);
assertCase(
  "p5.3.i.repeated-si-bound",
  pearsonYes.turnType === "continuation_answer" &&
    pearsonYes2.turnType === "continuation_answer" &&
    pearsonYes2.continuationKind === "none" &&
    afterPearsonYes2.pendingSlot === null &&
    pearsonYes3.turnType === "closing" &&
    pearsonYes3.continuationKind === "none" &&
    !/no hay una intenci[oó]n clara/i.test(pearsonYes3.interpretation),
  `${pearsonYes.continuationKind}/${pearsonYes2.continuationKind}/${pearsonYes3.turnType}`
);

const afterWhereKruskal = nextGuidanceConversation(whereKruskal, "¿Dónde está?");
const kruskalYes = buildGuidanceDecision("sí", emptyCtx, afterWhereKruskal);
const kruskalYesCopy = `${kruskalYes.interpretation} ${kruskalYes.explanation}`;
assertCase(
  "p5.3.j.kruskal-yes-unknown",
  afterWhereKruskal.pendingSlot === null &&
    kruskalYes.turnType === "new_intent" &&
    kruskalYes.primaryCardId === null &&
    !/an[aá]lisis →|analysis\/multivariate|prueba kruskal|disponible.*kruskal/i.test(
      kruskalYesCopy
    ),
  `${afterWhereKruskal.pendingSlot}/${kruskalYes.turnType}/${kruskalYesCopy}`
);

const afterAmbiguousWhen = nextGuidanceConversation(
  whenUsedAmbiguous,
  "¿Y cuándo se usa?"
);
const multiYes = buildGuidanceDecision("sí", emptyCtx, afterAmbiguousWhen);
const multiYesCopy = `${multiYes.interpretation} ${multiYes.explanation}`;
assertCase(
  "p5.3.k.multi-yes-no-winner",
  afterAmbiguousWhen.pendingSlot === null &&
    multiYes.primaryCardId === null &&
    !/debes usar|elija pearson|elija regresi|m[eé]todo correcto/i.test(multiYesCopy),
  `${afterAmbiguousWhen.pendingSlot}/${multiYes.turnType}/${multiYesCopy}`
);

const screenSource = readFileSync(
  join(repoRoot, "src/components/home/SmartStartScreen.tsx"),
  "utf8"
);
assertCase(
  "p5.3.l.card-remount",
  EMPTY_HOME_GUIDANCE_CONVERSATION.pendingSlot === null &&
    EMPTY_HOME_GUIDANCE_CONVERSATION.turnCount === 0 &&
    EMPTY_HOME_GUIDANCE_CONVERSATION.lastDecision === null &&
    screenSource.includes("guidanceEpoch"),
  "empty default / guidanceEpoch"
);

const continuationResolveSource = readFileSync(
  join(repoRoot, "src/lib/smart-start/continuation-resolve.ts"),
  "utf8"
);
const p53Overreach = [
  pearsonYesCopy,
  regressionYesCopy,
  `${continuationNo.interpretation} ${continuationNo.explanation}`,
  dependeCopy,
  kruskalYesCopy,
  multiYesCopy,
].join(" ");
assertCase(
  "p5.3.n.overreach",
  !/recomend|debes usar|es correcta|ejecutar/i.test(p53Overreach) &&
    !continuationResolveSource.includes("openai") &&
    !continuationResolveSource.includes("handleSmartStartSelect") &&
    !guidanceSource.includes("handleSmartStartSelect"),
  "copy/handlers"
);

assertCase(
  "p5.3.data-source-not-continuation",
  afterAsk.pendingSlot === "data_source" &&
    followUpImport.turnType === "clarification" &&
    followUpImport.primaryCardId === "analyze-dataset" &&
    afterWhenUsed.pendingSlot === "continuation" &&
    afterWhenUsed.clarificationAsked === false,
  `${afterAsk.pendingSlot}/${followUpImport.turnType}/${afterWhenUsed.pendingSlot}`
);

const csvDuringContinuation = buildGuidanceDecision(
  "tengo un CSV",
  emptyCtx,
  afterWhenUsed
);
assertCase(
  "p5.3.csv-not-continuation-answer",
  csvDuringContinuation.turnType !== "continuation_answer" &&
    csvDuringContinuation.clarification === null,
  `${csvDuringContinuation.turnType}/${csvDuringContinuation.primaryCardId}`
);

const conversationContractSource = readFileSync(
  join(repoRoot, "src/lib/conversation/contract.ts"),
  "utf8"
);
assertCase(
  "p5.4.contract-exists-home-wired",
  conversationContractSource.includes("WIRED_CONVERSATION_DOMAINS") &&
    conversationContractSource.includes('"home"') &&
    conversationContractSource.includes("homeConversationContext") &&
    conversationContractSource.includes("allowGenerationPort: true") &&
    !conversationContractSource.includes("openai") &&
    !assistantSource.includes("@/lib/conversation"),
  "p5.4 freeze"
);

const summary = {
  phase: "home-guidance-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

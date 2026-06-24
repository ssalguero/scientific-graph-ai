import {
  classifyIntent,
  type SmartStartIntentId,
} from "../src/app/intentAssistant";

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const results: CaseResult[] = [];

function assertIntent(
  id: string,
  input: string,
  expectedIntent: SmartStartIntentId,
  expectedProfile?: string
) {
  const recommendation = classifyIntent(input);
  const pass =
    recommendation !== null &&
    recommendation.intentId === expectedIntent &&
    (expectedProfile === undefined ||
      recommendation.recommendedProfile === expectedProfile);

  results.push({
    id,
    pass,
    detail: recommendation
      ? `${recommendation.intentId} / ${recommendation.recommendedProfile}`
      : "null",
  });
}

assertIntent("example.analyze-csv", "Quiero importar un CSV para análisis", "analyze-dataset", "basic");
assertIntent("example.analyze-excel", "Tengo datos en Excel", "analyze-dataset", "basic");
assertIntent("example.compare-ab", "comparar grupos A/B en un experimento", "compare-datasets", "standard");
assertIntent("example.math-sine", "graficar función seno y coseno", "math-graph", "standard");
assertIntent("example.publication", "evaluar paper para revista científica", "evaluate-publication", "standard");
assertIntent("example.open-project", "abrir mi proyecto sgproj guardado", "open-project", "standard");
assertIntent("example.expert", "modo experto con herramientas avanzadas", "expert-mode", "expert");

results.push({
  id: "empty.input",
  pass: classifyIntent("   ") === null,
});

const summary = {
  phase: "intent-assistant-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

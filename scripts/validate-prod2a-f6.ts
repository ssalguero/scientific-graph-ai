import {
  formatProjectOpenError,
  migrateProjectJson,
  sniffJsonFileKind,
  validateProjectFileSelection,
} from "../src/lib/project/index";

type CaseResult = { id: string; pass: boolean; detail?: string };
const results: CaseResult[] = [];

const assertCase = (id: string, condition: boolean, detail?: string) => {
  results.push({ id, pass: condition, detail });
};

assertCase("f6.sniff.sgproj", sniffJsonFileKind('{"kind":"scientific-graph-ai.project"}') === "sgproj");
assertCase(
  "f6.sniff.graph",
  sniffJsonFileKind('{"expression":"x^2","min_x":-10}') === "graph-json"
);
assertCase("f6.sniff.invalid", sniffJsonFileKind("{") === "invalid-json");
assertCase("f6.sniff.empty", sniffJsonFileKind("   ") === "invalid-json");
assertCase(
  "f6.sniff.unknown",
  sniffJsonFileKind('{"foo":"bar"}') === "unknown-json"
);

const badExtension = validateProjectFileSelection("dataset.csv");
assertCase("f6.extension.csv", badExtension !== null);
assertCase(
  "f6.extension.sgproj",
  validateProjectFileSelection("mi-proyecto.sgproj") === null
);

const graphMsg = formatProjectOpenError([], {
  fileText: '{"expression":"sin(x)","curves":[{"expression":"x"}]}',
});
assertCase("f6.message.graph-json", graphMsg.includes("gráfico JSON"));

const future = migrateProjectJson(
  JSON.stringify({
    kind: "scientific-graph-ai.project",
    schemaVersion: 99,
    appVersion: "0.1.0",
    exportedAt: "2026-01-01T00:00:00.000Z",
    project: {
      metadata: {
        id: "00000000-0000-4000-8000-000000000001",
        name: "Future",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      dataset: { series: [], info: null },
      importProvenance: { report: null, preserveAnalysisOnReimport: false },
      analysisConfig: {
        visibility: {},
        modes: {
          regressionModel: "none",
          errorBarMode: "sd",
          correlationMethod: "pearson",
          outlierMethod: "iqr",
          heatmapMode: "correlation",
          nonParametricMode: "mann-whitney",
          histogramBins: 10,
          axisScaleMode: "linear",
          naturalLanguageEnabled: true,
        },
        selections: {
          tTestSeriesA: null,
          tTestSeriesB: null,
          mannWhitneySeriesA: null,
          mannWhitneySeriesB: null,
        },
        legend: { hiddenKeys: [] },
      },
      workflow: {
        session: {
          status: "idle",
          templateId: null,
          currentStepIndex: 0,
          completedStepIds: [],
          skippedStepIds: [],
          startedAt: null,
          completedAt: null,
        },
      },
      comparison: {
        slots: {
          A: { label: "Slot A", profile: null },
          B: { label: "Slot B", profile: null },
        },
      },
      workspace: {
        activeSection: "data",
        inspectorSection: "visualization",
        enabledModules: { basic: true },
      },
      graphContext: null,
    },
  })
);
assertCase("f6.future.schema", future.ok === false);
if (!future.ok) {
  const futureMsg = formatProjectOpenError(future.errors);
  assertCase(
    "f6.future.message",
    futureMsg.includes("versión más nueva") || futureMsg.includes("Schema version")
  );
}

const summary = {
  phase: "F6",
  pass: results.every((item) => item.pass),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

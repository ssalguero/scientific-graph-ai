import fs from "node:fs";
import path from "node:path";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
} from "@/lib/experimentalWorksheet";
import { hydrateProjectJson, serializeProjectV2 } from "@/lib/project";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import { projectVisualGraphEntryToPersistedV2 } from "@/lib/project/domain/mappers/visual-graph";
import {
  buildVisualGraphHydrateContextFromSeries,
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
  SAMPLE_VGB_BUBBLE_SPEC_INPUT,
  SAMPLE_VGB_DATASET_ID,
  SAMPLE_VGB_HEATMAP_SPEC_INPUT,
  SAMPLE_VGB_PCA_SPEC_INPUT,
  SAMPLE_VGB_REGISTRY,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
  SAMPLE_VGB_SERIES,
  buildSampleVisualGraphEntry,
  buildSampleVisualGraphPersisted,
} from "@/lib/project/__tests__/visual-graph-mapper-helpers";
import { projectVisualGraphPersistedV2ToRuntimeEntry } from "@/lib/project/domain/mappers/visual-graph";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  applyVisualGraphSpecification,
  buildGraphSpecification,
  buildPCAFromWorksheet,
  buildVisualGraphPreview,
  incorporateVisualGraphIntoProject,
  validateVisualGraphConfiguration,
} from "@/lib/visualGraphBuilder";

import {
  buildVisualGraphHydrateCollectContext,
  patchToCollectContextV2WithVisualGraphs,
} from "@/lib/project/__tests__/visual-graph-hydrate-helpers";

const PCA_EIGENVALUE_EPSILON = 1e-9;
const PCA_GOLDEN_FIXTURE = path.join(
  process.cwd(),
  "scripts",
  "fixtures",
  "project-v2-dataset5-with-pca.sgproj"
);

const pcaSpec = { ...SAMPLE_VGB_PCA_SPEC_INPUT };
const model = seriesToWorksheet(SAMPLE_VGB_SERIES);

const constantColumnSeries: ExperimentalSeries = {
  id: "const-col",
  name: "ConstCol",
  color: "#333333",
  points: [
    { x: 1, y: 5 },
    { x: 2, y: 5 },
    { x: 3, y: 5 },
  ],
};

const constantModel = seriesToWorksheet([
  SAMPLE_VGB_SERIES[0]!,
  SAMPLE_VGB_SERIES[1]!,
  constantColumnSeries,
]);
const constantRegistry = {
  ...SAMPLE_VGB_REGISTRY,
  "const-col": DEFAULT_COLUMN_METADATA,
};

const singleRowSeries: ExperimentalSeries[] = [
  {
    id: "row-a",
    name: "RowA",
    color: "#444444",
    points: [{ x: 1, y: 1 }],
  },
  {
    id: "row-b",
    name: "RowB",
    color: "#555555",
    points: [{ x: 1, y: 2 }],
  },
];

const allConstantSeries: ExperimentalSeries[] = [
  {
    id: "c1",
    name: "C1",
    color: "#666666",
    points: [
      { x: 1, y: 3 },
      { x: 2, y: 3 },
    ],
  },
  {
    id: "c2",
    name: "C2",
    color: "#777777",
    points: [
      { x: 1, y: 7 },
      { x: 2, y: 7 },
    ],
  },
];

const perfectCorrXSeries: ExperimentalSeries = {
  id: "xcol",
  name: "X",
  color: "#888888",
  points: [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 4 },
    { x: 5, y: 5 },
  ],
};

const perfectCorrYSeries: ExperimentalSeries = {
  id: "ycol",
  name: "Y",
  color: "#999999",
  points: [
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 6 },
    { x: 4, y: 8 },
    { x: 5, y: 10 },
  ],
};

const perfectCorrModel = seriesToWorksheet([perfectCorrXSeries, perfectCorrYSeries]);
const perfectCorrRegistry = {
  xcol: DEFAULT_COLUMN_METADATA,
  ycol: DEFAULT_COLUMN_METADATA,
};

const perfectCorrSpec = {
  ...SAMPLE_VGB_PCA_SPEC_INPUT,
  pcaVariables: ["xcol", "ycol"],
};

export const runPcaCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  assertCase(
    "visual-graph.pca.config.valid",
    validateVisualGraphConfiguration(pcaSpec, model, SAMPLE_VGB_REGISTRY).ok === true
  );

  const tooFewVars = validateVisualGraphConfiguration(
    { ...pcaSpec, pcaVariables: ["control1"] },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.pca.config.too-few-variables",
    !tooFewVars.ok &&
      tooFewVars.message === "Se requieren al menos 2 variables numéricas."
  );

  const missingVar = validateVisualGraphConfiguration(
    { ...pcaSpec, pcaVariables: ["control1", "missing-column"] },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.pca.config.missing-variable",
    !missingVar.ok &&
      missingVar.message.includes('Variable "missing-column" no encontrada')
  );

  const preview = buildVisualGraphPreview(pcaSpec, model, SAMPLE_VGB_REGISTRY);
  assertCase(
    "visual-graph.pca.algorithm.scores-finite-deterministic",
    !("error" in preview) &&
      preview.pcaData.length > 0 &&
      preview.pcaData.every(
        (point) =>
          Number.isFinite(point.pc1) &&
          Number.isFinite(point.pc2) &&
          typeof point.label === "string"
      )
  );

  const standardizedPreview = buildVisualGraphPreview(
    { ...pcaSpec, pcaStandardize: true },
    model,
    SAMPLE_VGB_REGISTRY
  );
  const rawPreview = buildVisualGraphPreview(
    { ...pcaSpec, pcaStandardize: false },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.pca.algorithm.standardize-differs",
    !("error" in standardizedPreview) &&
      !("error" in rawPreview) &&
      JSON.stringify(standardizedPreview.pcaData) !== JSON.stringify(rawPreview.pcaData)
  );

  const withConstantPreview = buildVisualGraphPreview(
    {
      ...pcaSpec,
      pcaVariables: ["control1", "tratamiento1", "const-col"],
    },
    constantModel,
    constantRegistry
  );
  assertCase(
    "visual-graph.pca.algorithm.constant-column-excluded",
    !("error" in withConstantPreview) && withConstantPreview.pcaData.length === 3
  );

  const perfectPreview = buildVisualGraphPreview(
    perfectCorrSpec,
    perfectCorrModel,
    perfectCorrRegistry
  );
  assertCase(
    "visual-graph.pca.algorithm.pc2-degenerate",
    !("error" in perfectPreview) &&
      perfectPreview.pcaData.length > 0 &&
      perfectPreview.pcaData.every(
        (point) => Math.abs(point.pc2) <= PCA_EIGENVALUE_EPSILON
      )
  );

  const singleRowModel = seriesToWorksheet(singleRowSeries);
  const singleRowRegistry = {
    "row-a": DEFAULT_COLUMN_METADATA,
    "row-b": DEFAULT_COLUMN_METADATA,
  };
  const insufficientRows = validateVisualGraphConfiguration(
    { ...pcaSpec, pcaVariables: ["row-a", "row-b"] },
    singleRowModel,
    singleRowRegistry
  );
  assertCase(
    "visual-graph.pca.algorithm.insufficient-observations",
    !insufficientRows.ok &&
      insufficientRows.message === "Datos insuficientes para PCA."
  );

  const allConstantModel = seriesToWorksheet(allConstantSeries);
  const allConstantRegistry = {
    c1: DEFAULT_COLUMN_METADATA,
    c2: DEFAULT_COLUMN_METADATA,
  };
  const insufficientVariance = validateVisualGraphConfiguration(
    { ...pcaSpec, pcaVariables: ["c1", "c2"] },
    allConstantModel,
    allConstantRegistry
  );
  assertCase(
    "visual-graph.pca.algorithm.insufficient-variance",
    !insufficientVariance.ok &&
      insufficientVariance.message === "Datos insuficientes para PCA."
  );

  const builtSpec = buildGraphSpecification(pcaSpec, model, SAMPLE_VGB_REGISTRY);
  assertCase(
    "visual-graph.pca.pipeline.buildGraphSpecification",
    !("error" in builtSpec) &&
      builtSpec.graphType === "pca" &&
      builtSpec.pcaVariables?.length === 2 &&
      builtSpec.pcaStandardize === true
  );

  const applied = applyVisualGraphSpecification(
    pcaSpec,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.pca.pipeline.applyVisualGraphSpecification",
    applied.ok &&
      applied.preview.graphType === "pca" &&
      applied.preview.pcaData.length > 0 &&
      applied.preview.pcaMeta !== null &&
      applied.displaySeries.length === 0
  );

  const incorporated = incorporateVisualGraphIntoProject(
    [],
    pcaSpec,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.pca.pipeline.incorporateVisualGraphIntoProject",
    incorporated.ok &&
      incorporated.graphs.length === 1 &&
      incorporated.entry.graphSpec.graphType === "pca"
  );

  const pcaEntry = buildSampleVisualGraphEntry({
    graphId: "vg-pca-gate",
    specInput: pcaSpec,
  });
  const persisted = projectVisualGraphEntryToPersistedV2(
    pcaEntry,
    SAMPLE_VGB_DATASET_ID
  );
  const serialized = serializeProjectV2({
    project: collectProjectSnapshotV2(
      buildVisualGraphHydrateCollectContext({
        projectVisualGraphEntries: [pcaEntry],
      })
    ),
    appVersion: "0.1.0",
    options: { includeChecksum: false, pretty: true },
  });

  assertCase(
    "visual-graph.pca.vgbR1.noPcaDataLeak",
    hasOnlyPersistedVisualGraphKeys(persisted as unknown as Record<string, unknown>) &&
      !("preview" in (persisted as unknown as Record<string, unknown>)) &&
      !("displaySeries" in (persisted as unknown as Record<string, unknown>)) &&
      !("pcaData" in (persisted.graphSpec as unknown as Record<string, unknown>)) &&
      !("pcaMeta" in (persisted.graphSpec as unknown as Record<string, unknown>)) &&
      PREVIEW_ONLY_EPHEMERAL_KEYS.every(
        (key) => !(key in (persisted.graphSpec as unknown as Record<string, unknown>))
      ) &&
      serialized.ok === true &&
      !serialized.json.includes('"preview"') &&
      !serialized.json.includes('"displaySeries"') &&
      !serialized.json.includes('"pcaData"') &&
      !serialized.json.includes('"pcaMeta"')
  );

  const persistedPca = buildSampleVisualGraphPersisted({
    graphId: "vg-pca-hydrate",
    specInput: pcaSpec,
  });
  const rebuilt = projectVisualGraphPersistedV2ToRuntimeEntry(
    persistedPca,
    buildVisualGraphHydrateContextFromSeries()
  );
  assertCase(
    "visual-graph.pca.hydrate.rebuildsPreview",
    rebuilt !== null &&
      rebuilt.preview.graphType === "pca" &&
      rebuilt.preview.pcaData.length > 0 &&
      rebuilt.preview.pcaMeta !== null
  );

  const pcaGoldenHydrated = hydrateProjectJson(
    fs.readFileSync(PCA_GOLDEN_FIXTURE, "utf8")
  );
  const pcaCollectContext =
    pcaGoldenHydrated.ok === true
      ? patchToCollectContextV2WithVisualGraphs(pcaGoldenHydrated.patch)
      : null;
  const firstProject =
    pcaCollectContext !== null
      ? collectProjectSnapshotV2(pcaCollectContext)
      : null;
  const firstSerialized =
    firstProject !== null
      ? serializeProjectV2({
          project: firstProject,
          appVersion: "0.1.0",
          exportedAt: "2026-06-30T10:00:00.000Z",
          options: { includeChecksum: false },
        })
      : { ok: false as const, errors: [] as string[] };
  const reloaded =
    firstSerialized.ok === true
      ? hydrateProjectJson(firstSerialized.json)
      : { ok: false as const, errors: [] as string[] };
  const secondProject =
    reloaded.ok === true
      ? collectProjectSnapshotV2(patchToCollectContextV2WithVisualGraphs(reloaded.patch))
      : null;
  const secondSerialized =
    secondProject !== null
      ? serializeProjectV2({
          project: secondProject,
          appVersion: "0.1.0",
          exportedAt: "2026-06-30T10:00:00.000Z",
          options: { includeChecksum: false },
        })
      : { ok: false as const, errors: [] as string[] };

  assertCase(
    "visual-graph.pca.roundtrip.idempotent",
    pcaGoldenHydrated.ok === true &&
      firstSerialized.ok === true &&
      reloaded.ok === true &&
      secondSerialized.ok === true &&
      firstSerialized.json === secondSerialized.json
  );

  const scatterWithPcaVars = {
    ...SAMPLE_VGB_SCATTER_SPEC_INPUT,
    pcaVariables: ["control1", "tratamiento1"],
    pcaStandardize: true,
  };
  const scatterBuilt = buildGraphSpecification(
    scatterWithPcaVars,
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.pca.scope.pcaVariables-ignored-in-scatter",
    validateVisualGraphConfiguration(scatterWithPcaVars, model, SAMPLE_VGB_REGISTRY).ok ===
      true &&
      !("error" in scatterBuilt) &&
      !("pcaVariables" in scatterBuilt) &&
      !("pcaStandardize" in scatterBuilt) &&
      scatterBuilt.graphType === "scatter"
  );

  assertCase(
    "visual-graph.pca.regression.heatmap",
    validateVisualGraphConfiguration(
      SAMPLE_VGB_HEATMAP_SPEC_INPUT,
      model,
      SAMPLE_VGB_REGISTRY
    ).ok === true
  );

  assertCase(
    "visual-graph.pca.regression.bubble",
    validateVisualGraphConfiguration(
      SAMPLE_VGB_BUBBLE_SPEC_INPUT,
      model,
      SAMPLE_VGB_REGISTRY
    ).ok === true
  );

  if (!("error" in preview) && preview.pcaMeta) {
    const meta = preview.pcaMeta;
    assertCase(
      "visual-graph.pca.meta.variance-coherent",
      meta.component1Variance >= 0 &&
        meta.component2Variance >= 0 &&
        meta.cumulativeVariance >= 0 &&
        meta.cumulativeVariance <= 100 + 1e-9 &&
        Math.abs(
          meta.cumulativeVariance -
            (meta.component1Variance + meta.component2Variance)
        ) < 1e-9
    );
  } else {
    assertCase("visual-graph.pca.meta.variance-coherent", false);
  }

  const previewA = buildVisualGraphPreview(pcaSpec, model, SAMPLE_VGB_REGISTRY);
  const previewB = buildVisualGraphPreview(pcaSpec, model, SAMPLE_VGB_REGISTRY);
  const analysisA = buildPCAFromWorksheet(
    model,
    pcaSpec.pcaVariables ?? [],
    pcaSpec.pcaStandardize ?? true
  );
  const analysisB = buildPCAFromWorksheet(
    model,
    pcaSpec.pcaVariables ?? [],
    pcaSpec.pcaStandardize ?? true
  );
  assertCase(
    "visual-graph.pca.decision-i.sign-normalization-determinism",
    !("error" in previewA) &&
      !("error" in previewB) &&
      JSON.stringify(previewA.pcaData) === JSON.stringify(previewB.pcaData) &&
      analysisA !== null &&
      analysisB !== null &&
      JSON.stringify(analysisA) === JSON.stringify(analysisB)
  );

  if (!("error" in perfectPreview) && perfectPreview.pcaMeta) {
    assertCase(
      "visual-graph.pca.case19.perfectly-correlated-variables",
      perfectPreview.pcaData.length > 0 &&
        perfectPreview.pcaData.every((point) => Number.isFinite(point.pc1)) &&
        perfectPreview.pcaData.every(
          (point) => Math.abs(point.pc2) <= PCA_EIGENVALUE_EPSILON
        ) &&
        perfectPreview.pcaMeta.component1Variance > 0 &&
        perfectPreview.pcaMeta.cumulativeVariance >=
          perfectPreview.pcaMeta.component1Variance - 1e-9
    );
  } else {
    assertCase("visual-graph.pca.case19.perfectly-correlated-variables", false);
  }

  if (!("error" in preview) && preview.pcaMeta) {
    const metaKeys = Object.keys(preview.pcaMeta).sort();
    assertCase(
      "visual-graph.pca.decision-j.only-pc1-pc2",
      metaKeys.length === 3 &&
        metaKeys.join(",") ===
          "component1Variance,component2Variance,cumulativeVariance" &&
        preview.pcaData.every(
          (point) =>
            Object.keys(point).sort().join(",") === "label,pc1,pc2"
        )
    );
  } else {
    assertCase("visual-graph.pca.decision-j.only-pc1-pc2", false);
  }

  return results;
};

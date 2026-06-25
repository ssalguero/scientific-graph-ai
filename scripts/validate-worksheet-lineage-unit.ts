import type { ExperimentalSeries } from "../src/lib/experimentalData";
import {
  createFormulaColumnMetadata,
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
} from "../src/lib/experimentalWorksheet";
import {
  buildWorksheetDependencyTree,
  getWorksheetColumnLineage,
} from "../src/lib/worksheetLineage";

type CaseResult = { id: string; pass: boolean; detail?: string };

const results: CaseResult[] = [];

const control1: ExperimentalSeries = {
  id: "control1",
  name: "Control1",
  color: "#3b82f6",
  points: [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
  ],
};

const tratamiento1: ExperimentalSeries = {
  id: "tratamiento1",
  name: "Tratamiento1",
  color: "#ef4444",
  points: [
    { x: 1, y: 30 },
    { x: 2, y: 40 },
  ],
};

const baseModel = seriesToWorksheet([control1, tratamiento1]);

const registry = {
  control1: DEFAULT_COLUMN_METADATA,
  tratamiento1: DEFAULT_COLUMN_METADATA,
  "control1-log": {
    columnType: "numeric" as const,
    transforms: [
      {
        kind: "log" as const,
        enabled: true,
        sourceSeriesId: "control1",
        createdAt: "2026-06-24T14:35:00.000Z",
      },
    ],
  },
  "control1-z": {
    columnType: "numeric" as const,
    transforms: [
      {
        kind: "zscore" as const,
        enabled: true,
        sourceSeriesId: "control1",
      },
    ],
  },
  "indice-metabolico": createFormulaColumnMetadata({
    kind: "formula",
    enabled: true,
    expression: "(Control1 + Tratamiento1) / 2",
    createdAt: "2026-06-24T15:00:00.000Z",
    sourceSeriesIds: ["control1", "tratamiento1"],
  }),
  "formula-simple": createFormulaColumnMetadata({
    kind: "formula",
    enabled: true,
    expression: "Control1 * 2",
    createdAt: "2026-06-24T16:00:00.000Z",
    sourceSeriesIds: ["control1"],
  }),
  "metadata-incompleta": {
    columnType: "numeric" as const,
    transforms: [
      {
        kind: "normalize" as const,
        enabled: true,
      },
    ],
  },
};

const extendedModel = {
  ...baseModel,
  columns: [
    ...baseModel.columns,
    { seriesId: "control1-log", label: "Control1 (Log10)" },
    { seriesId: "control1-z", label: "Control1 (Z)" },
    { seriesId: "indice-metabolico", label: "Índice Metabólico" },
    { seriesId: "formula-simple", label: "Control1 x2" },
    { seriesId: "metadata-incompleta", label: "Sin origen" },
  ],
};

function assertLineage(
  id: string,
  seriesId: string,
  expected: {
    type?: string;
    badge?: string;
    transformLabel?: string | null;
    expression?: string | null;
    sourceLabels?: string[];
    dependencyTree?: string;
    hasCreatedAt?: boolean;
  }
) {
  const lineage = getWorksheetColumnLineage(extendedModel, registry, seriesId);
  if (!lineage) {
    results.push({ id, pass: false, detail: "lineage null" });
    return;
  }

  results.push({
    id,
    pass:
      (expected.type === undefined || lineage.type === expected.type) &&
      (expected.badge === undefined || lineage.badge === expected.badge) &&
      (expected.transformLabel === undefined ||
        lineage.transformLabel === expected.transformLabel) &&
      (expected.expression === undefined ||
        lineage.expression === expected.expression) &&
      (expected.sourceLabels === undefined ||
        JSON.stringify(lineage.sourceLabels) ===
          JSON.stringify(expected.sourceLabels)) &&
      (expected.dependencyTree === undefined ||
        lineage.dependencyTree === expected.dependencyTree) &&
      (expected.hasCreatedAt === undefined ||
        (expected.hasCreatedAt
          ? lineage.createdAtFormatted !== null
          : lineage.createdAtFormatted === null)),
    detail: JSON.stringify({
      type: lineage.type,
      badge: lineage.badge,
      transformLabel: lineage.transformLabel,
      expression: lineage.expression,
      sourceLabels: lineage.sourceLabels,
      dependencyTree: lineage.dependencyTree,
      createdAtFormatted: lineage.createdAtFormatted,
    }),
  });
}

assertLineage("lineage.original", "control1", {
  type: "original",
  badge: "ORIGINAL",
  sourceLabels: [],
  dependencyTree: "Control1",
  hasCreatedAt: false,
});

assertLineage("lineage.transform.log10", "control1-log", {
  type: "transform",
  badge: "TRANSFORMADA",
  transformLabel: "Log10",
  sourceLabels: ["Control1"],
  dependencyTree: buildWorksheetDependencyTree("Control1 (Log10)", [
    { seriesId: "control1", label: "Control1" },
  ]),
  hasCreatedAt: true,
});

assertLineage("lineage.transform.zscore", "control1-z", {
  type: "transform",
  badge: "TRANSFORMADA",
  transformLabel: "Z-Score",
  sourceLabels: ["Control1"],
  dependencyTree: buildWorksheetDependencyTree("Control1 (Z)", [
    { seriesId: "control1", label: "Control1" },
  ]),
  hasCreatedAt: false,
});

assertLineage("lineage.formula.simple", "formula-simple", {
  type: "formula",
  badge: "FÓRMULA",
  expression: "Control1 * 2",
  sourceLabels: ["Control1"],
  hasCreatedAt: true,
});

assertLineage("lineage.formula.two-variables", "indice-metabolico", {
  type: "formula",
  badge: "FÓRMULA",
  expression: "(Control1 + Tratamiento1) / 2",
  sourceLabels: ["Control1", "Tratamiento1"],
  dependencyTree: buildWorksheetDependencyTree("Índice Metabólico", [
    { seriesId: "control1", label: "Control1" },
    { seriesId: "tratamiento1", label: "Tratamiento1" },
  ]),
});

assertLineage("lineage.incomplete-metadata", "metadata-incompleta", {
  type: "transform",
  badge: "TRANSFORMADA",
  transformLabel: "Normalizar (0-1)",
  sourceLabels: [],
  hasCreatedAt: false,
});

const missingLineage = getWorksheetColumnLineage(
  extendedModel,
  registry,
  "columna-desconocida"
);
results.push({
  id: "lineage.missing-column",
  pass: missingLineage === null,
});

const emptyRegistryLineage = getWorksheetColumnLineage(
  extendedModel,
  {},
  "control1"
);
results.push({
  id: "lineage.without-registry",
  pass:
    emptyRegistryLineage !== null &&
    emptyRegistryLineage.type === "original" &&
    emptyRegistryLineage.badge === "ORIGINAL",
});

const summary = {
  phase: "worksheet-lineage-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

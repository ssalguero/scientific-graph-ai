import {
  composeScientificProvenance,
  createCitableScientificSnapshot,
  createLiveScientificProjection,
  createScientificSemanticValue,
  projectCitableScientificSnapshot,
} from "../../contracts";
import {
  SCIENTIFIC_NUMERIC_EXPORT_KIND,
  SCIENTIFIC_NUMERIC_EXPORT_SCHEMA,
  createScientificNumericExport,
  isScientificNumericExport,
  parseScientificNumericExport,
  serializeScientificNumericExport,
  type ScientificNumericExport,
} from "..";

export type ScientificExportAssertCase = (
  id: string,
  pass: boolean,
  detail?: string,
) => void;

const projectionFixture = () => {
  const provenance = composeScientificProvenance({
    dataset: {
      id: "dataset-export",
      label: "precision.csv",
      checksum: "sha256:fixture",
    },
    source: { kind: "worksheet", id: "sheet-export", label: "Measurements" },
    series: [
      { id: "series-response", label: "Response", role: "response" },
      { id: "series-group", label: "Group", role: "group" },
    ],
    config: {
      id: "config-export",
      values: { alpha: 0.05, nested: { iterations: 1000, enabled: true } },
    },
    method: {
      id: "welch-t",
      label: "Welch t-test",
      version: "1",
      parameters: { tails: 2, alpha: 0.05 },
    },
    approximation: {
      kind: "numerical",
      details: "Fixture numerical approximation.",
    },
    warnings: [
      {
        code: "SMALL_SAMPLE",
        message: "Small sample fixture.",
        severity: "warning",
      },
    ],
  });
  const snapshot = createCitableScientificSnapshot({
    snapshotId: "snapshot-export",
    capturedAt: "2026-08-22T10:00:00.000Z",
    resultContractId: "inference.parametric",
    provenance,
    semanticValues: [
      createScientificSemanticValue({
        field: "estimate",
        label: "Estimate",
        value: 0.12345678901234568,
        unit: "mol/L",
        status: "known",
        authority: "system-factual",
        approximation: "numerical",
        uncertainty: {
          kind: "ci",
          value: [0.10000000000000002, 0.14999999999999999],
          unit: "mol/L",
          confidenceLevel: 0.95,
        },
        warnings: [],
        equivalencePolicy: "exact",
      }),
      createScientificSemanticValue({
        field: "extremes",
        value: { minimum: Number.MIN_VALUE, maximum: Number.MAX_VALUE },
        status: "known",
        authority: "system-factual",
        approximation: "exact-formula",
        warnings: [],
        equivalencePolicy: "exact",
      }),
      createScientificSemanticValue({
        field: "generatedInterpretation",
        value: "System-generated advisory prose.",
        status: "known",
        authority: "system-advisory",
        approximation: "unknown",
        warnings: [],
        equivalencePolicy: "non-comparable",
      }),
    ],
    limitations: ["Fixture limitation."],
  });
  return projectCitableScientificSnapshot(snapshot, "numeric-export-foundation", {
    state: "CURRENT",
    recomputable: true,
    reasons: [
      {
        code: "CURRENT_CONTEXT_MATCHES",
        message: "Fixture context is current.",
      },
    ],
  });
};

export const createScientificNumericExportFixture =
  (): ScientificNumericExport =>
    createScientificNumericExport({
      projection: projectionFixture(),
      exportId: "numeric-export-fixture",
      exportedAt: "2026-08-22T11:00:00.000Z",
    });

export const runNumericScientificExportCases = (
  assertCase: ScientificExportAssertCase,
) => {
  const projection = projectionFixture();
  const artifact = createScientificNumericExport({
    projection,
    exportId: "numeric-export-fixture",
    exportedAt: "2026-08-22T11:00:00.000Z",
  });

  assertCase(
    "numeric-export.contract.identity",
    artifact.schema === SCIENTIFIC_NUMERIC_EXPORT_SCHEMA &&
      artifact.kind === SCIENTIFIC_NUMERIC_EXPORT_KIND &&
      artifact.exportIdentity.exportId === "numeric-export-fixture" &&
      artifact.exportIdentity.exportedAt === "2026-08-22T11:00:00.000Z",
  );
  assertCase(
    "numeric-export.contract.snapshot-identity",
    artifact.artifactIdentity.kind === "citable-scientific-snapshot" &&
      artifact.artifactIdentity.snapshotId === "snapshot-export",
  );
  assertCase(
    "numeric-export.contract.result-and-source",
    artifact.resultContractId === "inference.parametric" &&
      artifact.artifactKind === "scientific-result" &&
      artifact.sourceIdentity.dataset.checksum === "sha256:fixture" &&
      artifact.sourceIdentity.series[0]?.role === "response",
  );
  assertCase(
    "numeric-export.contract.semantic-unit-uncertainty",
    artifact.semanticValues[0]?.unit === "mol/L" &&
      artifact.semanticValues[0]?.uncertainty?.unit === "mol/L" &&
      artifact.semanticValues[0]?.uncertainty?.confidenceLevel === 0.95,
  );
  assertCase(
    "numeric-export.contract.excludes-generated-advisory",
    artifact.semanticValues.length === 2 &&
      artifact.semanticValues.every(
        (value) => value.authority === "system-factual",
      ) &&
      !artifact.semanticValues.some(
        (value) => value.field === "generatedInterpretation",
      ),
  );
  assertCase(
    "numeric-export.contract.provenance-metadata",
    artifact.methodIdentity.id === "welch-t" &&
      artifact.configurationIdentity.id === "config-export" &&
      artifact.approximation.kind === "numerical" &&
      artifact.warnings[0]?.code === "SMALL_SAMPLE" &&
      artifact.limitations[0] === "Fixture limitation." &&
      artifact.freshness.state === "CURRENT",
  );
  assertCase(
    "numeric-export.contract.compatibility",
    artifact.compatibility.format === "json" &&
      artifact.compatibility.version === 1 &&
      artifact.compatibility.sourceSurface === "numeric-export-foundation" &&
      artifact.compatibility.numberEncoding ===
        "ieee-754-json-number-round-trip" &&
      artifact.compatibility.generatedContentPolicy ===
        "exclude-non-factual-semantic-values",
  );
  assertCase(
    "numeric-export.contract.frozen",
    Object.isFrozen(artifact) &&
      Object.isFrozen(artifact.semanticValues) &&
      Object.isFrozen(artifact.semanticValues[0]?.uncertainty) &&
      Object.isFrozen(artifact.provenance.config.values),
  );

  const serialized = serializeScientificNumericExport(artifact);
  const parsed = parseScientificNumericExport(serialized);
  assertCase(
    "numeric-export.serialization.deterministic",
    serialized === serializeScientificNumericExport(artifact),
  );
  assertCase(
    "numeric-export.serialization.roundtrip",
    parsed !== null &&
      serializeScientificNumericExport(parsed) === serialized &&
      Object.isFrozen(parsed) &&
      Object.isFrozen(parsed.provenance),
  );
  assertCase(
    "numeric-export.serialization.precision",
    parsed?.semanticValues[0]?.value === 0.12345678901234568 &&
      (
        parsed?.semanticValues[1]?.value as {
          minimum?: number;
          maximum?: number;
        }
      )?.minimum === Number.MIN_VALUE &&
      (
        parsed?.semanticValues[1]?.value as {
          minimum?: number;
          maximum?: number;
        }
      )?.maximum === Number.MAX_VALUE,
  );

  const malformed = structuredClone(artifact) as unknown as Record<
    string,
    unknown
  >;
  malformed.chart = { component: "ResultsChart" };
  assertCase(
    "numeric-export.guard.excludes-chart-ui-state",
    !isScientificNumericExport(malformed),
  );

  const divergent = structuredClone(artifact);
  divergent.provenance.method.id = "different-method";
  assertCase(
    "numeric-export.guard.rejects-divergent-provenance",
    !isScientificNumericExport(divergent),
  );

  const cyclic = structuredClone(artifact) as unknown as {
    compatibility: Record<string, unknown>;
  };
  cyclic.compatibility.self = cyclic.compatibility;
  assertCase(
    "numeric-export.guard.cycle-safe",
    !isScientificNumericExport(cyclic),
  );
  assertCase(
    "numeric-export.parse.rejects-other-artifacts",
    parseScientificNumericExport(
      JSON.stringify({
        schema: "scientific-numeric-export/v2",
        kind: SCIENTIFIC_NUMERIC_EXPORT_KIND,
      }),
    ) === null,
  );
  const negativeZero = structuredClone(artifact);
  (
    negativeZero.semanticValues[0] as {
      value: number;
    }
  ).value = -0;
  assertCase(
    "numeric-export.guard.rejects-negative-zero-loss",
    !isScientificNumericExport(negativeZero),
  );
  const advisoryInjection = structuredClone(artifact);
  (
    advisoryInjection.semanticValues[0] as {
      authority: "system-factual" | "system-advisory";
    }
  ).authority = "system-advisory";
  assertCase(
    "numeric-export.guard.rejects-advisory-semantic-injection",
    !isScientificNumericExport(advisoryInjection) &&
      parseScientificNumericExport(JSON.stringify(advisoryInjection)) === null,
  );
  const negativeZeroConfidence = structuredClone(artifact);
  (
    negativeZeroConfidence.semanticValues[0] as {
      uncertainty: { confidenceLevel: number };
    }
  ).uncertainty.confidenceLevel = -0;
  assertCase(
    "numeric-export.guard.rejects-negative-zero-confidence",
    !isScientificNumericExport(negativeZeroConfidence),
  );

  let wrongSurfaceRejected = false;
  try {
    createScientificNumericExport({
      projection: createLiveScientificProjection({
        surface: "results",
        resultContractId: "inference.parametric",
        provenance: projection.provenance,
        semanticValues: projection.semanticValues,
      }),
      exportId: "wrong-surface",
      exportedAt: "2026-08-22T11:00:00.000Z",
    });
  } catch {
    wrongSurfaceRejected = true;
  }
  assertCase(
    "numeric-export.contract.numeric-foundation-only",
    wrongSurfaceRejected,
  );
};

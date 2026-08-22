import {
  LIVE_DERIVED_RESULT_IDENTITY,
  assessScientificArtifactEquivalence,
  assessScientificSnapshotFreshness,
  assessSemanticProjectionParity,
  composeScientificProvenance,
  createCitableScientificSnapshot,
  createScientificSemanticValue,
  isCitableScientificSnapshot,
  projectCitableScientificSnapshot,
} from "..";
import type { ContractFoundationAssertCase } from "./run-assertions";

const provenance = () =>
  composeScientificProvenance({
    dataset: { id: "dataset-1", label: "Dataset.csv", checksum: "data-v1" },
    source: { kind: "worksheet", id: "sheet-1" },
    series: [
      { id: "series-a", role: "input" },
      { id: "series-b", role: "input" },
    ],
    config: { id: "config-1", values: { alpha: 0.05 } },
    method: {
      id: "method-1",
      label: "Método de fixture",
      version: "1",
      parameters: { alpha: 0.05 },
    },
    approximation: { kind: "numerical", details: "Fixture PR2." },
    warnings: [{ code: "FIXTURE", message: "Advertencia de fixture.", severity: "info" }],
  });

const semanticValue = (value = 42) =>
  createScientificSemanticValue({
    field: "value",
    value,
    unit: "unit",
    status: "known",
    authority: "system-factual",
    approximation: "numerical",
    equivalencePolicy: "exact",
  });

const snapshot = (id: string, value = 42) =>
  createCitableScientificSnapshot({
    snapshotId: id,
    capturedAt: "2026-08-21T20:00:00.000Z",
    resultContractId: "inference.parametric",
    provenance: provenance(),
    semanticValues: [semanticValue(value)],
    limitations: ["Fixture limitation."],
  });

export const runPr2LifecycleCases = (assertCase: ContractFoundationAssertCase) => {
  const sourceProvenance = provenance();
  const sourceValues = [semanticValue()];
  const captured = createCitableScientificSnapshot({
    snapshotId: "snapshot-a",
    capturedAt: "2026-08-21T20:00:00.000Z",
    resultContractId: "inference.parametric",
    provenance: sourceProvenance,
    semanticValues: sourceValues,
  });

  assertCase(
    "pr2.snapshot.live-distinct",
    captured.identity.kind === "citable-scientific-snapshot" &&
      captured.identity.citable === true &&
      LIVE_DERIVED_RESULT_IDENTITY.citable === false,
  );
  assertCase(
    "pr2.snapshot.stable-id",
    captured.identity.snapshotId === "snapshot-a" && captured.identity.version === 1,
  );
  assertCase(
    "pr2.snapshot.provenance",
    captured.provenance.dataset.checksum === "data-v1" && captured.methodIdentity.id === "method-1",
  );
  assertCase(
    "pr2.snapshot.machine-readable",
    captured.semanticValues[0]?.value === 42 && captured.semanticValues[0]?.unit === "unit",
  );
  assertCase(
    "pr2.snapshot.frozen",
    Object.isFrozen(captured) &&
      Object.isFrozen(captured.identity) &&
      Object.isFrozen(captured.semanticValues),
  );

  sourceProvenance.dataset.label = "Mutated";
  sourceValues[0] = semanticValue(99);
  assertCase(
    "pr2.snapshot.input-mutation-isolated",
    captured.provenance.dataset.label === "Dataset.csv" && captured.semanticValues[0]?.value === 42,
  );
  const malformed = structuredClone(captured) as unknown as {
    provenance: { dataset: unknown };
  };
  malformed.provenance.dataset = null;
  assertCase(
    "pr2.snapshot.runtime-guard-rejects-malformed-nested-state",
    !isCitableScientificSnapshot(malformed) &&
      assessScientificSnapshotFreshness({
        snapshot: malformed,
        sourceAvailable: true,
      }).state === "INVALID",
  );
  const cyclic = structuredClone(captured) as unknown as {
    sourceIdentity: Record<string, unknown>;
  };
  cyclic.sourceIdentity.self = cyclic.sourceIdentity;
  assertCase("pr2.snapshot.runtime-guard-does-not-throw", !isCitableScientificSnapshot(cyclic));

  assertCase(
    "pr2.equivalence.identical",
    assessScientificArtifactEquivalence(snapshot("same"), snapshot("same")).state === "IDENTICAL",
  );
  assertCase(
    "pr2.equivalence.equivalent-new-id",
    assessScientificArtifactEquivalence(snapshot("snapshot-1"), snapshot("snapshot-2")).state ===
      "EQUIVALENT",
  );
  assertCase(
    "pr2.equivalence.non-equivalent-payload",
    assessScientificArtifactEquivalence(snapshot("snapshot-1", 42), snapshot("snapshot-2", 43))
      .state === "NON_EQUIVALENT",
  );
  const comparisonProvenanceA = provenance();
  comparisonProvenanceA.source = {
    kind: "comparison-profile",
    id: "A",
  };
  comparisonProvenanceA.method.parameters = { slotLabel: "A" };
  const comparisonProvenanceB = provenance();
  comparisonProvenanceB.source = {
    kind: "comparison-profile",
    id: "B",
  };
  comparisonProvenanceB.method.parameters = { slotLabel: "B" };
  const comparisonSnapshot = (
    id: string,
    comparisonProvenance: ReturnType<typeof provenance>,
    advisory: string,
  ) =>
    createCitableScientificSnapshot({
      snapshotId: id,
      capturedAt: "2026-08-21T20:00:00.000Z",
      resultContractId: "sci-58.comparison",
      provenance: comparisonProvenance,
      semanticValues: [
        semanticValue(),
        createScientificSemanticValue({
          field: "systemAdvisory",
          value: advisory,
          status: "known",
          authority: "system-advisory",
          approximation: "mixed",
          equivalencePolicy: "non-comparable",
        }),
      ],
    });
  assertCase(
    "pr2.equivalence.slot-and-advisory-independent",
    assessScientificArtifactEquivalence(
      comparisonSnapshot("comparison-a", comparisonProvenanceA, "Texto A"),
      comparisonSnapshot("comparison-b", comparisonProvenanceB, "Texto B"),
    ).state === "EQUIVALENT",
  );
  assertCase(
    "pr2.equivalence.same-id-divergence-invalid",
    assessScientificArtifactEquivalence(
      comparisonSnapshot("comparison-same-id", comparisonProvenanceA, "Texto A"),
      comparisonSnapshot("comparison-same-id", comparisonProvenanceA, "Texto B"),
    ).state === "NON_EQUIVALENT",
  );
  const distinctSourceProvenance = provenance();
  distinctSourceProvenance.dataset = {
    id: "different-dataset-id",
    label: captured.provenance.dataset.label,
  };
  assertCase(
    "pr2.equivalence.distinct-source-id",
    assessScientificArtifactEquivalence(
      captured,
      createCitableScientificSnapshot({
        snapshotId: "snapshot-distinct-source",
        capturedAt: "2026-08-21T20:00:00.000Z",
        resultContractId: "inference.parametric",
        provenance: distinctSourceProvenance,
        semanticValues: [semanticValue()],
      }),
    ).state === "NON_EQUIVALENT",
  );

  const current = assessScientificSnapshotFreshness({
    snapshot: captured,
    currentResultContractId: "inference.parametric",
    currentProvenance: provenance(),
    sourceAvailable: true,
  });
  assertCase("pr2.freshness.current", current.state === "CURRENT" && current.recomputable === true);

  const changedConfig = provenance();
  changedConfig.config.values = { alpha: 0.01 };
  assertCase(
    "pr2.freshness.configuration-stale",
    assessScientificSnapshotFreshness({
      snapshot: captured,
      currentProvenance: changedConfig,
      sourceAvailable: true,
    }).state === "STALE",
  );

  const changedSource = provenance();
  changedSource.dataset.checksum = "data-v2";
  assertCase(
    "pr2.freshness.source-stale",
    assessScientificSnapshotFreshness({
      snapshot: captured,
      currentProvenance: changedSource,
      sourceAvailable: true,
    }).state === "STALE",
  );
  const differentSourceId = provenance();
  differentSourceId.dataset.id = "dataset-2";
  assertCase(
    "pr2.freshness.source-id-stale",
    assessScientificSnapshotFreshness({
      snapshot: captured,
      currentProvenance: differentSourceId,
      sourceAvailable: true,
    }).state === "STALE",
  );
  const provenanceWithoutContentIdentity = provenance();
  delete provenanceWithoutContentIdentity.dataset.checksum;
  const snapshotWithoutContentIdentity = createCitableScientificSnapshot({
    snapshotId: "snapshot-no-content-identity",
    capturedAt: "2026-08-21T20:00:00.000Z",
    resultContractId: "inference.parametric",
    provenance: provenanceWithoutContentIdentity,
    semanticValues: [semanticValue()],
  });
  assertCase(
    "pr2.freshness.no-content-identity-unknown",
    assessScientificSnapshotFreshness({
      snapshot: snapshotWithoutContentIdentity,
      currentProvenance: provenanceWithoutContentIdentity,
      sourceAvailable: true,
    }).state === "UNKNOWN",
  );
  const unverifiableChecksum = provenance();
  delete unverifiableChecksum.dataset.checksum;
  assertCase(
    "pr2.freshness.checksum-missing-unknown",
    assessScientificSnapshotFreshness({
      snapshot: captured,
      currentProvenance: unverifiableChecksum,
      sourceAvailable: true,
    }).state === "UNKNOWN",
  );

  const changedSeries = provenance();
  changedSeries.series = [{ id: "series-c", role: "input" }];
  assertCase(
    "pr2.freshness.series-stale",
    assessScientificSnapshotFreshness({
      snapshot: captured,
      currentProvenance: changedSeries,
      sourceAvailable: true,
    }).state === "STALE",
  );

  const changedMethod = provenance();
  changedMethod.method.version = "2";
  assertCase(
    "pr2.freshness.method-stale",
    assessScientificSnapshotFreshness({
      snapshot: captured,
      currentProvenance: changedMethod,
      sourceAvailable: true,
    }).state === "STALE",
  );
  assertCase(
    "pr2.freshness.unknown",
    assessScientificSnapshotFreshness({
      snapshot: captured,
      sourceAvailable: "unknown",
    }).state === "UNKNOWN",
  );
  assertCase(
    "pr2.freshness.invalid-source",
    assessScientificSnapshotFreshness({
      snapshot: captured,
      sourceAvailable: false,
    }).state === "INVALID",
  );
  assertCase(
    "pr2.freshness.invalid-contract",
    assessScientificSnapshotFreshness({
      snapshot: {},
      sourceAvailable: true,
    }).state === "INVALID",
  );

  const projections = (["results", "report", "pdf", "comparison"] as const).map((surface) =>
    projectCitableScientificSnapshot(captured, surface, current),
  );
  assertCase("pr2.parity.cross-surface", assessSemanticProjectionParity(projections).equivalent);
  assertCase(
    "pr2.parity.numeric-foundation",
    projectCitableScientificSnapshot(captured, "numeric-export-foundation", current)
      .semanticValues[0]?.value === 42,
  );
};

import type { ContractFoundationAssertCase } from "@/lib/scientific/contracts/__tests__/run-assertions";
import { composeScientificProvenance } from "@/lib/scientific/contracts";
import { createSessionDatasetFromImport, updateSessionDatasetPayload } from "@/lib/graph/series";
import {
  projectDatasetV2ToSessionDataset,
  sessionDatasetToProjectDatasetV2,
} from "@/lib/project/adapters/sgproj/map-session-dataset";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import { hydrateProjectJson } from "@/lib/project/hydrate";
import { MODULE_KEYS_V1 } from "@/lib/project/keys";
import { serializeProjectV2 } from "@/lib/project/serialize-project-v2";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import {
  assessComparisonCompatibility,
  buildCaptureMetadata,
  buildDatasetAnalysisProfile,
  buildMultiDatasetComparisonAnalysis,
  canBuildMultiDatasetComparisonAnalysis,
  deriveComparisonSlotFreshness,
  invalidateDatasetAnalysisProfileSource,
  projectDatasetAnalysisProfile,
  reviveDatasetAnalysisProfile,
} from "..";

const buildProvenance = (slotLabel: "A" | "B", alpha = 0.05) =>
  composeScientificProvenance({
    dataset: { id: `dataset-${slotLabel}`, label: `${slotLabel}.csv` },
    source: { kind: "comparison-profile", id: slotLabel },
    series: [{ id: `series-${slotLabel}`, role: "input" }],
    config: {
      id: "comparison-profile-capture",
      values: { alpha, sourceRevision: 0, worksheetModified: false },
    },
    method: {
      id: "scientific-comparison-profile",
      label: "Perfil federado de comparación científica",
      version: "1",
      parameters: { slotLabel },
    },
    approximation: { kind: "mixed", details: "Fixture PR2." },
    warnings: [],
  });

const buildProfile = (slotLabel: "A" | "B") =>
  buildDatasetAnalysisProfile({
    slotLabel,
    datasetInfo: {
      fileName: `${slotLabel}.csv`,
      importedAt: "2026-08-21T20:00:00.000Z",
      seriesCount: 1,
      observationCount: 10,
    },
    seriesCount: 1,
    totalObservations: 10,
    readinessScore: slotLabel === "A" ? 80 : 82,
    overallHealthScore: 75,
    evidenceScore: 77,
    captureMetadata: buildCaptureMetadata({
      worksheetModifiedAtCapture: false,
      provenance: buildProvenance(slotLabel),
      hasMethodologicalDashboard: true,
      hasPublicationReadiness: true,
      hasEvidenceEngine: true,
      hasMultivariateDashboard: false,
      hasEffectSizePower: false,
      normalityAssessmentCount: 0,
    }),
  });

export const runPr2ComparisonSnapshotFreshnessCases = (
  assertCase: ContractFoundationAssertCase,
) => {
  const initialDataset = createSessionDatasetFromImport(
    "revision.csv",
    [{ id: "series-r", name: "R", color: "#000", points: [{ x: 1, y: 1 }] }],
    null,
    "2026-08-21T20:00:00.000Z",
  );
  const revisionOne = updateSessionDatasetPayload(
    initialDataset,
    [{ id: "series-r", name: "R", color: "#000", points: [{ x: 1, y: 2 }] }],
    null,
    true,
  );
  const revisionTwo = updateSessionDatasetPayload(
    revisionOne,
    [{ id: "series-r", name: "R", color: "#000", points: [{ x: 1, y: 3 }] }],
    null,
    true,
  );
  const unchangedRevision = updateSessionDatasetPayload(
    revisionTwo,
    revisionTwo.datasetPayload.series,
    null,
    true,
  );
  assertCase(
    "pr2.source-revision.detects-repeated-edits",
    initialDataset.sourceRevision === 0 &&
      revisionOne.sourceRevision === 1 &&
      revisionTwo.sourceRevision === 2,
  );
  assertCase("pr2.source-revision.stable-without-edit", unchangedRevision.sourceRevision === 2);
  const persistedRevision = sessionDatasetToProjectDatasetV2({
    ...revisionTwo,
    id: toPrimaryDatasetId("00000000-0000-4000-8000-000000000091"),
  });
  assertCase(
    "pr2.source-revision.project-roundtrip",
    persistedRevision.sourceRevision === 2 &&
      projectDatasetV2ToSessionDataset(persistedRevision).sourceRevision === 2,
  );

  const profileA = buildProfile("A");
  const profileB = buildProfile("B");
  const projectId = "00000000-0000-4000-8000-000000000092";
  const datasetAId = toPrimaryDatasetId(projectId);
  const datasetBId = toSequencedDatasetId(projectId, 2);
  const project: ScientificProjectV2 = {
    metadata: {
      id: projectId,
      name: "PR2 snapshot roundtrip",
      createdAt: "2026-08-21T20:00:00.000Z",
      updatedAt: "2026-08-21T20:00:00.000Z",
    },
    datasets: [
      {
        id: datasetAId,
        label: "A",
        series: [
          {
            id: "series-A",
            name: "A",
            color: "#000",
            points: [{ x: 1, y: 1 }],
          },
        ],
        info: profileA.datasetInfo,
        importReport: null,
        sourceRevision: 2,
      },
      {
        id: datasetBId,
        label: "B",
        series: [
          {
            id: "series-B",
            name: "B",
            color: "#111",
            points: [{ x: 1, y: 2 }],
          },
        ],
        info: profileB.datasetInfo,
        importReport: null,
        sourceRevision: 3,
      },
    ],
    activeDatasetId: datasetAId,
    analysisConfig: {
      visibility: { showStatistics: true },
      modes: {
        regressionModel: "linear",
        errorBarMode: "sd",
        correlationMethod: "pearson",
        outlierMethod: "iqr",
        heatmapMode: "correlation",
        nonParametricMode: "mann-whitney",
        histogramBins: 10,
        axisScaleMode: "linear",
        naturalLanguageEnabled: false,
      },
      selections: {
        tTestSeriesA: null,
        tTestSeriesB: null,
        mannWhitneySeriesA: null,
        mannWhitneySeriesB: null,
      },
      legend: { hiddenKeys: [] },
    },
    workflow: { session: GUIDED_WORKFLOW_IDLE_SESSION },
    comparison: {
      slots: {
        A: { label: "Slot A", profile: profileA, sourceDatasetId: datasetAId },
        B: { label: "Slot B", profile: profileB, sourceDatasetId: datasetBId },
      },
    },
    workspace: {
      activeSection: "data",
      inspectorSection: "visualization",
      enabledModules: Object.fromEntries(MODULE_KEYS_V1.map((key) => [key, true])),
      controlPanelTab: "data",
    },
    graphContext: null,
  };
  const serialized = serializeProjectV2({
    project,
    appVersion: "1.0.0",
    exportedAt: "2026-08-21T20:01:00.000Z",
  });
  const hydrated = serialized.ok ? hydrateProjectJson(serialized.json) : null;
  const hydratedProfile =
    hydrated?.ok === true ? hydrated.patch.project.comparison.slots.A.profile : null;
  assertCase(
    "pr2.comparison.real-project-roundtrip",
    serialized.ok &&
      hydrated?.ok === true &&
      hydratedProfile?.captureMetadata?.snapshot?.identity.snapshotId ===
        profileA.captureMetadata?.snapshot?.identity.snapshotId &&
      Object.isFrozen(hydratedProfile?.captureMetadata?.snapshot),
  );
  assertCase(
    "pr2.comparison.snapshot-materialized",
    profileA.captureMetadata?.snapshot?.resultContractId === "sci-58.comparison",
  );
  assertCase(
    "pr2.comparison.snapshot-immutable",
    Object.isFrozen(profileA) && Object.isFrozen(profileA.captureMetadata?.snapshot),
  );
  assertCase(
    "pr2.comparison.recapture-new-identity",
    buildProfile("A").captureMetadata?.snapshot?.identity.snapshotId !==
      profileA.captureMetadata?.snapshot?.identity.snapshotId,
  );
  const revived = reviveDatasetAnalysisProfile(JSON.parse(JSON.stringify(profileA)));
  assertCase(
    "pr2.comparison.project-roundtrip-identity",
    revived?.captureMetadata?.snapshot?.identity.snapshotId ===
      profileA.captureMetadata?.snapshot?.identity.snapshotId,
  );
  assertCase(
    "pr2.comparison.project-roundtrip-refrozen",
    Object.isFrozen(revived) && Object.isFrozen(revived?.captureMetadata?.snapshot),
  );
  const invalidated = invalidateDatasetAnalysisProfileSource(profileA);
  assertCase(
    "pr2.comparison.source-removal-preserves-snapshot",
    invalidated.captureMetadata?.snapshot?.identity.snapshotId ===
      profileA.captureMetadata?.snapshot?.identity.snapshotId,
  );
  assertCase(
    "pr2.comparison.source-removal-invalid",
    deriveComparisonSlotFreshness({
      profile: invalidated,
      currentProvenance: null,
      sourceAvailable: "unknown",
    }).state === "INVALID",
  );
  assertCase(
    "pr2.comparison.freshness-current",
    deriveComparisonSlotFreshness({
      profile: profileA,
      currentProvenance: buildProvenance("A"),
      sourceAvailable: true,
    }).state === "CURRENT",
  );
  assertCase(
    "pr2.comparison.freshness-stale",
    deriveComparisonSlotFreshness({
      profile: profileA,
      currentProvenance: buildProvenance("A", 0.01),
      sourceAvailable: true,
    }).state === "STALE",
  );
  assertCase(
    "pr2.comparison.freshness-unknown",
    deriveComparisonSlotFreshness({
      profile: profileA,
      currentProvenance: null,
      sourceAvailable: true,
    }).state === "UNKNOWN",
  );
  assertCase(
    "pr2.comparison.freshness-invalid",
    deriveComparisonSlotFreshness({
      profile: profileA,
      currentProvenance: null,
      sourceAvailable: false,
    }).state === "INVALID",
  );
  assertCase(
    "pr2.comparison.compatible",
    assessComparisonCompatibility(profileA, profileB).state === "COMPATIBLE",
  );
  const incompatibleUnits = structuredClone(profileB);
  const incompatibleReadiness = incompatibleUnits.captureMetadata?.snapshot?.semanticValues.find(
    (value) => value.field === "readinessScore",
  );
  if (incompatibleReadiness) {
    incompatibleReadiness.unit = "fraction";
  }
  assertCase(
    "pr2.comparison.incompatible-unit",
    assessComparisonCompatibility(profileA, incompatibleUnits).state === "INCOMPATIBLE",
  );

  const tampered = structuredClone(profileA);
  tampered.readinessScore = 1;
  tampered.isComplete = false;
  assertCase(
    "pr2.results.eligibility-consumes-snapshot-payload",
    canBuildMultiDatasetComparisonAnalysis(tampered, profileB),
  );
  const analysis = buildMultiDatasetComparisonAnalysis({
    slotA: tampered,
    slotB: profileB,
  });
  assertCase("pr2.results.consumes-snapshot-payload", analysis.slotA.readinessScore === 80);
  const resultsProjection = projectDatasetAnalysisProfile(profileA, "results");
  const reportProjection = projectDatasetAnalysisProfile(profileA, "report");
  assertCase(
    "pr2.comparison.projection-identity-parity",
    resultsProjection?.artifactIdentity.kind === "citable-scientific-snapshot" &&
      reportProjection?.artifactIdentity.kind === "citable-scientific-snapshot" &&
      resultsProjection.artifactIdentity.snapshotId ===
        reportProjection.artifactIdentity.snapshotId,
  );
};

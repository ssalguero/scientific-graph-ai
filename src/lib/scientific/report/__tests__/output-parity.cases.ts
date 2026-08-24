import { createScientificNumericExport } from "../../export";
import {
  assessSemanticProjectionParity,
  composeScientificProvenance,
  type ScientificFreshnessAssessment,
} from "../../contracts";
import {
  buildCaptureMetadata,
  buildDatasetAnalysisProfile,
  buildMultiDatasetComparisonAnalysis,
  buildMultiDatasetComparisonPdfReportSection,
  buildMultiDatasetComparisonReportSection,
  canBuildMultiDatasetComparisonAnalysis,
  getAuthoritativeDatasetAnalysisProfile,
  projectDatasetAnalysisProfile,
  replaceMultiDatasetComparisonWithPdfProjection,
  reviveDatasetAnalysisProfile,
} from "../../comparison";
import type { AssertCase } from "../../comparison/__tests__/run-assertions";

const freshness: ScientificFreshnessAssessment = {
  state: "CURRENT",
  recomputable: true,
  reasons: [
    {
      code: "CURRENT_CONTEXT_MATCHES",
      message: "Output parity fixture is current.",
    },
  ],
};

const buildProfile = (slotLabel: "A" | "B") => {
  const provenance = composeScientificProvenance({
    dataset: {
      id: `dataset-${slotLabel}`,
      label: `${slotLabel}.csv`,
      checksum: `sha256:${slotLabel}`,
    },
    source: { kind: "comparison-profile", id: slotLabel },
    series: [{ id: `series-${slotLabel}`, role: "input" }],
    config: {
      id: "pr3-parity-config",
      values: { alpha: 0.05, sourceRevision: 1 },
    },
    method: {
      id: "scientific-comparison-profile",
      label: "Scientific comparison profile",
      version: "1",
      parameters: { slotLabel },
    },
    approximation: {
      kind: "mixed",
      details: "PR3 output parity fixture.",
    },
    warnings: [
      {
        code: "PR3_FIXTURE_WARNING",
        message: "Material fixture warning.",
        severity: "warning",
      },
    ],
  });
  return buildDatasetAnalysisProfile({
    slotLabel,
    datasetInfo: {
      fileName: `${slotLabel}.csv`,
      importedAt: "2026-08-22T10:00:00.000Z",
      seriesCount: 1,
      observationCount: 10,
    },
    seriesCount: 1,
    totalObservations: 10,
    readinessScore: slotLabel === "A" ? 80 : 82,
    overallHealthScore: 75,
    evidenceScore: 77,
    captureMetadata: buildCaptureMetadata({
      provenance,
      worksheetModifiedAtCapture: false,
      hasMethodologicalDashboard: true,
      hasPublicationReadiness: true,
      hasEvidenceEngine: true,
      hasMultivariateDashboard: false,
      hasEffectSizePower: false,
      normalityAssessmentCount: 0,
    }),
  });
};

export const runPr3OutputParityCases = (assertCase: AssertCase): void => {
  const slotA = buildProfile("A");
  const slotB = buildProfile("B");
  const surfaces = [
    "results",
    "report",
    "pdf",
    "comparison",
    "numeric-export-foundation",
  ] as const;
  const projections = surfaces.map((surface) =>
    projectDatasetAnalysisProfile(slotA, surface, freshness)
  );
  const [results, report, pdf, comparison, numericFoundation] = projections;

  assertCase(
    "pr3.parity.authoritative-snapshot-all-surfaces",
    projections.every(
      (projection) =>
        projection !== null &&
        projection.artifactIdentity.kind ===
          "citable-scientific-snapshot" &&
        projection.artifactIdentity.snapshotId ===
          slotA.captureMetadata?.snapshot?.identity.snapshotId
    )
  );
  const revivedValid = reviveDatasetAnalysisProfile(
    structuredClone(slotA)
  );
  assertCase(
    "pr3.correction.snapshot.valid-revival-authoritative",
    revivedValid !== null &&
      revivedValid.captureMetadata?.snapshotValidation === undefined &&
      projectDatasetAnalysisProfile(revivedValid, "results")?.artifactIdentity
        .kind === "citable-scientific-snapshot" &&
      getAuthoritativeDatasetAnalysisProfile(revivedValid).readinessScore ===
        slotA.readinessScore
  );
  const legacyProfile = structuredClone(slotA);
  if (legacyProfile.captureMetadata) {
    delete legacyProfile.captureMetadata.snapshot;
    delete legacyProfile.captureMetadata.snapshotValidation;
  }
  const revivedLegacy = reviveDatasetAnalysisProfile(legacyProfile);
  assertCase(
    "pr3.correction.snapshot.absent-remains-legacy",
    revivedLegacy !== null &&
      revivedLegacy.isComplete &&
      revivedLegacy.captureMetadata?.snapshotValidation === undefined &&
      projectDatasetAnalysisProfile(revivedLegacy, "results") === null
  );
  const malformedPersisted = structuredClone(slotA) as unknown as {
    isComplete: boolean;
    captureMetadata: {
      snapshot: { schema: string };
      snapshotValidation?: "invalid";
    };
  };
  malformedPersisted.isComplete = true;
  malformedPersisted.captureMetadata.snapshot.schema = "malformed-snapshot";
  const revivedMalformed = reviveDatasetAnalysisProfile(
    malformedPersisted as unknown as typeof slotA
  );
  assertCase(
    "pr3.correction.snapshot.malformed-revives-incomplete",
    revivedMalformed !== null &&
      !revivedMalformed.isComplete &&
      revivedMalformed.captureMetadata?.snapshot === undefined &&
      revivedMalformed.captureMetadata?.snapshotValidation === "invalid" &&
      reviveDatasetAnalysisProfile(revivedMalformed)?.captureMetadata
        ?.snapshotValidation === "invalid"
  );
  assertCase(
    "pr3.correction.snapshot.malformed-cannot-regain-mutable-authority",
    revivedMalformed !== null &&
      !getAuthoritativeDatasetAnalysisProfile(revivedMalformed).isComplete &&
      !canBuildMultiDatasetComparisonAnalysis(revivedMalformed, slotB)
  );
  const malformedPayload = structuredClone(slotA);
  const comparisonPayload =
    malformedPayload.captureMetadata?.snapshot?.semanticValues.find(
      (value) => value.field === "comparisonProfile"
    );
  if (
    comparisonPayload &&
    comparisonPayload.value !== null &&
    typeof comparisonPayload.value === "object" &&
    !Array.isArray(comparisonPayload.value)
  ) {
    comparisonPayload.value = {
      ...comparisonPayload.value,
      datasetInfo: {
        fileName: "A.csv",
        importedAt: "2026-08-22T10:00:00.000Z",
        seriesCount: "not-a-number",
        observationCount: 10,
      },
    };
  }
  assertCase(
    "pr3.correction.snapshot.embedded-payload-fully-validated",
    !getAuthoritativeDatasetAnalysisProfile(malformedPayload).isComplete
  );
  assertCase(
    "pr3.parity.results-report",
    results !== null &&
      report !== null &&
      assessSemanticProjectionParity([results, report]).equivalent
  );
  assertCase(
    "pr3.parity.results-pdf",
    results !== null &&
      pdf !== null &&
      assessSemanticProjectionParity([results, pdf]).equivalent
  );
  assertCase(
    "pr3.parity.results-comparison",
    results !== null &&
      comparison !== null &&
      assessSemanticProjectionParity([results, comparison]).equivalent
  );
  assertCase(
    "pr3.parity.results-numeric-foundation",
    results !== null &&
      numericFoundation !== null &&
      assessSemanticProjectionParity([
        results,
        numericFoundation,
      ]).equivalent
  );

  if (!numericFoundation) {
    assertCase("pr3.parity.numeric-export-created", false);
    return;
  }
  const numericExport = createScientificNumericExport({
    projection: numericFoundation,
    exportId: "pr3-parity-fixture",
    exportedAt: "2026-08-22T12:00:00.000Z",
  });
  assertCase(
    "pr3.parity.numeric-export-created",
    numericExport.semanticValues.length ===
      numericFoundation.semanticValues.filter(
        (value) => value.authority === "system-factual"
      ).length &&
      numericExport.semanticValues.every(
        (value) => value.authority === "system-factual"
      )
  );
  assertCase(
    "pr3.parity.numeric-preserves-provenance",
    JSON.stringify(numericExport.provenance) ===
      JSON.stringify(numericFoundation.provenance)
  );
  assertCase(
    "pr3.parity.numeric-preserves-disclosures",
    JSON.stringify(numericExport.warnings) ===
      JSON.stringify(numericFoundation.warnings) &&
      JSON.stringify(numericExport.limitations) ===
        JSON.stringify(numericFoundation.limitations) &&
      JSON.stringify(numericExport.approximation) ===
        JSON.stringify(numericFoundation.approximation)
  );
  assertCase(
    "pr3.parity.numeric-preserves-freshness",
    numericExport.freshness.state === "CURRENT" &&
      numericExport.freshness.reasons[0] ===
        "Output parity fixture is current."
  );

  const analysis = buildMultiDatasetComparisonAnalysis({ slotA, slotB });
  const context = { slotAFreshness: freshness, slotBFreshness: freshness };
  const reportSection = buildMultiDatasetComparisonReportSection(
    analysis,
    context
  );
  const pdfSection = buildMultiDatasetComparisonPdfReportSection(
    analysis,
    context
  );
  const productionPdfSections =
    replaceMultiDatasetComparisonWithPdfProjection({
      sections: [
        { title: "Descripción de datos", content: ["Fixture."] },
        reportSection,
      ],
      analysis,
      context,
      included: true,
    });
  const productionComparisonSection = productionPdfSections.find(
    (section) => section.title === reportSection.title
  );
  assertCase(
    "pr3.correction.pdf.production-replaces-report-projection",
    productionComparisonSection !== undefined &&
      JSON.stringify(productionComparisonSection.content) ===
        JSON.stringify(pdfSection.content) &&
      JSON.stringify(productionComparisonSection.content) !==
        JSON.stringify(reportSection.content)
  );
  const snapshotId = slotA.captureMetadata?.snapshot?.identity.snapshotId;
  assertCase(
    "pr3.parity.report-snapshot-disclosure",
    Boolean(
      snapshotId &&
        reportSection.content.some((line) => line.includes(snapshotId))
    )
  );
  assertCase(
    "pr3.parity.pdf-snapshot-disclosure",
    Boolean(
      snapshotId && pdfSection.content.some((line) => line.includes(snapshotId))
    )
  );
  assertCase(
    "pr3.parity.report-pdf-method-warning-freshness",
    reportSection.content.some((line) => line.includes("Método:")) &&
      pdfSection.content.some((line) => line.includes("Método:")) &&
      reportSection.content.some((line) => line.includes("Vigencia: CURRENT")) &&
      pdfSection.content.some((line) => line.includes("Vigencia: CURRENT")) &&
      reportSection.content.some((line) =>
        line.includes("PR3_FIXTURE_WARNING")
      ) &&
      pdfSection.content.some((line) =>
        line.includes("PR3_FIXTURE_WARNING")
      )
  );
};

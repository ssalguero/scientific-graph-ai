import type { AssertCase } from "@/lib/scientific/comparison/__tests__/run-assertions";
import {
  extractVgbFigureScientificBinding,
  fingerprintGeneratedTextValue,
  fingerprintVgbFigureScientificBinding,
} from "@/lib/scientific/contracts";
import { composeScientificProvenance } from "@/lib/scientific/contracts";
import type { GeneratedTextReviewRecord } from "@/lib/scientific/contracts";
import {
  appendVgbPublicationFigure,
  approveVgbFigure,
  buildVgbFigureReviewContent,
  buildVgbFigureReviewEvidence,
  buildVgbPublicationFigureReportSection,
  canIncludeVgbPublicationFiguresInReport,
  composeVgbFigureProvenance,
  createPublicationVgbFigure,
  createVgbFigureReviewRecord,
  createWorkingVgbFigure,
  getVgbFigureLifecycleStoreFromProject,
  projectWorkingVgbFigure,
  reassessVgbFigureReview,
  reviewVgbFigure,
  setVgbFigureLifecycleStoreOnExtensions,
  submitWorkingVgbFigureForReview,
  upsertWorkingVgbFigureRecord,
  VGB_PUBLICATION_FIGURE_REPORT_TITLE,
} from "@/lib/scientific/figure";
import {
  assessGeneratedTextReviewValidity,
  createLiveGeneratedTextReview,
} from "@/lib/scientific/report/review-authority";
import {
  getScientificReportBlockReviewDescriptor,
} from "@/lib/scientific/report/generated-text-classification";
import {
  guardGeneratedTextExport,
  guardGeneratedTextExportManifest,
} from "@/lib/scientific/report/review-export-guard";
import {
  getReviewAuthorityRecordsFromProject,
  setReviewAuthorityRecordsOnExtensions,
} from "@/lib/scientific/report/review-persistence";
import { extractVisualGraphRuntimeState } from "@/lib/project/apply-hydrate-project-v2-patch";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import { hydrateProjectJson } from "@/lib/project";
import { serializeProjectV2 } from "@/lib/project/serialize-project-v2";
import {
  mergeVisualGraphsFromSessionIntoProjectSnapshot,
  prepareCollectContextWithSessionVisualGraphs,
} from "@/lib/project/visual-graph-session-ui";
import { applyVisualGraphSpecification } from "@/lib/visualGraphBuilder";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SAMPLE_VGB_REGISTRY,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
  SAMPLE_VGB_SERIES,
  buildSampleVisualGraphEntry,
} from "./visual-graph-mapper-helpers";
import {
  UI_VGB_DATASET_A_ID,
  buildUiVisualGraphCollectContext,
} from "./visual-graph-ui-helpers";

const createdAt = "2026-08-24T12:00:00.000Z";
const reviewedAt = "2026-08-24T12:01:00.000Z";
const approvedAt = "2026-08-24T12:02:00.000Z";
const publishedAt = "2026-08-24T12:03:00.000Z";
const reopenedAt = "2026-08-24T12:10:00.000Z";

const researcher = {
  kind: "researcher" as const,
  id: "current-project-researcher",
  name: "Investigador/a del proyecto",
};

export type Pr5Wave0AssessmentSnapshot = {
  validity: string;
  reason: string;
  message: string;
  contentFingerprintEqual: boolean;
  evidenceFingerprintEqual: boolean;
  graphSpecFingerprintEqual: boolean;
  previewJsonEqual: boolean;
  provenanceFingerprintEqual: boolean;
};

export type Pr5Wave0DiagnosticReport = {
  publicationIdPreserved: boolean;
  snapshotIdPreserved: boolean;
  reviewRecordIdPreserved: boolean;
  publicationId: string;
  snapshotId: string;
  reviewRecordId: string;
  sourceRevisionBefore: number;
  sourceRevisionAfter: number | undefined;
  datasetIdBefore: string;
  datasetIdAfter: string | null;
  isolatedPreviewRebuild: Pr5Wave0AssessmentSnapshot;
  projectRoundTrip: Pr5Wave0AssessmentSnapshot;
  reviewJsonReviveEvidenceUnchanged: boolean;
  staleClassification:
    | "EVIDENCE_UNCHANGED_CURRENT"
    | "PREVIEW_REBUILD_CHANGED_VALUES"
    | "PROVENANCE_INPUT_DRIFT"
    | "FINGERPRINT_INSTABILITY"
    | "GRAPHSPEC_MUTATED";
  pr4CorrectiveDebt: boolean;
  pr4DebtNote: string | null;
  pr5OwnershipChange: string | null;
};

const jsonEqual = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

const snapshotAssessment = (input: {
  review: GeneratedTextReviewRecord;
  entryBefore: ProjectVisualGraphEntry;
  entryAfter: ProjectVisualGraphEntry;
  provenanceBefore: ReturnType<typeof composeVgbFigureProvenance>;
  provenanceAfter: ReturnType<typeof composeVgbFigureProvenance>;
}): Pr5Wave0AssessmentSnapshot => {
  const projectionAfter = projectWorkingVgbFigure({
    entry: input.entryAfter,
    provenance: input.provenanceAfter,
  });
  const currentContent = buildVgbFigureReviewContent({
    graphSpec: input.entryAfter.graphSpec,
  });
  const currentEvidence = buildVgbFigureReviewEvidence({
    graphSpec: input.entryAfter.graphSpec,
    projection: projectionAfter,
  });
  const assessment = assessGeneratedTextReviewValidity({
    record: input.review,
    currentContent,
    currentSemanticEvidence: currentEvidence,
  });
  return {
    validity: assessment.validity,
    reason: assessment.reason,
    message: assessment.message,
    contentFingerprintEqual:
      fingerprintGeneratedTextValue(currentContent) ===
      input.review.contentIdentity.fingerprint,
    evidenceFingerprintEqual:
      fingerprintGeneratedTextValue(currentEvidence) ===
      input.review.evidenceIdentity.fingerprint,
    graphSpecFingerprintEqual:
      fingerprintVgbFigureScientificBinding(
        extractVgbFigureScientificBinding(input.entryBefore.graphSpec)
      ) ===
      fingerprintVgbFigureScientificBinding(
        extractVgbFigureScientificBinding(input.entryAfter.graphSpec)
      ),
    previewJsonEqual: jsonEqual(input.entryBefore.preview, input.entryAfter.preview),
    provenanceFingerprintEqual:
      fingerprintGeneratedTextValue(input.provenanceBefore) ===
      fingerprintGeneratedTextValue(input.provenanceAfter),
  };
};

const classifyStale = (
  isolated: Pr5Wave0AssessmentSnapshot,
  roundTrip: Pr5Wave0AssessmentSnapshot
): Pick<
  Pr5Wave0DiagnosticReport,
  "staleClassification" | "pr4CorrectiveDebt" | "pr4DebtNote" | "pr5OwnershipChange"
> => {
  if (
    roundTrip.validity === "STALE" &&
    roundTrip.evidenceFingerprintEqual &&
    isolated.evidenceFingerprintEqual
  ) {
    return {
      staleClassification: "FINGERPRINT_INSTABILITY",
      pr4CorrectiveDebt: true,
      pr4DebtNote:
        "Working-figure review is STALE even though content, evidence, graphSpec and provenance fingerprints match. CTR-08 reassessment is unstable across reopen.",
      pr5OwnershipChange:
        "Do not treat STALE as expected continuity until this fingerprint defect is classified as PR4 corrective debt.",
    };
  }
  if (!roundTrip.graphSpecFingerprintEqual) {
    return {
      staleClassification: "GRAPHSPEC_MUTATED",
      pr4CorrectiveDebt: true,
      pr4DebtNote:
        "Persisted working graphSpec scientific binding changed across SAVE → OPEN. That is persistence/hydrate debt, not Product Face.",
      pr5OwnershipChange:
        "Hold constructor restoration until graphSpec round-trip is proven stable.",
    };
  }
  if (
    isolated.validity === "STALE" &&
    !isolated.previewJsonEqual &&
    isolated.provenanceFingerprintEqual &&
    isolated.graphSpecFingerprintEqual
  ) {
    return {
      staleClassification: "PREVIEW_REBUILD_CHANGED_VALUES",
      pr4CorrectiveDebt: false,
      pr4DebtNote: null,
      pr5OwnershipChange:
        "STALE is expected CTR-08 live-evidence behavior because preview is rebuilt and values.* are part of review evidence. PR5 must disclose STALE, not force CURRENT.",
    };
  }
  if (
    roundTrip.validity === "STALE" &&
    !roundTrip.provenanceFingerprintEqual &&
    roundTrip.graphSpecFingerprintEqual &&
    isolated.validity === "CURRENT"
  ) {
    return {
      staleClassification: "PROVENANCE_INPUT_DRIFT",
      pr4CorrectiveDebt: false,
      pr4DebtNote: null,
      pr5OwnershipChange:
        "STALE is caused by live provenance inputs after hydrate (datasetId/sourceRevision/worksheetModified), not by publication identity loss. PR5-A owns disclosure and provenance continuity; do not reopen CTR-09.",
    };
  }
  if (roundTrip.validity === "CURRENT" && isolated.validity === "CURRENT") {
    return {
      staleClassification: "EVIDENCE_UNCHANGED_CURRENT",
      pr4CorrectiveDebt: false,
      pr4DebtNote: null,
      pr5OwnershipChange:
        "Project v2 round-trip keeps working-figure approval CURRENT when provenance inputs are held constant. Browser STALE is therefore a live reopen-wiring/UI issue for Wave 1, not a lost publication identity.",
    };
  }
  if (roundTrip.validity === "STALE") {
    return {
      staleClassification: "PROVENANCE_INPUT_DRIFT",
      pr4CorrectiveDebt: false,
      pr4DebtNote: null,
      pr5OwnershipChange:
        "Working approval becomes STALE because live evidence/provenance changed. Disclose; do not promote CURRENT.",
    };
  }
  return {
    staleClassification: "EVIDENCE_UNCHANGED_CURRENT",
    pr4CorrectiveDebt: false,
    pr4DebtNote: null,
    pr5OwnershipChange: null,
  };
};

export const runPr5Wave0ContinuityCases = (
  assertCase: AssertCase
): Pr5Wave0DiagnosticReport => {
  const entry = buildSampleVisualGraphEntry({
    graphId: "vg-pr5-wave0-1",
    createdAt,
    specInput: SAMPLE_VGB_SCATTER_SPEC_INPUT,
  });
  const datasetId = UI_VGB_DATASET_A_ID;
  const provenance = composeVgbFigureProvenance({
    entry,
    datasetId,
    datasetLabel: "DatasetA.csv",
    sourceRevision: 0,
    worksheetModified: true,
  });
  const projection = projectWorkingVgbFigure({ entry, provenance });
  const working = createWorkingVgbFigure({
    entry,
    at: createdAt,
    sourceDatasetId: datasetId,
  });
  const generated = createVgbFigureReviewRecord({
    recordId: "vgb-review-pr5-wave0",
    figureId: entry.id,
    generatedAt: createdAt,
    graphSpec: entry.graphSpec,
    projection,
  });
  const reviewed = reviewVgbFigure(generated, {
    reviewer: researcher,
    at: reviewedAt,
  });
  const inReview = submitWorkingVgbFigureForReview({
    record: working,
    review: reviewed,
    at: reviewedAt,
  });
  const approved = approveVgbFigure(reviewed, {
    reviewer: researcher,
    at: approvedAt,
  });
  const publication = createPublicationVgbFigure({
    working: inReview,
    entry,
    projection,
    review: approved,
    at: publishedAt,
    publicationId: "vgb-publication-pr5-wave0",
  });

  const rebuiltApplied = applyVisualGraphSpecification(
    entry.graphSpec,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  if (!rebuiltApplied.ok) {
    throw new Error(`Wave 0 preview rebuild failed: ${rebuiltApplied.message}`);
  }
  const rebuiltEntry: ProjectVisualGraphEntry = {
    ...entry,
    graphSpec: { ...entry.graphSpec },
    preview: rebuiltApplied.preview,
    displaySeries: rebuiltApplied.displaySeries,
  };
  const isolatedPreviewRebuild = snapshotAssessment({
    review: approved,
    entryBefore: entry,
    entryAfter: rebuiltEntry,
    provenanceBefore: provenance,
    provenanceAfter: provenance,
  });

  let extensions = setVgbFigureLifecycleStoreOnExtensions(
    {},
    appendVgbPublicationFigure(
      upsertWorkingVgbFigureRecord(
        {
          schema: "scientific-vgb-figure-lifecycle-store/v1",
          working: [],
          publications: [],
        },
        inReview
      ),
      publication
    )
  );
  extensions = setReviewAuthorityRecordsOnExtensions(extensions, [approved]);

  const collectContext = {
    ...buildUiVisualGraphCollectContext({
      extensions,
      worksheetModified: true,
    }),
  };
  const prepared = prepareCollectContextWithSessionVisualGraphs(
    collectContext,
    [entry]
  );
  const collected = collectProjectSnapshotV2(prepared);
  const merged = mergeVisualGraphsFromSessionIntoProjectSnapshot(
    collected,
    prepared
  );
  const serialized = serializeProjectV2({
    project: merged,
    appVersion: "0.1.0",
    exportedAt: publishedAt,
    options: { includeChecksum: false, pretty: true },
  });
  if (!serialized.ok) {
    throw new Error("Wave 0 serialize failed.");
  }
  const hydrated = hydrateProjectJson(serialized.json);
  if (!hydrated.ok) {
    throw new Error("Wave 0 hydrate failed.");
  }

  const restoredStore = getVgbFigureLifecycleStoreFromProject(
    hydrated.patch.project
  );
  const restoredReviews = getReviewAuthorityRecordsFromProject(
    hydrated.patch.project
  );
  const restoredPublication = restoredStore.publications[0];
  const restoredWorking = restoredStore.working[0];
  const restoredReview = restoredReviews.find(
    (record) => record.recordId === restoredWorking?.reviewRecordId
  );
  const runtimeEntries = extractVisualGraphRuntimeState(hydrated.patch);
  const reopenedEntry = runtimeEntries[0];
  const reopenedSession = hydrated.patch.sessionDatasets.find(
    (dataset) => dataset.id === hydrated.patch.activeDatasetId
  );
  const reopenProvenance = composeVgbFigureProvenance({
    entry: reopenedEntry ?? entry,
    datasetId: hydrated.patch.activeDatasetId,
    datasetLabel: reopenedSession?.name,
    sourceRevision: reopenedSession?.sourceRevision ?? 0,
    worksheetModified: reopenedSession?.worksheetModified ?? true,
  });
  const projectRoundTrip = snapshotAssessment({
    review: restoredReview ?? approved,
    entryBefore: entry,
    entryAfter: reopenedEntry ?? entry,
    provenanceBefore: provenance,
    provenanceAfter: reopenProvenance,
  });

  const revivedApproved = restoredReviews.find(
    (record) => record.recordId === approved.recordId
  );
  const reviewJsonReviveEvidenceUnchanged =
    revivedApproved?.evidenceIdentity.fingerprint ===
    approved.evidenceIdentity.fingerprint;

  const reassessed = restoredReview
    ? reassessVgbFigureReview({
        record: restoredReview,
        graphSpec: (reopenedEntry ?? entry).graphSpec,
        projection: projectWorkingVgbFigure({
          entry: reopenedEntry ?? entry,
          provenance: reopenProvenance,
        }),
        at: reopenedAt,
      })
    : restoredReview;

  const classification = classifyStale(isolatedPreviewRebuild, projectRoundTrip);
  const report: Pr5Wave0DiagnosticReport = {
    publicationIdPreserved:
      restoredPublication?.publicationId === publication.publicationId,
    snapshotIdPreserved:
      restoredPublication?.snapshot.identity.snapshotId ===
      publication.snapshot.identity.snapshotId,
    reviewRecordIdPreserved:
      restoredWorking?.reviewRecordId === publication.reviewRecordId &&
      restoredReview?.recordId === approved.recordId,
    publicationId: publication.publicationId,
    snapshotId: publication.snapshot.identity.snapshotId,
    reviewRecordId: approved.recordId,
    sourceRevisionBefore: 0,
    sourceRevisionAfter: reopenedSession?.sourceRevision,
    datasetIdBefore: datasetId,
    datasetIdAfter: hydrated.patch.activeDatasetId,
    isolatedPreviewRebuild,
    projectRoundTrip,
    reviewJsonReviveEvidenceUnchanged,
    ...classification,
  };

  assertCase(
    "pr5.wave0.save-open.publicationId-preserved",
    report.publicationIdPreserved,
    publication.publicationId
  );
  assertCase(
    "pr5.wave0.save-open.snapshotId-preserved",
    report.snapshotIdPreserved,
    publication.snapshot.identity.snapshotId
  );
  assertCase(
    "pr5.wave0.save-open.reviewRecordId-preserved",
    report.reviewRecordIdPreserved,
    approved.recordId
  );
  assertCase(
    "pr5.wave0.save-open.working-figureId-preserved",
    restoredWorking?.figureId === entry.id &&
      reopenedEntry?.id === entry.id
  );
  assertCase(
    "pr5.wave0.save-open.scientific-graphSpec-preserved",
    projectRoundTrip.graphSpecFingerprintEqual
  );
  assertCase(
    "pr5.wave0.save-open.review-json-revive-evidence-stable",
    reviewJsonReviveEvidenceUnchanged,
    revivedApproved?.evidenceIdentity.fingerprint
  );
  assertCase(
    "pr5.wave0.stale.isolated-preview-rebuild.reason-explicit",
    isolatedPreviewRebuild.reason.length > 0,
    `${isolatedPreviewRebuild.validity}:${isolatedPreviewRebuild.reason}`
  );
  assertCase(
    "pr5.wave0.stale.project-round-trip.reason-explicit",
    projectRoundTrip.reason.length > 0,
    `${projectRoundTrip.validity}:${projectRoundTrip.reason}`
  );
  assertCase(
    "pr5.wave0.stale.ctr08-stale-implies-evidence-diff",
    projectRoundTrip.validity !== "STALE" ||
      !projectRoundTrip.evidenceFingerprintEqual,
    `${projectRoundTrip.validity}:${projectRoundTrip.reason}`
  );
  assertCase(
    "pr5.wave0.stale.ctr08-current-implies-evidence-match",
    projectRoundTrip.validity !== "CURRENT" ||
      projectRoundTrip.evidenceFingerprintEqual,
    `${projectRoundTrip.validity}:${projectRoundTrip.reason}`
  );
  assertCase(
    "pr5.wave0.stale.reassess-does-not-upgrade-validity",
    !reassessed ||
      reassessed.validity === restoredReview?.validity ||
      (restoredReview?.validity === "CURRENT" &&
        (reassessed.validity === "STALE" ||
          reassessed.validity === "INVALID" ||
          reassessed.validity === "UNKNOWN")),
    reassessed?.validity
  );

  const reportSection = buildVgbPublicationFigureReportSection([
    restoredPublication ?? publication,
  ]);
  assertCase(
    "pr5.wave0.report.contains-publication-section-title",
    reportSection.title === "Figuras de publicación (VGB)" &&
      reportSection.title === VGB_PUBLICATION_FIGURE_REPORT_TITLE &&
      canIncludeVgbPublicationFiguresInReport(restoredStore.publications)
  );
  assertCase(
    "pr5.wave0.report.section-lists-publicationId",
    reportSection.content.some((line) =>
      line.includes(publication.publicationId)
    )
  );
  assertCase(
    "pr5.wave0.report.classification-factual-vgb-preview",
    getScientificReportBlockReviewDescriptor(reportSection.title)
      .classification === "factual" &&
      getScientificReportBlockReviewDescriptor(reportSection.title)
        .resultContractId === "vgb.preview-values"
  );

  const pageSource = readFileSync(
    join(process.cwd(), "src/app/page.tsx"),
    "utf8"
  );
  assertCase(
    "pr5.wave0.report.page-appends-publication-section",
    pageSource.includes("buildVgbPublicationFigureReportSection") &&
      pageSource.includes("canIncludeVgbPublicationFiguresInReport") &&
      pageSource.includes("vgbFigureLifecycleStore.publications")
  );

  const mixedReport = createLiveGeneratedTextReview({
    recordId: "report-mixed-pr5-wave0",
    artifactId: "scientific-report.summary",
    producer: {
      kind: "system",
      id: "scientific-report-deterministic-generator",
      label: "Scientific Graph AI report generator",
      version: "1",
    },
    generatedAt: createdAt,
    content: "Interpretación mixta del reporte científico.",
    classification: "mixed",
    resultContractId: "sci-60.publication-dashboard",
    provenance: composeScientificProvenance({
      dataset: { id: datasetId, label: "DatasetA.csv" },
      source: { kind: "experimental-series", id: datasetId },
      series: [],
      config: { values: {} },
      method: {
        id: "scientific-report",
        label: "Scientific report",
        version: "1",
        parameters: {},
      },
      approximation: { kind: "mixed", details: "Wave 0 fixture." },
      warnings: [],
    }),
    semanticEvidence: { blockId: "scientific-report.summary" },
  });
  const factualFigureListing = createLiveGeneratedTextReview({
    recordId: "report-vgb-pr5-wave0",
    artifactId: "scientific-report.section.figuras-de-publicacion-vgb",
    producer: {
      kind: "system",
      id: "scientific-report-deterministic-generator",
      label: "Scientific Graph AI report generator",
      version: "1",
    },
    generatedAt: createdAt,
    content: reportSection.content.join("\n"),
    classification: "factual",
    resultContractId: "vgb.preview-values",
    provenance,
    semanticEvidence: { publicationId: publication.publicationId },
  });
  const blockedByReport = guardGeneratedTextExportManifest([
    { included: true, record: mixedReport },
    { included: true, record: factualFigureListing },
  ]);
  const factualOnly = guardGeneratedTextExport({
    included: true,
    record: factualFigureListing,
  });
  const publishedFigureDoesNotApproveReport = guardGeneratedTextExport({
    included: true,
    record: mixedReport,
  });

  assertCase(
    "pr5.wave0.pdf.figure-publication-does-not-approve-report",
    publishedFigureDoesNotApproveReport.decision ===
      "BLOCK_RESEARCHER_APPROVAL_REQUIRED" &&
      publishedFigureDoesNotApproveReport.allowed === false
  );
  assertCase(
    "pr5.wave0.pdf.factual-vgb-listing-may-export-with-disclosure",
    factualOnly.decision === "ALLOW_FACTUAL_WITH_DISCLOSURE" &&
      factualOnly.allowed
  );
  assertCase(
    "pr5.wave0.pdf.manifest-blocked-when-mixed-report-included",
    blockedByReport.allowed === false &&
      blockedByReport.reasons.some((reason) =>
        reason.includes("researcher approval")
      )
  );
  assertCase(
    "pr5.wave0.pdf.page-still-gates-before-export",
    pageSource.includes("buildScientificReportExportReviewManifest") &&
      pageSource.includes("if (!reviewManifest.allowed)") &&
      pageSource.includes("publicationFigures")
  );

  const builderSource = readFileSync(
    join(process.cwd(), "src/components/graph-builder/VisualGraphBuilder.tsx"),
    "utf8"
  );
  assertCase(
    "pr5.wave0.constructor.draft-not-hydrated-from-project",
    builderSource.includes("INITIAL_VISUAL_GRAPH_BUILDER_DRAFT") &&
      !builderSource.includes("initialSpec") &&
      !serialized.json.includes("INITIAL_VISUAL_GRAPH_BUILDER_DRAFT")
  );

  assertCase(
    "pr5.wave0.stale.classification-recorded",
    report.staleClassification.length > 0,
    `${report.staleClassification}; pr4Debt=${String(report.pr4CorrectiveDebt)}; roundTrip=${projectRoundTrip.validity}/${projectRoundTrip.reason}; isolated=${isolatedPreviewRebuild.validity}/${isolatedPreviewRebuild.reason}`
  );

  return report;
};

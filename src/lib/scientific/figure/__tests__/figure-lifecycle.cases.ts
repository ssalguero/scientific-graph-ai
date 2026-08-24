import type { AssertCase } from "../../comparison/__tests__/run-assertions";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";
import {
  assessSemanticProjectionParity,
  isVgbFigureLifecycleStore,
  isVgbPublicationFigureArtifact,
} from "@/lib/scientific/contracts";
import {
  approveVgbFigure,
  appendVgbPublicationFigure,
  buildVgbPublicationFigurePdfReportSection,
  buildVgbPublicationFigureReportSection,
  canPromoteVgbFigureToPublication,
  composeVgbFigureProvenance,
  createPublicationVgbFigure,
  createPublicationVgbFigureNumericExport,
  createVgbFigureReviewRecord,
  createWorkingVgbFigure,
  deriveVgbFigureLifecyclePhase,
  getVgbDisplaySeriesDisposition,
  getVgbFigureLifecycleStoreFromProject,
  isVgbDisplaySeriesAnalysisFeed,
  publicationFigureUsesDisplaySeries,
  publicationRemainsImmutableAfterWorkingEdit,
  projectPublicationVgbFigure,
  projectWorkingVgbFigure,
  reassessVgbFigureReview,
  refreshWorkingVgbFigureBinding,
  replaceVgbPublicationFiguresWithPdfProjection,
  reviveVgbFigureLifecycleStore,
  reviewVgbFigure,
  setVgbFigureLifecycleStoreOnProject,
  shouldPersistVgbDisplaySeries,
  submitWorkingVgbFigureForReview,
  upsertWorkingVgbFigureRecord,
} from "..";
import { assessVgbVisualTruth } from "../eligibility";

const at = "2026-08-24T12:00:00.000Z";
const reviewedAt = "2026-08-24T12:01:00.000Z";
const approvedAt = "2026-08-24T12:02:00.000Z";
const publishedAt = "2026-08-24T12:03:00.000Z";
const editedAt = "2026-08-24T12:04:00.000Z";

const researcher = {
  kind: "researcher" as const,
  id: "researcher-1",
  name: "Researcher",
};

const buildEntry = (
  overrides?: Partial<ProjectVisualGraphEntry["graphSpec"]>
): ProjectVisualGraphEntry => ({
  id: "graph-1",
  createdAt: at,
  graphSpec: {
    id: "graph-1",
    createdAt: at,
    graphType: "bar",
    xVariable: "group",
    yVariable: "value",
    groupVariable: null,
    color: "#000000",
    marker: "circle",
    lineStyle: "solid",
    markerSize: 6,
    errorBars: "sem",
    bins: 10,
    title: "Concentración",
    xLabel: "Grupo",
    yLabel: "Concentración (mg/L)",
    groupLabel: null,
    publicationPresetId: "journal",
    ...overrides,
  },
  preview: {
    graphType: "bar",
    title: "Concentración",
    xLabel: "Grupo",
    yLabel: "Concentración (mg/L)",
    scatterPoints: [],
    lineSeries: [],
    barData: [{ category: "A", value: 12, error: 1.5 }],
    histogramBins: [],
    boxPlotData: [],
    violinData: [],
    heatmapData: [],
    bubbleData: [],
    pcaData: [],
    pcaMeta: null,
  },
  displaySeries: [
    {
      id: "orphan-series",
      name: "Orphan",
      color: "#111",
      points: [{ x: 1, y: 2 }],
    },
  ],
});

export const runPr4FigureLifecycleCases = (assertCase: AssertCase): void => {
  const entry = buildEntry();
  const provenance = composeVgbFigureProvenance({
    entry,
    datasetId: "dataset-1",
    datasetLabel: "Dataset.csv",
    sourceRevision: 1,
  });
  const workingProjection = projectWorkingVgbFigure({ entry, provenance });
  const working = createWorkingVgbFigure({ entry, at, sourceDatasetId: "dataset-1" });

  assertCase(
    "pr4.working.created",
    working.lifecycleState === "WORKING" && working.figureId === entry.id
  );
  assertCase(
    "pr4.identity.stable-not-ui",
    working.figureId === entry.graphSpec.id &&
      working.figureId !== "0" &&
      !working.figureId.includes("[")
  );

  const generated = createVgbFigureReviewRecord({
    recordId: "vgb-review-1",
    figureId: entry.id,
    generatedAt: at,
    graphSpec: entry.graphSpec,
    projection: workingProjection,
  });
  const reviewed = reviewVgbFigure(generated, { reviewer: researcher, at: reviewedAt });
  const inReview = submitWorkingVgbFigureForReview({
    record: working,
    review: reviewed,
    at: reviewedAt,
  });
  assertCase(
    "pr4.review.transition",
    inReview.lifecycleState === "RESEARCHER_REVIEW" &&
      reviewed.state === "RESEARCHER_REVIEWED" &&
      reviewed.validity === "CURRENT"
  );
  assertCase(
    "pr4.review.bound-to-evidence",
    reviewed.artifactIdentity.artifactId === entry.id &&
      reviewed.provenance.dataset.id === "dataset-1"
  );

  const approved = approveVgbFigure(reviewed, {
    reviewer: researcher,
    at: approvedAt,
  });
  const visualTruth = assessVgbVisualTruth({
    graphSpec: entry.graphSpec,
    projection: workingProjection,
  });
  assertCase("pr4.eligibility.visual-truth", visualTruth.eligible);
  assertCase(
    "pr4.publication.requires-researcher-authority",
    canPromoteVgbFigureToPublication({
      visualTruth,
      review: reviewed,
    }).allowed === false &&
      canPromoteVgbFigureToPublication({
        visualTruth,
        review: approved,
      }).allowed
  );

  const publication = createPublicationVgbFigure({
    working: inReview,
    entry,
    projection: workingProjection,
    review: approved,
    at: publishedAt,
    publicationId: "vgb-publication-fixed",
  });
  assertCase(
    "pr4.publication.created-from-reviewed-evidence",
    publication.workingFigureId === entry.id &&
      publication.reviewRecordId === approved.recordId &&
      Object.isFrozen(publication) &&
      publication.snapshot.identity.kind === "citable-scientific-snapshot"
  );

  const editedEntry = buildEntry({ errorBars: "sd", color: "#ff0000" });
  assertCase(
    "pr4.publication.immutable-after-working-edit",
    publicationRemainsImmutableAfterWorkingEdit({
      publication,
      currentEntry: editedEntry,
    }) &&
      publication.graphSpec.errorBars === "sem" &&
      editedEntry.graphSpec.errorBars === "sd"
  );

  const refreshed = refreshWorkingVgbFigureBinding({
    record: inReview,
    entry: editedEntry,
    at: editedAt,
  });
  assertCase(
    "pr4.review.invalidation-on-scientific-change",
    refreshed.lifecycleState === "WORKING" &&
      refreshed.reviewRecordId === undefined &&
      refreshed.scientificFingerprint !== inReview.scientificFingerprint
  );

  const cosmeticOnly = refreshWorkingVgbFigureBinding({
    record: inReview,
    entry: buildEntry({ color: "#00ff00", markerSize: 10 }),
    at: editedAt,
  });
  assertCase(
    "pr4.review.cosmetic-does-not-reset-lifecycle",
    cosmeticOnly.lifecycleState === "RESEARCHER_REVIEW" &&
      cosmeticOnly.scientificFingerprint === inReview.scientificFingerprint &&
      cosmeticOnly.cosmeticFingerprint !== inReview.cosmeticFingerprint
  );

  const invalidatedReview = reassessVgbFigureReview({
    record: approved,
    graphSpec: editedEntry.graphSpec,
    projection: projectWorkingVgbFigure({
      entry: editedEntry,
      provenance: composeVgbFigureProvenance({
        entry: editedEntry,
        datasetId: "dataset-1",
      }),
    }),
    at: editedAt,
  });
  assertCase(
    "pr4.review.ctr08-invalidated-on-scientific-change",
    invalidatedReview.validity === "INVALID"
  );
  const cosmeticReview = reassessVgbFigureReview({
    record: approved,
    graphSpec: buildEntry({ color: "#00ff00", markerSize: 10 }).graphSpec,
    projection: workingProjection,
    at: editedAt,
  });
  assertCase(
    "pr4.review.ctr08-current-on-cosmetic",
    cosmeticReview.validity === "CURRENT"
  );

  let publicationFromWorkingRejected = false;
  try {
    createPublicationVgbFigure({
      working,
      entry,
      projection: workingProjection,
      review: approved,
      at: publishedAt,
    });
  } catch {
    publicationFromWorkingRejected = true;
  }
  assertCase(
    "pr4.publication.rejects-unreviewed-working",
    publicationFromWorkingRejected
  );

  const reportProjection = projectPublicationVgbFigure({
    artifact: publication,
    surface: "report",
  });
  const pdfProjection = projectPublicationVgbFigure({
    artifact: publication,
    surface: "pdf",
  });
  const numericProjection = projectPublicationVgbFigure({
    artifact: publication,
    surface: "numeric-export-foundation",
  });
  assertCase(
    "pr4.parity.report-pdf-numeric",
    assessSemanticProjectionParity([
      reportProjection,
      pdfProjection,
      numericProjection,
    ]).equivalent
  );
  const bar = reportProjection.semanticValues.find(
    (value) => value.field === "values.barData"
  );
  assertCase(
    "pr4.semantics.units-uncertainty-provenance",
    bar?.uncertainty?.kind === "sem" &&
      reportProjection.provenance.dataset.id === "dataset-1" &&
      reportProjection.approximation.kind === "mixed" &&
      reportProjection.limitations.length > 0
  );
  assertCase(
    "pr4.freshness.preserved",
    reportProjection.freshness.state === "CURRENT" ||
      reportProjection.freshness.state === "UNKNOWN"
  );

  const numeric = createPublicationVgbFigureNumericExport(publication);
  assertCase(
    "pr4.numeric.publication-only-factual",
    numeric.semanticValues.every((value) => value.authority === "system-factual") &&
      !JSON.stringify(numeric).includes("displaySeries")
  );

  assertCase(
    "pr4.displaySeries.not-analysis-feed",
    getVgbDisplaySeriesDisposition().analysisFeed === false &&
      !isVgbDisplaySeriesAnalysisFeed(entry) &&
      !shouldPersistVgbDisplaySeries(entry) &&
      !publicationFigureUsesDisplaySeries() &&
      !JSON.stringify(publication).includes("orphan-series")
  );

  const reportSection = buildVgbPublicationFigureReportSection([publication]);
  const pdfSection = buildVgbPublicationFigurePdfReportSection([publication]);
  const productionPdf = replaceVgbPublicationFiguresWithPdfProjection({
    sections: [reportSection],
    artifacts: [publication],
    included: true,
  });
  assertCase(
    "pr4.report-pdf.publication-consumed",
    reportSection.content.some((line) =>
      line.includes("vgb-publication-fixed")
    ) &&
      productionPdf[0]?.content.join("\n") === pdfSection.content.join("\n") &&
      !reportSection.content.some((line) => line.includes("Working Figure automática"))
  );

  const stored = setVgbFigureLifecycleStoreOnProject(
    { metadata: { name: "fixture" }, extensions: { unrelated: true } },
    appendVgbPublicationFigure(
      upsertWorkingVgbFigureRecord(
        {
          schema: "scientific-vgb-figure-lifecycle-store/v1",
          working: [],
          publications: [],
        },
        working
      ),
      publication
    )
  );
  const revived = getVgbFigureLifecycleStoreFromProject(
    JSON.parse(JSON.stringify(stored))
  );
  assertCase(
    "pr4.persistence.round-trip-identity",
    stored.extensions?.unrelated === true &&
      revived.publications[0]?.publicationId === publication.publicationId &&
      revived.publications[0]?.snapshot.identity.snapshotId ===
        publication.snapshot.identity.snapshotId &&
      Object.isFrozen(revived.publications[0])
  );
  assertCase(
    "pr4.hydrate.malformed-rejected",
    reviveVgbFigureLifecycleStore({
      schema: "scientific-vgb-figure-lifecycle-store/v1",
      working: [{ schema: "malformed" }],
      publications: [],
    }) === null && !isVgbFigureLifecycleStore({ schema: "nope" })
  );
  assertCase(
    "pr4.hydrate.malformed-publication-rejected",
    reviveVgbFigureLifecycleStore({
      schema: "scientific-vgb-figure-lifecycle-store/v1",
      working: [working],
      publications: [
        {
          ...publication,
          snapshot: { schema: "not-a-snapshot" },
        },
      ],
    }) === null
  );
  assertCase(
    "pr4.working-not-automatically-publication",
    deriveVgbFigureLifecyclePhase({ working, publications: [] }) ===
      "WORKING" &&
      deriveVgbFigureLifecyclePhase({
        working: inReview,
        publications: [publication],
        review: approved,
      }) === "PUBLICATION"
  );
  assertCase(
    "pr4.publication.not-status-flag",
    isVgbPublicationFigureArtifact(publication) &&
      publication.schema === "scientific-vgb-publication-figure/v1" &&
      working.lifecycleState === "WORKING"
  );
};

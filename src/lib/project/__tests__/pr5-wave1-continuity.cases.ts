import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { AssertCase } from "@/lib/scientific/comparison/__tests__/run-assertions";
import { composeScientificProvenance } from "@/lib/scientific/contracts";
import { VGB_PUBLICATION_FIGURE_REPORT_TITLE } from "@/lib/scientific/figure";
import { getScientificReportBlockReviewDescriptor } from "@/lib/scientific/report/generated-text-classification";
import { createLiveGeneratedTextReview } from "@/lib/scientific/report/review-authority";
import {
  guardGeneratedTextExport,
  guardGeneratedTextExportManifest,
} from "@/lib/scientific/report/review-export-guard";
import {
  applyVisualGraphSpecification,
  INITIAL_VISUAL_GRAPH_BUILDER_DRAFT,
} from "@/lib/visualGraphBuilder";
import {
  describeVgbReviewValidity,
  formatPdfCtr08BlockMessage,
  preserveWorkingFigureGraphSpecIdentity,
  PR5_MULTIPLE_WORKING_FIGURES_DISCLOSURE,
  PR5_PDF_CTR08_BLOCK_MESSAGE,
  PR5_PDF_CTR08_NEXT_ACTION,
  PR5_PDF_FIGURE_DOES_NOT_APPROVE_REPORT,
  PR5_REPORT_PUBLICATION_SECTION_DISCLOSURE,
  replaceWorkingVisualGraphEntry,
  resolveReopenVisualBuilderContext,
  toVisualGraphBuilderDraftFromGraphSpec,
} from "@/lib/project/pr5-researcher-continuity";

import {
  SAMPLE_VGB_REGISTRY,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
  SAMPLE_VGB_SERIES,
  buildSampleVisualGraphEntry,
} from "./visual-graph-mapper-helpers";

const read = (path: string): string =>
  readFileSync(join(process.cwd(), path), "utf8");

export const runPr5Wave1ContinuityCases = (assertCase: AssertCase): void => {
  const entry = buildSampleVisualGraphEntry({
    graphId: "working-figure-pr5-wave1",
    createdAt: "2026-08-24T12:00:00.000Z",
    specInput: SAMPLE_VGB_SCATTER_SPEC_INPUT,
  });
  const draft = toVisualGraphBuilderDraftFromGraphSpec(entry.graphSpec);
  const applied = applyVisualGraphSpecification(
    SAMPLE_VGB_SCATTER_SPEC_INPUT,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  if (!applied.ok) {
    throw new Error(`Wave 1 apply failed: ${applied.message}`);
  }

  const page = read("src/app/page.tsx");
  const builder = read("src/components/graph-builder/VisualGraphBuilder.tsx");
  const panel = read("src/components/graph-builder/VgbFigureLifecyclePanel.tsx");
  const helper = read("src/lib/project/pr5-researcher-continuity.ts");
  const collect = read("src/lib/project/collect-project-snapshot-v2.ts");
  const guard = read("src/lib/scientific/report/review-export-guard.ts");
  const figureLifecycle = read("src/lib/scientific/figure/lifecycle.ts");
  const figureReview = read("src/lib/scientific/figure/review.ts");
  const figureReport = read("src/lib/scientific/figure/report.ts");
  const contractLifecycle = read(
    "src/lib/scientific/contracts/vgb-figure-lifecycle.ts"
  );
  const contractReview = read(
    "src/lib/scientific/contracts/generated-text-review.ts"
  );

  assertCase(
    "pr5.wave1.constructor.persisted-graphSpec-initializes-draft",
    draft.graphType === entry.graphSpec.graphType &&
      draft.xVariable === entry.graphSpec.xVariable &&
      draft.yVariable === entry.graphSpec.yVariable &&
      draft.publicationPresetId === entry.graphSpec.publicationPresetId &&
      !("id" in draft) &&
      !("createdAt" in draft) &&
      builder.includes("initialGraphSpec") &&
      builder.includes("toVisualGraphBuilderDraftFromGraphSpec") &&
      page.includes("initialGraphSpec=")
  );
  assertCase(
    "pr5.wave1.constructor.new-builder-empty-default",
    INITIAL_VISUAL_GRAPH_BUILDER_DRAFT.graphType === null &&
      INITIAL_VISUAL_GRAPH_BUILDER_DRAFT.yVariable === null &&
      builder.includes("INITIAL_VISUAL_GRAPH_BUILDER_DRAFT") &&
      page.includes('continueVisualGraphId ?? "new"') &&
      !page.includes("INITIAL_VISUAL_GRAPH_BUILDER_DRAFT")
  );
  assertCase(
    "pr5.wave1.constructor.continue-does-not-overwrite-with-empty-draft",
    builder.includes("continueMode") &&
      !builder.includes(
        "setSpec(INITIAL_VISUAL_GRAPH_BUILDER_DRAFT)"
      )
  );

  const preserved = preserveWorkingFigureGraphSpecIdentity(
    applied.graphSpec,
    entry.graphSpec
  );
  const replaced = replaceWorkingVisualGraphEntry(
    [entry],
    entry.id,
    applied
  );
  const missing = replaceWorkingVisualGraphEntry(
    [entry],
    "missing-figure",
    applied
  );
  const publicationId = "vgb-publication-pr5-wave1";

  assertCase(
    "pr5.wave1.identity.engine-mints-but-parent-preserves-figureId",
    applied.graphSpec.id !== entry.id &&
      preserved.id === entry.graphSpec.id &&
      preserved.createdAt === entry.graphSpec.createdAt &&
      replaced !== null &&
      replaced.length === 1 &&
      replaced[0]!.id === entry.id &&
      replaced[0]!.graphSpec.id === entry.graphSpec.id &&
      missing === null &&
      page.includes("replaceWorkingVisualGraphEntry") &&
      page.includes("if (continueVisualGraphId)")
  );
  assertCase(
    "pr5.wave1.identity.publicationId-untouched-by-continue-edit",
    !helper.includes("createPublicationVgbFigure") &&
      !helper.includes("publicationId:") &&
      page.includes("createWorkingVgbFigure") &&
      page.includes("if (continueVisualGraphId)") &&
      publicationId === "vgb-publication-pr5-wave1"
  );

  const zero = resolveReopenVisualBuilderContext([]);
  const one = resolveReopenVisualBuilderContext([entry]);
  const many = resolveReopenVisualBuilderContext([
    entry,
    { ...entry, id: "working-figure-pr5-wave1-b" },
  ]);
  assertCase(
    "pr5.wave1.reopen.zero-keeps-empty-builder",
    zero.restoreVisualBuilderView === false &&
      zero.continueFigureId === null &&
      zero.multipleWorkingFigures === false
  );
  assertCase(
    "pr5.wave1.reopen.single-restores-visual-builder-and-spec",
    one.restoreVisualBuilderView === true &&
      one.continueFigureId === entry.id &&
      one.multipleWorkingFigures === false &&
      page.includes("resolveReopenVisualBuilderContext") &&
      page.includes('reopen.restoreVisualBuilderView ? "visual-builder"')
  );
  assertCase(
    "pr5.wave1.reopen.multiple-restores-view-without-auto-select",
    many.restoreVisualBuilderView === true &&
      many.continueFigureId === null &&
      many.multipleWorkingFigures === true &&
      page.includes("PR5_MULTIPLE_WORKING_FIGURES_DISCLOSURE") &&
      PR5_MULTIPLE_WORKING_FIGURES_DISCLOSURE.includes(
        "No se elige una figura automáticamente"
      )
  );

  const stale = describeVgbReviewValidity("STALE", true);
  const unknown = describeVgbReviewValidity("UNKNOWN", true);
  const invalid = describeVgbReviewValidity("INVALID", true);
  const current = describeVgbReviewValidity("CURRENT", true);
  assertCase(
    "pr5.wave1.disclosure.stale-remains-stale",
    stale.body.includes("evidencia o proveniencia viva") &&
      stale.body.includes("no cambia") &&
      !stale.body.toLowerCase().includes("el artefacto de publicación cambió") &&
      stale.nextAction !== null &&
      stale.nextAction.includes("No se reaprueba en silencio") &&
      panel.includes("describeVgbReviewValidity") &&
      page.includes("reassessVgbFigureReview") &&
      !helper.includes('validity: "CURRENT"')
  );
  assertCase(
    "pr5.wave1.disclosure.unknown-remains-unknown",
    unknown.body.includes("No se puede verificar") &&
      unknown.nextAction !== null &&
      describeVgbReviewValidity("UNKNOWN", false).body === unknown.body
  );
  assertCase(
    "pr5.wave1.disclosure.invalid-remains-invalid",
    invalid.body.includes("no es válido") &&
      invalid.body.includes("permanece congelada") &&
      invalid.nextAction !== null &&
      current.body === "" &&
      current.nextAction === null
  );

  const listingClassification = getScientificReportBlockReviewDescriptor(
    VGB_PUBLICATION_FIGURE_REPORT_TITLE
  );
  assertCase(
    "pr5.wave1.report.publication-listing-factual",
    VGB_PUBLICATION_FIGURE_REPORT_TITLE === "Figuras de publicación (VGB)" &&
      listingClassification.classification === "factual" &&
      page.includes("buildVgbPublicationFigureReportSection") &&
      figureReport.includes("Solo las Figuras de publicación")
  );
  assertCase(
    "pr5.wave1.report.publication-listing-discoverable",
    page.includes("VGB_PUBLICATION_FIGURE_REPORT_TITLE") &&
      page.includes("defaultOpen={") &&
      page.includes("PR5_REPORT_PUBLICATION_SECTION_DISCLOSURE") &&
      PR5_REPORT_PUBLICATION_SECTION_DISCLOSURE.includes(
        VGB_PUBLICATION_FIGURE_REPORT_TITLE
      )
  );

  const mixedReport = createLiveGeneratedTextReview({
    recordId: "report-mixed-pr5-wave1",
    artifactId: "scientific-report.summary",
    producer: {
      kind: "system",
      id: "scientific-report-deterministic-generator",
      label: "Scientific Graph AI report generator",
      version: "1",
    },
    generatedAt: "2026-08-24T12:00:00.000Z",
    content: "Interpretación mixta del reporte científico.",
    classification: "mixed",
    resultContractId: "sci-60.publication-dashboard",
    provenance: composeScientificProvenance({
      dataset: { id: "dataset-a", label: "DatasetA.csv" },
      source: { kind: "experimental-series", id: "dataset-a" },
      series: [],
      config: { values: {} },
      method: {
        id: "scientific-report",
        label: "Scientific report",
        version: "1",
        parameters: {},
      },
      approximation: { kind: "mixed", details: "Wave 1 fixture." },
      warnings: [],
    }),
    semanticEvidence: { blockId: "scientific-report.summary" },
  });
  const factualListing = createLiveGeneratedTextReview({
    recordId: "report-vgb-pr5-wave1",
    artifactId: "scientific-report.section.figuras-de-publicacion-vgb",
    producer: {
      kind: "system",
      id: "scientific-report-deterministic-generator",
      label: "Scientific Graph AI report generator",
      version: "1",
    },
    generatedAt: "2026-08-24T12:00:00.000Z",
    content: "Identidad de publicación: vgb-publication-pr5-wave1",
    classification: "factual",
    resultContractId: "vgb.preview-values",
    provenance: mixedReport.provenance,
    semanticEvidence: { publicationId },
  });
  const blockedMixed = guardGeneratedTextExportManifest([
    { included: true, record: mixedReport },
    { included: true, record: factualListing },
  ]);
  const factualOnly = guardGeneratedTextExport({
    included: true,
    record: factualListing,
  });
  const publicationDoesNotApprove = guardGeneratedTextExport({
    included: true,
    record: mixedReport,
  });
  const pdfMessage = formatPdfCtr08BlockMessage();

  assertCase(
    "pr5.wave1.pdf.mixed-advisory-remains-blocked",
    blockedMixed.allowed === false &&
      blockedMixed.reasons.length > 0 &&
      page.includes("if (!reviewManifest.allowed)") &&
      page.includes("guardGeneratedTextExportManifest")
  );
  assertCase(
    "pr5.wave1.pdf.block-discloses-next-action",
    pdfMessage.includes(PR5_PDF_CTR08_BLOCK_MESSAGE) &&
      pdfMessage.includes(PR5_PDF_CTR08_NEXT_ACTION) &&
      pdfMessage.includes(PR5_PDF_FIGURE_DOES_NOT_APPROVE_REPORT) &&
      page.includes("formatPdfCtr08BlockMessage()")
  );
  assertCase(
    "pr5.wave1.pdf.publication-does-not-bypass-ctr08",
    publicationDoesNotApprove.allowed === false &&
      publicationDoesNotApprove.decision ===
        "BLOCK_RESEARCHER_APPROVAL_REQUIRED" &&
      factualOnly.allowed === true &&
      guard.includes("BLOCK_RESEARCHER_APPROVAL_REQUIRED") &&
      !guard.includes("pr5-researcher-continuity")
  );

  assertCase(
    "pr5.wave1.session.remains-deferred",
    !helper.includes("@/components/session") &&
      !helper.includes("SessionRestore") &&
      !page.includes("SessionRestoreEngine") &&
      !collect.includes("continueVisualGraphId") &&
      !collect.includes("dataWorkspaceView") &&
      page.includes("continueVisualGraphId") &&
      !page.includes("sessionStorage")
  );
  assertCase(
    "pr5.wave1.boundary.no-scientific-contract-change",
    !contractLifecycle.includes("pr5-researcher-continuity") &&
      !contractReview.includes("pr5-researcher-continuity") &&
      !figureLifecycle.includes("pr5-researcher-continuity") &&
      !figureReview.includes("pr5-researcher-continuity") &&
      !figureReport.includes("pr5-researcher-continuity") &&
      !page.includes("publication-figure-picker")
  );
  assertCase(
    "pr5.wave1.journey.localized-continuity-actions",
    page.includes('label: "Constructor Visual"') &&
      page.includes("onContinueEdit") &&
      panel.includes("Continuar en Constructor Visual") &&
      page.includes("Nueva figura") &&
      page.includes("setContinueVisualGraphId(null)")
  );
};

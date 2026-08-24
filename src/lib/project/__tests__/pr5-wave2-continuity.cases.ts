import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { AssertCase } from "@/lib/scientific/comparison/__tests__/run-assertions";
import {
  resolveToggleVisibilityLongHint,
  resolveToggleVisibilityShortHint,
} from "@/components/analysis/resolve-toggle-visibility-hint";
import {
  formatPr5ContinuityDisposition,
  formatPr5GatedModuleDescription,
  formatPr5ReportPublicationContext,
  PR5_ANALYSIS_ROLE,
  PR5_COMPARE_PATH,
  PR5_COMPUTATION_NOT_STOPPED,
  PR5_DOMAIN_UNDO_DISPOSITION,
  PR5_GE_VGB_DISTINCT,
  PR5_GATED_MODULE_REASON,
  PR5_LIVE_REPORT_ACTIVE_DATASET,
  PR5_PROJECT_PUBLICATION_SCOPE,
  PR5_PROJECT_RECOVERY_DISPOSITION,
  PR5_PUBLICATION_BANNER_NOT_FRESHNESS,
  PR5_REPORT_PUBLICATION_SECTION_DISCLOSURE,
  PR5_RESULTS_ROLE,
  PR5_SESSION_RESTORE_DISPOSITION,
} from "@/lib/project/pr5-researcher-continuity";

const read = (path: string): string =>
  readFileSync(join(process.cwd(), path), "utf8");

const walkFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  });

const SCIENTIFIC_CONTRACT_FILES = [
  "src/lib/scientific/figure/lifecycle.ts",
  "src/lib/scientific/figure/review.ts",
  "src/lib/scientific/figure/report.ts",
  "src/lib/scientific/figure/projection.ts",
  "src/lib/scientific/figure/eligibility.ts",
  "src/lib/scientific/figure/persistence.ts",
  "src/lib/scientific/contracts/vgb-figure-lifecycle.ts",
  "src/lib/scientific/contracts/generated-text-review.ts",
  "src/lib/scientific/report/review-export-guard.ts",
  "src/lib/scientific/export/numeric-scientific-export.ts",
] as const;

export const runPr5Wave2ContinuityCases = (assertCase: AssertCase): void => {
  const page = read("src/app/page.tsx");
  const helper = read("src/lib/project/pr5-researcher-continuity.ts");
  const hint = read("src/components/analysis/resolve-toggle-visibility-hint.ts");
  const sessionFiles = walkFiles(join(process.cwd(), "src/components/session"));
  const readAbs = (path: string): string => readFileSync(path, "utf8");
  const disposition = formatPr5ContinuityDisposition();
  const missingLiveContext = formatPr5ReportPublicationContext({
    liveReportAvailable: false,
    publicationCount: 2,
  });
  const liveContext = formatPr5ReportPublicationContext({
    liveReportAvailable: true,
    publicationCount: 1,
  });
  const noPublicationContext = formatPr5ReportPublicationContext({
    liveReportAvailable: false,
    publicationCount: 0,
  });
  const longHint = resolveToggleVisibilityLongHint("showConsistencyEngine");
  const shortHint = resolveToggleVisibilityShortHint("showConsistencyEngine");

  assertCase(
    "pr5.wave2.session.restore-disclosed-unavailable",
    disposition.includes(PR5_PROJECT_RECOVERY_DISPOSITION) &&
      disposition.includes(PR5_SESSION_RESTORE_DISPOSITION) &&
      page.includes("formatPr5ContinuityDisposition()") &&
      helper.includes("no está disponible") &&
      !page.includes("SessionRestoreEngine")
  );
  assertCase(
    "pr5.wave2.undo.domain-deferred",
    disposition.includes(PR5_DOMAIN_UNDO_DISPOSITION) &&
      helper.includes("permanece diferido") &&
      !page.includes("useUndoRedo") &&
      !helper.includes("history.undo")
  );
  assertCase(
    "pr5.wave2.report.dataset-vs-project-scope",
    missingLiveContext.includes(PR5_LIVE_REPORT_ACTIVE_DATASET) &&
      missingLiveContext.includes(PR5_PROJECT_PUBLICATION_SCOPE) &&
      missingLiveContext.includes(PR5_PUBLICATION_BANNER_NOT_FRESHNESS) &&
      missingLiveContext.includes(PR5_REPORT_PUBLICATION_SECTION_DISCLOSURE) &&
      liveContext.includes(PR5_LIVE_REPORT_ACTIVE_DATASET) &&
      liveContext.includes(PR5_REPORT_PUBLICATION_SECTION_DISCLOSURE) &&
      noPublicationContext === "" &&
      page.includes("formatPr5ReportPublicationContext")
  );
  assertCase(
    "pr5.wave2.report.no-publication-picker-or-filter",
    !page.includes("publication-figure-picker") &&
      !page.includes("filterPublicationsByDataset") &&
      !page.includes("activeDatasetPublication") &&
      !helper.includes("filterPublicationsByDataset") &&
      page.includes("canIncludeVgbPublicationFiguresInReport")
  );
  assertCase(
    "pr5.wave2.report.publication-listing-remains-factual",
    page.includes("PR5_REPORT_PUBLICATION_SECTION_DISCLOSURE") &&
      page.includes("VGB_PUBLICATION_FIGURE_REPORT_TITLE") &&
      page.includes("buildVgbPublicationFigureReportSection") &&
      liveContext.includes("Figuras de publicación (VGB)")
  );
  assertCase(
    "pr5.wave2.journey.gated-modules-explained",
    formatPr5GatedModuleDescription(true, "PCA") === "PCA" &&
      formatPr5GatedModuleDescription(false, "PCA").includes(
        PR5_GATED_MODULE_REASON
      ) &&
      page.includes("formatPr5GatedModuleDescription") &&
      page.includes("PR5_GATED_MODULE_REASON") &&
      page.includes("No hay categorías de análisis")
  );
  assertCase(
    "pr5.wave2.journey.next-action-continuity",
    page.includes('label: "Continuar a Datos →"') &&
      page.includes('label: "Continuar a Análisis →"') &&
      page.includes('label: "Ver gráfico / Resultados →"') &&
      page.includes('label: "Ir a Reportes"') &&
      page.includes('label: "Constructor y=f(x)"') &&
      page.includes('label: "Comparar en Resultados"') &&
      page.includes('label: "Revisar comparación"')
  );
  assertCase(
    "pr5.wave2.computation.visibility-does-not-claim-stopped",
    longHint.includes(PR5_COMPUTATION_NOT_STOPPED) &&
      longHint.includes("sigue evaluándose") &&
      shortHint.includes("Calculado en segundo plano") &&
      !longHint.toLowerCase().includes("cálculo detenido") &&
      !shortHint.toLowerCase().includes("deshabilitado el motor") &&
      hint.includes("PR5_COMPUTATION_NOT_STOPPED") &&
      page.includes("ToggleVisibilityHint")
  );
  assertCase(
    "pr5.wave2.results.analysis-roles-distinct",
    PR5_ANALYSIS_ROLE.includes("Análisis configura") &&
      PR5_RESULTS_ROLE.includes("Resultados es el centro de revisión") &&
      page.includes("PR5_ANALYSIS_ROLE") &&
      page.includes("PR5_RESULTS_ROLE") &&
      !PR5_ANALYSIS_ROLE.includes("Resultados es el centro") &&
      !PR5_RESULTS_ROLE.includes("Análisis configura")
  );
  assertCase(
    "pr5.wave2.results.ge-vgb-remain-distinct",
    PR5_GE_VGB_DISTINCT.includes("Constructor y=f(x) (GE)") &&
      PR5_GE_VGB_DISTINCT.includes("Constructor Visual (VGB)") &&
      PR5_GE_VGB_DISTINCT.includes("capacidades distintas") &&
      page.includes("PR5_GE_VGB_DISTINCT") &&
      page.includes('openDataView("curves")') &&
      page.includes('openDataView("visual-builder")')
  );
  assertCase(
    "pr5.wave2.results.compare-report-export-paths",
    PR5_COMPARE_PATH.includes("comparación se revisa en Resultados") &&
      page.includes("PR5_COMPARE_PATH") &&
      page.includes("createPublicationVgbFigureNumericExport") &&
      page.includes("exportVgbPublicationNumeric") &&
      page.includes("formatPdfCtr08BlockMessage()") &&
      page.includes("selectWorkspaceSection(\"reports\")")
  );
  assertCase(
    "pr5.wave2.boundary.session-modules-unmodified",
    sessionFiles.length > 0 &&
      sessionFiles.every(
        (path) => !readAbs(path).includes("pr5-researcher-continuity")
      ) &&
      sessionFiles.every((path) => !readAbs(path).includes("PR5_SESSION_RESTORE")) &&
      !helper.includes("@/components/session")
  );
  assertCase(
    "pr5.wave2.boundary.figure-lifecycle-unreopened",
    SCIENTIFIC_CONTRACT_FILES.filter((path) => path.includes("/figure/")).every(
      (path) => !read(path).includes("pr5-researcher-continuity")
    ) &&
      !read("src/lib/scientific/contracts/vgb-figure-lifecycle.ts").includes(
        "pr5-researcher-continuity"
      )
  );
  assertCase(
    "pr5.wave2.boundary.ctr08-pdf-guard-unchanged",
    !read("src/lib/scientific/report/review-export-guard.ts").includes(
      "pr5-researcher-continuity"
    ) &&
      !read("src/lib/scientific/report/review-export-guard.ts").includes(
        "PR5_"
      ) &&
      page.includes("guardGeneratedTextExportManifest")
  );
  assertCase(
    "pr5.wave2.boundary.numeric-export-publication-only",
    read("src/lib/scientific/figure/projection.ts").includes(
      "createPublicationVgbFigureNumericExport"
    ) &&
      page.includes("createPublicationVgbFigureNumericExport(artifact)") &&
      !page.includes("createWorkingVgbFigureNumericExport") &&
      !read("src/lib/scientific/export/numeric-scientific-export.ts").includes(
        "pr5-researcher-continuity"
      )
  );
  assertCase(
    "pr5.wave2.boundary.no-scientific-calculation-edits",
    SCIENTIFIC_CONTRACT_FILES.every(
      (path) => !read(path).includes("pr5-researcher-continuity")
    ) &&
      !helper.includes("p-value") &&
      !helper.includes("estimator")
  );
  assertCase(
    "pr5.wave2.boundary.no-pr6-performance-release",
    !helper.includes("PR6-A") &&
      !page.includes("validate:performance") &&
      !page.includes("release-certification") &&
      !hint.includes("PR6")
  );
  assertCase(
    "pr5.wave2.boundary.no-page-extraction",
    page.includes("export default function Home()") &&
      page.includes("function WorkflowContinuityBar(") &&
      page.includes("data-home-stage") &&
      page.includes('activeWorkspaceSection === "data"') &&
      page.includes('activeWorkspaceSection === "analysis"') &&
      page.includes('activeWorkspaceSection === "results"') &&
      page.includes('activeWorkspaceSection === "reports"') &&
      !page.includes("extractPageOrchestration")
  );
};

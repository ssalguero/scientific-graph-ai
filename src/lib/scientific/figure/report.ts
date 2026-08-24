import { sanitizeForPdfText } from "@/lib/scientific/report/pdf-text";
import type { VgbPublicationFigureArtifact } from "@/lib/scientific/contracts";
import { projectPublicationVgbFigure } from "./projection";
import { publicationFigureUsesDisplaySeries } from "./display-series";

export const VGB_PUBLICATION_FIGURE_REPORT_TITLE =
  "Figuras de publicación (VGB)";

export const PDF_BLOCK_VGB_PUBLICATION_FIGURES_ID = "vgb-publication-figures";

export type VgbPublicationFigureReportSection = {
  title: string;
  content: string[];
};

const buildLines = (
  artifacts: readonly VgbPublicationFigureArtifact[],
  forPdf: boolean
): string[] => {
  const raw: string[] = [
    "Solo las Figuras de publicación, no las Figuras de trabajo, entran en Report/PDF.",
    "displaySeries no es un feed de Análisis ni autoridad de publicación.",
  ];
  if (artifacts.length === 0) {
    raw.push("No hay Figuras de publicación vigentes.");
  }
  artifacts.forEach((artifact, index) => {
    const projection = projectPublicationVgbFigure({
      artifact,
      surface: forPdf ? "pdf" : "report",
    });
    raw.push(`Figura de publicación ${index + 1}`);
    raw.push(`Identidad de publicación: ${artifact.publicationId}`);
    raw.push(`Figura de trabajo de origen: ${artifact.workingFigureId}`);
    raw.push(`Snapshot: ${artifact.snapshot.identity.snapshotId}`);
    raw.push(`Contrato: ${artifact.snapshot.resultContractId}`);
    raw.push(`Método: ${projection.methodIdentity.label}`);
    raw.push(`Aproximación: ${projection.approximation.kind}`);
    raw.push(`Vigencia: ${projection.freshness.state}`);
    projection.warnings.forEach((warning) =>
      raw.push(`Advertencia: ${warning.message}`)
    );
    projection.limitations.forEach((limitation) =>
      raw.push(`Limitación: ${limitation}`)
    );
    raw.push(
      `displaySeries en publicación: ${publicationFigureUsesDisplaySeries() ? "sí" : "no"}`
    );
  });
  return forPdf ? raw.map((line) => sanitizeForPdfText(line)) : raw;
};

export const buildVgbPublicationFigureReportSection = (
  artifacts: readonly VgbPublicationFigureArtifact[]
): VgbPublicationFigureReportSection => ({
  title: VGB_PUBLICATION_FIGURE_REPORT_TITLE,
  content: buildLines(artifacts, false),
});

export const buildVgbPublicationFigurePdfReportSection = (
  artifacts: readonly VgbPublicationFigureArtifact[]
): VgbPublicationFigureReportSection => ({
  title: VGB_PUBLICATION_FIGURE_REPORT_TITLE,
  content: buildLines(artifacts, true),
});

export const canIncludeVgbPublicationFiguresInReport = (
  artifacts: readonly VgbPublicationFigureArtifact[] | null | undefined
): artifacts is readonly VgbPublicationFigureArtifact[] =>
  Array.isArray(artifacts) && artifacts.length > 0;

export const replaceVgbPublicationFiguresWithPdfProjection = (input: {
  sections: readonly VgbPublicationFigureReportSection[];
  artifacts: readonly VgbPublicationFigureArtifact[];
  included: boolean;
}): VgbPublicationFigureReportSection[] => {
  const without = input.sections.filter(
    (section) => section.title !== VGB_PUBLICATION_FIGURE_REPORT_TITLE
  );
  if (!input.included || !canIncludeVgbPublicationFiguresInReport(input.artifacts)) {
    return without;
  }
  return [
    ...without,
    buildVgbPublicationFigurePdfReportSection(input.artifacts),
  ];
};

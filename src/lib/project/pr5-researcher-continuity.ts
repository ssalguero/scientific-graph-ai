import type { GeneratedTextReviewValidity } from "@/lib/scientific/contracts";
import type {
  GraphSpecification,
  ProjectVisualGraphEntry,
  VisualGraphBuilderDraft,
} from "@/lib/visualGraphBuilder";
import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { VisualGraphPreview } from "@/lib/visualGraphBuilder";

export const PR5_PDF_CTR08_BLOCK_MESSAGE =
  "El PDF incluye contenido que requiere revisión/aprobación del investigador.";

export const PR5_PDF_CTR08_NEXT_ACTION =
  "Revisar y aprobar el contenido vigente.";

export const PR5_PDF_FIGURE_DOES_NOT_APPROVE_REPORT =
  "Publicar una figura VGB no aprueba el reporte científico.";

export const PR5_REPORT_PUBLICATION_SECTION_DISCLOSURE =
  "El reporte incluye la sección factual «Figuras de publicación (VGB)». Publicar una figura VGB no aprueba el reporte científico.";

export const PR5_MULTIPLE_WORKING_FIGURES_DISCLOSURE =
  "Hay más de una figura de trabajo. Continúe desde Resultados para seleccionar cuál reconstruir. No se elige una figura automáticamente.";

export const PR5_PROJECT_RECOVERY_DISPOSITION =
  "Guardar y Abrir Proyecto recuperan el artefacto durable.";

export const PR5_SESSION_RESTORE_DISPOSITION =
  "Restaurar sesión (ventanas, pestañas o contenido efímero) no está disponible.";

export const PR5_DOMAIN_UNDO_DISPOSITION =
  "Deshacer y rehacer de dominio (datos, gráfico o análisis) no está implementado y permanece diferido.";

export const PR5_LIVE_REPORT_ACTIVE_DATASET =
  "El reporte científico vivo se genera desde el dataset activo.";

export const PR5_PROJECT_PUBLICATION_SCOPE =
  "Las figuras de publicación (VGB) pertenecen al Proyecto, no al dataset activo.";

export const PR5_PUBLICATION_BANNER_NOT_FRESHNESS =
  "El listado de publicación no implica que el reporte vivo del dataset activo contenga esa figura, ni que esté vigente o aprobado.";

export const PR5_ANALYSIS_ROLE =
  "Análisis configura y controla el cálculo. La revisión científica está en Resultados.";

export const PR5_RESULTS_ROLE =
  "Resultados es el centro de revisión científica. Análisis permanece como control.";

export const PR5_GE_VGB_DISTINCT =
  "Constructor y=f(x) (GE) y Constructor Visual (VGB) son capacidades distintas. VGB no alimenta Análisis automáticamente.";

export const PR5_COMPARE_PATH =
  "La comparación se revisa en Resultados. Un snapshot comparativo no se convierte en análisis vivo.";

export const PR5_GATED_MODULE_REASON =
  "Este módulo científico está desactivado. Actívelo en Módulos de la barra lateral para usarlo.";

export const PR5_COMPUTATION_NOT_STOPPED =
  "Ocultar un panel no detiene el cálculo científico mientras haya datos suficientes.";

export const formatPr5ContinuityDisposition = (): string =>
  `${PR5_PROJECT_RECOVERY_DISPOSITION} ${PR5_SESSION_RESTORE_DISPOSITION} ${PR5_DOMAIN_UNDO_DISPOSITION}`;

export const formatPr5ReportPublicationContext = (input: {
  liveReportAvailable: boolean;
  publicationCount: number;
}): string => {
  if (input.publicationCount <= 0) {
    return "";
  }
  const listing = `${PR5_REPORT_PUBLICATION_SECTION_DISCLOSURE} ${input.publicationCount} figura${
    input.publicationCount === 1 ? "" : "s"
  } listada${input.publicationCount === 1 ? "" : "s"}.`;
  if (input.liveReportAvailable) {
    return `${PR5_LIVE_REPORT_ACTIVE_DATASET} ${listing}`;
  }
  return `${PR5_LIVE_REPORT_ACTIVE_DATASET} ${PR5_PROJECT_PUBLICATION_SCOPE} ${PR5_PUBLICATION_BANNER_NOT_FRESHNESS} ${listing}`;
};

export const formatPr5GatedModuleDescription = (
  enabled: boolean,
  description: string
): string =>
  enabled ? description : `${PR5_GATED_MODULE_REASON} ${description}`;

export type ReopenVisualBuilderContext = {
  restoreVisualBuilderView: boolean;
  continueFigureId: string | null;
  multipleWorkingFigures: boolean;
};

export type VgbReviewValidityDisclosure = {
  body: string;
  nextAction: string | null;
};

export const toVisualGraphBuilderDraftFromGraphSpec = (
  graphSpec: GraphSpecification
): VisualGraphBuilderDraft => ({
  graphType: graphSpec.graphType,
  xVariable: graphSpec.xVariable,
  yVariable: graphSpec.yVariable,
  groupVariable: graphSpec.groupVariable,
  color: graphSpec.color,
  marker: graphSpec.marker,
  lineStyle: graphSpec.lineStyle,
  markerSize: graphSpec.markerSize,
  errorBars: graphSpec.errorBars,
  bins: graphSpec.bins,
  title: graphSpec.title,
  colorVariable: graphSpec.colorVariable ?? null,
  sizeVariable: graphSpec.sizeVariable ?? null,
  pcaVariables: graphSpec.pcaVariables ? [...graphSpec.pcaVariables] : [],
  pcaStandardize: graphSpec.pcaStandardize ?? true,
  publicationPresetId: graphSpec.publicationPresetId ?? null,
});

export const preserveWorkingFigureGraphSpecIdentity = (
  applied: GraphSpecification,
  existing: Pick<GraphSpecification, "id" | "createdAt">
): GraphSpecification => ({
  ...applied,
  id: existing.id,
  createdAt: existing.createdAt,
});

export const replaceWorkingVisualGraphEntry = (
  graphs: readonly ProjectVisualGraphEntry[],
  figureId: string,
  applied: {
    graphSpec: GraphSpecification;
    preview: VisualGraphPreview;
    displaySeries: ExperimentalSeries[];
  }
): ProjectVisualGraphEntry[] | null => {
  const existing = graphs.find((entry) => entry.id === figureId);
  if (!existing) {
    return null;
  }
  return graphs.map((entry) =>
    entry.id === figureId
      ? {
          ...existing,
          graphSpec: preserveWorkingFigureGraphSpecIdentity(
            applied.graphSpec,
            existing.graphSpec
          ),
          preview: applied.preview,
          displaySeries: applied.displaySeries,
        }
      : entry
  );
};

export const resolveReopenVisualBuilderContext = (
  visualGraphs: readonly Pick<ProjectVisualGraphEntry, "id">[]
): ReopenVisualBuilderContext => {
  if (visualGraphs.length === 0) {
    return {
      restoreVisualBuilderView: false,
      continueFigureId: null,
      multipleWorkingFigures: false,
    };
  }
  if (visualGraphs.length === 1) {
    return {
      restoreVisualBuilderView: true,
      continueFigureId: visualGraphs[0]!.id,
      multipleWorkingFigures: false,
    };
  }
  return {
    restoreVisualBuilderView: true,
    continueFigureId: null,
    multipleWorkingFigures: true,
  };
};

export const describeVgbReviewValidity = (
  validity: GeneratedTextReviewValidity,
  hasPublication: boolean
): VgbReviewValidityDisclosure => {
  if (validity === "CURRENT") {
    return { body: "", nextAction: null };
  }
  if (validity === "STALE") {
    return {
      body: hasPublication
        ? "La evidencia o proveniencia viva difiere de la aprobación capturada. La figura de publicación inmutable no cambia por este estado."
        : "La evidencia o proveniencia viva difiere de la aprobación capturada.",
      nextAction:
        "Vuelva a revisar la figura de trabajo si desea una aprobación vigente. No se reaprueba en silencio.",
    };
  }
  if (validity === "UNKNOWN") {
    return {
      body: "No se puede verificar la evidencia científica actual de esta figura de trabajo.",
      nextAction:
        "Conserve el registro y compruebe el contexto de datos antes de tratar la aprobación como vigente.",
    };
  }
  return {
    body: hasPublication
      ? "El artefacto de trabajo revisado no es válido y no puede usarse como autoridad vigente. La identidad de publicación, si existe, permanece congelada."
      : "El artefacto de trabajo revisado no es válido y no puede usarse como autoridad vigente.",
    nextAction:
      "No confíe en esta aprobación. Conserve el registro y vuelva a revisar con evidencia válida.",
  };
};

export const formatPdfCtr08BlockMessage = (): string =>
  `${PR5_PDF_CTR08_BLOCK_MESSAGE} ${PR5_PDF_CTR08_NEXT_ACTION} ${PR5_PDF_FIGURE_DOES_NOT_APPROVE_REPORT}`;

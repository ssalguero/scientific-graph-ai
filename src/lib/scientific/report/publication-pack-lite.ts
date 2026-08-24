/**
 * SPE-1.2 Publication Pack Lite — pack semantics (no ZIP, no download I/O).
 * Composes EXPORT-2 PDF + EXPORT-1 companion PNG as the pack contract.
 */

export type PublicationPackLiteStatus =
  | "ready"
  | "pdf-only"
  | "blocked-no-report"
  | "blocked-unapproved-content";

export type PublicationPackLiteInputs = {
  hasScientificReport: boolean;
  hasChartContent: boolean;
  reviewExportAllowed?: boolean;
};

export const PUBLICATION_PACK_LITE_TITLE = "Pack de publicación (Lite)";

export const PUBLICATION_PACK_LITE_SEMANTICS =
  "PDF científico + figura companion PNG. No incluye ZIP ni paquete manuscrito completo.";

export const PUBLICATION_PACK_LITE_MESSAGES = {
  exporting: "Descargando Pack Lite…",
  success: "Pack Lite descargado: PDF + figura companion PNG.",
  pdfOnly:
    "Pack Lite parcial: PDF descargado. Figura companion omitida (sin contenido en el gráfico).",
  blocked: "No hay reporte científico disponible para el Pack Lite.",
  blockedUnapproved:
    "Pack Lite bloqueado: el contenido interpretativo o asesor requiere aprobación investigadora vigente.",
  error: "Error al generar el Pack Lite.",
} as const;

export function resolvePublicationPackLiteStatus(
  inputs: PublicationPackLiteInputs
): PublicationPackLiteStatus {
  if (!inputs.hasScientificReport) {
    return "blocked-no-report";
  }
  if (inputs.reviewExportAllowed === false) {
    return "blocked-unapproved-content";
  }
  if (!inputs.hasChartContent) {
    return "pdf-only";
  }
  return "ready";
}

export function publicationPackLiteStatusMessage(
  status: PublicationPackLiteStatus
): string {
  switch (status) {
    case "ready":
      return PUBLICATION_PACK_LITE_MESSAGES.success;
    case "pdf-only":
      return PUBLICATION_PACK_LITE_MESSAGES.pdfOnly;
    case "blocked-no-report":
      return PUBLICATION_PACK_LITE_MESSAGES.blocked;
    case "blocked-unapproved-content":
      return PUBLICATION_PACK_LITE_MESSAGES.blockedUnapproved;
  }
}

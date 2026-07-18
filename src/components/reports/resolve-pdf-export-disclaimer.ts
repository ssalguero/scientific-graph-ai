export type PdfExportDisclaimerMessages = {
  shortMessage: string;
  longMessage: string;
};

const PDF_EXPORT_DISCLAIMER_SHORT_MESSAGE =
  "El PDF incluye únicamente las secciones alineadas con los toggles de visibilidad activos.";

const PDF_EXPORT_DISCLAIMER_LONG_MESSAGE =
  "La exportación del reporte científico en PDF respeta la política de progressive disclosure (ARCH-6 / EXPORT-2): " +
  "las secciones con política when-visible se incluyen solo si el toggle correspondiente está activo; " +
  "always-include se conservan; never no se exportan. " +
  "Los controles del Inspector de Análisis definen tanto la visualización en Resultados como el contenido del PDF.";

export const resolvePdfExportDisclaimer = (): PdfExportDisclaimerMessages => ({
  shortMessage: PDF_EXPORT_DISCLAIMER_SHORT_MESSAGE,
  longMessage: PDF_EXPORT_DISCLAIMER_LONG_MESSAGE,
});

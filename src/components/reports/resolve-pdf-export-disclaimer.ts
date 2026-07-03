export type PdfExportDisclaimerMessages = {
  shortMessage: string;
  longMessage: string;
};

const PDF_EXPORT_DISCLAIMER_SHORT_MESSAGE =
  "Los toggles controlan la visualización en Resultados; el PDF puede incluir secciones metodológicas aunque los paneles estén ocultos.";

const PDF_EXPORT_DISCLAIMER_LONG_MESSAGE =
  "Los toggles del Inspector de Análisis controlan únicamente la visualización de los paneles en Resultados y Análisis. " +
  "La exportación del reporte científico en PDF puede incluir secciones metodológicas (SCI-50→60) aunque esos paneles estén ocultos. " +
  "Este comportamiento responde a la decisión arquitectónica DA-4 (wont-fix funcional en PROD-2D). " +
  "La alineación completa entre visibilidad y exportación PDF está prevista para PROD-3 / EXPORT-2.";

export const resolvePdfExportDisclaimer = (): PdfExportDisclaimerMessages => ({
  shortMessage: PDF_EXPORT_DISCLAIMER_SHORT_MESSAGE,
  longMessage: PDF_EXPORT_DISCLAIMER_LONG_MESSAGE,
});

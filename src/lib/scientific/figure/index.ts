export {
  VGB_DISPLAY_SERIES_DISPOSITION,
  getVgbDisplaySeriesDisposition,
  isVgbDisplaySeriesAnalysisFeed,
  publicationFigureUsesDisplaySeries,
  shouldPersistVgbDisplaySeries,
} from "./display-series";
export {
  assessVgbVisualTruth,
  canPromoteVgbFigureToPublication,
} from "./eligibility";
export {
  createPublicationVgbFigure,
  createWorkingVgbFigure,
  deriveVgbFigureLifecyclePhase,
  publicationRemainsImmutableAfterWorkingEdit,
  refreshWorkingVgbFigureBinding,
  submitWorkingVgbFigureForReview,
} from "./lifecycle";
export {
  composeVgbFigureProvenance,
} from "./provenance";
export {
  VGB_FIGURE_LIFECYCLE_PROJECT_EXTENSION_KEY,
  appendVgbPublicationFigure,
  getVgbFigureLifecycleStoreFromExtensions,
  getVgbFigureLifecycleStoreFromProject,
  reviveVgbFigureLifecycleStore,
  setVgbFigureLifecycleStoreOnExtensions,
  setVgbFigureLifecycleStoreOnProject,
  upsertWorkingVgbFigureRecord,
} from "./persistence";
export {
  createPublicationVgbFigureNumericExport,
  projectPublicationVgbFigure,
  projectWorkingVgbFigure,
} from "./projection";
export {
  PDF_BLOCK_VGB_PUBLICATION_FIGURES_ID,
  VGB_PUBLICATION_FIGURE_REPORT_TITLE,
  buildVgbPublicationFigurePdfReportSection,
  buildVgbPublicationFigureReportSection,
  canIncludeVgbPublicationFiguresInReport,
  replaceVgbPublicationFiguresWithPdfProjection,
} from "./report";
export {
  approveVgbFigure,
  createVgbFigureReviewRecord,
  reassessVgbFigureReview,
  reviewVgbFigure,
} from "./review";
export {
  buildVgbFigureReviewContent,
  buildVgbFigureReviewEvidence,
  createVgbFigureReviewIdentities,
} from "./binding-helpers";

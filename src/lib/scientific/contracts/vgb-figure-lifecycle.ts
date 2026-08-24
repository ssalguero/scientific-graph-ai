/**
 * CTR-09 — VGB figure lifecycle. Working Figure, Researcher Review and
 * Publication Figure are distinct artifacts; publication is never a status
 * flag on a mutable working graph.
 */
import { isCitableScientificSnapshot } from "./citable-snapshot";
import type { CitableScientificSnapshot } from "./citable-snapshot";
import { fingerprintGeneratedTextValue } from "./generated-text-review";
import {
  canonicalizeScientificValue,
  toScientificValue,
} from "./semantic-values";
import type { GraphSpecification } from "@/lib/visualGraphBuilder";

export const SCIENTIFIC_VGB_FIGURE_LIFECYCLE_SCHEMA =
  "scientific-vgb-figure-lifecycle/v1" as const;
export const SCIENTIFIC_VGB_WORKING_FIGURE_SCHEMA =
  "scientific-vgb-working-figure/v1" as const;
export const SCIENTIFIC_VGB_PUBLICATION_FIGURE_SCHEMA =
  "scientific-vgb-publication-figure/v1" as const;
export const SCIENTIFIC_VGB_FIGURE_LIFECYCLE_STORE_SCHEMA =
  "scientific-vgb-figure-lifecycle-store/v1" as const;

export type VgbFigureLifecycleState =
  | "WORKING"
  | "RESEARCHER_REVIEW"
  | "PUBLICATION";

export type VgbFigureLifecyclePhase = VgbFigureLifecycleState;

export const VGB_FIGURE_LIFECYCLE_STATES = [
  "WORKING",
  "RESEARCHER_REVIEW",
  "PUBLICATION",
] as const satisfies readonly VgbFigureLifecycleState[];

export type VgbDisplaySeriesDisposition = {
  role: "working-figure-runtime-reconstruction";
  persisted: false;
  analysisFeed: false;
  publicationAuthority: false;
};

export const VGB_DISPLAY_SERIES_DISPOSITION = {
  role: "working-figure-runtime-reconstruction",
  persisted: false,
  analysisFeed: false,
  publicationAuthority: false,
} as const satisfies VgbDisplaySeriesDisposition;

export type VgbFigureScientificBinding = {
  graphType: GraphSpecification["graphType"];
  xVariable: GraphSpecification["xVariable"];
  yVariable: GraphSpecification["yVariable"];
  groupVariable: GraphSpecification["groupVariable"];
  colorVariable: GraphSpecification["colorVariable"];
  sizeVariable: GraphSpecification["sizeVariable"];
  errorBars: GraphSpecification["errorBars"];
  bins: GraphSpecification["bins"];
  pcaVariables: GraphSpecification["pcaVariables"];
  pcaStandardize: GraphSpecification["pcaStandardize"];
  xLabel: GraphSpecification["xLabel"];
  yLabel: GraphSpecification["yLabel"];
  groupLabel: GraphSpecification["groupLabel"];
};

export type VgbFigureCosmeticBinding = {
  color: GraphSpecification["color"];
  marker: GraphSpecification["marker"];
  lineStyle: GraphSpecification["lineStyle"];
  markerSize: GraphSpecification["markerSize"];
  publicationPresetId: GraphSpecification["publicationPresetId"];
  title?: GraphSpecification["title"];
};

export type VgbWorkingFigureRecord = {
  schema: typeof SCIENTIFIC_VGB_WORKING_FIGURE_SCHEMA;
  figureId: string;
  lifecycleState: Exclude<VgbFigureLifecycleState, "PUBLICATION">;
  createdAt: string;
  updatedAt: string;
  sourceDatasetId?: string | null;
  scientificFingerprint: string;
  cosmeticFingerprint: string;
  reviewRecordId?: string;
};

export type VgbPublicationFigureArtifact = {
  schema: typeof SCIENTIFIC_VGB_PUBLICATION_FIGURE_SCHEMA;
  publicationId: string;
  publishedAt: string;
  workingFigureId: string;
  reviewRecordId: string;
  graphSpec: GraphSpecification;
  snapshot: CitableScientificSnapshot;
  publicationPresetId: string | null;
  displaySeriesDisposition: VgbDisplaySeriesDisposition;
};

export type VgbFigureLifecycleStore = {
  schema: typeof SCIENTIFIC_VGB_FIGURE_LIFECYCLE_STORE_SCHEMA;
  working: readonly VgbWorkingFigureRecord[];
  publications: readonly VgbPublicationFigureArtifact[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isIsoTimestamp = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
  new Date(value).toISOString() === value;

const GRAPH_TYPES: readonly GraphSpecification["graphType"][] = [
  "scatter",
  "line",
  "bar",
  "histogram",
  "boxPlot",
  "violin",
  "heatmap",
  "bubble",
  "pca",
];

export const extractVgbFigureScientificBinding = (
  spec: GraphSpecification
): VgbFigureScientificBinding => ({
  graphType: spec.graphType,
  xVariable: spec.xVariable,
  yVariable: spec.yVariable,
  groupVariable: spec.groupVariable,
  colorVariable: spec.colorVariable,
  sizeVariable: spec.sizeVariable,
  errorBars: spec.errorBars,
  bins: spec.bins,
  pcaVariables: spec.pcaVariables,
  pcaStandardize: spec.pcaStandardize,
  xLabel: spec.xLabel,
  yLabel: spec.yLabel,
  groupLabel: spec.groupLabel,
});

export const extractVgbFigureCosmeticBinding = (
  spec: GraphSpecification
): VgbFigureCosmeticBinding => ({
  color: spec.color,
  marker: spec.marker,
  lineStyle: spec.lineStyle,
  markerSize: spec.markerSize,
  publicationPresetId: spec.publicationPresetId,
  title: spec.title,
});

export const fingerprintVgbFigureScientificBinding = (
  binding: VgbFigureScientificBinding
): string => fingerprintGeneratedTextValue(binding);

export const fingerprintVgbFigureCosmeticBinding = (
  binding: VgbFigureCosmeticBinding
): string => fingerprintGeneratedTextValue(binding);

export const fingerprintVgbFigureEvidence = (evidence: unknown): string =>
  fingerprintGeneratedTextValue(evidence);

const isGraphSpecification = (value: unknown): value is GraphSpecification =>
  isRecord(value) &&
  GRAPH_TYPES.includes(value.graphType as GraphSpecification["graphType"]) &&
  typeof value.id === "string" &&
  value.id.trim().length > 0 &&
  isIsoTimestamp(value.createdAt) &&
  typeof value.xLabel === "string" &&
  typeof value.yLabel === "string" &&
  (value.groupLabel === null || typeof value.groupLabel === "string") &&
  typeof value.color === "string" &&
  typeof value.marker === "string" &&
  typeof value.lineStyle === "string" &&
  typeof value.markerSize === "number" &&
  Number.isFinite(value.markerSize) &&
  typeof value.errorBars === "string" &&
  typeof value.bins === "number";

export const isVgbWorkingFigureRecord = (
  value: unknown
): value is VgbWorkingFigureRecord =>
  isRecord(value) &&
  value.schema === SCIENTIFIC_VGB_WORKING_FIGURE_SCHEMA &&
  typeof value.figureId === "string" &&
  value.figureId.trim().length > 0 &&
  (value.lifecycleState === "WORKING" ||
    value.lifecycleState === "RESEARCHER_REVIEW") &&
  isIsoTimestamp(value.createdAt) &&
  isIsoTimestamp(value.updatedAt) &&
  typeof value.scientificFingerprint === "string" &&
  value.scientificFingerprint.startsWith("sga-v1-") &&
  typeof value.cosmeticFingerprint === "string" &&
  value.cosmeticFingerprint.startsWith("sga-v1-") &&
  (value.reviewRecordId === undefined ||
    (typeof value.reviewRecordId === "string" &&
      value.reviewRecordId.trim().length > 0)) &&
  (value.sourceDatasetId === undefined ||
    value.sourceDatasetId === null ||
    typeof value.sourceDatasetId === "string");

export const isVgbPublicationFigureArtifact = (
  value: unknown
): value is VgbPublicationFigureArtifact =>
  isRecord(value) &&
  value.schema === SCIENTIFIC_VGB_PUBLICATION_FIGURE_SCHEMA &&
  typeof value.publicationId === "string" &&
  value.publicationId.trim().length > 0 &&
  isIsoTimestamp(value.publishedAt) &&
  typeof value.workingFigureId === "string" &&
  value.workingFigureId.trim().length > 0 &&
  typeof value.reviewRecordId === "string" &&
  value.reviewRecordId.trim().length > 0 &&
  isGraphSpecification(value.graphSpec) &&
  isCitableScientificSnapshot(value.snapshot) &&
  (value.publicationPresetId === null ||
    typeof value.publicationPresetId === "string") &&
  isRecord(value.displaySeriesDisposition) &&
  value.displaySeriesDisposition.role ===
    "working-figure-runtime-reconstruction" &&
  value.displaySeriesDisposition.persisted === false &&
  value.displaySeriesDisposition.analysisFeed === false &&
  value.displaySeriesDisposition.publicationAuthority === false &&
  canonicalizeScientificValue(
    toScientificValue(value.snapshot.semanticValues)
  ).includes("figure.scientificConfiguration");

export const isVgbFigureLifecycleStore = (
  value: unknown
): value is VgbFigureLifecycleStore => {
  if (
    !isRecord(value) ||
    value.schema !== SCIENTIFIC_VGB_FIGURE_LIFECYCLE_STORE_SCHEMA ||
    !Array.isArray(value.working) ||
    !Array.isArray(value.publications)
  ) {
    return false;
  }
  const workingIds = value.working.map((record) =>
    isVgbWorkingFigureRecord(record) ? record.figureId : ""
  );
  const publicationIds = value.publications.map((artifact) =>
    isVgbPublicationFigureArtifact(artifact) ? artifact.publicationId : ""
  );
  return (
    value.working.every(isVgbWorkingFigureRecord) &&
    value.publications.every(isVgbPublicationFigureArtifact) &&
    new Set(workingIds).size === workingIds.length &&
    new Set(publicationIds).size === publicationIds.length
  );
};

const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach((child) => {
      deepFreeze(child);
    });
    Object.freeze(value);
  }
  return value;
};

export const freezeVgbWorkingFigureRecord = (
  record: VgbWorkingFigureRecord
): VgbWorkingFigureRecord =>
  deepFreeze(structuredClone(record)) as VgbWorkingFigureRecord;

export const freezeVgbPublicationFigureArtifact = (
  artifact: VgbPublicationFigureArtifact
): VgbPublicationFigureArtifact =>
  deepFreeze(structuredClone(artifact)) as VgbPublicationFigureArtifact;

export const freezeVgbFigureLifecycleStore = (
  store: VgbFigureLifecycleStore
): VgbFigureLifecycleStore =>
  deepFreeze({
    schema: SCIENTIFIC_VGB_FIGURE_LIFECYCLE_STORE_SCHEMA,
    working: store.working.map((record) =>
      freezeVgbWorkingFigureRecord(record)
    ),
    publications: store.publications.map((artifact) =>
      freezeVgbPublicationFigureArtifact(artifact)
    ),
  }) as VgbFigureLifecycleStore;

let fallbackIdSequence = 0;

export const createVgbPublicationFigureId = (): string => {
  const cryptoApi =
    typeof globalThis !== "undefined"
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;
  if (typeof cryptoApi?.randomUUID === "function") {
    return `vgb-publication-${cryptoApi.randomUUID()}`;
  }
  fallbackIdSequence += 1;
  return `vgb-publication-${Date.now()}-${fallbackIdSequence}`;
};

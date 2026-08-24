import {
  createCitableScientificSnapshot,
  createVgbPublicationFigureId,
  extractVgbFigureCosmeticBinding,
  extractVgbFigureScientificBinding,
  fingerprintVgbFigureCosmeticBinding,
  fingerprintVgbFigureScientificBinding,
  freezeVgbPublicationFigureArtifact,
  freezeVgbWorkingFigureRecord,
  VGB_DISPLAY_SERIES_DISPOSITION,
  type GeneratedTextReviewRecord,
  type VgbFigureLifecyclePhase,
  type VgbPublicationFigureArtifact,
  type VgbWorkingFigureRecord,
} from "@/lib/scientific/contracts";
import type { ScientificSemanticProjection } from "@/lib/scientific/contracts";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";
import {
  assessVgbVisualTruth,
  canPromoteVgbFigureToPublication,
} from "./eligibility";
import { createVgbFigureReviewIdentities } from "./binding-helpers";
import { cloneGraphSpecification } from "@/lib/project/domain/visual-graph-domain";

const assertIso = (value: string, label: string): void => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    throw new Error(`${label} must be an ISO-8601 UTC timestamp.`);
  }
};

export const createWorkingVgbFigure = (input: {
  entry: ProjectVisualGraphEntry;
  at: string;
  sourceDatasetId?: string | null;
}): VgbWorkingFigureRecord => {
  assertIso(input.at, "createdAt");
  const scientificFingerprint = fingerprintVgbFigureScientificBinding(
    extractVgbFigureScientificBinding(input.entry.graphSpec)
  );
  const cosmeticFingerprint = fingerprintVgbFigureCosmeticBinding(
    extractVgbFigureCosmeticBinding(input.entry.graphSpec)
  );
  return freezeVgbWorkingFigureRecord({
    schema: "scientific-vgb-working-figure/v1",
    figureId: input.entry.id,
    lifecycleState: "WORKING",
    createdAt: input.at,
    updatedAt: input.at,
    sourceDatasetId: input.sourceDatasetId ?? null,
    scientificFingerprint,
    cosmeticFingerprint,
  });
};

export const refreshWorkingVgbFigureBinding = (input: {
  record: VgbWorkingFigureRecord;
  entry: ProjectVisualGraphEntry;
  at: string;
}): VgbWorkingFigureRecord => {
  assertIso(input.at, "updatedAt");
  const scientificFingerprint = fingerprintVgbFigureScientificBinding(
    extractVgbFigureScientificBinding(input.entry.graphSpec)
  );
  const cosmeticFingerprint = fingerprintVgbFigureCosmeticBinding(
    extractVgbFigureCosmeticBinding(input.entry.graphSpec)
  );
  const scientificChanged =
    scientificFingerprint !== input.record.scientificFingerprint;
  return freezeVgbWorkingFigureRecord({
    ...input.record,
    scientificFingerprint,
    cosmeticFingerprint,
    lifecycleState: scientificChanged ? "WORKING" : input.record.lifecycleState,
    reviewRecordId: scientificChanged ? undefined : input.record.reviewRecordId,
    updatedAt: input.at,
  });
};

export const submitWorkingVgbFigureForReview = (input: {
  record: VgbWorkingFigureRecord;
  review: GeneratedTextReviewRecord;
  at: string;
}): VgbWorkingFigureRecord => {
  assertIso(input.at, "updatedAt");
  if (input.record.lifecycleState === "RESEARCHER_REVIEW") {
    throw new Error("Figure is already in researcher review.");
  }
  if (
    input.review.state !== "GENERATED" &&
    input.review.state !== "RESEARCHER_REVIEWED"
  ) {
    throw new Error("Review submission requires a CTR-08 review record.");
  }
  return freezeVgbWorkingFigureRecord({
    ...input.record,
    lifecycleState: "RESEARCHER_REVIEW",
    reviewRecordId: input.review.recordId,
    updatedAt: input.at,
  });
};

export const createPublicationVgbFigure = (input: {
  working: VgbWorkingFigureRecord;
  entry: ProjectVisualGraphEntry;
  projection: ScientificSemanticProjection;
  review: GeneratedTextReviewRecord;
  at: string;
  publicationId?: string;
}): VgbPublicationFigureArtifact => {
  assertIso(input.at, "publishedAt");
  if (input.working.lifecycleState !== "RESEARCHER_REVIEW") {
    throw new Error("Publication requires an explicit researcher-review phase.");
  }
  if (input.working.figureId !== input.entry.id) {
    throw new Error("Publication must be bound to the reviewed working figure.");
  }
  if (input.working.reviewRecordId !== input.review.recordId) {
    throw new Error("Publication must use the bound CTR-08 review record.");
  }
  const identities = createVgbFigureReviewIdentities({
    graphSpec: input.entry.graphSpec,
    projection: input.projection,
  });
  if (identities.scientificFingerprint !== input.working.scientificFingerprint) {
    throw new Error("Working figure scientific identity drifted before publication.");
  }
  const visualTruth = assessVgbVisualTruth({
    graphSpec: input.entry.graphSpec,
    projection: input.projection,
  });
  const eligibility = canPromoteVgbFigureToPublication({
    visualTruth,
    review: input.review,
  });
  if (!eligibility.allowed) {
    throw new Error(eligibility.reasons[0] ?? "Figure is not eligible for publication.");
  }
  const snapshot = createCitableScientificSnapshot({
    capturedAt: input.at,
    resultContractId: input.projection.resultContractId,
    provenance: input.projection.provenance,
    semanticValues: input.projection.semanticValues,
    limitations: [
      ...input.projection.limitations,
      "Figura de publicación inmutable; no muta si la figura de trabajo cambia después.",
    ],
  });
  return freezeVgbPublicationFigureArtifact({
    schema: "scientific-vgb-publication-figure/v1",
    publicationId: input.publicationId ?? createVgbPublicationFigureId(),
    publishedAt: input.at,
    workingFigureId: input.working.figureId,
    reviewRecordId: input.review.recordId,
    graphSpec: cloneGraphSpecification(input.entry.graphSpec),
    snapshot,
    publicationPresetId: input.entry.graphSpec.publicationPresetId ?? null,
    displaySeriesDisposition: VGB_DISPLAY_SERIES_DISPOSITION,
  });
};

export const deriveVgbFigureLifecyclePhase = (input: {
  working: VgbWorkingFigureRecord | null;
  publications: readonly VgbPublicationFigureArtifact[];
  currentScientificFingerprint?: string;
  review?: GeneratedTextReviewRecord | null;
}): VgbFigureLifecyclePhase => {
  const working = input.working;
  if (!working) {
    return "WORKING";
  }
  const matchingPublication = input.publications.find(
    (artifact) =>
      artifact.workingFigureId === working.figureId &&
      fingerprintVgbFigureScientificBinding(
        extractVgbFigureScientificBinding(artifact.graphSpec)
      ) ===
        (input.currentScientificFingerprint ?? working.scientificFingerprint)
  );
  if (
    matchingPublication &&
    input.review?.state === "RESEARCHER_APPROVED" &&
    input.review.validity === "CURRENT"
  ) {
    return "PUBLICATION";
  }
  return working.lifecycleState;
};

export const publicationRemainsImmutableAfterWorkingEdit = (input: {
  publication: VgbPublicationFigureArtifact;
  currentEntry: ProjectVisualGraphEntry;
}): boolean =>
  JSON.stringify(input.publication.graphSpec) !==
    JSON.stringify(cloneGraphSpecification(input.currentEntry.graphSpec)) &&
  input.publication.workingFigureId === input.currentEntry.id;

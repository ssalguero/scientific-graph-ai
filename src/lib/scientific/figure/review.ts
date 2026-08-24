import {
  applyGeneratedTextValidityAssessment,
  assessGeneratedTextReviewValidity,
  createLiveGeneratedTextReview,
  markGeneratedTextResearcherReviewed,
  approveGeneratedTextReview,
  type GeneratedTextReviewAction,
} from "@/lib/scientific/report/review-authority";
import type {
  GeneratedTextReviewRecord,
  ScientificSemanticProjection,
} from "@/lib/scientific/contracts";
import type { GraphSpecification } from "@/lib/visualGraphBuilder";
import {
  buildVgbFigureReviewContent,
  buildVgbFigureReviewEvidence,
} from "./binding-helpers";

const FIGURE_REVIEW_PRODUCER = {
  kind: "system" as const,
  id: "vgb-figure-lifecycle",
  label: "VGB figure lifecycle",
  version: "1",
};

export const createVgbFigureReviewRecord = (input: {
  recordId: string;
  figureId: string;
  generatedAt: string;
  graphSpec: GraphSpecification;
  projection: ScientificSemanticProjection;
}): GeneratedTextReviewRecord =>
  createLiveGeneratedTextReview({
    recordId: input.recordId,
    artifactId: input.figureId,
    producer: FIGURE_REVIEW_PRODUCER,
    generatedAt: input.generatedAt,
    content: buildVgbFigureReviewContent({ graphSpec: input.graphSpec }),
    classification: "factual",
    resultContractId: input.projection.resultContractId,
    provenance: input.projection.provenance,
    semanticEvidence: buildVgbFigureReviewEvidence({
      graphSpec: input.graphSpec,
      projection: input.projection,
    }),
  });

export const reviewVgbFigure = (
  record: GeneratedTextReviewRecord,
  action: GeneratedTextReviewAction
): GeneratedTextReviewRecord =>
  markGeneratedTextResearcherReviewed(record, action);

export const approveVgbFigure = (
  record: GeneratedTextReviewRecord,
  action: GeneratedTextReviewAction
): GeneratedTextReviewRecord => approveGeneratedTextReview(record, action);

export const reassessVgbFigureReview = (input: {
  record: GeneratedTextReviewRecord;
  graphSpec: GraphSpecification;
  projection: ScientificSemanticProjection;
  at: string;
}): GeneratedTextReviewRecord =>
  applyGeneratedTextValidityAssessment(
    input.record,
    assessGeneratedTextReviewValidity({
      record: input.record,
      currentContent: buildVgbFigureReviewContent({
        graphSpec: input.graphSpec,
      }),
      currentSemanticEvidence: buildVgbFigureReviewEvidence({
        graphSpec: input.graphSpec,
        projection: input.projection,
      }),
    }),
    input.at
  );

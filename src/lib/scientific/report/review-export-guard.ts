import {
  isGeneratedTextReviewRecord,
  type GeneratedTextReviewRecord,
} from "../contracts/generated-text-review";
import { generatedTextRequiresResearcherApproval } from "./generated-text-classification";

export const GENERATED_TEXT_EXPORT_DISCLOSURE =
  "Generated system text; non-authoritative unless explicitly reviewed and approved by a researcher.";

export type GeneratedTextExportDecision =
  | "OMIT_NOT_INCLUDED"
  | "ALLOW_FACTUAL_WITH_DISCLOSURE"
  | "ALLOW_APPROVED_WITH_DISCLOSURE"
  | "BLOCK_INVALID_RECORD"
  | "BLOCK_NOT_CURRENT"
  | "BLOCK_RESEARCHER_APPROVAL_REQUIRED";

export type GeneratedTextExportGuardResult = {
  included: boolean;
  shouldExport: boolean;
  allowed: boolean;
  decision: GeneratedTextExportDecision;
  disclosure: string | null;
  reasons: readonly string[];
};

export type GuardGeneratedTextExportInput = {
  included: boolean;
  record: GeneratedTextReviewRecord | unknown;
};

/**
 * Inclusion is a presentation choice. Authority is an independent gate:
 * omitting content does not alter its review state, and selecting content does
 * not grant authority.
 */
export const guardGeneratedTextExport = (
  input: GuardGeneratedTextExportInput,
): GeneratedTextExportGuardResult => {
  if (!input.included) {
    return {
      included: false,
      shouldExport: false,
      allowed: true,
      decision: "OMIT_NOT_INCLUDED",
      disclosure: null,
      reasons: ["Generated text was not selected for this export."],
    };
  }
  if (!isGeneratedTextReviewRecord(input.record)) {
    return {
      included: true,
      shouldExport: false,
      allowed: false,
      decision: "BLOCK_INVALID_RECORD",
      disclosure: null,
      reasons: [
        "Included generated text lacks a valid scientific-generated-text-review/v1 record.",
      ],
    };
  }
  const record = input.record;
  if (record.validity !== "CURRENT") {
    return {
      included: true,
      shouldExport: false,
      allowed: false,
      decision: "BLOCK_NOT_CURRENT",
      disclosure: null,
      reasons: [
        `Included generated text is ${record.validity}; only CURRENT content can export.`,
      ],
    };
  }

  const factualSystemContent =
    record.classification === "factual" && record.producer.kind === "system";
  if (factualSystemContent) {
    return {
      included: true,
      shouldExport: true,
      allowed: true,
      decision: "ALLOW_FACTUAL_WITH_DISCLOSURE",
      disclosure: GENERATED_TEXT_EXPORT_DISCLOSURE,
      reasons: [
        "Current factual system content may export without approval when its generated status is disclosed.",
      ],
    };
  }

  if (
    generatedTextRequiresResearcherApproval(record.classification) ||
    record.producer.kind !== "system"
  ) {
    if (record.state !== "RESEARCHER_APPROVED") {
      return {
        included: true,
        shouldExport: false,
        allowed: false,
        decision: "BLOCK_RESEARCHER_APPROVAL_REQUIRED",
        disclosure: null,
        reasons: [
          "Included interpretive, advisory, mixed, or non-system content requires explicit researcher approval.",
        ],
      };
    }
  }

  return {
    included: true,
    shouldExport: true,
    allowed: true,
    decision: "ALLOW_APPROVED_WITH_DISCLOSURE",
    disclosure: GENERATED_TEXT_EXPORT_DISCLOSURE,
    reasons: [
      "Included content is researcher-approved and remains current.",
    ],
  };
};

export const canExportGeneratedText = (
  input: GuardGeneratedTextExportInput,
): boolean => guardGeneratedTextExport(input).allowed;

export type GeneratedTextExportManifest = {
  allowed: boolean;
  decisions: readonly GeneratedTextExportGuardResult[];
  disclosures: readonly string[];
  reasons: readonly string[];
};

export const guardGeneratedTextExportManifest = (
  inputs: readonly GuardGeneratedTextExportInput[],
): GeneratedTextExportManifest => {
  const decisions = inputs.map(guardGeneratedTextExport);
  return {
    allowed: decisions.every((decision) => decision.allowed),
    decisions,
    disclosures: [
      ...new Set(
        decisions
          .map((decision) => decision.disclosure)
          .filter((value): value is string => value !== null),
      ),
    ],
    reasons: decisions
      .filter((decision) => !decision.allowed)
      .flatMap((decision) => decision.reasons),
  };
};

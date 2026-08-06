/**
 * AI-I1 — Contract classification skeleton (shapes only).
 *
 * Authority: AI-P4 Contract Classification Model · AI-P6 AI-I1
 * Frozen conceptual classes — not APIs, DTOs, or runtime surfaces.
 */

export const AI_CONTRACT_CLASSIFICATION = [
  "Internal",
  "External",
  "CrossDomain",
  "Extension",
  "Governance",
] as const;

export type AiContractClassification = (typeof AI_CONTRACT_CLASSIFICATION)[number];

export const AI_CONTRACT_CLASSIFICATION_MEANING = {
  Internal: "Relationships among conceptual components of the AI inventory",
  External: "Exposure of intelligence toward consumers outside the internal nucleus",
  CrossDomain: "Relationships with ENGINE, DATA, UX (and future peers)",
  Extension: "Relationships that enable Extension components / future capabilities",
  Governance:
    "Relationships that express Capability Authority, Component Authority, Optionality, and Non-Authoritative rules",
} as const satisfies Record<AiContractClassification, string>;

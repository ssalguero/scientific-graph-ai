/**
 * AI-I9 — Quality Gate catalog (declarative).
 * Maps hardening concerns to existing AI-I0…I8 validators.
 * Does not reinterpret Planning. Not a consumer API.
 */

export const AiQualityGateId = {
  G1_Foundation: "AI-G1",
  G2_Infrastructure: "AI-G2",
  G3_Core: "AI-G3",
  G4_Contextual: "AI-G4",
  G5_CoreCapabilities: "AI-G5",
  G6_Supporting: "AI-G6",
  G7_Governance: "AI-G7",
  G8_Integration: "AI-G8",
  G9_Extension: "AI-G9",
  G10_Boundaries: "AI-G10",
  G11_Hardening: "AI-G11",
} as const;

export type AiQualityGateId =
  (typeof AiQualityGateId)[keyof typeof AiQualityGateId];

export type AiQualityGateDefinition = {
  readonly id: AiQualityGateId;
  readonly name: string;
  readonly purpose: string;
  readonly npmScript: string;
  readonly phase: string;
};

/** Ordered catalog — consolidates AI-I0…I9 verification. */
export const AI_QUALITY_GATES: readonly AiQualityGateDefinition[] = [
  {
    id: AiQualityGateId.G1_Foundation,
    name: "Foundation",
    purpose: "Package foundation + planning records + identity",
    npmScript: "validate:ai-foundation",
    phase: "AI-I0",
  },
  {
    id: AiQualityGateId.G2_Infrastructure,
    name: "Infrastructure",
    purpose: "Boundaries + classification skeleton + wiring markers",
    npmScript: "validate:ai-infrastructure",
    phase: "AI-I1",
  },
  {
    id: AiQualityGateId.G3_Core,
    name: "Core Intelligence",
    purpose: "Intelligence Generation + Scientific Grounding skeletons",
    npmScript: "validate:ai-core",
    phase: "AI-I2",
  },
  {
    id: AiQualityGateId.G4_Contextual,
    name: "Contextual Assistance",
    purpose: "CA + Recommendation + Explanation skeletons",
    npmScript: "validate:ai-contextual",
    phase: "AI-I3",
  },
  {
    id: AiQualityGateId.G5_CoreCapabilities,
    name: "Core Capabilities",
    purpose: "Analytical Interpretation + Workflow Guidance + core set",
    npmScript: "validate:ai-i4",
    phase: "AI-I4",
  },
  {
    id: AiQualityGateId.G6_Supporting,
    name: "Supporting",
    purpose: "Assistance Context + Catalog + Assumption/Confidence",
    npmScript: "validate:ai-supporting",
    phase: "AI-I5",
  },
  {
    id: AiQualityGateId.G7_Governance,
    name: "Governance",
    purpose: "Capability Governance + Guard + Optionality",
    npmScript: "validate:ai-governance",
    phase: "AI-I6",
  },
  {
    id: AiQualityGateId.G8_Integration,
    name: "Integration",
    purpose: "Cross-domain pathways DATA/ENGINE/UX",
    npmScript: "validate:ai-integration",
    phase: "AI-I7",
  },
  {
    id: AiQualityGateId.G9_Extension,
    name: "Extension",
    purpose: "Certified extension slots only",
    npmScript: "validate:ai-extension",
    phase: "AI-I8",
  },
  {
    id: AiQualityGateId.G10_Boundaries,
    name: "Boundaries",
    purpose: "AI Optional + no foreign internals",
    npmScript: "validate:ai-boundaries",
    phase: "AI-I0+",
  },
  {
    id: AiQualityGateId.G11_Hardening,
    name: "Hardening",
    purpose: "Traceability + consistency + certification readiness",
    npmScript: "validate:ai-hardening",
    phase: "AI-I9",
  },
] as const;

export const AI_QUALITY_GATE_COUNT = AI_QUALITY_GATES.length;

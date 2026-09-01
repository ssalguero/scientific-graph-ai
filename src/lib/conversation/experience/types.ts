/**
 * Product Face + AI Experience contracts.
 * Adapters normalize occupancy. This module is the user-visible conversation brain.
 * Does not mutate workspace state. Does not invoke ENGINE.
 */

import type { ProductScreenId } from "@/lib/product-navigation";

export const SYSTEM_CALCULATION_DISCLOSURE =
  "Calculado por Scientific Graph AI.";

export const AI_EXPLANATION_DISCLOSURE =
  "Explicación / interpretación / consejo generado por IA.";

/** Shown when Preguntar is visible but no generation provider is configured. Not a generated reply. */
export const GENERATION_UNAVAILABLE_DISCLOSURE =
  "La IA conversacional no está configurada en este entorno. Esto no es una respuesta generada.";

export const GENERATION_UNAVAILABLE_MESSAGE =
  "La inteligencia conversacional no está activa en este entorno porque no hay un proveedor de generación configurado. No voy a simular una respuesta. Podés seguir con las Cards.";

export type ConversationSurface =
  | "home"
  | "data"
  | "analysis"
  | "results"
  | "reports";

export type ConversationCapabilityId =
  | "home"
  | "import"
  | "comparison"
  | "graph"
  | "vgb"
  | "analysis"
  | "evaluate"
  | "results"
  | "reports";

/** Approved Analizar domains. R0 exposes the field; R6 assigns real methods. */
export type ScientificModeId =
  | "descriptive"
  | "association"
  | "multivariate"
  | "inference"
  | "modeling";

export type DataViewId =
  | "experimental"
  | "curves"
  | "advanced"
  | "visual-builder";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ProductContext = {
  productScreen: ProductScreenId;
  capability: ConversationCapabilityId;
  scientificMode: ScientificModeId | null;
  /** Derived leftover IDE surface. Not the Product Face identity. */
  surface: ConversationSurface;
  dataView: DataViewId | null;
  comparisonOpen: boolean;
  importActive: boolean;
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
  inspectorCategory: string | null;
  hasExecutedAnalysis: boolean | null;
  hasGraphedCurves: boolean | null;
  hasNonEmptyExpressions: boolean | null;
  constructorPanelOpen: boolean | null;
  slotAOccupied: boolean | null;
  slotBOccupied: boolean | null;
  hasExistingReport: boolean | null;
  hasVgbFigures: boolean | null;
  methodologyActive: boolean | null;
  workflowTemplate: string | null;
  systemObservation: string | null;
};

export type ScientificContext = {
  analysisArea:
    | "mathematics"
    | "statistics"
    | "visualization"
    | "inference"
    | "advisor"
    | null;
  resultOccupancy: "none" | "partial" | "present";
  reportOccupancy: "none" | "present";
};

export type GroundingFact = {
  id: string;
  kind: "product" | "absence" | "scientific" | "boundary";
  title: string;
  statement: string;
  caveat?: string;
};

export type GroundingBundle = {
  facts: GroundingFact[];
  retrievalNotes: string[];
};

export type SafetyVerdict = {
  autonomyRequested: boolean;
  outOfDomain: boolean;
  unsupportedCapability: boolean;
  domainReturnHint: string;
};

export type GenerationRequest = {
  messages: ConversationMessage[];
  product: ProductContext;
  scientific: ScientificContext;
  grounding: GroundingBundle;
  safety: SafetyVerdict;
};

export type GenerationSource = "http-provider" | "unconfigured" | "injected";

export type GenerationResponse = {
  text: string;
  source: GenerationSource;
};

export type GenerationPort = {
  generate(request: GenerationRequest): Promise<GenerationResponse>;
};

export type ConversationTurnInput = {
  text: string;
  history: ConversationMessage[];
  product: ProductContext;
};

export type ConversationTurnResult = {
  text: string;
  source: GenerationSource;
  disclosure:
    | typeof AI_EXPLANATION_DISCLOSURE
    | typeof GENERATION_UNAVAILABLE_DISCLOSURE;
  history: ConversationMessage[];
  safety: SafetyVerdict;
};

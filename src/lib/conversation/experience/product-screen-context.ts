import type { ProductScreenId } from "@/lib/product-navigation";

import type {
  ConversationCapabilityId,
  ConversationSurface,
  ProductContext,
  ScientificModeId,
} from "./types";

export function capabilityFromProductScreen(
  screen: ProductScreenId
): ConversationCapabilityId {
  switch (screen) {
    case "home":
      return "home";
    case "importar":
      return "import";
    case "comparar":
      return "comparison";
    case "graph":
      return "graph";
    case "vgb":
      return "vgb";
    case "analizar":
      return "analysis";
    case "evaluar-metodologia":
      return "evaluate";
    case "results":
      return "results";
    case "reports":
      return "reports";
  }
}

/**
 * Leftover IDE tab for renderer/adapters. Not Face identity.
 */
export function conversationSurfaceFromProductScreen(
  screen: ProductScreenId
): ConversationSurface {
  switch (screen) {
    case "home":
      return "home";
    case "importar":
    case "comparar":
    case "graph":
    case "vgb":
      return "data";
    case "analizar":
    case "evaluar-metodologia":
      return "analysis";
    case "results":
      return "results";
    case "reports":
      return "reports";
  }
}

/**
 * R0 provisional. Does not reorganize Analizar.
 * Mixed inspector "statistics" stays null until R6.
 */
export function scientificModeFromInspectorCategory(
  category: string | null
): ScientificModeId | null {
  if (category === "mathematics") return "modeling";
  if (category === "inference") return "inference";
  return null;
}

export function createProductContext(
  input: Partial<ProductContext> & { productScreen: ProductScreenId }
): ProductContext {
  const productScreen = input.productScreen;
  return {
    productScreen,
    capability:
      input.capability ?? capabilityFromProductScreen(productScreen),
    scientificMode: input.scientificMode ?? null,
    surface:
      input.surface ?? conversationSurfaceFromProductScreen(productScreen),
    dataView: input.dataView ?? null,
    comparisonOpen: input.comparisonOpen ?? false,
    importActive: input.importActive ?? false,
    hasDataset: input.hasDataset ?? null,
    hasExperimentalSeries: input.hasExperimentalSeries ?? null,
    inspectorCategory: input.inspectorCategory ?? null,
    hasExecutedAnalysis: input.hasExecutedAnalysis ?? null,
    hasGraphedCurves: input.hasGraphedCurves ?? null,
    hasNonEmptyExpressions: input.hasNonEmptyExpressions ?? null,
    constructorPanelOpen: input.constructorPanelOpen ?? null,
    slotAOccupied: input.slotAOccupied ?? null,
    slotBOccupied: input.slotBOccupied ?? null,
    hasExistingReport: input.hasExistingReport ?? null,
    hasVgbFigures: input.hasVgbFigures ?? null,
    methodologyActive: input.methodologyActive ?? null,
    workflowTemplate: input.workflowTemplate ?? null,
    systemObservation: input.systemObservation ?? null,
  };
}

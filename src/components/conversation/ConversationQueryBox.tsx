"use client";

import {
  normalizeAnalyzeContext,
  type AnalyzeInspectorCategory,
} from "@/lib/conversation/analyze-adapter";
import { normalizeCompareContext } from "@/lib/conversation/compare-adapter";
import { normalizeMathContext } from "@/lib/conversation/math-adapter";
import { buildSystemContext } from "@/lib/conversation/system-context";
import { ScientificConversationSurface } from "@/components/conversation/ScientificConversationSurface";
import {
  createProductContext,
  scientificModeFromInspectorCategory,
  type ProductContext,
} from "@/lib/conversation/experience";
import type { ProductScreenId } from "@/lib/product-navigation";

export type ConversationQueryBoxProps = {
  productScreen: ProductScreenId;
  workspaceSection: "home" | "data" | "analysis" | "results" | "reports";
  dataWorkspaceView: "experimental" | "curves" | "advanced" | "visual-builder";
  comparisonSurfaceOpen: boolean;
  importDestinationActive: boolean;
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
  inspectorCategory: AnalyzeInspectorCategory | null;
  hasExecutedAnalysis: boolean | null;
  slotAOccupied: boolean | null;
  slotBOccupied: boolean | null;
  slotAFileName: string | null;
  slotBFileName: string | null;
  constructorPanelOpen: boolean | null;
  hasNonEmptyExpressions: boolean | null;
  hasGraphedCurves: boolean | null;
  hasExistingReport?: boolean | null;
  hasVgbFigures?: boolean | null;
  methodologyActive?: boolean | null;
  workflowTemplate?: string | null;
  systemObservation?: string | null;
};

/**
 * Transversal on-demand surface. Same IA as Home. Does not navigate or execute.
 * Adapters normalize occupancy for ProductContext; they are not the conversational brain.
 */
export function ConversationQueryBox({
  productScreen,
  workspaceSection,
  dataWorkspaceView,
  comparisonSurfaceOpen,
  importDestinationActive,
  hasDataset,
  hasExperimentalSeries,
  inspectorCategory,
  hasExecutedAnalysis,
  slotAOccupied,
  slotBOccupied,
  slotAFileName,
  slotBFileName,
  constructorPanelOpen,
  hasNonEmptyExpressions,
  hasGraphedCurves,
  hasExistingReport = null,
  hasVgbFigures = null,
  methodologyActive = null,
  workflowTemplate = null,
  systemObservation = null,
}: ConversationQueryBoxProps) {
  const system = buildSystemContext({
    surface: {
      workspaceSection,
      dataWorkspaceView,
      comparisonSurfaceOpen,
      importDestinationActive,
    },
    hasDataset,
    hasExperimentalSeries,
  });
  const analyzeContext =
    system.activeConversationDomain === "analyze"
      ? normalizeAnalyzeContext({
          hasDataset,
          hasExperimentalSeries,
          inspectorCategory,
          hasExecutedAnalysis,
        })
      : null;
  const compareContext =
    comparisonSurfaceOpen || slotAOccupied === true || slotBOccupied === true
      ? normalizeCompareContext({
          slotAOccupied,
          slotBOccupied,
          slotAFileName,
          slotBFileName,
        })
      : null;
  const mathContext =
    system.activeConversationDomain === "math" ||
    hasNonEmptyExpressions === true ||
    hasGraphedCurves === true
      ? normalizeMathContext({
          constructorPanelOpen,
          hasNonEmptyExpressions,
          hasGraphedCurves,
        })
      : null;

  const product: ProductContext = createProductContext({
    productScreen,
    scientificMode: scientificModeFromInspectorCategory(inspectorCategory),
    surface: workspaceSection,
    dataView: workspaceSection === "data" ? dataWorkspaceView : null,
    comparisonOpen: comparisonSurfaceOpen,
    importActive: importDestinationActive,
    hasDataset,
    hasExperimentalSeries,
    inspectorCategory:
      analyzeContext?.scientificArea?.replace(/_area$/, "") ?? inspectorCategory,
    hasExecutedAnalysis: analyzeContext?.hasExecutedAnalysis ?? hasExecutedAnalysis,
    hasGraphedCurves: mathContext?.hasGraphedCurves ?? hasGraphedCurves,
    hasNonEmptyExpressions:
      mathContext?.hasNonEmptyExpressions ?? hasNonEmptyExpressions,
    constructorPanelOpen:
      mathContext?.constructorPanelOpen ?? constructorPanelOpen,
    slotAOccupied: compareContext?.slotAOccupied ?? slotAOccupied,
    slotBOccupied: compareContext?.slotBOccupied ?? slotBOccupied,
    hasExistingReport,
    hasVgbFigures,
    methodologyActive,
    workflowTemplate,
    systemObservation,
  });

  return <ScientificConversationSurface variant="contextual" product={product} />;
}

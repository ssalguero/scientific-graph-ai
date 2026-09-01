"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import type { LabUsageProfile } from "./labUsageProfile";
import type { IntentRecommendation } from "@/lib/smart-start";
import { productScreenForCardOption } from "@/lib/product-navigation";
import type { ProductScreenId } from "@/lib/product-navigation";
import {
  buildGuidedWorkflowPlan,
  type GuidedWorkflowContext,
  type GuidedWorkflowSession,
  type GuidedWorkflowTemplateId,
} from "@/lib/scientific/workflow";
import type { ComparisonDatasetInfo } from "@/lib/scientific/comparison";
import type { ExperimentalSeries } from "@/lib/experimentalData";

type Curve = { id: number; expression: string; color: string };

export type UseSmartStartParams = {
  projectId: string;
  currentDatasetInfo: ComparisonDatasetInfo | null;
  experimentalSeries: ExperimentalSeries[];
  curves: Curve[];
  chartData: unknown[];
  selectedGraphId: string | null;
  guidedWorkflowSession: GuidedWorkflowSession;
  guidedWorkflowContext: GuidedWorkflowContext;
  labUsageProfile: LabUsageProfile;
  projectPanelRef: RefObject<HTMLDivElement | null>;
  openProjectButtonRef: RefObject<HTMLButtonElement | null>;
  openProductScreen: (screen: ProductScreenId) => void;
  setLabUsageProfile: (profile: LabUsageProfile) => void;
  setExpertModeToastVisible: (visible: boolean) => void;
  setHighlightProjectPanel: (highlight: boolean) => void;
  startGuidedWorkflow: (templateId: GuidedWorkflowTemplateId) => void;
};

export function useSmartStart(params: UseSmartStartParams) {
  const {
    projectId,
    currentDatasetInfo,
    experimentalSeries,
    curves,
    chartData,
    selectedGraphId,
    guidedWorkflowSession,
    guidedWorkflowContext,
    labUsageProfile,
    projectPanelRef,
    openProjectButtonRef,
    openProductScreen,
    setLabUsageProfile,
    setExpertModeToastVisible,
    setHighlightProjectPanel,
    startGuidedWorkflow,
  } = params;

  const [smartStartDismissed, setSmartStartDismissed] = useState(false);
  const [showCompareStepsBanner, setShowCompareStepsBanner] = useState(false);
  const [showPublicationEntryBanner, setShowPublicationEntryBanner] =
    useState(false);

  const isFirstProjectId = useRef(true);
  const openProductScreenRef = useRef(openProductScreen);
  openProductScreenRef.current = openProductScreen;
  useEffect(() => {
    setSmartStartDismissed(false);
    if (isFirstProjectId.current) {
      isFirstProjectId.current = false;
      return;
    }
    openProductScreenRef.current("home");
  }, [projectId]);

  const hasActiveCurveExpressions = curves.some(
    (curve) => curve.expression.trim().length > 0
  );
  const isGuidedWorkflowInactive =
    guidedWorkflowSession.status === "idle" ||
    guidedWorkflowSession.status === "cancelled";
  const showSmartStartScreen =
    !smartStartDismissed &&
    !currentDatasetInfo &&
    experimentalSeries.length === 0 &&
    !hasActiveCurveExpressions &&
    chartData.length === 0 &&
    !selectedGraphId &&
    isGuidedWorkflowInactive;

  const handleSmartStartExpertMode = () => {
    setLabUsageProfile("expert");
    setSmartStartDismissed(true);
    setExpertModeToastVisible(true);
  };

  const handleOpenProjectFromIntent = () => {
    setHighlightProjectPanel(true);
    setSmartStartDismissed(false);
    window.setTimeout(() => {
      projectPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      openProjectButtonRef.current?.focus();
    }, 150);
  };

  const handleSmartStartSelect = (optionId: string) => {
    const screen = productScreenForCardOption(optionId);
    if (!screen) return;
    setSmartStartDismissed(true);
    setShowPublicationEntryBanner(false);
    setHighlightProjectPanel(false);
    switch (optionId) {
      case "analyze-dataset":
        setShowCompareStepsBanner(false);
        break;
      case "compare-datasets":
        if (labUsageProfile === "basic") {
          setLabUsageProfile("standard");
        }
        setShowCompareStepsBanner(true);
        break;
      case "math-graph":
        if (labUsageProfile === "basic") {
          setLabUsageProfile("standard");
        }
        setShowCompareStepsBanner(false);
        break;
      case "constructor-visual":
        if (labUsageProfile === "basic") {
          setLabUsageProfile("standard");
        }
        setShowCompareStepsBanner(false);
        break;
      case "analyze-workspace":
        setShowCompareStepsBanner(false);
        break;
      case "evaluate-publication": {
        setShowCompareStepsBanner(false);
        break;
      }
      default:
        break;
    }
    openProductScreen(screen);
    if (optionId === "compare-datasets") {
      const comparePlan = buildGuidedWorkflowPlan(
        "compare-groups",
        guidedWorkflowContext
      );
      // Stay on comparar. Workflow may activate in-place when groups exist;
      // it must not hop to analizar.
      if (comparePlan) {
        startGuidedWorkflow("compare-groups");
      }
    }
    if (optionId === "evaluate-publication") {
      const plan = buildGuidedWorkflowPlan(
        "evaluate-publication",
        guidedWorkflowContext
      );
      if (plan) {
        startGuidedWorkflow("evaluate-publication");
      } else {
        setShowPublicationEntryBanner(true);
      }
    }
  };
  const handleIntentRecommendationStart = (
    recommendation: IntentRecommendation
  ) => {
    if (recommendation.intentId === "analyze-dataset") {
      if (labUsageProfile === "basic") {
        setLabUsageProfile("standard");
      }
    } else {
      setLabUsageProfile(recommendation.recommendedProfile);
    }
    if (recommendation.intentId === "open-project") {
      handleOpenProjectFromIntent();
      return;
    }
    handleSmartStartSelect(recommendation.intentId);
  };
  const handlePublicationEntryGoToImport = () => {
    setShowPublicationEntryBanner(false);
    openProductScreen("importar");
  };
  const handlePublicationEntryStartWorkflow = () => {
    const plan = buildGuidedWorkflowPlan(
      "evaluate-publication",
      guidedWorkflowContext
    );
    if (plan) {
      setShowPublicationEntryBanner(false);
      startGuidedWorkflow("evaluate-publication");
    }
  };
  const dismissCompareStepsBanner = () => {
    setShowCompareStepsBanner(false);
  };
  const dismissPublicationEntryBanner = () => {
    setShowPublicationEntryBanner(false);
  };

  return {
    showSmartStartScreen,
    showCompareStepsBanner,
    setShowCompareStepsBanner,
    showPublicationEntryBanner,
    smartStartDismissed,
    handleSmartStartSelect,
    handleSmartStartExpertMode,
    handleIntentRecommendationStart,
    handlePublicationEntryGoToImport,
    handlePublicationEntryStartWorkflow,
    dismissCompareStepsBanner,
    dismissPublicationEntryBanner,
  };
}

"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import type { LabUsageProfile } from "./labUsageProfile";
import type { IntentRecommendation, SmartStartNavIntent } from "@/lib/smart-start";
import {
  buildGuidedWorkflowPlan,
  type GuidedWorkflowContext,
  type GuidedWorkflowSession,
  type GuidedWorkflowTemplateId,
} from "@/lib/scientific/workflow";
import type { ComparisonDatasetInfo } from "@/lib/scientific/comparison";
import type { ExperimentalSeries } from "@/lib/experimentalData";

type WorkspaceSection = "home" | "data" | "analysis" | "results" | "reports";

type DataWorkspaceView = "experimental" | "curves" | "advanced" | "visual-builder";

type AnalysisInspectorSection =
  | "visualization"
  | "mathematics"
  | "statistics"
  | "inference"
  | "advisor";

type DataSectionOpen = {
  constructor: boolean;
  import: boolean;
  multiDataset: boolean;
};

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
  dataImportSectionRef: RefObject<HTMLDivElement | null>;
  dataMultiDatasetSectionRef: RefObject<HTMLDivElement | null>;
  dataConstructorSectionRef: RefObject<HTMLDivElement | null>;
  firstCurveExpressionRef: RefObject<HTMLInputElement | null>;
  projectPanelRef: RefObject<HTMLDivElement | null>;
  openProjectButtonRef: RefObject<HTMLButtonElement | null>;
  setActiveWorkspaceSection: (section: WorkspaceSection) => void;
  setDataWorkspaceView: (view: DataWorkspaceView) => void;
  setDataSectionOpen: Dispatch<SetStateAction<DataSectionOpen>>;
  setLabUsageProfile: (profile: LabUsageProfile) => void;
  setStatisticsDashboardsOpen: (open: boolean) => void;
  setExpertModeToastVisible: (visible: boolean) => void;
  setAnalysisInspectorSection: (section: AnalysisInspectorSection) => void;
  setControlPanelTab: (tab: "graph" | "library" | "data") => void;
  setShowMultiDatasetComparison: (show: boolean) => void;
  setHighlightPublicationDashboards: (highlight: boolean) => void;
  setHighlightProjectPanel: (highlight: boolean) => void;
  setImportDestinationActive: (active: boolean) => void;
  importarDestinationRef: RefObject<HTMLDivElement | null>;
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
    dataImportSectionRef,
    dataMultiDatasetSectionRef,
    dataConstructorSectionRef,
    firstCurveExpressionRef,
    projectPanelRef,
    openProjectButtonRef,
    setActiveWorkspaceSection,
    setDataWorkspaceView,
    setDataSectionOpen,
    setLabUsageProfile,
    setStatisticsDashboardsOpen,
    setExpertModeToastVisible,
    setAnalysisInspectorSection,
    setControlPanelTab,
    setShowMultiDatasetComparison,
    setHighlightPublicationDashboards,
    setHighlightProjectPanel,
    setImportDestinationActive,
    importarDestinationRef,
    startGuidedWorkflow,
  } = params;

  const [smartStartDismissed, setSmartStartDismissed] = useState(false);
  const [smartStartNavIntent, setSmartStartNavIntent] =
    useState<SmartStartNavIntent>("idle");
  const [showCompareStepsBanner, setShowCompareStepsBanner] = useState(false);
  const [showPublicationEntryBanner, setShowPublicationEntryBanner] =
    useState(false);

  useEffect(() => {
    setSmartStartDismissed(false);
    setImportDestinationActive(false);
  }, [projectId]);

  useEffect(() => {
    if (smartStartNavIntent === "idle") return;

    const timer = window.setTimeout(() => {
      switch (smartStartNavIntent) {
        case "analyze-dataset":
          importarDestinationRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          break;
        case "compare-datasets":
          dataMultiDatasetSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          break;
        case "evaluate-publication":
          break;
        case "math-graph":
          dataConstructorSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          firstCurveExpressionRef.current?.focus();
          break;
        case "analyze-workspace":
          break;
        default:
          break;
      }
      setSmartStartNavIntent("idle");
    }, 150);

    return () => window.clearTimeout(timer);
  }, [smartStartNavIntent]);

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
  useEffect(() => {
    if (showSmartStartScreen) {
      setActiveWorkspaceSection("home");
    }
  }, [showSmartStartScreen]);

  const handleSmartStartExpertMode = () => {
    setLabUsageProfile("expert");
    setSmartStartDismissed(true);
    setImportDestinationActive(false);
    setActiveWorkspaceSection("data");
    setDataWorkspaceView("advanced");
    setStatisticsDashboardsOpen(true);
    setExpertModeToastVisible(true);
  };
  const selectWorkspaceSection = (section: WorkspaceSection) => {
    setImportDestinationActive(false);
    if (section === "home") {
      setSmartStartDismissed(false);
      setActiveWorkspaceSection("home");
      return;
    }
    setSmartStartDismissed(true);
    setActiveWorkspaceSection(section);
  };
  const handleOpenProjectFromIntent = () => {
    setImportDestinationActive(false);
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
    if (optionId === "expert-mode") {
      handleSmartStartExpertMode();
      return;
    }
    setSmartStartDismissed(true);
    setShowPublicationEntryBanner(false);
    setHighlightPublicationDashboards(false);
    setHighlightProjectPanel(false);
    setImportDestinationActive(false);
    switch (optionId) {
      case "analyze-dataset":
        setActiveWorkspaceSection("data");
        setDataWorkspaceView("experimental");
        setShowCompareStepsBanner(false);
        setDataSectionOpen({
          constructor: false,
          import: true,
          multiDataset: false,
        });
        setImportDestinationActive(true);
        setSmartStartNavIntent("analyze-dataset");
        break;
      case "compare-datasets":
        if (labUsageProfile === "basic") {
          setLabUsageProfile("standard");
        }
        setActiveWorkspaceSection("data");
        setShowMultiDatasetComparison(true);
        setShowCompareStepsBanner(true);
        setDataSectionOpen({
          constructor: false,
          import: false,
          multiDataset: true,
        });
        {
          const comparePlan = buildGuidedWorkflowPlan(
            "compare-groups",
            guidedWorkflowContext
          );
          if (comparePlan) {
            startGuidedWorkflow("compare-groups");
          }
        }
        setSmartStartNavIntent("compare-datasets");
        break;
      case "math-graph":
        if (labUsageProfile === "basic") {
          setLabUsageProfile("standard");
        }
        setActiveWorkspaceSection("data");
        setDataWorkspaceView("curves");
        setControlPanelTab("graph");
        setShowCompareStepsBanner(false);
        setDataSectionOpen({
          constructor: true,
          import: false,
          multiDataset: false,
        });
        setSmartStartNavIntent("math-graph");
        break;
      case "analyze-workspace":
        setActiveWorkspaceSection("analysis");
        setShowCompareStepsBanner(false);
        setSmartStartNavIntent("analyze-workspace");
        break;
      case "evaluate-publication": {
        setActiveWorkspaceSection("analysis");
        setAnalysisInspectorSection("statistics");
        setStatisticsDashboardsOpen(true);
        setHighlightPublicationDashboards(true);
        setShowCompareStepsBanner(false);
        const plan = buildGuidedWorkflowPlan(
          "evaluate-publication",
          guidedWorkflowContext
        );
        if (plan) {
          startGuidedWorkflow("evaluate-publication");
        } else {
          setShowPublicationEntryBanner(true);
        }
        setSmartStartNavIntent("evaluate-publication");
        break;
      }
      case "expert-mode":
        handleSmartStartExpertMode();
        break;
      default:
        break;
    }
  };
  const handleIntentRecommendationStart = (
    recommendation: IntentRecommendation
  ) => {
    setLabUsageProfile(recommendation.recommendedProfile);
    if (recommendation.intentId === "open-project") {
      handleOpenProjectFromIntent();
      return;
    }
    handleSmartStartSelect(recommendation.intentId);
  };
  const handlePublicationEntryGoToImport = () => {
    setShowPublicationEntryBanner(false);
    setActiveWorkspaceSection("data");
    setDataWorkspaceView("experimental");
    setDataSectionOpen({
      constructor: false,
      import: true,
      multiDataset: false,
    });
    setImportDestinationActive(true);
    setSmartStartNavIntent("analyze-dataset");
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
    showPublicationEntryBanner,
    smartStartDismissed,
    smartStartNavIntent,
    handleSmartStartSelect,
    handleSmartStartExpertMode,
    handleIntentRecommendationStart,
    handlePublicationEntryGoToImport,
    handlePublicationEntryStartWorkflow,
    selectWorkspaceSection,
    dismissCompareStepsBanner,
    dismissPublicationEntryBanner,
  };
}

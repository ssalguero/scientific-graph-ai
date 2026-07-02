import { resolvePdfExportPolicy } from "@/lib/scientific/visibility/pdf-export-policy";
import { getToggleRegistryEntry } from "@/lib/scientific/visibility/registry";
import {
  isVisible,
  listKeysByCategory,
  listMethodologyToggles,
} from "@/lib/scientific/visibility/queries";
import type {
  PdfExportPolicy,
  ToggleCategory,
  VisibilityState,
  VisibilityToggleKey,
  VisibilityWorkspaceTab,
} from "@/lib/scientific/visibility/types";

const WORKSPACE_TAB_LABELS: Record<VisibilityWorkspaceTab, string> = {
  analysis: "Análisis",
  results: "Resultados",
  reports: "Reportes",
};

export type ResolveToggleVisibilityHintInput = {
  toggleKey: VisibilityToggleKey;
  state: VisibilityState;
  disabled?: boolean;
};

export type ToggleVisibilityHintMessages = {
  shortMessage: string;
  longMessage: string;
};

export type ResolvedToggleVisibilityHint = ToggleVisibilityHintMessages & {
  shouldShowHint: boolean;
};

const isSci5060DashboardHintKey = (key: VisibilityToggleKey): boolean => {
  const { category, sciId } = getToggleRegistryEntry(key);
  return (
    category === "dashboard" && (sciId === "SCI-56" || sciId === "SCI-60")
  );
};

export const listSci5060HintToggleKeys = (): VisibilityToggleKey[] => [
  ...listMethodologyToggles(),
  ...listKeysByCategory("dashboard").filter(isSci5060DashboardHintKey),
];

export const isSci5060HintToggleKey = (key: VisibilityToggleKey): boolean =>
  listMethodologyToggles().includes(key) || isSci5060DashboardHintKey(key);

const getWorkspaceTabLabel = (
  workspaceTab: VisibilityWorkspaceTab | undefined
): string =>
  workspaceTab ? WORKSPACE_TAB_LABELS[workspaceTab] : "Resultados";

const getShortExportPhrase = (policy: PdfExportPolicy): string => {
  if (policy === "never") {
    return "PDF no incluye";
  }

  return "PDF puede incluir contenido";
};

const getExportPhrase = (policy: PdfExportPolicy): string => {
  if (policy === "never") {
    return "La exportación PDF no incluye esta sección";
  }

  if (policy === "always-include") {
    return "La exportación PDF puede incluir esta sección independientemente del toggle";
  }

  return "La exportación PDF puede incluir esta sección aunque el panel esté oculto";
};

const getCalculationPhrase = (
  sciId: string | undefined,
  category: ToggleCategory
): string => {
  if (
    category === "dashboard" &&
    (sciId === "SCI-56" || sciId === "SCI-60")
  ) {
    return `${sciId} sigue agregándose mientras haya datos suficientes en la cadena metodológica`;
  }

  if (sciId) {
    return `${sciId} sigue evaluándose mientras haya datos suficientes`;
  }

  return "El motor sigue evaluándose mientras haya datos suficientes";
};

const getVisualizationPhrase = (
  workspaceTab: VisibilityWorkspaceTab | undefined
): string => {
  const tabLabel = getWorkspaceTabLabel(workspaceTab);
  return `Este toggle solo controla si el panel aparece en ${tabLabel}`;
};

export const resolveToggleVisibilityShortHint = (
  toggleKey: VisibilityToggleKey
): string => {
  const policy = resolvePdfExportPolicy(toggleKey);
  return `Calculado en segundo plano · Panel oculto · ${getShortExportPhrase(policy)}`;
};

export const resolveToggleVisibilityLongHint = (
  toggleKey: VisibilityToggleKey
): string => {
  const entry = getToggleRegistryEntry(toggleKey);
  const policy = resolvePdfExportPolicy(toggleKey);
  const calculation = getCalculationPhrase(entry.sciId, entry.category);
  const visualization = getVisualizationPhrase(entry.workspaceTab);
  const exportation = getExportPhrase(policy);

  return `${calculation}. ${visualization}. ${exportation}.`;
};

export const resolveToggleVisibilityHint = (
  input: ResolveToggleVisibilityHintInput
): ResolvedToggleVisibilityHint => {
  const { toggleKey, state, disabled = false } = input;

  if (
    disabled ||
    isVisible(state, toggleKey) ||
    !isSci5060HintToggleKey(toggleKey)
  ) {
    return {
      shouldShowHint: false,
      shortMessage: "",
      longMessage: "",
    };
  }

  return {
    shouldShowHint: true,
    shortMessage: resolveToggleVisibilityShortHint(toggleKey),
    longMessage: resolveToggleVisibilityLongHint(toggleKey),
  };
};

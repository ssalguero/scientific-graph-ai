export type LabUsageProfile = "basic" | "standard" | "expert";

export type DataWorkspaceView = "experimental" | "curves" | "advanced";

export type AnalysisInspectorSection =
  | "visualization"
  | "mathematics"
  | "statistics"
  | "inference"
  | "advisor";

export type StatisticsInspectorGroup =
  | "esencial"
  | "descriptiva"
  | "distribucion"
  | "multivariante"
  | "metodologia"
  | "inferencia_avanzada"
  | "dashboards";

export const LAB_USAGE_PROFILE_STORAGE_KEY = "scientific-graph-ai.lab-usage-profile";

export const LAB_USAGE_PROFILE_ORDER: LabUsageProfile[] = [
  "basic",
  "standard",
  "expert",
];

export const LAB_USAGE_PROFILE_META: Record<
  LabUsageProfile,
  { label: string; hint: string }
> = {
  basic: { label: "Básico", hint: "Aprendizaje guiado" },
  standard: { label: "Estándar", hint: "Laboratorio recomendado" },
  expert: { label: "Experto", hint: "Acceso completo" },
};

export function readStoredLabUsageProfile(): LabUsageProfile {
  try {
    const raw = localStorage.getItem(LAB_USAGE_PROFILE_STORAGE_KEY);
    if (raw === "basic" || raw === "standard" || raw === "expert") {
      return raw;
    }
  } catch {
    // ignore storage errors
  }
  return "standard";
}

export function profileShowsDataWorkspaceView(
  view: DataWorkspaceView,
  profile: LabUsageProfile
): boolean {
  if (profile === "basic") {
    return view === "experimental";
  }
  return true;
}

export function profileShowsMultiDataset(profile: LabUsageProfile): boolean {
  return profile !== "basic";
}

export function profileShowsInspectorCategory(
  section: AnalysisInspectorSection,
  profile: LabUsageProfile
): boolean {
  if (profile === "basic") {
    return section === "visualization" || section === "statistics";
  }
  return true;
}

export function profileShowsStatisticsGroup(
  group: StatisticsInspectorGroup,
  profile: LabUsageProfile
): boolean {
  if (profile === "basic") {
    return group === "esencial";
  }
  return true;
}

export function profileShowsAdvancedResults(profile: LabUsageProfile): boolean {
  return profile !== "basic";
}

export function profileShowsGuidedWorkflow(profile: LabUsageProfile): boolean {
  return profile !== "basic";
}

export function profileShowsScientificReport(profile: LabUsageProfile): boolean {
  return profile !== "basic";
}

export function profileShowsReportsCopyPanel(profile: LabUsageProfile): boolean {
  return profile !== "basic";
}

export function profileForcesInspectorGroupsOpen(
  profile: LabUsageProfile
): boolean {
  return profile === "expert";
}

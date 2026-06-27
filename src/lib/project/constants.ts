export const PROJECT_KIND = "scientific-graph-ai.project" as const;

export const SCHEMA_VERSION_V1 = 1 as const;

export const SCHEMA_VERSION_V2 = 2 as const;

export const CURRENT_SCHEMA_VERSION = SCHEMA_VERSION_V2;

/** Soft warning threshold for serialized project size (bytes). */
export const PROJECT_SIZE_WARN_BYTES = 10 * 1024 * 1024;

export const DEFAULT_PROJECT_NAME = "Proyecto sin título";

export const PROJECT_FILE_EXTENSION = ".sgproj";

export const WORKSPACE_SECTIONS = [
  "data",
  "analysis",
  "results",
  "reports",
] as const;

export const INSPECTOR_SECTIONS = [
  "visualization",
  "mathematics",
  "statistics",
  "inference",
  "advisor",
] as const;

export const CONTROL_PANEL_TABS = ["graph", "library", "data"] as const;

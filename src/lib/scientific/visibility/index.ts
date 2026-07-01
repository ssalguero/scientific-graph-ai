export type {
  MethodologyRegistryToggleKey,
  PdfExportPolicy,
  RegistryValidationIssue,
  ToggleCategory,
  ToggleRegistryEntry,
  VisibilityState,
  VisibilityToggleKey,
  VisibilityToggleRegistry,
  VisibilityWorkspaceTab,
} from "./types";

export { createDefaultVisibilityState } from "./defaults";

export {
  applyVisibilityKeys,
  cloneVisibilityState,
  mergeVisibilityState,
} from "./state";

export {
  isVisible,
  listKeysByCategory,
  listMethodologyToggles,
  listVisibleKeys,
  listVisibleKeysByCategory,
  listWorkflowToggleKeys,
} from "./queries";

export {
  isVisibilityRegistryValid,
  validateRegistryDefaultVisibleInvariant,
  validateRegistryParityWithProjectKeys,
  validateVisibilityRegistry,
  validateWorkflowToggleSubset,
} from "./validate";

export {
  resolvePdfExportPolicy,
  resolvePdfSectionsForState,
} from "./pdf-export-policy";

export {
  getToggleRegistryEntry,
  isVisibilityToggleKey,
  METHODOLOGY_REGISTRY_TOGGLE_KEYS,
  VISIBILITY_TOGGLE_KEYS,
  VISIBILITY_TOGGLE_REGISTRY,
} from "./registry";

import { GUIDED_WORKFLOW_TOGGLE_KEYS_V1, VISIBILITY_KEYS_V1 } from "@/lib/project/keys";
import {
  createAssertCase,
  type AssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  getToggleRegistryEntry,
  METHODOLOGY_REGISTRY_TOGGLE_KEYS,
  VISIBILITY_TOGGLE_KEYS,
  VISIBILITY_TOGGLE_REGISTRY,
} from "../registry";
import {
  isVisibilityRegistryValid,
  validateRegistryParityWithProjectKeys,
  validateWorkflowToggleSubset,
} from "../validate";

const METHODOLOGY_SCI_IDS = [
  "SCI-50",
  "SCI-51",
  "SCI-52",
  "SCI-53",
  "SCI-54",
  "SCI-55",
] as const;

export const runVisibilityRegistryCases = (assertCase: AssertCase): void => {
  assertCase(
    "registry.parity.keyCount",
    VISIBILITY_TOGGLE_KEYS.length === VISIBILITY_KEYS_V1.length &&
      VISIBILITY_TOGGLE_KEYS.length > 0
  );

  assertCase(
    "registry.parity.everyProjectKeyInRegistry",
    VISIBILITY_KEYS_V1.every((key) => key in VISIBILITY_TOGGLE_REGISTRY)
  );

  assertCase(
    "registry.parity.noOrphanKeys",
    validateRegistryParityWithProjectKeys().length === 0
  );

  assertCase(
    "registry.parity.workflowSubset",
    validateWorkflowToggleSubset().length === 0 &&
      GUIDED_WORKFLOW_TOGGLE_KEYS_V1.every((key) => key in VISIBILITY_TOGGLE_REGISTRY)
  );

  assertCase(
    "registry.methodology.sci50to55Entries",
    METHODOLOGY_REGISTRY_TOGGLE_KEYS.length === 6 &&
      METHODOLOGY_SCI_IDS.every(
        (sciId, index) =>
          getToggleRegistryEntry(METHODOLOGY_REGISTRY_TOGGLE_KEYS[index]).sciId ===
          sciId
      )
  );

  assertCase(
    "registry.dashboard.multiDatasetComparisonSci58",
    getToggleRegistryEntry("showMultiDatasetComparison").category === "dashboard" &&
      getToggleRegistryEntry("showMultiDatasetComparison").sciId === "SCI-58"
  );

  assertCase(
    "registry.dashboard.methodologicalAndPublication",
    getToggleRegistryEntry("showMethodologicalDashboard").sciId === "SCI-56" &&
      getToggleRegistryEntry("showPublicationDashboard").sciId === "SCI-60"
  );

  assertCase(
    "registry.graphMath.neverPdfPolicy",
    getToggleRegistryEntry("showDerivative").pdfExportPolicy === "never" &&
      getToggleRegistryEntry("showIntegral").pdfExportPolicy === "never"
  );

  assertCase(
    "registry.validate.fullRegistryValid",
    isVisibilityRegistryValid()
  );
};

export const runVisibilityRegistryCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runVisibilityRegistryCases(assertCase);
  return results;
};

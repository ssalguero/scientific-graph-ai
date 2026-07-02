import {
  createAssertCase,
  type AssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";
import { GUIDED_WORKFLOW_TOGGLE_KEYS_V1 } from "@/lib/project/keys";

import { createDefaultVisibilityState } from "../defaults";
import {
  isVisible,
  listMethodologyToggles,
  listVisibleKeys,
  listVisibleKeysByCategory,
  listWorkflowToggleKeys,
} from "../queries";
import {
  applyVisibilityKeys,
  cloneVisibilityState,
  mergeVisibilityState,
} from "../state";
import { VISIBILITY_TOGGLE_KEYS } from "../registry";
import type { VisibilityState } from "../types";

export const runVisibilityStateCases = (assertCase: AssertCase): void => {
  const defaults = createDefaultVisibilityState();

  assertCase(
    "defaults.allOff",
    VISIBILITY_TOGGLE_KEYS.every((key) => defaults[key] === false)
  );

  assertCase(
    "defaults.methodologyOff",
    listMethodologyToggles().every((key) => defaults[key] === false)
  );

  assertCase(
    "defaults.dashboardSci5660Off",
    defaults.showMethodologicalDashboard === false &&
      defaults.showPublicationDashboard === false
  );

  assertCase(
    "defaults.stableKeyCount",
    Object.keys(defaults).length === VISIBILITY_TOGGLE_KEYS.length
  );

  const base = createDefaultVisibilityState();
  const cloned = cloneVisibilityState(base);
  cloned.showStatistics = true;
  assertCase(
    "state.clone.immutable",
    base.showStatistics === false && cloned.showStatistics === true
  );

  const merged = mergeVisibilityState(base, {
    showStatistics: true,
    showPCA: true,
  });
  assertCase(
    "state.merge.updatesPatchKeys",
    merged.showStatistics === true &&
      merged.showPCA === true &&
      merged.showConsistencyEngine === false
  );

  const withUnknown = mergeVisibilityState(base, {
    showStatistics: true,
    showPCA: "yes" as unknown as boolean,
    notARealKey: true,
  } as VisibilityState);
  assertCase(
    "state.merge.ignoresUnknownAndNonBoolean",
    withUnknown.showStatistics === true &&
      !("notARealKey" in withUnknown) &&
      withUnknown.showPCA === false
  );

  const applied = applyVisibilityKeys(base, ["showConsistencyEngine"], true);
  assertCase(
    "state.applyVisibilityKeys.immutable",
    base.showConsistencyEngine === false &&
      applied.showConsistencyEngine === true
  );

  const noop = applyVisibilityKeys(base, [], true);
  assertCase(
    "state.applyVisibilityKeys.emptyNoOp",
    VISIBILITY_TOGGLE_KEYS.every((key) => noop[key] === base[key])
  );

  assertCase(
    "query.isVisible.missingUsesDefaultOff",
    isVisible({}, "showConsistencyEngine") === false
  );

  assertCase(
    "query.isVisible.explicitTrue",
    isVisible({ showConsistencyEngine: true }, "showConsistencyEngine") === true
  );

  assertCase(
    "query.listWorkflowToggleKeys.count",
    listWorkflowToggleKeys().length === GUIDED_WORKFLOW_TOGGLE_KEYS_V1.length
  );

  const visibleState = applyVisibilityKeys(
    createDefaultVisibilityState(),
    ["showConsistencyEngine", "showStatistics"],
    true
  );
  assertCase(
    "query.listVisibleKeys.filtersOn",
    listVisibleKeys(visibleState).includes("showConsistencyEngine") &&
      listVisibleKeys(visibleState).includes("showStatistics") &&
      listVisibleKeys(visibleState).length === 2
  );

  assertCase(
    "query.listVisibleKeysByCategory.methodology",
    listVisibleKeysByCategory(visibleState, "methodology").length === 1 &&
      listVisibleKeysByCategory(visibleState, "methodology")[0] ===
        "showConsistencyEngine"
  );
};

export const runVisibilityStateCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runVisibilityStateCases(assertCase);
  return results;
};

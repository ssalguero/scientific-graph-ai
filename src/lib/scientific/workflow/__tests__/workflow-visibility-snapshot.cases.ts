import {
  createAssertCase,
  type AssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";
import { GUIDED_WORKFLOW_TOGGLE_KEYS_V1 } from "@/lib/project/keys";
import { createDefaultVisibilityState } from "@/lib/scientific/visibility/defaults";
import { listWorkflowToggleKeys } from "@/lib/scientific/visibility/queries";
import { applyVisibilityKeys } from "@/lib/scientific/visibility/state";
import type { VisibilityState } from "@/lib/scientific/visibility/types";

import { applyGuidedWorkflowToggles } from "../apply";
import { buildEvaluatePublicationWorkflowSteps } from "../templates";
import type { GuidedWorkflowToggleKey, GuidedWorkflowToggleSetters } from "../toggles";
import {
  captureWorkflowVisibilitySnapshot,
  restoreWorkflowVisibilitySnapshot,
  type WorkflowVisibilitySnapshot,
} from "../snapshot";

const createMutableWorkflowState = (
  initial: VisibilityState = createDefaultVisibilityState()
): {
  state: VisibilityState;
  setters: GuidedWorkflowToggleSetters;
} => {
  const state: VisibilityState = { ...initial };

  const setters = {} as GuidedWorkflowToggleSetters;
  for (const key of listWorkflowToggleKeys()) {
    const toggleKey = key as GuidedWorkflowToggleKey;
    setters[toggleKey] = (value: boolean) => {
      state[toggleKey] = value;
    };
  }

  return { state, setters };
};

const readWorkflowToggleValues = (
  state: VisibilityState
): WorkflowVisibilitySnapshot => captureWorkflowVisibilitySnapshot(state);

const snapshotsEqual = (
  left: WorkflowVisibilitySnapshot,
  right: WorkflowVisibilitySnapshot
): boolean =>
  listWorkflowToggleKeys().every(
    (key) =>
      left[key as GuidedWorkflowToggleKey] === right[key as GuidedWorkflowToggleKey]
  );

export const runWorkflowVisibilitySnapshotCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase: AssertCase = createAssertCase(results);

  const defaults = createDefaultVisibilityState();
  const w1Snapshot = captureWorkflowVisibilitySnapshot(defaults);
  assertCase(
    "W1.capture.defaultAllOff",
    listWorkflowToggleKeys().every((key) => w1Snapshot[key as GuidedWorkflowToggleKey] === false)
  );

  const preStart = applyVisibilityKeys(defaults, ["showStatistics", "showPCA"], true);
  const w2Snapshot = captureWorkflowVisibilitySnapshot(preStart);
  const { state: w2State, setters: w2Setters } = createMutableWorkflowState(preStart);
  applyGuidedWorkflowToggles(["showConsistencyEngine"], w2Setters);
  restoreWorkflowVisibilitySnapshot(w2Snapshot, w2Setters);
  assertCase(
    "W2.capture.mixOnOff.roundTripRestore",
    snapshotsEqual(readWorkflowToggleValues(w2State), w2Snapshot)
  );

  const t3Steps = buildEvaluatePublicationWorkflowSteps();
  const { state: w3State, setters: w3Setters } = createMutableWorkflowState(defaults);
  const w3Initial = captureWorkflowVisibilitySnapshot(w3State);
  applyGuidedWorkflowToggles(t3Steps[0]!.toggles, w3Setters);
  applyGuidedWorkflowToggles(t3Steps[1]!.toggles, w3Setters);
  restoreWorkflowVisibilitySnapshot(w3Initial, w3Setters);
  assertCase(
    "W3.t3.step1And2.cancelRestoreEqualsPreStart",
    snapshotsEqual(readWorkflowToggleValues(w3State), w3Initial)
  );

  const w4Snapshot = captureWorkflowVisibilitySnapshot({
    ...defaults,
    showDerivative: true,
    showOutliers: true,
  });
  assertCase(
    "W4.snapshot.excludesNonWorkflowKeys",
    !("showDerivative" in w4Snapshot) && !("showOutliers" in w4Snapshot)
  );

  const workflowKeys = listWorkflowToggleKeys();
  assertCase(
    "W5.parity.workflowKeyCount25",
    workflowKeys.length === 25 &&
      GUIDED_WORKFLOW_TOGGLE_KEYS_V1.every((key) =>
        workflowKeys.includes(key)
      )
  );

  const w6Base = captureWorkflowVisibilitySnapshot(defaults);
  const w6Clone = { ...w6Base, showStatistics: true } as WorkflowVisibilitySnapshot;
  assertCase(
    "W6.snapshot.captureIndependentCopy",
    w6Base.showStatistics === false && w6Clone.showStatistics === true
  );

  const w7Snapshot = captureWorkflowVisibilitySnapshot(defaults);
  const w7Invocations: GuidedWorkflowToggleKey[] = [];
  const w7Setters = {} as GuidedWorkflowToggleSetters;
  for (const key of listWorkflowToggleKeys()) {
    const toggleKey = key as GuidedWorkflowToggleKey;
    w7Setters[toggleKey] = (value: boolean) => {
      w7Invocations.push(toggleKey);
      void value;
    };
  }
  restoreWorkflowVisibilitySnapshot(w7Snapshot, w7Setters);
  assertCase(
    "W7.restore.invokes25Setters",
    w7Invocations.length === 25
  );

  const { state: w8State, setters: w8Setters } = createMutableWorkflowState(defaults);
  const w8Initial = captureWorkflowVisibilitySnapshot(w8State);
  applyGuidedWorkflowToggles(t3Steps[0]!.toggles, w8Setters);
  restoreWorkflowVisibilitySnapshot(w8Initial, w8Setters);
  assertCase(
    "W8.skipScenario.singleStepRestoreEqualsPreStart",
    snapshotsEqual(readWorkflowToggleValues(w8State), w8Initial)
  );

  const w9PreStart = applyVisibilityKeys(defaults, ["showStatistics"], true);
  const { state: w9State, setters: w9Setters } = createMutableWorkflowState(w9PreStart);
  const w9Initial = captureWorkflowVisibilitySnapshot(w9State);
  applyGuidedWorkflowToggles(t3Steps[0]!.toggles, w9Setters);
  w9Setters.showPublicationDashboard(true);
  restoreWorkflowVisibilitySnapshot(w9Initial, w9Setters);
  assertCase(
    "W9.manualMidWorkflow.discardedOnRestore",
    snapshotsEqual(readWorkflowToggleValues(w9State), w9Initial) &&
      w9State.showPublicationDashboard === w9Initial.showPublicationDashboard
  );

  return results;
};

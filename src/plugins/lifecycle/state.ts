/**
 * PLUGINS-I6 — Lifecycle state model (P5 vocabulary).
 *
 * Active = activated / Execution-eligible conceptually — NOT executing.
 * Eligible (user-facing) maps to activationEligibility, not a new state.
 */

import type { PluginLifecycleState } from "../types";
import type {
  LifecycleActivationEligibility,
  LifecyclePluginRecord,
} from "./descriptors";

export const PLUGINS_LIFECYCLE_STATES = [
  "Discovered",
  "Validated",
  "Registered",
  "Active",
  "Inactive",
  "Suspended",
  "Updating",
  "Invalid",
  "Removed",
] as const satisfies readonly PluginLifecycleState[];

export type LifecycleEngineState = {
  readonly __kind: "LifecycleEngineState";
  readonly __ownsRegistry: false;
  readonly __executionImplemented: false;
  readonly records: readonly LifecyclePluginRecord[];
  readonly recordCount: number;
};

export function createEmptyLifecycleEngineState(): LifecycleEngineState {
  return {
    __kind: "LifecycleEngineState",
    __ownsRegistry: false,
    __executionImplemented: false,
    records: [],
    recordCount: 0,
  };
}

export function createLifecyclePluginRecord(
  identity: string,
  state: PluginLifecycleState,
  activationEligibility: LifecycleActivationEligibility,
): LifecyclePluginRecord {
  return {
    __kind: "LifecyclePluginRecord",
    __executionImplied: false,
    identity,
    state,
    activationEligibility,
    activationEligible: activationEligibility === "Eligible",
    activeMeansExecuting: false,
  };
}

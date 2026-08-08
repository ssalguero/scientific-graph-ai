/**
 * PLUGINS-I6 — Lifecycle descriptors.
 *
 * "Eligible" is an activation-eligibility decision (P5 Inactive awaiting Activation).
 * It is not a new PluginLifecycleState — P5 vocabulary remains frozen.
 * "Active" is lifecycle state only — never implies execution.
 */

import type { PluginLifecycleState } from "../types";

export type LifecycleActivationEligibility =
  | "Eligible"
  | "Ineligible";

export type LifecyclePluginRecord = {
  readonly __kind: "LifecyclePluginRecord";
  readonly __executionImplied: false;
  readonly identity: string;
  readonly state: PluginLifecycleState;
  readonly activationEligibility: LifecycleActivationEligibility;
  readonly activationEligible: boolean;
  /** Conceptual only — Active never means executing. */
  readonly activeMeansExecuting: false;
};

export type LifecycleDecision = {
  readonly __kind: "LifecycleDecision";
  readonly __structuralOnly: true;
  readonly __executionDeferred: true;
  readonly identity: string;
  readonly fromState: PluginLifecycleState;
  readonly toState: PluginLifecycleState;
  readonly activationEligibility: LifecycleActivationEligibility;
  readonly reason: string;
};

export type LifecycleDiagnostic =
  | { readonly code: "CONTRACT_CONSUMED"; readonly message: string }
  | { readonly code: "ACTIVATION_ELIGIBLE"; readonly message: string; readonly identity: string }
  | { readonly code: "ACTIVATION_INELIGIBLE"; readonly message: string; readonly identity: string }
  | { readonly code: "TRANSITION_APPLIED"; readonly message: string; readonly identity: string }
  | { readonly code: "TRANSITION_REJECTED"; readonly message: string; readonly identity: string }
  | { readonly code: "INVALID_CONTRACT"; readonly message: string };

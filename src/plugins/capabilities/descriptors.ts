/**
 * PLUGINS-I4 — Capability descriptors (declarative / never inferred).
 */

import type { CapabilityId, PluginIdentity } from "../types";

/** Availability classification — advisory until Lifecycle (I6) consumes results. */
export type CapabilityAvailability =
  | "Declared"
  | "Undeclared"
  | "AbsentFromRegistry";

export type CapabilityDescriptor = {
  readonly __kind: "CapabilityDescriptor";
  readonly __inferred: false;
  readonly __activatable: false;
  readonly __executable: false;
  readonly capabilityId: CapabilityId;
  readonly pluginIdentity?: PluginIdentity;
};

export type CapabilityEvaluationRecord = {
  readonly __kind: "CapabilityEvaluationRecord";
  readonly __advisory: true;
  readonly capabilityId: CapabilityId;
  readonly pluginIdentity?: PluginIdentity;
  readonly availability: CapabilityAvailability;
  readonly declared: boolean;
};

export type CapabilityDiagnostic =
  | { readonly code: "EMPTY_CAPABILITY_ID"; readonly message: string }
  | {
      readonly code: "UNDECLARED_CAPABILITY";
      readonly message: string;
      readonly capabilityId: string;
    }
  | {
      readonly code: "PLUGIN_NOT_REGISTERED";
      readonly message: string;
      readonly pluginIdentity: string;
    };

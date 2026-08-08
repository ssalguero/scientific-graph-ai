/**
 * PLUGINS-I3 — Discovery descriptors (inert).
 *
 * Produced by Discovery. Never written into Registry by Discovery.
 */

import type { CapabilityId, PluginIdentity, PluginVersion } from "../types";

export type PluginDiscoveryCandidate = {
  readonly identity: string;
  readonly version?: string;
  readonly declaredCapabilityIds?: readonly string[];
};

export type PluginDiscoveryDescriptor = {
  readonly __kind: "PluginDiscoveryDescriptor";
  readonly __inert: true;
  readonly __activatable: false;
  readonly __executable: false;
  readonly identity: PluginIdentity;
  readonly version?: PluginVersion;
  readonly declaredCapabilityIds: readonly CapabilityId[];
};

export type DiscoveryDiagnostic =
  | { readonly code: "EMPTY_IDENTITY"; readonly message: string }
  | { readonly code: "DUPLICATE_CANDIDATE"; readonly message: string; readonly identity: string }
  | { readonly code: "INVALID_CAPABILITY_ID"; readonly message: string };

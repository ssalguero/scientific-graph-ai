/**
 * PLUGINS-I3 — Registration descriptors (structural eligibility).
 */

import type { PluginDiscoveryDescriptor } from "../discovery/descriptors";
import type { PluginRegistryEntry } from "../registry/state";

export type PluginRegistrationDescriptor = {
  readonly __kind: "PluginRegistrationDescriptor";
  readonly __fromDiscovery: true;
  readonly __activatable: false;
  readonly discovery: PluginDiscoveryDescriptor;
};

export type RegistrationDiagnostic =
  | { readonly code: "MISSING_IDENTITY"; readonly message: string }
  | { readonly code: "REGISTRY_REJECTED"; readonly message: string }
  | { readonly code: "NOT_INERT"; readonly message: string };

export type RegistrationSuccess = {
  readonly ok: true;
  readonly entry: PluginRegistryEntry;
  readonly descriptor: PluginRegistrationDescriptor;
};

export type RegistrationFailure = {
  readonly ok: false;
  readonly error: string;
  readonly diagnostic: RegistrationDiagnostic;
};

export type RegistrationResult = RegistrationSuccess | RegistrationFailure;

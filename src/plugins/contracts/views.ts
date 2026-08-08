/**
 * PLUGINS-I5 — Public Contract Views (certified public surface).
 *
 * These views are the only extensibility-facing shapes produced by I5.
 * They must not embed Registry State, Store, Framework wiring, or lifecycle state.
 */

import type { PublicPluginContractCategory } from "./catalog";
import type {
  PublicContractDiagnostic,
  PublicContractMetadata,
} from "./descriptors";

/** Public projection of a registered plugin — no Registry entry internals. */
export type PublicRegisteredPluginView = {
  readonly __view: "PublicRegisteredPluginView";
  readonly identity: string;
  readonly version?: string;
  readonly declaredCapabilityIds: readonly string[];
};

/** Advisory capability exposure — Contracts never re-evaluate. */
export type PublicCapabilityAdvisoryView = {
  readonly __view: "PublicCapabilityAdvisoryView";
  readonly __advisory: true;
  readonly capabilityId: string;
  readonly pluginIdentity?: string;
  readonly availability: string;
  readonly declared: boolean;
};

/** Advisory permission exposure — Contracts never re-evaluate. */
export type PublicPermissionAdvisoryView = {
  readonly __view: "PublicPermissionAdvisoryView";
  readonly __advisory: true;
  readonly permissionId: string;
  readonly capabilityId: string;
  readonly pluginIdentity?: string;
  readonly status: string;
  readonly capabilityDeclared: boolean;
};

/**
 * Certified Public Plugin Contract view.
 * Lifecycle (I6) is the first authorized consumer of this surface.
 */
export type PublicPluginContractView = {
  readonly __kind: "PublicPluginContractView";
  readonly __certifiedPublicSurface: true;
  readonly __extensible: true;
  readonly __exposesRegistryInternals: false;
  readonly __exposesFrameworkInternals: false;
  readonly __exposesStore: false;
  readonly __mutable: false;
  readonly __activatesPlugins: false;
  readonly __executesPlugins: false;
  readonly contractId: string;
  readonly category: PublicPluginContractCategory;
  readonly versionLabel: string;
  readonly plugins: readonly PublicRegisteredPluginView[];
  readonly capabilities: readonly PublicCapabilityAdvisoryView[];
  readonly permissions: readonly PublicPermissionAdvisoryView[];
  readonly metadata: PublicContractMetadata;
  readonly diagnostics: readonly PublicContractDiagnostic[];
};

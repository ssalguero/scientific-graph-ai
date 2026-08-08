/**
 * PLUGINS-I5 — Contract Adapter layer.
 *
 * Mandatory path:
 *   Registry Read View / Advisory Results
 *         │
 *         ▼
 *   Contract Adapter
 *         │
 *         ▼
 *   Public Contract View
 *
 * Adapter never evaluates capabilities/permissions.
 * Adapter never mutates Registry.
 * Adapter never re-exports Registry/Store/Framework types on the public view.
 */

import type { CapabilityEvaluationRecord } from "../capabilities/descriptors";
import type { PermissionEvaluationRecord } from "../permissions/descriptors";
import type { PluginRegistryReadView } from "../registry/read-view";
import {
  PLUGINS_PUBLIC_PLUGIN_CONTRACT_ID,
  type PublicPluginContractCategory,
} from "./catalog";
import type {
  PublicContractDiagnostic,
  PublicContractMetadata,
} from "./descriptors";
import type {
  PublicCapabilityAdvisoryView,
  PublicPermissionAdvisoryView,
  PublicPluginContractView,
  PublicRegisteredPluginView,
} from "./views";

export type PublicContractAdapterOptions = {
  readonly category?: PublicPluginContractCategory;
  readonly versionLabel?: string;
  readonly contractId?: string;
};

/**
 * Project Registry Read View → public plugin views.
 * Drops all Registry entry internal markers (__kind, __populatedBy, ordinals).
 */
export function projectRegistryReadView(
  readView: PluginRegistryReadView,
): readonly PublicRegisteredPluginView[] {
  const state = readView.getState();
  return state.entries.map((entry) => ({
    __view: "PublicRegisteredPluginView" as const,
    identity: String(entry.identity),
    version: entry.version != null ? String(entry.version) : undefined,
    declaredCapabilityIds: entry.declaredCapabilityIds.map((c) => String(c)),
  }));
}

/**
 * Project advisory capability records → public advisory views.
 * Does not call capability evaluation.
 */
export function projectCapabilityAdvisories(
  records: readonly CapabilityEvaluationRecord[],
): readonly PublicCapabilityAdvisoryView[] {
  return records.map((r) => ({
    __view: "PublicCapabilityAdvisoryView" as const,
    __advisory: true as const,
    capabilityId: String(r.capabilityId),
    pluginIdentity:
      r.pluginIdentity != null ? String(r.pluginIdentity) : undefined,
    availability: r.availability,
    declared: r.declared,
  }));
}

/**
 * Project advisory permission records → public advisory views.
 * Does not call permission evaluation.
 */
export function projectPermissionAdvisories(
  records: readonly PermissionEvaluationRecord[],
): readonly PublicPermissionAdvisoryView[] {
  return records.map((r) => ({
    __view: "PublicPermissionAdvisoryView" as const,
    __advisory: true as const,
    permissionId: String(r.permissionId),
    capabilityId: String(r.capabilityId),
    pluginIdentity:
      r.pluginIdentity != null ? String(r.pluginIdentity) : undefined,
    status: r.status,
    capabilityDeclared: r.capabilityDeclared,
  }));
}

/**
 * Sole architectural bridge from internal read/advisory inputs → Public Contract View.
 */
export function adaptToPublicPluginContract(
  readView: PluginRegistryReadView,
  capabilityRecords: readonly CapabilityEvaluationRecord[],
  permissionRecords: readonly PermissionEvaluationRecord[],
  options?: PublicContractAdapterOptions,
): PublicPluginContractView {
  const plugins = projectRegistryReadView(readView);
  const capabilities = projectCapabilityAdvisories(capabilityRecords);
  const permissions = projectPermissionAdvisories(permissionRecords);

  const contractId = options?.contractId ?? PLUGINS_PUBLIC_PLUGIN_CONTRACT_ID;
  const category = options?.category ?? "CapabilityContracts";
  const versionLabel = options?.versionLabel ?? "v0-infrastructure";

  const diagnostics: PublicContractDiagnostic[] = [
    {
      code: "ADAPTER_PROJECTION_COMPLETE",
      message: "internal inputs projected to certified public contract view",
    },
    {
      code: "CONTRACT_BUILT",
      message: `public contract ${contractId} built (advisory-only)`,
    },
  ];

  if (capabilityRecords.length === 0 && permissionRecords.length === 0) {
    diagnostics.push({
      code: "EMPTY_ADVISORY_INPUT",
      message: "no capability/permission advisories supplied",
    });
  }

  const metadata: PublicContractMetadata = {
    __kind: "PublicContractMetadata",
    contractId,
    category,
    versionLabel,
    advisoryOnly: true,
    activatesPlugins: false,
    executesPlugins: false,
  };

  return {
    __kind: "PublicPluginContractView",
    __certifiedPublicSurface: true,
    __extensible: true,
    __exposesRegistryInternals: false,
    __exposesFrameworkInternals: false,
    __exposesStore: false,
    __mutable: false,
    __activatesPlugins: false,
    __executesPlugins: false,
    contractId,
    category,
    versionLabel,
    plugins,
    capabilities,
    permissions,
    metadata,
    diagnostics,
  };
}

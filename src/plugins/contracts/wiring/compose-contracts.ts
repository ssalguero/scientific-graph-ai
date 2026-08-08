/**
 * PLUGINS-I5 — Public Contract composition.
 */

import { adaptToPublicPluginContract } from "../adapter";
import {
  PLUGINS_PUBLIC_CONTRACT_CATEGORIES,
  PLUGINS_PUBLIC_CONTRACT_V1_SELECTION_DEFERRED,
  PLUGINS_PUBLIC_PLUGIN_CONTRACT_ID,
} from "../catalog";
import { PLUGINS_CONTRACTS_DIAGNOSTICS_METADATA } from "../diagnostics";
import { PLUGINS_CONTRACTS_IDENTITY } from "../identity";
import {
  PLUGINS_CONTRACTS_FLAGS,
  PLUGINS_CONTRACTS_PHASE,
  PLUGINS_CONTRACTS_STATUS,
} from "../status";

export type PluginsContractsSnapshot = {
  readonly phase: typeof PLUGINS_CONTRACTS_PHASE;
  readonly status: typeof PLUGINS_CONTRACTS_STATUS;
  readonly identity: typeof PLUGINS_CONTRACTS_IDENTITY;
  readonly diagnosticsMetadata: typeof PLUGINS_CONTRACTS_DIAGNOSTICS_METADATA;
  readonly categories: typeof PLUGINS_PUBLIC_CONTRACT_CATEGORIES;
  readonly designatedContractId: typeof PLUGINS_PUBLIC_PLUGIN_CONTRACT_ID;
  readonly v1SelectionDeferred: typeof PLUGINS_PUBLIC_CONTRACT_V1_SELECTION_DEFERRED;
  readonly adapt: typeof adaptToPublicPluginContract;
  readonly publicContractsImplemented: typeof PLUGINS_CONTRACTS_FLAGS.publicContractsImplemented;
  readonly publicContractsExposeOnlyCertifiedSurface: typeof PLUGINS_CONTRACTS_FLAGS.publicContractsExposeOnlyCertifiedSurface;
  readonly registryInternalsExposed: typeof PLUGINS_CONTRACTS_FLAGS.registryInternalsExposed;
  readonly activationImplemented: typeof PLUGINS_CONTRACTS_FLAGS.activationImplemented;
  readonly lifecycleImplemented: typeof PLUGINS_CONTRACTS_FLAGS.lifecycleImplemented;
  readonly pluginExecutionImplemented: typeof PLUGINS_CONTRACTS_FLAGS.pluginExecutionImplemented;
  readonly evaluatesCapabilities: false;
  readonly evaluatesPermissions: false;
  readonly mutatesRegistry: false;
};

export function composePluginsPublicContracts(): PluginsContractsSnapshot {
  return {
    phase: PLUGINS_CONTRACTS_PHASE,
    status: PLUGINS_CONTRACTS_STATUS,
    identity: PLUGINS_CONTRACTS_IDENTITY,
    diagnosticsMetadata: PLUGINS_CONTRACTS_DIAGNOSTICS_METADATA,
    categories: PLUGINS_PUBLIC_CONTRACT_CATEGORIES,
    designatedContractId: PLUGINS_PUBLIC_PLUGIN_CONTRACT_ID,
    v1SelectionDeferred: PLUGINS_PUBLIC_CONTRACT_V1_SELECTION_DEFERRED,
    adapt: adaptToPublicPluginContract,
    publicContractsImplemented:
      PLUGINS_CONTRACTS_FLAGS.publicContractsImplemented,
    publicContractsExposeOnlyCertifiedSurface:
      PLUGINS_CONTRACTS_FLAGS.publicContractsExposeOnlyCertifiedSurface,
    registryInternalsExposed: PLUGINS_CONTRACTS_FLAGS.registryInternalsExposed,
    activationImplemented: PLUGINS_CONTRACTS_FLAGS.activationImplemented,
    lifecycleImplemented: PLUGINS_CONTRACTS_FLAGS.lifecycleImplemented,
    pluginExecutionImplemented:
      PLUGINS_CONTRACTS_FLAGS.pluginExecutionImplemented,
    evaluatesCapabilities: false,
    evaluatesPermissions: false,
    mutatesRegistry: false,
  };
}

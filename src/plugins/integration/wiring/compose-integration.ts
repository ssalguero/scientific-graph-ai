/**
 * PLUGINS-I9 — Integration composition (wiring).
 */

import { PLUGINS_ALL_INTEGRATION_ADAPTERS } from "../adapters";
import { collectIntegrationDiagnostics, getIntegrationHealthView } from "../diagnostics";
import { PLUGINS_INTEGRATION_IDENTITY } from "../identity";
import { PLUGINS_PEER_OWNERSHIP } from "../peers";
import {
  getIntegrationAdapterRegistryView,
  listIntegrationAdapters,
} from "../registry";
import { resolveExtensionPointBinding } from "../resolver";
import { PLUGINS_INTEGRATION_FLAGS, PLUGINS_INTEGRATION_STATUS } from "../status";
import {
  getCrossDomainIntegrationView,
  getIntegrationPublicView,
} from "../views";

export type PluginsIntegrationComposition = {
  readonly status: typeof PLUGINS_INTEGRATION_STATUS;
  readonly flags: typeof PLUGINS_INTEGRATION_FLAGS;
  readonly identity: typeof PLUGINS_INTEGRATION_IDENTITY;
  readonly peers: typeof PLUGINS_PEER_OWNERSHIP;
  readonly adapters: typeof PLUGINS_ALL_INTEGRATION_ADAPTERS;
  readonly listAdapters: typeof listIntegrationAdapters;
  readonly getRegistryView: typeof getIntegrationAdapterRegistryView;
  readonly resolveBinding: typeof resolveExtensionPointBinding;
  readonly getPublicView: typeof getIntegrationPublicView;
  readonly getCrossDomainView: typeof getCrossDomainIntegrationView;
  readonly getHealth: typeof getIntegrationHealthView;
  readonly collectDiagnostics: typeof collectIntegrationDiagnostics;
};

export function composePluginsIntegration(): PluginsIntegrationComposition {
  return {
    status: PLUGINS_INTEGRATION_STATUS,
    flags: PLUGINS_INTEGRATION_FLAGS,
    identity: PLUGINS_INTEGRATION_IDENTITY,
    peers: PLUGINS_PEER_OWNERSHIP,
    adapters: PLUGINS_ALL_INTEGRATION_ADAPTERS,
    listAdapters: listIntegrationAdapters,
    getRegistryView: getIntegrationAdapterRegistryView,
    resolveBinding: resolveExtensionPointBinding,
    getPublicView: getIntegrationPublicView,
    getCrossDomainView: getCrossDomainIntegrationView,
    getHealth: getIntegrationHealthView,
    collectDiagnostics: collectIntegrationDiagnostics,
  };
}

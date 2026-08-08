/**
 * PLUGINS-I3 — Registration Service (C4).
 *
 * Registration requests incorporation via Registry Public Registration Interface.
 * Registration never owns Registry state and never bypasses Registry abstractions.
 * No activation, loading, capability evaluation, or lifecycle execution.
 */

import type { PluginDiscoveryDescriptor } from "../discovery/descriptors";
import type { PluginRegistryRegistrationService } from "../registry/registration-service";
import type {
  PluginRegistrationDescriptor,
  RegistrationResult,
} from "./descriptors";

/**
 * Request incorporation of a discovered inert descriptor into the Registry.
 * Architectural bridge: Discovery → Registration → Registry Service → Registry State.
 */
export function requestPluginRegistration(
  discovery: PluginDiscoveryDescriptor,
  registryService: PluginRegistryRegistrationService,
): RegistrationResult {
  if (!discovery.identity) {
    return {
      ok: false,
      error: "missing identity",
      diagnostic: {
        code: "MISSING_IDENTITY",
        message: "discovery descriptor lacks identity",
      },
    };
  }

  if (
    discovery.__inert !== true ||
    discovery.__activatable !== false ||
    discovery.__executable !== false
  ) {
    return {
      ok: false,
      error: "descriptor is not inert",
      diagnostic: {
        code: "NOT_INERT",
        message: "only inert discovery descriptors may be registered",
      },
    };
  }

  const descriptor: PluginRegistrationDescriptor = {
    __kind: "PluginRegistrationDescriptor",
    __fromDiscovery: true,
    __activatable: false,
    discovery,
  };

  const result = registryService.registerEntry({
    identity: discovery.identity,
    version: discovery.version,
    declaredCapabilityIds: discovery.declaredCapabilityIds,
  });

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      diagnostic: {
        code: "REGISTRY_REJECTED",
        message: result.error,
      },
    };
  }

  return {
    ok: true,
    entry: result.entry,
    descriptor,
  };
}

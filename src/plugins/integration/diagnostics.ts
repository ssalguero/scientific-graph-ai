/**
 * PLUGINS-I9 — Integration diagnostics & health.
 */

import { PLUGINS_ALL_INTEGRATION_ADAPTERS } from "./adapters";
import type { IntegrationDiagnostic } from "./descriptors";
import { PLUGINS_PEER_OWNERSHIP } from "./peers";
import { PLUGINS_INTEGRATION_FLAGS } from "./status";

export type IntegrationHealthView = {
  readonly __kind: "IntegrationHealthView";
  readonly healthy: true;
  readonly adapterCount: number;
  readonly peerOwnershipPreserved: true;
  readonly peerContractsOnly: true;
  readonly peerInternalAccess: false;
  readonly executionImplemented: false;
  readonly diagnostics: readonly IntegrationDiagnostic[];
};

export function collectIntegrationDiagnostics(): readonly IntegrationDiagnostic[] {
  const out: IntegrationDiagnostic[] = [];
  for (const adapter of PLUGINS_ALL_INTEGRATION_ADAPTERS) {
    out.push({
      code: "ADAPTER_REGISTERED",
      message: `Integration adapter registered for ${adapter.peer}`,
      peer: adapter.peer,
    });
  }
  for (const peer of PLUGINS_PEER_OWNERSHIP) {
    out.push({
      code: "OWNERSHIP_PRESERVED",
      message: `${peer.peer} retains exclusive ownership of its extension points`,
      peer: peer.peer,
    });
  }
  out.push({
    code: "PEER_INTERNAL_FORBIDDEN",
    message:
      "PLUGINS Integration must not consume peer internals, registries, or services",
  });
  return out;
}

export function getIntegrationHealthView(): IntegrationHealthView {
  return {
    __kind: "IntegrationHealthView",
    healthy: true,
    adapterCount: PLUGINS_ALL_INTEGRATION_ADAPTERS.length,
    peerOwnershipPreserved: true,
    peerContractsOnly: PLUGINS_INTEGRATION_FLAGS.peerContractsOnly,
    peerInternalAccess: false,
    executionImplemented: false,
    diagnostics: collectIntegrationDiagnostics(),
  };
}

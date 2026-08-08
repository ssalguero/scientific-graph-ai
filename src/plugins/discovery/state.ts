/**
 * PLUGINS-I3 — Discovery state (session results; not Registry SSOT).
 */

import type { PluginDiscoveryDescriptor, DiscoveryDiagnostic } from "./descriptors";

export type DiscoveryState = {
  readonly __kind: "DiscoveryState";
  readonly __ownsRegistry: false;
  readonly descriptors: readonly PluginDiscoveryDescriptor[];
  readonly diagnostics: readonly DiscoveryDiagnostic[];
  readonly candidateCount: number;
  readonly acceptedCount: number;
};

export function createEmptyDiscoveryState(): DiscoveryState {
  return {
    __kind: "DiscoveryState",
    __ownsRegistry: false,
    descriptors: [],
    diagnostics: [],
    candidateCount: 0,
    acceptedCount: 0,
  };
}

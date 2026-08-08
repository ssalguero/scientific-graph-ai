/**
 * PLUGINS-I3 — Discovery Service (C3).
 *
 * Discovery discovers: identifies candidates → inert descriptors.
 * Discovery never mutates Registry state, store, or collections.
 * No filesystem scan, dynamic import, activation, or execution.
 */

import {
  asCapabilityId,
  asPluginIdentity,
  asPluginVersion,
} from "../types";
import type {
  DiscoveryDiagnostic,
  PluginDiscoveryCandidate,
  PluginDiscoveryDescriptor,
} from "./descriptors";
import { createEmptyDiscoveryState, type DiscoveryState } from "./state";

export type DiscoveryResult = {
  readonly ok: true;
  readonly state: DiscoveryState;
  readonly descriptors: readonly PluginDiscoveryDescriptor[];
};

/**
 * Build inert discovery descriptors from an injected candidate list.
 * Candidates are provided by the caller (tests / future I9 loaders) —
 * Discovery does not scan the filesystem or load modules.
 */
export function discoverPluginCandidates(
  candidates: readonly PluginDiscoveryCandidate[],
): DiscoveryResult {
  const descriptors: PluginDiscoveryDescriptor[] = [];
  const diagnostics: DiscoveryDiagnostic[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const identity = asPluginIdentity(candidate.identity);
    if (!identity) {
      diagnostics.push({
        code: "EMPTY_IDENTITY",
        message: "candidate identity is empty",
      });
      continue;
    }

    if (seen.has(identity)) {
      diagnostics.push({
        code: "DUPLICATE_CANDIDATE",
        message: `duplicate candidate identity: ${identity}`,
        identity,
      });
      continue;
    }
    seen.add(identity);

    const capabilityIds: ReturnType<typeof asCapabilityId>[] = [];
    let capabilityInvalid = false;
    for (const raw of candidate.declaredCapabilityIds ?? []) {
      const id = asCapabilityId(raw);
      if (!id) {
        diagnostics.push({
          code: "INVALID_CAPABILITY_ID",
          message: `invalid capability id on ${identity}`,
        });
        capabilityInvalid = true;
        break;
      }
      capabilityIds.push(id);
    }
    if (capabilityInvalid) continue;

    const version = candidate.version
      ? asPluginVersion(candidate.version) ?? undefined
      : undefined;
    if (candidate.version && !version) {
      diagnostics.push({
        code: "EMPTY_IDENTITY",
        message: `empty version string on ${identity}`,
      });
      continue;
    }

    descriptors.push({
      __kind: "PluginDiscoveryDescriptor",
      __inert: true,
      __activatable: false,
      __executable: false,
      identity,
      version: version ?? undefined,
      declaredCapabilityIds: capabilityIds.filter(
        (c): c is NonNullable<typeof c> => c != null,
      ),
    });
  }

  const state: DiscoveryState = {
    ...createEmptyDiscoveryState(),
    descriptors,
    diagnostics,
    candidateCount: candidates.length,
    acceptedCount: descriptors.length,
  };

  return { ok: true, state, descriptors };
}

/**
 * PLUGINS-I4 — Capability evaluation (C6).
 *
 * Capabilities evaluate declared capabilities against Registry state (read-only).
 * Never inferred. Never mutate Registry. Never activate / execute plugins.
 * Results are advisory until Lifecycle (I6) consumes them.
 */

import type { PluginRegistryState } from "../registry/state";
import { asCapabilityId, asPluginIdentity } from "../types";
import type {
  CapabilityDiagnostic,
  CapabilityEvaluationRecord,
} from "./descriptors";
import {
  createEmptyCapabilityEvaluationState,
  type CapabilityEvaluationState,
} from "./state";

export type CapabilityEvaluationResult = {
  readonly ok: true;
  readonly state: CapabilityEvaluationState;
  readonly records: readonly CapabilityEvaluationRecord[];
};

/**
 * Evaluate all capabilities declared on registered plugins.
 * Undeclared capabilities are never invented.
 */
export function evaluateRegisteredCapabilities(
  registryState: PluginRegistryState,
): CapabilityEvaluationResult {
  const records: CapabilityEvaluationRecord[] = [];
  const diagnostics: CapabilityDiagnostic[] = [];

  for (const entry of registryState.entries) {
    for (const raw of entry.declaredCapabilityIds) {
      records.push({
        __kind: "CapabilityEvaluationRecord",
        __advisory: true,
        capabilityId: raw,
        pluginIdentity: entry.identity,
        availability: "Declared",
        declared: true,
      });
    }
  }

  const state: CapabilityEvaluationState = {
    ...createEmptyCapabilityEvaluationState(),
    records,
    diagnostics,
    evaluatedCount: records.length,
    declaredCount: records.length,
  };

  return { ok: true, state, records };
}

/**
 * Query whether a capability id is declared on any registered plugin.
 * If absent → Undeclared (never inferred as available).
 */
export function evaluateCapabilityQuery(
  registryState: PluginRegistryState,
  capabilityIdRaw: string,
  pluginIdentityRaw?: string,
): CapabilityEvaluationResult {
  const records: CapabilityEvaluationRecord[] = [];
  const diagnostics: CapabilityDiagnostic[] = [];

  const capabilityId = asCapabilityId(capabilityIdRaw);
  if (!capabilityId) {
    diagnostics.push({
      code: "EMPTY_CAPABILITY_ID",
      message: "capability id is empty",
    });
    return {
      ok: true,
      state: {
        ...createEmptyCapabilityEvaluationState(),
        diagnostics,
      },
      records,
    };
  }

  const pluginIdentity = pluginIdentityRaw
    ? asPluginIdentity(pluginIdentityRaw)
    : null;

  if (pluginIdentityRaw && !pluginIdentity) {
    diagnostics.push({
      code: "PLUGIN_NOT_REGISTERED",
      message: "plugin identity is empty",
      pluginIdentity: pluginIdentityRaw,
    });
  }

  if (pluginIdentity) {
    const entry = registryState.entries.find((e) => e.identity === pluginIdentity);
    if (!entry) {
      diagnostics.push({
        code: "PLUGIN_NOT_REGISTERED",
        message: `plugin not in registry: ${pluginIdentity}`,
        pluginIdentity,
      });
      records.push({
        __kind: "CapabilityEvaluationRecord",
        __advisory: true,
        capabilityId,
        pluginIdentity,
        availability: "AbsentFromRegistry",
        declared: false,
      });
    } else {
      const declared = entry.declaredCapabilityIds.includes(capabilityId);
      if (!declared) {
        diagnostics.push({
          code: "UNDECLARED_CAPABILITY",
          message: `capability not declared on ${pluginIdentity}: ${capabilityId}`,
          capabilityId,
        });
      }
      records.push({
        __kind: "CapabilityEvaluationRecord",
        __advisory: true,
        capabilityId,
        pluginIdentity,
        availability: declared ? "Declared" : "Undeclared",
        declared,
      });
    }
  } else {
    const holders = registryState.entries.filter((e) =>
      e.declaredCapabilityIds.includes(capabilityId),
    );
    if (holders.length === 0) {
      diagnostics.push({
        code: "UNDECLARED_CAPABILITY",
        message: `capability not declared on any registered plugin: ${capabilityId}`,
        capabilityId,
      });
      records.push({
        __kind: "CapabilityEvaluationRecord",
        __advisory: true,
        capabilityId,
        availability: "Undeclared",
        declared: false,
      });
    } else {
      for (const entry of holders) {
        records.push({
          __kind: "CapabilityEvaluationRecord",
          __advisory: true,
          capabilityId,
          pluginIdentity: entry.identity,
          availability: "Declared",
          declared: true,
        });
      }
    }
  }

  const state: CapabilityEvaluationState = {
    ...createEmptyCapabilityEvaluationState(),
    records,
    diagnostics,
    evaluatedCount: records.length,
    declaredCount: records.filter((r) => r.declared).length,
  };

  return { ok: true, state, records };
}

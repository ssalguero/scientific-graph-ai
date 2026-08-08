/**
 * PLUGINS-I4 — Permission evaluation (C7).
 *
 * Permissions evaluate declared permission intent against Registry (read-only).
 * Least privilege: no ambient grant. Never mutate Registry. Never activate.
 * Results are advisory until Lifecycle (I6).
 */

import type { PluginRegistryState } from "../registry/state";
import type { CapabilityId, PluginIdentity } from "../types";
import {
  asCapabilityId,
  asPermissionId,
  asPluginIdentity,
} from "../types";
import type {
  PermissionDiagnostic,
  PermissionEvaluationRecord,
  PermissionIntentDescriptor,
} from "./descriptors";
import {
  createEmptyPermissionEvaluationState,
  type PermissionEvaluationState,
} from "./state";

export type PermissionEvaluationResult = {
  readonly ok: true;
  readonly state: PermissionEvaluationState;
  readonly records: readonly PermissionEvaluationRecord[];
};

function capabilityDeclaredOnRegistry(
  registryState: PluginRegistryState,
  capabilityId: CapabilityId,
  pluginIdentity?: PluginIdentity,
): boolean {
  if (pluginIdentity) {
    const entry = registryState.entries.find((e) => e.identity === pluginIdentity);
    return entry?.declaredCapabilityIds.includes(capabilityId) ?? false;
  }
  return registryState.entries.some((e) =>
    e.declaredCapabilityIds.includes(capabilityId),
  );
}

/**
 * Evaluate injected permission intents (caller-supplied; no ambient grants).
 * Grant only when intent is well-formed AND the capability is declared on Registry.
 * Otherwise Deny under least privilege (advisory).
 */
export function evaluatePermissionIntents(
  registryState: PluginRegistryState,
  intents: readonly PermissionIntentDescriptor[],
): PermissionEvaluationResult {
  const records: PermissionEvaluationRecord[] = [];
  const diagnostics: PermissionDiagnostic[] = [];

  for (const intent of intents) {
    const permissionId = asPermissionId(intent.permissionId);
    if (!permissionId) {
      diagnostics.push({
        code: "EMPTY_PERMISSION_ID",
        message: "permission id is empty",
      });
      continue;
    }

    const capabilityId = asCapabilityId(intent.capabilityId);
    if (!capabilityId) {
      diagnostics.push({
        code: "EMPTY_CAPABILITY_ID",
        message: `empty capability id for permission ${permissionId}`,
      });
      continue;
    }

    const pluginIdentity = intent.pluginIdentity
      ? asPluginIdentity(intent.pluginIdentity) ?? undefined
      : undefined;

    const capabilityDeclared = capabilityDeclaredOnRegistry(
      registryState,
      capabilityId,
      pluginIdentity,
    );

    if (!capabilityDeclared) {
      diagnostics.push({
        code: "CAPABILITY_NOT_DECLARED",
        message: `capability not declared for permission ${permissionId}: ${capabilityId}`,
        capabilityId,
      });
      diagnostics.push({
        code: "DENIED_LEAST_PRIVILEGE",
        message: `denied ${permissionId} — capability undeclared (least privilege)`,
        permissionId,
      });
      records.push({
        __kind: "PermissionEvaluationRecord",
        __advisory: true,
        permissionId,
        capabilityId,
        pluginIdentity,
        status: "Denied",
        capabilityDeclared: false,
      });
      continue;
    }

    // Explicit intent + declared capability → Granted (advisory; Lifecycle decides activation).
    records.push({
      __kind: "PermissionEvaluationRecord",
      __advisory: true,
      permissionId,
      capabilityId,
      pluginIdentity,
      status: "Granted",
      capabilityDeclared: true,
    });
  }

  const state: PermissionEvaluationState = {
    ...createEmptyPermissionEvaluationState(),
    records,
    diagnostics,
    evaluatedCount: records.length,
    grantedCount: records.filter((r) => r.status === "Granted").length,
    deniedCount: records.filter((r) => r.status === "Denied").length,
  };

  return { ok: true, state, records };
}

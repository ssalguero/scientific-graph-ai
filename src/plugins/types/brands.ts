/**
 * PLUGINS-I3 — Brand helpers for vocabulary types (no runtime plugin execution).
 */

import type {
  CapabilityId,
  PermissionId,
  PluginIdentity,
  PluginVersion,
} from "./vocabulary";

export function asPluginIdentity(raw: string): PluginIdentity | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed as PluginIdentity;
}

export function asPluginVersion(raw: string): PluginVersion | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed as PluginVersion;
}

export function asCapabilityId(raw: string): CapabilityId | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed as CapabilityId;
}

export function asPermissionId(raw: string): PermissionId | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed as PermissionId;
}

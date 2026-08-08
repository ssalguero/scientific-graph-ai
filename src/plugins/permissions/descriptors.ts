/**
 * PLUGINS-I4 — Permission descriptors (least privilege / advisory).
 */

import type { CapabilityId, PermissionId, PluginIdentity } from "../types";

/** Permission status — advisory until Lifecycle (I6). */
export type PermissionStatus =
  | "Granted"
  | "Denied"
  | "Indeterminate";

export type PermissionIntentDescriptor = {
  readonly permissionId: string;
  readonly capabilityId: string;
  readonly pluginIdentity?: string;
};

export type PermissionDescriptor = {
  readonly __kind: "PermissionDescriptor";
  readonly __activatable: false;
  readonly __executable: false;
  readonly permissionId: PermissionId;
  readonly capabilityId: CapabilityId;
  readonly pluginIdentity?: PluginIdentity;
};

export type PermissionEvaluationRecord = {
  readonly __kind: "PermissionEvaluationRecord";
  readonly __advisory: true;
  readonly permissionId: PermissionId;
  readonly capabilityId: CapabilityId;
  readonly pluginIdentity?: PluginIdentity;
  readonly status: PermissionStatus;
  /** Capability was declared on a registered plugin (read-only check). */
  readonly capabilityDeclared: boolean;
};

export type PermissionDiagnostic =
  | { readonly code: "EMPTY_PERMISSION_ID"; readonly message: string }
  | { readonly code: "EMPTY_CAPABILITY_ID"; readonly message: string }
  | {
      readonly code: "CAPABILITY_NOT_DECLARED";
      readonly message: string;
      readonly capabilityId: string;
    }
  | {
      readonly code: "DENIED_LEAST_PRIVILEGE";
      readonly message: string;
      readonly permissionId: string;
    };

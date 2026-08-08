/**
 * PLUGINS-I0 — Capability / permission abstractions (type markers only).
 *
 * Behavior deferred to PLUGINS-I4 (PLUGINS-P2; P3 C6–C7).
 * No capability evaluation, authorization, or inference in I0.
 */

import type { CapabilityId, PermissionId } from "../types";

/**
 * Capabilities are Declarative / Never Inferred (P2).
 */
export type CapabilityManagerAbstraction = {
  readonly __abstraction: "CapabilityManager";
  readonly __implements: "C6";
  readonly __phase: "PLUGINS-I4";
  readonly __capabilitiesInferred: false;
  readonly __capability?: CapabilityId;
};

export type PermissionManagerAbstraction = {
  readonly __abstraction: "PermissionManager";
  readonly __implements: "C7";
  readonly __phase: "PLUGINS-I4";
  readonly __leastPrivilege: true;
  readonly __permission?: PermissionId;
};

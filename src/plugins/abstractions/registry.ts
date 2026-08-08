/**
 * PLUGINS-I0 — Registry abstractions (type markers only).
 *
 * Infrastructure: PLUGINS-I2. Operational discovery/registration: PLUGINS-I3.
 */

import type { CapabilityId, PluginIdentity } from "../types";

/**
 * Conceptual Plugin Registry surface (C2).
 * Not a public extensibility surface unless later designated (P4).
 */
export type PluginRegistryAbstraction = {
  readonly __abstraction: "PluginRegistry";
  readonly __implements: "C2";
  readonly __phase: "PLUGINS-I2";
  readonly __identity?: PluginIdentity;
};

/**
 * Conceptual Capability Registry facet (stewarded with C6; P3 anti-proliferation).
 */
export type CapabilityRegistryAbstraction = {
  readonly __abstraction: "CapabilityRegistry";
  readonly __implements: "C6_facet";
  readonly __phase: "PLUGINS-I2";
  readonly __capability?: CapabilityId;
};

/**
 * Index of references to peer-owned Extension Points (C10).
 * Does not own Extension Points (Charter EP Ownership Freeze).
 */
export type ExtensionPointRegistryAbstraction = {
  readonly __abstraction: "ExtensionPointRegistry";
  readonly __implements: "C10_facet";
  readonly __phase: "PLUGINS-I2";
  readonly __ownsExtensionPoints: false;
};

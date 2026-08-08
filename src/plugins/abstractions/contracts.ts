/**
 * PLUGINS-I0 — Public Plugin Contract abstractions (type markers only).
 *
 * Behavior / catalogs deferred to PLUGINS-I5 (PLUGINS-P4).
 * No API signatures, schemas, or SDK in I0.
 */

import type { PublicPluginContractId } from "../types";

/**
 * Only explicitly designated Public Plugin Contracts are extensible (P4).
 * Internals are constitutionally non-extensible.
 */
export type PublicPluginContractAbstraction = {
  readonly __abstraction: "PublicPluginContract";
  readonly __phase: "PLUGINS-I5";
  readonly __extensibleSurface: true;
  readonly __contractId?: PublicPluginContractId;
};

export type PublicContractSurfaceClass =
  | "PublicPluginContract"
  | "InternalService"
  | "PrivateComponent"
  | "InternalRegistry"
  | "PrivateImplementation";

export type NonExtensibleSurfaceMarker = {
  readonly __abstraction: "NonExtensibleSurface";
  readonly __extensible: false;
  readonly surfaceClass: Exclude<
    PublicContractSurfaceClass,
    "PublicPluginContract"
  >;
};

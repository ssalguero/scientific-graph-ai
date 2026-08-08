/**
 * PLUGINS-I5 — Public Contract descriptors (certified surface only).
 *
 * Descriptors describe public exposure — never Registry/Store/Framework internals.
 */

import type { PublicPluginContractCategory } from "./catalog";

export type PublicContractDescriptor = {
  readonly __kind: "PublicContractDescriptor";
  readonly __certifiedPublicSurface: true;
  readonly __extensible: true;
  readonly __exposesInternals: false;
  readonly contractId: string;
  readonly category: PublicPluginContractCategory;
  readonly versionLabel: string;
};

export type PublicContractMetadata = {
  readonly __kind: "PublicContractMetadata";
  readonly contractId: string;
  readonly category: PublicPluginContractCategory;
  readonly versionLabel: string;
  readonly advisoryOnly: true;
  readonly activatesPlugins: false;
  readonly executesPlugins: false;
};

export type PublicContractDiagnostic = {
  readonly code:
    | "CONTRACT_BUILT"
    | "EMPTY_ADVISORY_INPUT"
    | "ADAPTER_PROJECTION_COMPLETE";
  readonly message: string;
};

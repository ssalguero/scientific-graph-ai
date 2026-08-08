/**
 * PLUGINS-I3 — Registration state (session; not Registry SSOT).
 */

import type { RegistrationDiagnostic } from "./descriptors";
import type { PluginRegistryEntry } from "../registry/state";

export type RegistrationState = {
  readonly __kind: "RegistrationState";
  readonly __ownsRegistry: false;
  readonly lastRegistered?: PluginRegistryEntry;
  readonly diagnostics: readonly RegistrationDiagnostic[];
  readonly attemptCount: number;
  readonly successCount: number;
};

export function createEmptyRegistrationState(): RegistrationState {
  return {
    __kind: "RegistrationState",
    __ownsRegistry: false,
    diagnostics: [],
    attemptCount: 0,
    successCount: 0,
  };
}

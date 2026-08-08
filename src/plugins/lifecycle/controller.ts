/**
 * PLUGINS-I6 — Lifecycle Controller (C5).
 *
 * Consumes Public Plugin Contracts only.
 * Owns activation eligibility decisions.
 * Never evaluates capabilities/permissions, never mutates Registry,
 * never executes or loads plugins.
 *
 * Active = lifecycle-eligible conceptually — NOT currently executing.
 */

import type { PublicPluginContractView } from "../contracts/views";
import type {
  LifecycleActivationEligibility,
  LifecycleDecision,
  LifecycleDiagnostic,
  LifecyclePluginRecord,
} from "./descriptors";
import {
  createEmptyLifecycleEngineState,
  createLifecyclePluginRecord,
  type LifecycleEngineState,
} from "./state";
import { isAllowedLifecycleTransition } from "./transitions";
import type { PluginLifecycleState } from "../types";

export type LifecycleControllerResult = {
  readonly ok: true;
  readonly state: LifecycleEngineState;
  readonly decisions: readonly LifecycleDecision[];
  readonly diagnostics: readonly LifecycleDiagnostic[];
};

export type LifecycleTransitionResult =
  | {
      readonly ok: true;
      readonly record: LifecyclePluginRecord;
      readonly decision: LifecycleDecision;
      readonly state: LifecycleEngineState;
    }
  | {
      readonly ok: false;
      readonly error: string;
      readonly diagnostic: LifecycleDiagnostic;
      readonly state: LifecycleEngineState;
    };

/** In-memory lifecycle SSOT (not Registry). Cleared only via test helper. */
let records: LifecyclePluginRecord[] = [];

export function lifecycleClearForTests(): void {
  records = [];
}

function snapshotState(): LifecycleEngineState {
  return {
    ...createEmptyLifecycleEngineState(),
    records: [...records],
    recordCount: records.length,
  };
}

function upsertRecord(next: LifecyclePluginRecord): void {
  const idx = records.findIndex((r) => r.identity === next.identity);
  if (idx === -1) records = [...records, next];
  else {
    const copy = [...records];
    copy[idx] = next;
    records = copy;
  }
}

/**
 * Derive activation eligibility from advisory surfaces on the Public Contract.
 * Does not call Capability/Permission evaluators — reads advisory views only.
 */
function deriveEligibility(
  contract: PublicPluginContractView,
  identity: string,
): LifecycleActivationEligibility {
  const plugin = contract.plugins.find((p) => p.identity === identity);
  const declaredOnPlugin = (plugin?.declaredCapabilityIds.length ?? 0) > 0;

  const pluginCaps = contract.capabilities.filter(
    (c) => c.pluginIdentity === identity,
  );
  const declaredAdvisory = pluginCaps.some((c) => c.declared && c.__advisory);

  const pluginPerms = contract.permissions.filter(
    (p) => p.pluginIdentity === identity,
  );
  const denied = pluginPerms.some((p) => p.status === "Denied");

  // Eligible when contract presents the plugin with declared capabilities
  // (plugin view and/or advisory) and no denied permission advisories block it.
  if ((declaredOnPlugin || declaredAdvisory) && !denied) return "Eligible";
  return "Ineligible";
}

/**
 * Consume a certified Public Plugin Contract and produce lifecycle decisions.
 * Sole architectural entry for contract → lifecycle.
 */
export function decideFromPublicContract(
  contract: PublicPluginContractView,
): LifecycleControllerResult {
  const decisions: LifecycleDecision[] = [];
  const diagnostics: LifecycleDiagnostic[] = [];

  if (
    contract.__kind !== "PublicPluginContractView" ||
    contract.__certifiedPublicSurface !== true
  ) {
    diagnostics.push({
      code: "INVALID_CONTRACT",
      message: "input is not a certified Public Plugin Contract view",
    });
    return { ok: true, state: snapshotState(), decisions, diagnostics };
  }

  diagnostics.push({
    code: "CONTRACT_CONSUMED",
    message: `consumed public contract ${contract.contractId}`,
  });

  for (const plugin of contract.plugins) {
    const eligibility = deriveEligibility(contract, plugin.identity);
    const existing = records.find((r) => r.identity === plugin.identity);
    const fromState: PluginLifecycleState = existing?.state ?? "Registered";

    let toState: PluginLifecycleState;
    if (eligibility === "Eligible") {
      // Activation eligibility → Active (conceptual; not execution)
      toState =
        fromState === "Registered" || fromState === "Inactive"
          ? "Active"
          : fromState === "Active"
            ? "Active"
            : fromState;
      if (
        toState !== fromState &&
        !isAllowedLifecycleTransition(fromState, toState)
      ) {
        toState = fromState;
      }
      diagnostics.push({
        code: "ACTIVATION_ELIGIBLE",
        message: `activation eligible: ${plugin.identity}`,
        identity: plugin.identity,
      });
    } else {
      toState =
        fromState === "Active"
          ? "Inactive"
          : fromState === "Registered"
            ? "Inactive"
            : fromState;
      if (
        toState !== fromState &&
        !isAllowedLifecycleTransition(fromState, toState)
      ) {
        toState = "Inactive";
        if (!isAllowedLifecycleTransition(fromState, toState)) {
          toState = fromState;
        }
      }
      diagnostics.push({
        code: "ACTIVATION_INELIGIBLE",
        message: `activation ineligible: ${plugin.identity}`,
        identity: plugin.identity,
      });
    }

    const record = createLifecyclePluginRecord(
      plugin.identity,
      toState,
      eligibility,
    );
    upsertRecord(record);

    decisions.push({
      __kind: "LifecycleDecision",
      __structuralOnly: true,
      __executionDeferred: true,
      identity: plugin.identity,
      fromState,
      toState,
      activationEligibility: eligibility,
      reason:
        eligibility === "Eligible"
          ? "public contract advisories allow activation eligibility"
          : "public contract advisories deny activation eligibility",
    });

    if (fromState !== toState) {
      diagnostics.push({
        code: "TRANSITION_APPLIED",
        message: `${plugin.identity}: ${fromState} → ${toState}`,
        identity: plugin.identity,
      });
    }
  }

  return { ok: true, state: snapshotState(), decisions, diagnostics };
}

/**
 * Explicit platform-controlled transition (no side-effect activation).
 */
export function applyLifecycleTransition(
  identity: string,
  toState: PluginLifecycleState,
): LifecycleTransitionResult {
  const existing = records.find((r) => r.identity === identity);
  if (!existing) {
    const state = snapshotState();
    return {
      ok: false,
      error: `unknown plugin identity: ${identity}`,
      diagnostic: {
        code: "TRANSITION_REJECTED",
        message: `unknown plugin: ${identity}`,
        identity,
      },
      state,
    };
  }

  if (!isAllowedLifecycleTransition(existing.state, toState)) {
    const state = snapshotState();
    return {
      ok: false,
      error: `forbidden transition ${existing.state} → ${toState}`,
      diagnostic: {
        code: "TRANSITION_REJECTED",
        message: `forbidden transition ${existing.state} → ${toState}`,
        identity,
      },
      state,
    };
  }

  const eligibility: LifecycleActivationEligibility =
    toState === "Active" ? "Eligible" : "Ineligible";
  const record = createLifecyclePluginRecord(identity, toState, eligibility);
  upsertRecord(record);

  const decision: LifecycleDecision = {
    __kind: "LifecycleDecision",
    __structuralOnly: true,
    __executionDeferred: true,
    identity,
    fromState: existing.state,
    toState,
    activationEligibility: eligibility,
    reason: "explicit platform-controlled transition",
  };

  return {
    ok: true,
    record,
    decision,
    state: snapshotState(),
  };
}

export function getLifecycleState(): LifecycleEngineState {
  return snapshotState();
}

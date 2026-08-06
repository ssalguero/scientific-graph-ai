/**
 * DATA Domain — Derived entity lifecycle support (DATA-P5 / DATA-I3).
 *
 * Transformation yields a new Derived entity with lineage.
 * The parent is never replaced in place.
 * No transformation algorithms — only lifecycle/lineage wiring.
 *
 * @packageDocumentation
 */

import type { DataEntityIdentity } from "../registry/identity";
import {
  TransitionRequester,
  type TransitionRequester as TransitionRequesterId,
} from "./authority";
import { LifecycleInvariantError } from "./invariants";
import type { LifecycleTracker, LifecycleRecord } from "./lifecycle-tracker";
import { LifecycleState } from "./states";

export interface DerivationResult {
  readonly ok: boolean;
  readonly parent: LifecycleRecord;
  readonly derived?: LifecycleRecord;
  readonly derivedIdentity?: DataEntityIdentity;
  readonly error?: string;
}

export type DerivedIdentityMint = () => DataEntityIdentity;

/**
 * Complete the Transformed derivation path:
 * 1. Parent must be Transformed.
 * 2. Mint a new authoritative identity (via Dataset/Model Manager — SSOT).
 * 3. Child enters Derived with lineage to parent.
 * 4. Parent returns to Available or Validated (never replaced).
 */
export function completeDerivation(
  tracker: LifecycleTracker,
  parentIdentityId: string,
  mintDerivedIdentity: DerivedIdentityMint,
  requester: TransitionRequesterId = TransitionRequester.DATA,
  parentReturnState:
    | typeof LifecycleState.Available
    | typeof LifecycleState.Validated = LifecycleState.Available,
): DerivationResult {
  const parent = tracker.findByIdentity(parentIdentityId);
  if (!parent) {
    return {
      ok: false,
      parent: parent!,
      error: `Derivation: unknown parent ${parentIdentityId}`,
    };
  }
  if (parent.state !== LifecycleState.Transformed) {
    return {
      ok: false,
      parent,
      error: `Derivation requires parent in Transformed state (got ${parent.state})`,
    };
  }

  try {
    const derivedIdentity = mintDerivedIdentity();
    if (derivedIdentity.id === parentIdentityId) {
      throw new LifecycleInvariantError(
        "never-lose-lineage",
        "Derived entity must be a new identity; parent must not be replaced",
      );
    }

    const derived = tracker.attachDerived(
      derivedIdentity.id,
      [parentIdentityId],
      requester,
    );

    const parentResult = tracker.requestTransition(parentIdentityId, {
      requester,
      to: parentReturnState,
      note: "parent-preserved-after-derivation",
    });
    if (!parentResult.ok) {
      return {
        ok: false,
        parent: parentResult.record,
        derived,
        derivedIdentity,
        error: parentResult.error,
      };
    }

    return {
      ok: true,
      parent: parentResult.record,
      derived,
      derivedIdentity,
    };
  } catch (e) {
    return {
      ok: false,
      parent,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * DATA Domain — Lifecycle record + tracker (DATA-P5 / DATA-I3).
 *
 * Lifecycle state attaches to authoritative identity (or Conceived intent).
 * Does not invent a second SSOT. No scientific processing.
 *
 * @packageDocumentation
 */

import type { RegistryAuthority } from "../registry/authority";
import type { DataEntityClass } from "../registry/roles";
import {
  assertMayRequestTransition,
  TransitionRequester,
  type TransitionRequester as TransitionRequesterId,
} from "./authority";
import { LifecycleDiagnostics } from "./diagnostics";
import {
  LifecycleInvariantError,
} from "./invariants";
import { LifecycleState, type LifecycleState as LifecycleStateId } from "./states";
import { isTransitionAllowed } from "./transitions";
import {
  ValidationGate,
  ValidationGateError,
} from "./validation-gate";
import type { ValidationEngine } from "../../validation/validation-engine/ValidationEngine";

export interface LifecycleRecord {
  /** Authoritative identity id; null only while Conceived (pre-registration). */
  identityId: string | null;
  /** Intent id for Conceived subjects without registry identity yet. */
  readonly intentId: string;
  state: LifecycleStateId;
  lineageParentIds: readonly string[];
  entityClass: DataEntityClass | null;
}

export interface TransitionRequest {
  readonly requester: TransitionRequesterId;
  readonly to: LifecycleStateId;
  /** Required for Available → Described (explicit withdraw-and-redescribe). */
  readonly withdrawAndRedescribe?: boolean;
  /** Optional note for diagnostics. */
  readonly note?: string;
}

export interface TransitionResult {
  readonly ok: boolean;
  readonly record: LifecycleRecord;
  readonly error?: string;
}

let intentSeq = 0;

function mintIntentId(): string {
  intentSeq += 1;
  return `intent-${intentSeq}`;
}

export class LifecycleTracker {
  private readonly bySubject = new Map<string, LifecycleRecord>();
  readonly diagnostics = new LifecycleDiagnostics();
  readonly gate: ValidationGate;

  constructor(
    private readonly authority: RegistryAuthority,
    private readonly validationEngine: ValidationEngine,
  ) {
    this.gate = new ValidationGate(validationEngine);
  }

  /** Begin Conceived intent (no Authoritative identity yet). */
  conceive(
    requester: TransitionRequesterId,
    entityClass?: DataEntityClass,
  ): LifecycleRecord {
    assertMayRequestTransition(requester);
    const intentId = mintIntentId();
    const record: LifecycleRecord = {
      identityId: null,
      intentId,
      state: LifecycleState.Conceived,
      lineageParentIds: Object.freeze([]),
      entityClass: entityClass ?? null,
    };
    this.bySubject.set(intentId, record);
    this.diagnostics.record({
      at: Date.now(),
      subjectId: intentId,
      from: null,
      to: LifecycleState.Conceived,
      requester,
      ok: true,
      note: "conceive",
    });
    return record;
  }

  /**
   * Attach lifecycle at Registered for an existing authoritative identity.
   * Used after Dataset/Model Manager registration (SSOT remains the registry).
   */
  attachRegistered(
    identityId: string,
    requester: TransitionRequesterId,
    lineageParentIds: readonly string[] = [],
  ): LifecycleRecord {
    assertMayRequestTransition(requester);
    const identity = this.authority.resolveIdentity(identityId);
    if (!identity) {
      throw new Error(
        `Lifecycle: cannot attach Registered — authoritative identity not found: ${identityId}`,
      );
    }
    if (this.findByIdentity(identityId)) {
      throw new LifecycleInvariantError(
        "exactly-one-current-lifecycle-state",
        `identity ${identityId} already has a lifecycle record`,
      );
    }
    const intentId = mintIntentId();
    const record: LifecycleRecord = {
      identityId,
      intentId,
      state: LifecycleState.Registered,
      lineageParentIds: Object.freeze([...lineageParentIds]),
      entityClass: identity.entityClass,
    };
    this.bySubject.set(identityId, record);
    this.bySubject.set(intentId, record);
    this.diagnostics.record({
      at: Date.now(),
      subjectId: identityId,
      from: null,
      to: LifecycleState.Registered,
      requester,
      ok: true,
      note: "attachRegistered",
    });
    return record;
  }

  getBySubject(subjectId: string): LifecycleRecord | undefined {
    return this.bySubject.get(subjectId);
  }

  findByIdentity(identityId: string): LifecycleRecord | undefined {
    return this.bySubject.get(identityId);
  }

  getState(subjectId: string): LifecycleStateId | undefined {
    return this.bySubject.get(subjectId)?.state;
  }

  /**
   * Request a lifecycle transition.
   * ENGINE/DATA may request; DATA validates edge + gates.
   */
  requestTransition(
    subjectId: string,
    request: TransitionRequest,
  ): TransitionResult {
    try {
      assertMayRequestTransition(request.requester);
      const record = this.bySubject.get(subjectId);
      if (!record) {
        throw new Error(`Lifecycle: unknown subject ${subjectId}`);
      }

      const from = record.state;
      const to = request.to;

      if (!isTransitionAllowed(from, to)) {
        throw new LifecycleInvariantError(
          "never-skip-mandatory-transitions",
          `${from} → ${to} is not an allowed transition`,
        );
      }

      // Available → Described only via explicit withdraw-and-redescribe (P5).
      if (
        from === LifecycleState.Available &&
        to === LifecycleState.Described &&
        !request.withdrawAndRedescribe
      ) {
        throw new LifecycleInvariantError(
          "never-mutate-silently-after-publication",
          "Available → Described requires explicit withdrawAndRedescribe",
        );
      }

      // Conceived → Registered requires linking an authoritative identity.
      if (
        from === LifecycleState.Conceived &&
        to === LifecycleState.Registered
      ) {
        throw new Error(
          "Lifecycle: Conceived → Registered must use completeRegistration(intentId, identityId)",
        );
      }

      const identityId = record.identityId;
      if (!identityId && to !== LifecycleState.Conceived) {
        throw new Error(
          `Lifecycle: subject ${subjectId} has no authoritative identity for transition to ${to}`,
        );
      }

      if (to === LifecycleState.Validated && identityId) {
        this.gate.assertCanEnterValidated(identityId);
      }
      if (to === LifecycleState.Available && identityId) {
        this.gate.assertCanEnterAvailable(identityId);
      }

      // Derived must not replace parent — parent transitions handled separately.
      if (to === LifecycleState.Derived) {
        throw new Error(
          "Lifecycle: use completeDerivation(...) to create a Derived child; parent is not replaced",
        );
      }

      if (identityId) {
        this.gate.invalidateOnMeaningChange(identityId, to);
      }

      record.state = to;
      this.diagnostics.record({
        at: Date.now(),
        subjectId: identityId ?? record.intentId,
        from,
        to,
        requester: request.requester,
        ok: true,
        note: request.note,
      });
      return { ok: true, record };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.diagnostics.record({
        at: Date.now(),
        subjectId,
        from: this.bySubject.get(subjectId)?.state ?? null,
        to: request.to,
        requester: request.requester,
        ok: false,
        reason: message,
        note: request.note,
      });
      return {
        ok: false,
        record: this.bySubject.get(subjectId)!,
        error: message,
      };
    }
  }

  /**
   * Complete Conceived → Registered by binding a newly minted authoritative identity.
   */
  completeRegistration(
    intentId: string,
    identityId: string,
    requester: TransitionRequesterId,
  ): TransitionResult {
    try {
      assertMayRequestTransition(requester);
      const record = this.bySubject.get(intentId);
      if (!record || record.state !== LifecycleState.Conceived) {
        throw new Error(
          `Lifecycle: completeRegistration requires Conceived intent ${intentId}`,
        );
      }
      const identity = this.authority.resolveIdentity(identityId);
      if (!identity) {
        throw new Error(
          `Lifecycle: identity ${identityId} is not in an Authoritative Registry`,
        );
      }
      if (this.findByIdentity(identityId) && this.findByIdentity(identityId) !== record) {
        throw new LifecycleInvariantError(
          "exactly-one-current-lifecycle-state",
          `identity ${identityId} already has lifecycle`,
        );
      }

      const from = record.state;
      record.identityId = identityId;
      record.entityClass = identity.entityClass;
      record.state = LifecycleState.Registered;
      this.bySubject.set(identityId, record);

      this.diagnostics.record({
        at: Date.now(),
        subjectId: identityId,
        from,
        to: LifecycleState.Registered,
        requester,
        ok: true,
        note: "completeRegistration",
      });
      return { ok: true, record };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.diagnostics.record({
        at: Date.now(),
        subjectId: intentId,
        from: LifecycleState.Conceived,
        to: LifecycleState.Registered,
        requester,
        ok: false,
        reason: message,
      });
      const record = this.bySubject.get(intentId);
      return {
        ok: false,
        record: record!,
        error: message,
      };
    }
  }

  /**
   * Attach a newly minted Derived identity with lineage to parent(s).
   * Derived entities never replace the parent identity.
   */
  attachDerived(
    identityId: string,
    lineageParentIds: readonly string[],
    requester: TransitionRequesterId,
  ): LifecycleRecord {
    assertMayRequestTransition(requester);
    if (lineageParentIds.length === 0) {
      throw new LifecycleInvariantError(
        "never-lose-lineage",
        "Derived entity must declare lineage to parent(s)",
      );
    }
    if (lineageParentIds.includes(identityId)) {
      throw new LifecycleInvariantError(
        "never-lose-lineage",
        "Derived entity must not replace or alias the parent identity",
      );
    }
    for (const parentId of lineageParentIds) {
      if (!this.authority.resolveIdentity(parentId)) {
        throw new Error(
          `Lifecycle: lineage parent ${parentId} is not an authoritative identity`,
        );
      }
    }
    const identity = this.authority.resolveIdentity(identityId);
    if (!identity) {
      throw new Error(
        `Lifecycle: cannot attach Derived — authoritative identity not found: ${identityId}`,
      );
    }
    if (this.findByIdentity(identityId)) {
      throw new LifecycleInvariantError(
        "exactly-one-current-lifecycle-state",
        `identity ${identityId} already has a lifecycle record`,
      );
    }
    const intentId = mintIntentId();
    const record: LifecycleRecord = {
      identityId,
      intentId,
      state: LifecycleState.Derived,
      lineageParentIds: Object.freeze([...lineageParentIds]),
      entityClass: identity.entityClass,
    };
    this.bySubject.set(identityId, record);
    this.bySubject.set(intentId, record);
    this.diagnostics.record({
      at: Date.now(),
      subjectId: identityId,
      from: null,
      to: LifecycleState.Derived,
      requester,
      ok: true,
      note: "attachDerived",
    });
    return record;
  }

  /**
   * Record validation outcome then transition Described → Validated.
   * No scientific algorithms — pass/fail is supplied by the caller (gate input).
   */
  applyValidationGate(
    identityId: string,
    passed: boolean,
    requester: TransitionRequesterId = TransitionRequester.DATA,
  ): TransitionResult {
    assertMayRequestTransition(requester);
    this.validationEngine.recordOutcome(identityId, passed);
    if (!passed) {
      this.diagnostics.record({
        at: Date.now(),
        subjectId: identityId,
        from: this.getState(identityId) ?? null,
        to: LifecycleState.Validated,
        requester,
        ok: false,
        reason: "Validation Gate failed",
      });
      const record = this.findByIdentity(identityId);
      return {
        ok: false,
        record: record!,
        error: "Validation Gate failed",
      };
    }
    return this.requestTransition(identityId, {
      requester,
      to: LifecycleState.Validated,
      note: "validation-gate-pass",
    });
  }
}

export { ValidationGateError };

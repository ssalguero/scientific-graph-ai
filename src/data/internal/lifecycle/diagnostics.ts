/**
 * DATA Domain — Lifecycle transition diagnostics (DATA-I3).
 *
 * Internal reports only — not a public API.
 *
 * @packageDocumentation
 */

import type { LifecycleState } from "./states";
import type { TransitionRequester } from "./authority";

export interface LifecycleTransitionRecord {
  readonly at: number;
  readonly subjectId: string;
  readonly from: LifecycleState | null;
  readonly to: LifecycleState;
  readonly requester: TransitionRequester;
  readonly ok: boolean;
  readonly reason?: string;
  readonly note?: string;
}

export class LifecycleDiagnostics {
  private readonly journal: LifecycleTransitionRecord[] = [];

  record(entry: LifecycleTransitionRecord): void {
    this.journal.push(entry);
  }

  list(): readonly LifecycleTransitionRecord[] {
    return Object.freeze([...this.journal]);
  }

  listFor(subjectId: string): readonly LifecycleTransitionRecord[] {
    return Object.freeze(
      this.journal.filter((e) => e.subjectId === subjectId),
    );
  }

  clear(): void {
    this.journal.length = 0;
  }
}

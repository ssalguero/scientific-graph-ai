/**
 * UX-8.7 — Interaction Command Result foundation type.
 *
 * Result Immutability Freeze: every dispatch creates a NEW result; never mutate.
 * Result Snapshot Freeze: returned / snapshotted results are frozen.
 *
 * No payload · logs · execution results · side effects · timing.
 * No React · no UX-6 Commands · no Runtime.
 */

export type InteractionCommandResult = Readonly<{
  accepted: boolean;
  reason: string | null;
}>;

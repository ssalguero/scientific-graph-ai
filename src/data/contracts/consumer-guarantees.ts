/**
 * DATA Domain — Frozen Consumer Guarantees (DATA-P4 / DATA-P9).
 *
 * Documentary binding only. Do not reinterpret or weaken these guarantees.
 *
 * @packageDocumentation
 */

/** What every consumer may assume (DATA-P9 § Frozen Consumer Guarantees). */
export const DATA_CONSUMER_MAY_ASSUME = [
  "stable-semantic-behavior",
  "deterministic-outcomes-for-processing-capabilities",
  "metadata-consistency-with-meaning",
  "validation-before-publication",
  "ownership-never-changes",
] as const;

/** What consumers must never assume (DATA-P9). */
export const DATA_CONSUMER_MUST_NEVER_ASSUME = [
  "internal-algorithms",
  "internal-storage",
  "internal-representations",
  "execution-order-beyond-published-semantic-guarantees",
  "manager-topology-layer-wiring",
] as const;

export type DataConsumerMayAssume = (typeof DATA_CONSUMER_MAY_ASSUME)[number];
export type DataConsumerMustNeverAssume =
  (typeof DATA_CONSUMER_MUST_NEVER_ASSUME)[number];

/**
 * DATA Domain — Frozen Contract Invariants (DATA-P4 / DATA-P9).
 *
 * Documentary binding only. Do not weaken these invariants.
 *
 * @packageDocumentation
 */

/** Contract Invariants (DATA-P4 §9) — permanent for all public contracts. */
export const DATA_CONTRACT_INVARIANTS = [
  "scientific-correctness-first",
  "no-validation-bypass-on-publish-or-mutate-available-meaning",
  "metadata-always-preserved-with-scientific-meaning",
  "ownership-never-changes-through-contract-use",
  "contracts-expose-capabilities-not-implementation",
  "no-product-flow-ui-or-persistence-engine-control",
  "deterministic-transform-promises-remain-reproducible",
  "registry-as-ssot-identity-respected",
] as const;

export type DataContractInvariant = (typeof DATA_CONTRACT_INVARIANTS)[number];

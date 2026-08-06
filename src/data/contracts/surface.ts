/**
 * DATA Domain — Public vs Internal vs Never Public classification (DATA-P4 / DATA-P9).
 *
 * Binding of the frozen surface classification. Does not expose Never Public
 * concerns; only names the classification axis for catalog compliance.
 *
 * @packageDocumentation
 */

/** Surface visibility class for catalog entries (DATA-P4 § Public vs Internal). */
export const DataSurfaceClass = {
  Public: "Public",
  Internal: "Internal",
  NeverPublic: "NeverPublic",
} as const;

export type DataSurfaceClass =
  (typeof DataSurfaceClass)[keyof typeof DataSurfaceClass];

/**
 * Never Public concerns (DATA-P4) — documented for enforcement; never exported
 * as callable capabilities.
 */
export const DATA_NEVER_PUBLIC = [
  "persistence-engines",
  "indexeddb-file-io",
  "visualization-rendering-as-data-api",
  "product-flow-sequencing",
  "ux-wizards",
  "engine-business-precondition-orchestration",
  "session-snapshot-formats-as-data-ownership",
  "feedstock-src-lib-direct-access",
  "layer-bypass-exporting-internal-components",
  "ui-windows-project-open-save-flows",
  "ai-reasoning-apis",
] as const;

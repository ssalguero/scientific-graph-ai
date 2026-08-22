import {
  SCIENTIFIC_RESULT_CONTRACT_INVENTORY,
  getScientificResultContract,
  listScientificContractsBySciId,
  type ScientificResultContractId,
} from "../result-inventory";
import type { ContractFoundationAssertCase } from "./run-assertions";

const REQUIRED_FEDERATED_CONTRACTS: readonly ScientificResultContractId[] = [
  "descriptive.series-statistics",
  "distribution.exploration",
  "inference.parametric",
  "inference.nonparametric",
  "sci-57.effect-size-power",
  "ge.pca",
  "vgb.pca",
  "sci-58.comparison",
  "sci-50.consistency",
  "sci-51.report-quality",
  "sci-52.reproducibility",
  "sci-53.evidence-strength",
  "sci-54.assumptions",
  "sci-55.publication-readiness",
  "sci-56.methodological-dashboard",
  "sci-59.guided-workflow",
  "sci-60.publication-dashboard",
  "vgb.preview-values",
];

export const runInventoryCases = (
  assertCase: ContractFoundationAssertCase
): void => {
  assertCase(
    "inventory.required-contracts",
    REQUIRED_FEDERATED_CONTRACTS.every((id) =>
      SCIENTIFIC_RESULT_CONTRACT_INVENTORY.some(
        (descriptor) => descriptor.id === id
      )
    )
  );
  assertCase(
    "inventory.unique-ids",
    new Set(
      SCIENTIFIC_RESULT_CONTRACT_INVENTORY.map((descriptor) => descriptor.id)
    ).size === SCIENTIFIC_RESULT_CONTRACT_INVENTORY.length
  );
  assertCase(
    "inventory.owner-paths",
    SCIENTIFIC_RESULT_CONTRACT_INVENTORY.every(
      ({ ownerPaths }) =>
        ownerPaths.length > 0 &&
        ownerPaths.every((path) => path.startsWith("src/"))
    )
  );
  assertCase(
    "inventory.semantic-fields",
    SCIENTIFIC_RESULT_CONTRACT_INVENTORY.every(
      ({ semanticFields }) =>
        semanticFields.length > 0 &&
        semanticFields.every(({ name, meaning }) => name && meaning)
    )
  );
  assertCase(
    "inventory.approximation-policies",
    SCIENTIFIC_RESULT_CONTRACT_INVENTORY.every(
      ({ approximationPolicy }) =>
        approximationPolicy.mode.length > 0 &&
        approximationPolicy.statement.length > 0
    )
  );
  assertCase(
    "inventory.persistence-policies",
    SCIENTIFIC_RESULT_CONTRACT_INVENTORY.every(
      ({ persistencePolicy }) =>
        persistencePolicy.mode.length > 0 &&
        persistencePolicy.statement.length > 0
    )
  );

  const sciRange = Array.from({ length: 11 }, (_, index) => `SCI-${50 + index}`);
  assertCase(
    "inventory.sci-50-through-60",
    sciRange.every(
      (sciId) =>
        listScientificContractsBySciId(sciId as `SCI-${number}`).length === 1
    )
  );
  assertCase(
    "inventory.sci-59-is-not-result",
    getScientificResultContract("sci-59.guided-workflow").contractRole ===
      "workflow-state"
  );
  assertCase(
    "inventory.comparison-snapshot-only",
    getScientificResultContract("sci-58.comparison").persistencePolicy.mode ===
      "snapshot-only"
  );
  assertCase(
    "inventory.vgb-values-not-persisted",
    getScientificResultContract("vgb.preview-values").persistencePolicy.mode ===
      "configuration-only"
  );
};

import {
  SCIENTIFIC_CAPABILITY_IDENTITIES,
  getScientificCapabilityIdentity,
  resolveScientificCapabilityAlias,
} from "../capability-identity";
import {
  LIVE_DERIVED_RESULT_IDENTITY,
  SCIENTIFIC_ARTIFACT_KINDS,
} from "../artifacts";
import type { ContractFoundationAssertCase } from "./run-assertions";

const REQUIRED_ALIASES = [
  "MANOVA Explorer",
  "LDA Explorer",
  "Canonical Correlation Explorer",
  "PCR Explorer",
  "PLS Explorer",
  "Bootstrap Explorer",
  "Sensitivity Analysis Explorer",
  "t-SNE Explorer",
  "UMAP Explorer",
] as const;

export const runIdentityCases = (
  assertCase: ContractFoundationAssertCase
): void => {
  assertCase(
    "identity.nine-capabilities",
    SCIENTIFIC_CAPABILITY_IDENTITIES.length === 9
  );
  assertCase(
    "identity.unique-ids",
    new Set(SCIENTIFIC_CAPABILITY_IDENTITIES.map(({ id }) => id)).size === 9
  );
  assertCase(
    "identity.primary-labels-are-not-explorer-aliases",
    SCIENTIFIC_CAPABILITY_IDENTITIES.every(
      ({ primaryLabelEs }) => !primaryLabelEs.includes("Explorer")
    )
  );
  assertCase(
    "identity.all-have-evidence-and-exclusions",
    SCIENTIFIC_CAPABILITY_IDENTITIES.every(
      ({ evidenceBasis, excludedClaims }) =>
        evidenceBasis.length > 0 && excludedClaims.length > 0
    )
  );
  assertCase(
    "identity.all-historical-aliases-resolve",
    REQUIRED_ALIASES.every(
      (alias) => resolveScientificCapabilityAlias(alias) !== null
    )
  );
  assertCase(
    "identity.alias-resolution-case-insensitive",
    resolveScientificCapabilityAlias("manova explorer")?.id ===
      "multivariate-separation-indicator"
  );
  assertCase(
    "identity.lookup",
    getScientificCapabilityIdentity("mds-neighborhood-view").primaryLabelEs ===
      "Vista MDS con indicador de vecindad"
  );

  assertCase(
    "artifact.taxonomy-unique",
    new Set(SCIENTIFIC_ARTIFACT_KINDS).size ===
      SCIENTIFIC_ARTIFACT_KINDS.length
  );
  assertCase(
    "artifact.live-derived-is-ephemeral",
    LIVE_DERIVED_RESULT_IDENTITY.lifecycle === "ephemeral"
  );
  assertCase(
    "artifact.live-derived-is-not-citable",
    LIVE_DERIVED_RESULT_IDENTITY.citable === false
  );
  assertCase(
    "artifact.live-derived-is-not-persistable",
    LIVE_DERIVED_RESULT_IDENTITY.persistencePolicy === "forbidden"
  );
};

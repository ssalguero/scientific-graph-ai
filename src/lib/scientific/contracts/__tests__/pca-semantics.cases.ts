import {
  GE_PCA_SEMANTICS,
  PCA_CROSS_IMPLEMENTATION_POLICY,
  PCA_SEMANTIC_DESCRIPTORS,
  VGB_PCA_SEMANTICS,
} from "../pca-semantics";
import type { ContractFoundationAssertCase } from "./run-assertions";

export const runPcaSemanticCases = (
  assertCase: ContractFoundationAssertCase
): void => {
  assertCase(
    "pca.two-federated-descriptors",
    PCA_SEMANTIC_DESCRIPTORS.length === 2 &&
      new Set(PCA_SEMANTIC_DESCRIPTORS.map(({ id }) => id)).size === 2
  );
  assertCase(
    "pca.distinct-input-models",
    String(GE_PCA_SEMANTICS.inputModel.observationUnit) !==
      String(VGB_PCA_SEMANTICS.inputModel.observationUnit) &&
      String(GE_PCA_SEMANTICS.inputModel.missingValuePolicy) !==
        String(VGB_PCA_SEMANTICS.inputModel.missingValuePolicy)
  );
  assertCase(
    "pca.ge-always-standardizes",
    GE_PCA_SEMANTICS.standardization.policy === "always-standardize"
  );
  assertCase(
    "pca.vgb-standardization-configurable",
    VGB_PCA_SEMANTICS.standardization.policy === "configurable" &&
      VGB_PCA_SEMANTICS.standardization.scale.includes(
        "pcaStandardize=true"
      )
  );
  assertCase(
    "pca.sample-covariance-documented",
    GE_PCA_SEMANTICS.standardization.covarianceDenominator === "n-1" &&
      VGB_PCA_SEMANTICS.standardization.covarianceDenominator === "n-1"
  );
  assertCase(
    "pca.sign-conventions-explicit-and-distinct",
    GE_PCA_SEMANTICS.signConvention.policy ===
      "iteration-seed-no-canonicalization" &&
      VGB_PCA_SEMANTICS.signConvention.policy === "first-nonzero-positive"
  );
  assertCase(
    "pca.no-forced-equality",
    PCA_CROSS_IMPLEMENTATION_POLICY.forceEquality === false &&
      PCA_CROSS_IMPLEMENTATION_POLICY.comparableInvariants.length > 0
  );
};

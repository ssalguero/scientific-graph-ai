/**
 * DATA-I8 — Boundary enforcement unit cases.
 */
import {
  DATA_FROZEN_CAPABILITY_GROUPS,
  DATA_FROZEN_CONTRACT_CATEGORIES,
  DATA_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES,
  DATA_INTERNAL_FOLDER_SEGMENTS,
  DATA_PUBLIC_IMPORT_PREFIXES,
  DATA_TRANSITIONAL_ENGINE_LIB_ALLOWLIST,
  isAllowedDataPublicImport,
  isDataPackageImport,
  isForbiddenDataInternalImport,
} from "../internal/boundary-policy";

export type BoundaryCaseResult = {
  id: string;
  pass: boolean;
  detail: string;
};

export async function runDataBoundaryEnforcementCaseSuite(): Promise<
  BoundaryCaseResult[]
> {
  const results: BoundaryCaseResult[] = [];
  const check = (id: string, pass: boolean, detail: string) => {
    results.push({ id, pass, detail });
  };

  check(
    "policy.publicPrefixes.min",
    DATA_PUBLIC_IMPORT_PREFIXES.length >= 2,
    `prefixes=${DATA_PUBLIC_IMPORT_PREFIXES.length}`
  );

  check(
    "policy.internalSegments.count",
    DATA_INTERNAL_FOLDER_SEGMENTS.length === 7,
    `segments=${DATA_INTERNAL_FOLDER_SEGMENTS.length}`
  );

  check(
    "policy.forbiddenReexports.count",
    DATA_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES.length === 7,
    `reexports=${DATA_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES.length}`
  );

  check(
    "policy.capabilityGroups.six",
    DATA_FROZEN_CAPABILITY_GROUPS.length === 6,
    `groups=${DATA_FROZEN_CAPABILITY_GROUPS.length}`
  );

  check(
    "policy.contractCategories.six",
    DATA_FROZEN_CONTRACT_CATEGORIES.length === 6,
    `categories=${DATA_FROZEN_CONTRACT_CATEGORIES.length}`
  );

  check(
    "policy.allow.dataRoot",
    isAllowedDataPublicImport("@/data"),
    "@/data allowed"
  );

  check(
    "policy.allow.contracts",
    isAllowedDataPublicImport("@/data/contracts"),
    "@/data/contracts allowed"
  );

  check(
    "policy.allow.contractsSub",
    isAllowedDataPublicImport("@/data/contracts/catalog"),
    "@/data/contracts/* allowed"
  );

  check(
    "policy.forbid.model",
    isForbiddenDataInternalImport("@/data/model/dataset-manager"),
    "model deep import forbidden"
  );

  check(
    "policy.forbid.internal",
    isForbiddenDataInternalImport("@/data/internal/compose-domain"),
    "internal import forbidden"
  );

  check(
    "policy.forbid.integration",
    isForbiddenDataInternalImport("@/data/integration/integration-layer"),
    "integration import forbidden"
  );

  check(
    "policy.forbid.publicDeep",
    isForbiddenDataInternalImport("@/data/public/public-api-factory"),
    "public deep import forbidden for consumers"
  );

  check(
    "policy.forbid.repository",
    isForbiddenDataInternalImport("@/data/repository/repository-services"),
    "repository deep import forbidden"
  );

  check(
    "policy.packageDetect.root",
    isDataPackageImport("@/data"),
    "@/data detected as package import"
  );

  check(
    "policy.packageDetect.unrelated",
    !isDataPackageImport("@/engine"),
    "@/engine not a DATA package import"
  );

  check(
    "policy.rootNotForbidden",
    !isForbiddenDataInternalImport("@/data"),
    "@/data itself not classified as forbidden internal"
  );

  check(
    "policy.transitionalAllowlist.nonEmpty",
    DATA_TRANSITIONAL_ENGINE_LIB_ALLOWLIST.length >= 3,
    `transitional=${DATA_TRANSITIONAL_ENGINE_LIB_ALLOWLIST.length}`
  );

  check(
    "policy.transitional.importAdapter",
    DATA_TRANSITIONAL_ENGINE_LIB_ALLOWLIST.some((p) =>
      p.includes("lib-import-adapter")
    ),
    "lib-import-adapter listed"
  );

  check(
    "policy.transitional.projectAdapter",
    DATA_TRANSITIONAL_ENGINE_LIB_ALLOWLIST.some((p) =>
      p.includes("LocalProjectAdapter")
    ),
    "LocalProjectAdapter listed"
  );

  check(
    "policy.transitional.exportAdapter",
    DATA_TRANSITIONAL_ENGINE_LIB_ALLOWLIST.some((p) =>
      p.includes("lib-project-export-adapter")
    ),
    "export adapter listed"
  );

  // Negative: unrelated path should not be allowed as public DATA
  check(
    "policy.reject.engineAsData",
    !isAllowedDataPublicImport("@/engine"),
    "@/engine is not DATA public"
  );

  check(
    "policy.reject.dataPublicAsRoot",
    !isAllowedDataPublicImport("@/data/public"),
    "@/data/public not in allowlist (use @/data)"
  );

  check(
    "policy.forbid.processing",
    isForbiddenDataInternalImport(
      "@/data/processing/transformation-engine"
    ),
    "processing deep import forbidden"
  );

  check(
    "policy.forbid.validation",
    isForbiddenDataInternalImport("@/data/validation/validation-engine"),
    "validation deep import forbidden"
  );

  check(
    "policy.forbid.metadata",
    isForbiddenDataInternalImport("@/data/metadata/metadata-manager"),
    "metadata deep import forbidden"
  );

  check(
    "policy.groups.includeDataset",
    (DATA_FROZEN_CAPABILITY_GROUPS as readonly string[]).includes("Dataset"),
    "Dataset group frozen"
  );

  check(
    "policy.groups.includeRepository",
    (DATA_FROZEN_CAPABILITY_GROUPS as readonly string[]).includes(
      "Repository"
    ),
    "Repository group frozen"
  );

  check(
    "policy.categories.includeLifecycle",
    (DATA_FROZEN_CONTRACT_CATEGORIES as readonly string[]).includes(
      "Lifecycle"
    ),
    "Lifecycle category frozen"
  );

  check(
    "policy.categories.includePublication",
    (DATA_FROZEN_CONTRACT_CATEGORIES as readonly string[]).includes(
      "Publication"
    ),
    "Publication category frozen"
  );

  check(
    "policy.segments.includeInternal",
    (DATA_INTERNAL_FOLDER_SEGMENTS as readonly string[]).includes("internal"),
    "internal segment listed"
  );

  check(
    "policy.segments.includeIntegration",
    (DATA_INTERNAL_FOLDER_SEGMENTS as readonly string[]).includes(
      "integration"
    ),
    "integration segment listed"
  );

  return results;
}

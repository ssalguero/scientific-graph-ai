import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { runIdentityCases } from "../src/lib/scientific/contracts/__tests__/identity.cases";
import { runInventoryCases } from "../src/lib/scientific/contracts/__tests__/inventory.cases";
import { runPcaSemanticCases } from "../src/lib/scientific/contracts/__tests__/pca-semantics.cases";
import { runProvenanceCases } from "../src/lib/scientific/contracts/__tests__/provenance.cases";
import {
  createContractFoundationAssertCase,
  type ContractFoundationCaseResult,
} from "../src/lib/scientific/contracts/__tests__/run-assertions";
import { SCIENTIFIC_RESULT_CONTRACT_INVENTORY } from "../src/lib/scientific/contracts/result-inventory";

const MIN_CASE_COUNT = 35;
const root = process.cwd();
const contractsRoot = join(root, "src/lib/scientific/contracts");

const listTypeScriptFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listTypeScriptFiles(path);
    return entry.isFile() && entry.name.endsWith(".ts") ? [path] : [];
  });

const results: ContractFoundationCaseResult[] = [];
const assertCase = createContractFoundationAssertCase(results);

runIdentityCases(assertCase);
runProvenanceCases(assertCase);
runInventoryCases(assertCase);
runPcaSemanticCases(assertCase);

const contractFiles = listTypeScriptFiles(contractsRoot);
const contractSource = contractFiles
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

assertCase(
  "structure.no-data-internal-imports",
  !/from\s+["'][^"']*(?:\/data\/internal|@\/data\/internal)[^"']*["']/.test(
    contractSource
  )
);
assertCase(
  "structure.no-monolithic-result-model",
  !/\b(?:type|interface|class)\s+ResultModel\b/.test(contractSource)
);
assertCase(
  "structure.federated-modules",
  contractFiles.some((path) => path.endsWith("capability-identity.ts")) &&
    contractFiles.some((path) => path.endsWith("artifacts.ts")) &&
    contractFiles.some((path) => path.endsWith("provenance.ts")) &&
    contractFiles.some((path) => path.endsWith("result-inventory.ts")) &&
    contractFiles.some((path) => path.endsWith("pca-semantics.ts"))
);

const ownerPaths = new Set(
  SCIENTIFIC_RESULT_CONTRACT_INVENTORY.flatMap(
    (descriptor) => descriptor.ownerPaths
  )
);
const missingOwnerPaths = [...ownerPaths].filter(
  (path) => !existsSync(join(root, path))
);
assertCase(
  "structure.inventory-owner-paths-exist",
  missingOwnerPaths.length === 0,
  missingOwnerPaths.length > 0
    ? `missing: ${missingOwnerPaths.join(", ")}`
    : undefined
);

const failed = results.filter((result) => !result.pass);
const summary = {
  phase: "pr1-contract-foundation-unit",
  pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
  caseCount: results.length,
  minCaseCount: MIN_CASE_COUNT,
  failed: failed.map(({ id }) => id),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — pr1-contract-foundation-unit"
    : `\nFAIL — pr1-contract-foundation-unit (${failed
        .map(({ id }) => id)
        .join(", ")})`
);
process.exit(summary.pass ? 0 : 1);

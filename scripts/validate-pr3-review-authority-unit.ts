import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runReviewAuthorityCases } from "../src/lib/scientific/report/__tests__/review-authority.cases";
import {
  createAssertCase,
  type CaseResult,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);
runReviewAuthorityCases(assertCase);

const read = (path: string): string =>
  readFileSync(join(process.cwd(), path), "utf8");
const contract = read(
  "src/lib/scientific/contracts/generated-text-review.ts"
);
const page = read("src/app/page.tsx");
const persistence = read(
  "src/lib/scientific/report/review-persistence.ts"
);

assertCase(
  "pr3a.integration.states-explicit",
  contract.includes('"GENERATED"') &&
    contract.includes('"RESEARCHER_REVIEWED"') &&
    contract.includes('"RESEARCHER_APPROVED"')
);
assertCase(
  "pr3a.integration.validity-separate",
  contract.includes('"CURRENT"') &&
    contract.includes('"STALE"') &&
    contract.includes('"INVALID"') &&
    contract.includes('"UNKNOWN"')
);
assertCase(
  "pr3a.integration.project-extension",
  persistence.includes(
    '"scientific-graph-ai.review-authority/v1"'
  ) &&
    page.includes("setReviewAuthorityRecordsOnExtensions") &&
    page.includes("projectExtensions")
);
assertCase(
  "pr3a.integration.pdf-pack-guard",
  page.includes("buildScientificReportExportReviewManifest") &&
    page.includes("reviewExportAllowed") &&
    page.includes("reviewManifest")
);
assertCase(
  "pr3a.boundary.no-ai-runtime",
  !contract.includes("@/ai") &&
    !read("src/lib/scientific/report/review-authority.ts").includes("@/ai")
);

const failed = results.filter((result) => !result.pass);
const summary = {
  phase: "pr3-review-authority-unit",
  pass: failed.length === 0 && results.length >= 20,
  caseCount: results.length,
  minCaseCount: 20,
  failed: failed.map((result) => result.id),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

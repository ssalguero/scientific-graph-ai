import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  createAssertCase,
  type CaseResult,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";
import { runPr5Wave1ContinuityCases } from "../src/lib/project/__tests__/pr5-wave1-continuity.cases";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);
runPr5Wave1ContinuityCases(assertCase);

const read = (path: string): string =>
  readFileSync(join(process.cwd(), path), "utf8");

assertCase(
  "pr5.wave1.boundary.no-product-figure-module-edit",
  !read("src/lib/scientific/figure/lifecycle.ts").includes("pr5-wave1") &&
    !read("src/lib/scientific/figure/review.ts").includes("pr5-wave1") &&
    !read("src/lib/scientific/report/review-export-guard.ts").includes(
      "pr5-wave1"
    ) &&
    !read("src/lib/scientific/contracts/vgb-figure-lifecycle.ts").includes(
      "pr5-wave1"
    )
);

const failed = results.filter((result) => !result.pass);
const summary = {
  phase: "pr5-wave1-unit",
  pass: failed.length === 0 && results.length >= 14,
  caseCount: results.length,
  minCaseCount: 14,
  failed: failed.map((result) => result.id),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

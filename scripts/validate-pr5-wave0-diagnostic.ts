import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  createAssertCase,
  type CaseResult,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";
import {
  runPr5Wave0ContinuityCases,
  type Pr5Wave0DiagnosticReport,
} from "../src/lib/project/__tests__/pr5-wave0-continuity.cases";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);
const diagnostic: Pr5Wave0DiagnosticReport =
  runPr5Wave0ContinuityCases(assertCase);

const read = (path: string): string =>
  readFileSync(join(process.cwd(), path), "utf8");

assertCase(
  "pr5.wave0.boundary.no-product-figure-module-edit",
  !read("src/lib/scientific/figure/lifecycle.ts").includes("pr5-wave0") &&
    !read("src/lib/scientific/figure/review.ts").includes("pr5-wave0") &&
    !read("src/lib/scientific/report/review-export-guard.ts").includes(
      "pr5-wave0"
    )
);

const failed = results.filter((result) => !result.pass);
const summary = {
  phase: "pr5-wave0-diagnostic",
  pass: failed.length === 0 && results.length >= 16,
  caseCount: results.length,
  minCaseCount: 16,
  failed: failed.map((result) => result.id),
  staleDetermination: {
    classification: diagnostic.staleClassification,
    pr4CorrectiveDebt: diagnostic.pr4CorrectiveDebt,
    pr4DebtNote: diagnostic.pr4DebtNote,
    pr5OwnershipChange: diagnostic.pr5OwnershipChange,
    isolatedPreviewRebuild: diagnostic.isolatedPreviewRebuild,
    projectRoundTrip: diagnostic.projectRoundTrip,
    reviewJsonReviveEvidenceUnchanged:
      diagnostic.reviewJsonReviveEvidenceUnchanged,
    sourceRevision: {
      before: diagnostic.sourceRevisionBefore,
      after: diagnostic.sourceRevisionAfter,
    },
    datasetId: {
      before: diagnostic.datasetIdBefore,
      after: diagnostic.datasetIdAfter,
    },
    preserved: {
      publicationId: diagnostic.publicationId,
      snapshotId: diagnostic.snapshotId,
      reviewRecordId: diagnostic.reviewRecordId,
      publicationIdPreserved: diagnostic.publicationIdPreserved,
      snapshotIdPreserved: diagnostic.snapshotIdPreserved,
      reviewRecordIdPreserved: diagnostic.reviewRecordIdPreserved,
    },
  },
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);

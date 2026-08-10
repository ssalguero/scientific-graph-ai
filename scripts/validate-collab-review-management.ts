/**
 * COLLAB-I5 — Review & Lifecycle readiness gate.
 *
 * Authority: COLLAB-P6 I5 · COLLAB-P2 · COLLAB-P3 C4 · COLLAB-P5 Review→Revise→Approve ·
 * docs/COLLAB/implementation/COLLAB-I5-Review-Lifecycle.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_REVIEW_MANAGEMENT_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import {
  approveReview,
  createReviewRegistry,
  requestRevision,
  resumeReview,
  startReview,
} from "../src/collab/review-management";
import { asCollabPeerIdentityRef } from "../src/collab/membership/types";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const reviewDir = join(collabDir, "review-management");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const toPosix = (p: string) => p.replace(/\\/g, "/");
const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

const collectTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const child = join(abs, name);
      if (statSync(child).isDirectory()) walk(child);
      else if (/\.(ts|tsx)$/.test(name)) out.push(child);
    }
  };
  walk(dir);
  return out;
};

const REQUIRED_FILES = [
  "src/collab/review-management/index.ts",
  "src/collab/review-management/status.ts",
  "src/collab/review-management/identity.ts",
  "src/collab/review-management/lifecycle.ts",
  "src/collab/review-management/types.ts",
  "src/collab/review-management/registry.ts",
  "src/collab/review-management/operations.ts",
  "docs/COLLAB/implementation/COLLAB-I5-Review-Lifecycle.md",
];

const FORBIDDEN_FUTURE_DIRS = [
  "src/collab/sharing",
  "src/collab/annotations",
  "src/collab/discussions",
  "src/collab/reviews",
  "src/collab/presence",
  "src/collab/sessions",
  "src/collab/activity",
  "src/collab/notifications",
  "src/collab/integration",
  "src/collab/hardening",
  "src/collab/contracts",
  "src/collab/governance",
  "src/collab/audit",
];

const FORBIDDEN_SOURCE_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "realtime", re: /\b(WebSocket|CRDT|OperationalTransform|liveMultiplayer)\b/ },
  { id: "cursor-runtime", re: /\b(updateCursor|broadcastPresence)\b/ },
  { id: "speculative-revision", re: /\bsubmitRevision\b/ },
];

const PEER_IMPORT_RE =
  /from\s+["']@\/(engine|data|ai|ui|plugins|performance|components|app)(\/|["'])/;

for (const rel of REQUIRED_FILES) {
  assertCase(
    `layout.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "layout.dir.review-management",
  existsSync(reviewDir),
  "review-management package must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_REVIEW_MANAGEMENT_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}
assertCase(
  "barrel.no.ops.leak",
  !barrel.includes("startReview") &&
    !barrel.includes("approveReview") &&
    !barrel.includes("requestRevision") &&
    !barrel.includes("resumeReview"),
  "public barrel must not expose review operations",
);

assertCase(
  "policy.forbids.review",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes(
    "@/collab/review-management",
  ),
  "@/collab/review-management must be consumer-forbidden",
);

const identitySrc = readFileSync(join(reviewDir, "identity.ts"), "utf8");
assertCase(
  "identity.c4",
  identitySrc.includes('"C4"') || identitySrc.includes("'C4'"),
  "C4 Review Management identity present",
);
assertCase(
  "identity.not.engine",
  identitySrc.includes("equalsEngineWorkflow: false") ||
    identitySrc.includes("equalsEngineWorkflow:false"),
  "Review must not equal ENGINE workflow",
);

const lifecycleSrc = readFileSync(join(reviewDir, "lifecycle.ts"), "utf8");
assertCase(
  "lifecycle.stages",
  lifecycleSrc.includes("Review") &&
    lifecycleSrc.includes("Revise") &&
    lifecycleSrc.includes("Approve"),
  "I5 lifecycle stages Review/Revise/Approve present",
);
assertCase(
  "lifecycle.archive.deferred",
  lifecycleSrc.includes("COLLAB_I5_DEFERRED_LIFECYCLE_STAGES") &&
    lifecycleSrc.includes("Archive"),
  "Archive must be explicitly deferred",
);

const statusSrc = readFileSync(join(reviewDir, "status.ts"), "utf8");
assertCase(
  "status.phase",
  statusSrc.includes("COLLAB-I5"),
  "phase marker must be COLLAB-I5",
);
assertCase(
  "status.complete",
  statusSrc.includes("REVIEW_LIFECYCLE_COMPLETE"),
  "status must be REVIEW_LIFECYCLE_COMPLETE",
);

// Behavioral smoke — Review → Revise → Review → Approve
const registry = createReviewRegistry();
const peer = "data-entity-review-1";
const started = startReview(registry, {
  peerIdentityRef: peer,
  openedByActorId: "actor-reviewer",
  title: "Review peer identity",
  now: "1970-01-01T00:00:00.000Z",
});
assertCase(
  "ops.start.ok",
  started.ok && started.value.lifecycleStage === "Review",
  started.ok ? "started" : started.error,
);

let reviseOk = false;
let resumeOk = false;
let approveOk = false;
let illegalOk = false;

if (started.ok) {
  const revised = requestRevision(registry, {
    reviewId: started.value.id,
    actorId: "actor-reviewer",
    note: "Please clarify method section",
    now: "1970-01-01T00:00:01.000Z",
  });
  reviseOk = revised.ok && revised.value.lifecycleStage === "Revise";
  assertCase(
    "ops.revise.ok",
    reviseOk,
    revised.ok ? "revised" : revised.error,
  );

  if (revised.ok) {
    const resumed = resumeReview(registry, {
      reviewId: revised.value.id,
      actorId: "actor-editor",
      now: "1970-01-01T00:00:02.000Z",
    });
    resumeOk = resumed.ok && resumed.value.lifecycleStage === "Review";
    assertCase(
      "ops.resume.ok",
      resumeOk,
      resumed.ok ? "resumed" : resumed.error,
    );

    if (resumed.ok) {
      const approved = approveReview(registry, {
        reviewId: resumed.value.id,
        actorId: "actor-owner",
        now: "1970-01-01T00:00:03.000Z",
      });
      approveOk =
        approved.ok &&
        approved.value.lifecycleStage === "Approve" &&
        approved.value.approvedByActorId === "actor-owner";
      assertCase(
        "ops.approve.ok",
        approveOk,
        approved.ok ? "approved" : approved.error,
      );

      const illegal = requestRevision(registry, {
        reviewId: resumed.value.id,
        actorId: "actor-reviewer",
      });
      illegalOk = !illegal.ok;
      assertCase(
        "ops.illegal.after.approve",
        illegalOk,
        illegal.ok ? "should reject" : illegal.error,
      );
    } else {
      assertCase("ops.approve.ok", false, "skipped — resume failed");
      assertCase("ops.illegal.after.approve", false, "skipped");
    }
  } else {
    assertCase("ops.resume.ok", false, "skipped — revise failed");
    assertCase("ops.approve.ok", false, "skipped");
    assertCase("ops.illegal.after.approve", false, "skipped");
  }

  const fromReviseToApprove = startReview(registry, {
    peerIdentityRef: peer,
    openedByActorId: "actor-reviewer",
    title: "Second review",
    now: "1970-01-01T00:00:04.000Z",
  });
  if (fromReviseToApprove.ok) {
    requestRevision(registry, {
      reviewId: fromReviseToApprove.value.id,
      actorId: "actor-reviewer",
    });
    const bad = approveReview(registry, {
      reviewId: fromReviseToApprove.value.id,
      actorId: "actor-owner",
    });
    assertCase(
      "ops.illegal.revise.to.approve",
      !bad.ok,
      bad.ok ? "Revise→Approve must be illegal" : bad.error,
    );
  } else {
    assertCase("ops.illegal.revise.to.approve", false, "skipped");
  }
} else {
  assertCase("ops.revise.ok", false, "skipped — start failed");
  assertCase("ops.resume.ok", false, "skipped");
  assertCase("ops.approve.ok", false, "skipped");
  assertCase("ops.illegal.after.approve", false, "skipped");
  assertCase("ops.illegal.revise.to.approve", false, "skipped");
}

const peerRef = asCollabPeerIdentityRef(peer);
assertCase(
  "ops.list.by.peer",
  registry.listReviewsForPeer(peerRef).length >= 1,
  "reviews indexed by peer identity",
);

assertCase(
  "ops.smoke.complete",
  started.ok && reviseOk && resumeOk && approveOk && illegalOk,
  "Review → Revise → Review → Approve smoke path",
);

const tsFiles = collectTsFiles(collabDir);
assertCase(
  "package.ts.count.bounded",
  tsFiles.length <= 140,
  `COLLAB through I10 should remain bounded (found ${tsFiles.length} .ts files)`,
);

for (const file of tsFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN_SOURCE_PATTERNS) {
    const hit = re.test(src);
    assertCase(
      `no.forbidden.${id}.${rel}`,
      !hit,
      hit ? `forbidden pattern ${re} in ${rel}` : "clean",
    );
  }
  if (!rel.includes("src/collab/review-management/")) {
    const leak = /\b(startReview|approveReview|requestRevision|resumeReview)\b/.test(
      src,
    );
    assertCase(
      `no.review.ops.leak.${rel}`,
      !leak,
      leak ? "review ops must stay inside review-management" : "clean",
    );
  }
  if (!rel.includes("src/collab/supporting/")) {
    const leak =
      /\b(setPresence|openCollaborativeSession|closeCollaborativeSession|recordActivity|emitNotification)\b/.test(
        src,
      );
    assertCase(
      `no.supporting.ops.leak.${rel}`,
      !leak,
      leak ? "supporting ops must stay inside supporting/" : "clean",
    );
  }
  if (
    !rel.includes("src/collab/governance-audit/") &&
    !rel.includes("src/collab/hardening-controls/")
  ) {
    const leak =
      /\b(recordGovernedAuditEntry|verifyAuditTrailIntegrity|archiveCollaborationContext)\b/.test(
        src,
      );
    assertCase(
      `no.gov.ops.leak.${rel}`,
      !leak,
      leak ? "governance ops must stay inside governance-audit/" : "clean",
    );
  }
  if (!rel.includes("src/collab/hardening-controls/")) {
    const hardLeak =
      /\b(verifyPermissionIntegrity|resistSharedAccessAbuse|verifySharedAccessAbuseResistance|verifyActivityTrailIntegrity|attestHardeningReadiness|verifyHardeningGates)\b/.test(
        src,
      );
    assertCase(
      `no.hard.ops.leak.${rel}`,
      !hardLeak,
      hardLeak ? "hardening ops must stay inside hardening-controls/" : "clean",
    );
  }
  assertCase(
    `no.peer.import.${rel}`,
    !PEER_IMPORT_RE.test(src) ||
      (rel.includes("src/collab/cross-domain/") &&
        !/from\s+["']@\/(ai|plugins|performance|components|app)/.test(src) &&
        !/from\s+["']@\/(engine|data|ui)\//.test(src)),
    PEER_IMPORT_RE.test(src) && !rel.includes("src/collab/cross-domain/")
      ? "peer import forbidden outside cross-domain"
      : "clean",
  );
}

for (const rel of FORBIDDEN_FUTURE_DIRS) {
  assertCase(
    `no.future.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel))
      ? "must not exist (DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE)"
      : "absent",
  );
}

assertCase(
  "i0.i1.i2.i3.i4.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "infrastructure/status.ts")) &&
    existsSync(join(collabDir, "membership/operations.ts")) &&
    existsSync(join(collabDir, "permissions/evaluate.ts")) &&
    existsSync(join(collabDir, "annotation-discussion/operations.ts")),
  "I0–I4 baselines must remain present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(
    `\nvalidate-collab-review-management: ${failed.length} failure(s)`,
  );
  process.exit(1);
}

console.log(
  `\nvalidate-collab-review-management: ${results.length} checks PASS`,
);

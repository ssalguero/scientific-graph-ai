/**
 * COLLAB-I4 — Annotation & Discussion readiness gate.
 *
 * Authority: COLLAB-P6 I4 · COLLAB-P2 · COLLAB-P3 C5–C6 · COLLAB-P5 Collaborate ·
 * docs/COLLAB/implementation/COLLAB-I4-Annotation-Discussion.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_ANNOTATION_DISCUSSION_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import {
  createAnnotation,
  createAnnotationDiscussionRegistry,
  createDiscussion,
  createScientificComment,
  postDiscussionMessage,
} from "../src/collab/annotation-discussion";
import { asCollabPeerIdentityRef } from "../src/collab/membership/types";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const adDir = join(collabDir, "annotation-discussion");

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
  "src/collab/annotation-discussion/index.ts",
  "src/collab/annotation-discussion/status.ts",
  "src/collab/annotation-discussion/annotation-identity.ts",
  "src/collab/annotation-discussion/discussion-identity.ts",
  "src/collab/annotation-discussion/lifecycle.ts",
  "src/collab/annotation-discussion/types.ts",
  "src/collab/annotation-discussion/registry.ts",
  "src/collab/annotation-discussion/operations.ts",
  "docs/COLLAB/implementation/COLLAB-I4-Annotation-Discussion.md",
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
  { id: "review-runtime", re: /\bsubmitRevision\b/ },
  { id: "cursor-runtime", re: /\b(updateCursor|broadcastPresence)\b/ },
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
  "layout.dir.annotation-discussion",
  existsSync(adDir),
  "annotation-discussion package must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_ANNOTATION_DISCUSSION_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}
assertCase(
  "barrel.no.ops.leak",
  !barrel.includes("createAnnotation") &&
    !barrel.includes("createDiscussion") &&
    !barrel.includes("postDiscussionMessage"),
  "public barrel must not expose annotation/discussion operations",
);

assertCase(
  "policy.forbids.ad",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes(
    "@/collab/annotation-discussion",
  ),
  "@/collab/annotation-discussion must be consumer-forbidden",
);

const annId = readFileSync(join(adDir, "annotation-identity.ts"), "utf8");
assertCase(
  "identity.c5",
  annId.includes('"C5"') || annId.includes("'C5'"),
  "C5 Annotation Management identity present",
);

const discId = readFileSync(join(adDir, "discussion-identity.ts"), "utf8");
assertCase(
  "identity.c6",
  discId.includes('"C6"') || discId.includes("'C6'"),
  "C6 Discussion Management identity present",
);

const lifecycleSrc = readFileSync(join(adDir, "lifecycle.ts"), "utf8");
assertCase(
  "lifecycle.collaborate",
  lifecycleSrc.includes("Collaborate"),
  "I4 lifecycle stage Collaborate present",
);
assertCase(
  "lifecycle.review.deferred",
  lifecycleSrc.includes("COLLAB_I4_DEFERRED_LIFECYCLE_STAGES") &&
    lifecycleSrc.includes("Review"),
  "Review+ must be explicitly deferred",
);

const statusSrc = readFileSync(join(adDir, "status.ts"), "utf8");
assertCase(
  "status.phase",
  statusSrc.includes("COLLAB-I4"),
  "phase marker must be COLLAB-I4",
);
assertCase(
  "status.complete",
  statusSrc.includes("ANNOTATION_DISCUSSION_COMPLETE"),
  "status must be ANNOTATION_DISCUSSION_COMPLETE",
);

// Behavioral smoke
const registry = createAnnotationDiscussionRegistry();
const peer = "data-entity-42";
const annotation = createAnnotation(registry, {
  peerIdentityRef: peer,
  authorActorId: "actor-editor",
  body: "Mark region of interest",
  now: "1970-01-01T00:00:00.000Z",
});
assertCase(
  "ops.annotation.ok",
  annotation.ok && annotation.value.lifecycleStage === "Collaborate",
  annotation.ok ? "created" : annotation.error,
);

const comment = createScientificComment(registry, {
  peerIdentityRef: peer,
  authorActorId: "actor-editor",
  body: "Scientific note on peer identity",
  now: "1970-01-01T00:00:00.000Z",
});
assertCase(
  "ops.comment.ok",
  comment.ok && comment.value.kind === "scientific-comment",
  comment.ok ? "created" : comment.error,
);

const discussion = createDiscussion(registry, {
  peerIdentityRef: peer,
  createdByActorId: "actor-editor",
  title: "Thread on entity",
  now: "1970-01-01T00:00:00.000Z",
});
assertCase(
  "ops.discussion.ok",
  discussion.ok,
  discussion.ok ? "created" : discussion.error,
);

let messageOk = false;
if (discussion.ok) {
  const message = postDiscussionMessage(registry, {
    discussionId: discussion.value.id,
    authorActorId: "actor-reviewer",
    body: "First reply",
    now: "1970-01-01T00:00:00.000Z",
  });
  messageOk = message.ok;
  assertCase(
    "ops.message.ok",
    message.ok,
    message.ok ? "posted" : message.error,
  );
} else {
  assertCase("ops.message.ok", false, "skipped — discussion failed");
}

const peerRef = asCollabPeerIdentityRef(peer);
assertCase(
  "ops.list.by.peer",
  registry.listAnnotationsForPeer(peerRef).length >= 2 &&
    registry.listDiscussionsForPeer(peerRef).length >= 1,
  "annotations and discussions indexed by peer identity",
);

assertCase(
  "ops.no.peer.mutation",
  annotation.ok && annotation.value.peerIdentityRef === peer,
  "peer identity remains opaque reference",
);

assertCase(
  "ops.smoke.complete",
  annotation.ok && comment.ok && discussion.ok && messageOk,
  "Annotation → Comment → Discussion → Message smoke path",
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
  "i0.i1.i2.i3.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "infrastructure/status.ts")) &&
    existsSync(join(collabDir, "membership/operations.ts")) &&
    existsSync(join(collabDir, "permissions/evaluate.ts")),
  "I0–I3 baselines must remain present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(
    `\nvalidate-collab-annotation-discussion: ${failed.length} failure(s)`,
  );
  process.exit(1);
}

console.log(
  `\nvalidate-collab-annotation-discussion: ${results.length} checks PASS`,
);

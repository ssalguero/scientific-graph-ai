/**
 * COLLAB-I2 — Sharing & Membership readiness gate.
 *
 * Authority: COLLAB-P6 I2 · COLLAB-P2 · COLLAB-P3 C2 · COLLAB-P5 Share/Join ·
 * docs/COLLAB/implementation/COLLAB-I2-Sharing-Membership.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_SHARING_MEMBERSHIP_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import { COLLAB_CONCEPTUAL_ROLES } from "../src/collab/membership/roles";
import { COLLAB_I2_LIFECYCLE_STAGES } from "../src/collab/membership/lifecycle";
import {
  assignConceptualRole,
  createMembershipRegistry,
  joinMembership,
  openWorkspace,
  shareProject,
} from "../src/collab/membership";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const membershipDir = join(collabDir, "membership");

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
  "src/collab/membership/index.ts",
  "src/collab/membership/status.ts",
  "src/collab/membership/identity.ts",
  "src/collab/membership/roles.ts",
  "src/collab/membership/lifecycle.ts",
  "src/collab/membership/types.ts",
  "src/collab/membership/registry.ts",
  "src/collab/membership/operations.ts",
  "docs/COLLAB/implementation/COLLAB-I2-Sharing-Membership.md",
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
  { id: "annotation-runtime", re: /\b(postComment|startDiscussion)\b/ },
  { id: "review-runtime", re: /\bsubmitRevision\b/ },
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
  "layout.dir.membership",
  existsSync(membershipDir),
  "membership package must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_SHARING_MEMBERSHIP_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}
assertCase(
  "barrel.no.ops.leak",
  !barrel.includes("shareProject") &&
    !barrel.includes("joinMembership") &&
    !barrel.includes("createMembershipRegistry"),
  "public barrel must not expose membership operations",
);

assertCase(
  "policy.forbids.membership",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes("@/collab/membership"),
  "@/collab/membership must be consumer-forbidden",
);

const identitySrc = readFileSync(join(membershipDir, "identity.ts"), "utf8");
assertCase(
  "identity.c2",
  identitySrc.includes('"C2"') || identitySrc.includes("'C2'"),
  "C2 Membership Management identity present",
);
assertCase(
  "identity.no.permission.eval",
  /evaluatesPermissions:\s*false/.test(identitySrc),
  "C2 must not evaluate permissions in I2",
);

const rolesSrc = readFileSync(join(membershipDir, "roles.ts"), "utf8");
for (const role of COLLAB_CONCEPTUAL_ROLES) {
  assertCase(
    `roles.${role}`,
    rolesSrc.includes(`"${role}"`),
    `conceptual role ${role} present`,
  );
}

const lifecycleSrc = readFileSync(join(membershipDir, "lifecycle.ts"), "utf8");
for (const stage of COLLAB_I2_LIFECYCLE_STAGES) {
  assertCase(
    `lifecycle.${stage}`,
    lifecycleSrc.includes(`"${stage}"`),
    `I2 lifecycle stage ${stage} present`,
  );
}
assertCase(
  "lifecycle.deferred.collaborate",
  lifecycleSrc.includes("Collaborate") &&
    lifecycleSrc.includes("COLLAB_I2_DEFERRED_LIFECYCLE_STAGES"),
  "Collaborate+ must be explicitly deferred",
);

const statusSrc = readFileSync(join(membershipDir, "status.ts"), "utf8");
assertCase(
  "status.phase",
  statusSrc.includes("COLLAB-I2"),
  "phase marker must be COLLAB-I2",
);
assertCase(
  "status.complete",
  statusSrc.includes("SHARING_MEMBERSHIP_COMPLETE"),
  "status must be SHARING_MEMBERSHIP_COMPLETE",
);

// Behavioral smoke: Share → Workspace → Join
const registry = createMembershipRegistry();
const shared = shareProject(registry, {
  peerProjectRef: "peer-project-1",
  ownerActorId: "actor-owner",
  now: "1970-01-01T00:00:00.000Z",
});
assertCase("ops.share.ok", shared.ok, shared.ok ? "shared" : shared.error);

let workspaceOk = false;
let joinOk = false;
let roleOk = false;
if (shared.ok) {
  const ws = openWorkspace(registry, {
    sharedProjectId: shared.value.id,
    label: "Lab Workspace",
    now: "1970-01-01T00:00:00.000Z",
  });
  workspaceOk = ws.ok;
  assertCase("ops.workspace.ok", ws.ok, ws.ok ? "opened" : ws.error);
  if (ws.ok) {
    const joined = joinMembership(registry, {
      target: { kind: "workspace", workspaceId: ws.value.id },
      actorId: "actor-editor",
      role: "Editor",
      now: "1970-01-01T00:00:00.000Z",
    });
    joinOk = joined.ok;
    assertCase("ops.join.ok", joined.ok, joined.ok ? "joined" : joined.error);
    if (joined.ok) {
      const reassigned = assignConceptualRole(registry, joined.value.id, "Viewer");
      roleOk = reassigned.ok && reassigned.value.role === "Viewer";
      assertCase(
        "ops.assign.role.ok",
        roleOk,
        roleOk ? "reassigned" : "role assign failed",
      );
    }
  }
  assertCase(
    "ops.owner.membership",
    registry.listMemberships().some(
      (m) => m.role === "Owner" && m.actorId === shared.value.openedByActorId,
    ),
    "Share must create Owner membership",
  );
  assertCase(
    "ops.peer.ref.opaque",
    shared.value.peerProjectRef === "peer-project-1",
    "peer project ref preserved as opaque metadata",
  );
} else {
  assertCase("ops.workspace.ok", false, "skipped — share failed");
  assertCase("ops.join.ok", false, "skipped — share failed");
  assertCase("ops.assign.role.ok", false, "skipped — share failed");
  assertCase("ops.owner.membership", false, "skipped — share failed");
  assertCase("ops.peer.ref.opaque", false, "skipped — share failed");
}

assertCase(
  "ops.smoke.complete",
  shared.ok && workspaceOk && joinOk && roleOk,
  "Share → Workspace → Join → role assign smoke path",
);

const snap = registry.snapshot();
assertCase(
  "registry.snapshot",
  snap.sharedProjects.length >= 1 &&
    snap.workspaces.length >= 1 &&
    snap.memberships.length >= 2,
  "registry holds shared project, workspace, memberships",
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
  if (!rel.includes("src/collab/annotation-discussion/")) {
    const leak = /\bcreateAnnotation\b/.test(src);
    assertCase(
      `no.createAnnotation.leak.${rel}`,
      !leak,
      leak ? "createAnnotation must stay inside annotation-discussion" : "clean",
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
  "i0.i1.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "infrastructure/status.ts")),
  "I0 foundation and I1 infrastructure must remain present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-collab-sharing-membership: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-collab-sharing-membership: ${results.length} checks PASS`);

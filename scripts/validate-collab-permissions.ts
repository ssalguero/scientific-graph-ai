/**
 * COLLAB-I3 — Permissions / Permission Service readiness gate.
 *
 * Authority: COLLAB-P6 I3 · COLLAB-P2 · COLLAB-P3 C3 · COLLAB-P4 ·
 * docs/COLLAB/implementation/COLLAB-I3-Permissions.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_PERMISSIONS_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import { COLLAB_COLLABORATIVE_ACTIONS } from "../src/collab/permissions/actions";
import { COLLAB_PERMISSION_MATRIX } from "../src/collab/permissions/matrix";
import {
  evaluatePermission,
  evaluateRolePermission,
} from "../src/collab/permissions/evaluate";
import { COLLAB_CONCEPTUAL_ROLES } from "../src/collab/membership/roles";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const permissionsDir = join(collabDir, "permissions");

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
  "src/collab/permissions/index.ts",
  "src/collab/permissions/status.ts",
  "src/collab/permissions/identity.ts",
  "src/collab/permissions/actions.ts",
  "src/collab/permissions/matrix.ts",
  "src/collab/permissions/evaluate.ts",
  "docs/COLLAB/implementation/COLLAB-I3-Permissions.md",
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
  { id: "annotation-runtime", re: /\b(postComment|startDiscussion)\b/ },
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
  "layout.dir.permissions",
  existsSync(permissionsDir),
  "permissions package must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_PERMISSIONS_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}
assertCase(
  "barrel.no.eval.leak",
  !barrel.includes("evaluatePermission") &&
    !barrel.includes("COLLAB_PERMISSION_MATRIX"),
  "public barrel must not expose permission evaluation APIs",
);

assertCase(
  "policy.forbids.permissions",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes("@/collab/permissions"),
  "@/collab/permissions must be consumer-forbidden",
);

const identitySrc = readFileSync(join(permissionsDir, "identity.ts"), "utf8");
assertCase(
  "identity.c3",
  identitySrc.includes('"C3"') || identitySrc.includes("'C3'"),
  "C3 Permission Service identity present",
);
assertCase(
  "identity.evaluates",
  /evaluatesPermissions:\s*true/.test(identitySrc),
  "C3 must evaluate permissions",
);
assertCase(
  "identity.no.ui.enforcement",
  /enforcesViaUi:\s*false/.test(identitySrc),
  "I3 must not claim UI enforcement",
);

const actionsSrc = readFileSync(join(permissionsDir, "actions.ts"), "utf8");
for (const action of COLLAB_COLLABORATIVE_ACTIONS) {
  assertCase(
    `actions.${action}`,
    actionsSrc.includes(`"${action}"`),
    `collaborative action ${action} present`,
  );
}

const matrixSrc = readFileSync(join(permissionsDir, "matrix.ts"), "utf8");
for (const role of COLLAB_CONCEPTUAL_ROLES) {
  assertCase(
    `matrix.role.${role}`,
    matrixSrc.includes(`${role}:`),
    `matrix covers role ${role}`,
  );
}

const statusSrc = readFileSync(join(permissionsDir, "status.ts"), "utf8");
assertCase(
  "status.phase",
  statusSrc.includes("COLLAB-I3"),
  "phase marker must be COLLAB-I3",
);
assertCase(
  "status.complete",
  statusSrc.includes("PERMISSIONS_COMPLETE"),
  "status must be PERMISSIONS_COMPLETE",
);

const ownershipSrc = readFileSync(
  join(collabDir, "infrastructure/ownership.ts"),
  "utf8",
);
assertCase(
  "ownership.matrices.i3",
  ownershipSrc.includes('permissionMatricesImplementedIn: "COLLAB-I3"'),
  "ownership must record permission matrices realized in I3",
);

// Behavioral smoke
const ownerShare = evaluatePermission({
  role: "Owner",
  action: "share-project",
});
assertCase(
  "eval.owner.share.allow",
  ownerShare.ok && ownerShare.decision.allowed,
  ownerShare.ok ? "allowed" : ownerShare.error,
);

const viewerShare = evaluatePermission({
  role: "Viewer",
  action: "share-project",
});
assertCase(
  "eval.viewer.share.deny",
  viewerShare.ok && !viewerShare.decision.allowed,
  viewerShare.ok ? "denied" : viewerShare.error,
);

const editorView = evaluateRolePermission("Editor", "view-collaboration");
assertCase(
  "eval.editor.view.allow",
  editorView.allowed,
  editorView.reason,
);

const viewerContribute = evaluateRolePermission("Viewer", "contribute-metadata");
assertCase(
  "eval.viewer.contribute.deny",
  !viewerContribute.allowed,
  viewerContribute.reason,
);

const badRole = evaluatePermission({ role: "Superuser", action: "view-collaboration" });
assertCase("eval.bad.role", !badRole.ok, "unknown role rejected");

const badAction = evaluatePermission({ role: "Owner", action: "delete-universe" });
assertCase("eval.bad.action", !badAction.ok, "unknown action rejected");

assertCase(
  "matrix.owner.fullest",
  COLLAB_PERMISSION_MATRIX.Owner.length === COLLAB_COLLABORATIVE_ACTIONS.length,
  "Owner may perform all catalogued collaborative actions",
);
assertCase(
  "matrix.viewer.narrow",
  COLLAB_PERMISSION_MATRIX.Viewer.length === 1 &&
    COLLAB_PERMISSION_MATRIX.Viewer[0] === "view-collaboration",
  "Viewer is view-only",
);

const membershipIdentity = readFileSync(
  join(collabDir, "membership/identity.ts"),
  "utf8",
);
assertCase(
  "i2.still.no.eval",
  /evaluatesPermissions:\s*false/.test(membershipIdentity),
  "C2 must remain non-evaluating (I2 preserved)",
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
  "i0.i1.i2.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "infrastructure/status.ts")) &&
    existsSync(join(collabDir, "membership/operations.ts")),
  "I0–I2 baselines must remain present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-collab-permissions: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-collab-permissions: ${results.length} checks PASS`);

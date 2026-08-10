/**
 * COLLAB-I7 — Governance & Audit readiness gate.
 *
 * Authority: COLLAB-P6 I7 · Charter Audit Principle · COLLAB-P5 Audit ·
 * docs/COLLAB/implementation/COLLAB-I7-Governance-Audit.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_GOVERNANCE_AUDIT_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import {
  archiveCollaborationContext,
  createGovernanceAuditRegistry,
  recordGovernedAuditEntry,
  verifyAuditTrailIntegrity,
} from "../src/collab/governance-audit";
import { asCollabPeerIdentityRef } from "../src/collab/membership/types";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const govDir = join(collabDir, "governance-audit");

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
  "src/collab/governance-audit/index.ts",
  "src/collab/governance-audit/status.ts",
  "src/collab/governance-audit/principle.ts",
  "src/collab/governance-audit/lifecycle.ts",
  "src/collab/governance-audit/types.ts",
  "src/collab/governance-audit/integrity.ts",
  "src/collab/governance-audit/registry.ts",
  "src/collab/governance-audit/operations.ts",
  "docs/COLLAB/implementation/COLLAB-I7-Governance-Audit.md",
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

const GOV_OPS_RE =
  /\b(recordGovernedAuditEntry|verifyAuditTrailIntegrity|archiveCollaborationContext)\b/;

for (const rel of REQUIRED_FILES) {
  assertCase(
    `layout.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "layout.dir.governance-audit",
  existsSync(govDir),
  "governance-audit package must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_GOVERNANCE_AUDIT_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}
assertCase(
  "barrel.no.ops.leak",
  !GOV_OPS_RE.test(barrel),
  "public barrel must not expose governance/audit operations",
);

assertCase(
  "policy.forbids.gov",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes(
    "@/collab/governance-audit",
  ),
  "@/collab/governance-audit must be consumer-forbidden",
);

const principle = readFileSync(join(govDir, "principle.ts"), "utf8");
assertCase(
  "principle.citation",
  principle.includes("Every collaboration action SHALL be auditable"),
  "Audit Principle citation present",
);
assertCase(
  "principle.no.science",
  principle.includes("COLLAB_AUDIT_NEVER_MODIFIES_SCIENCE") &&
    principle.includes("true"),
  "audit must never modify science",
);

const lifecycle = readFileSync(join(govDir, "lifecycle.ts"), "utf8");
assertCase(
  "lifecycle.archive",
  lifecycle.includes("Archive"),
  "P5 Archive governance stage present",
);
assertCase(
  "deferred.i8",
  lifecycle.includes("PeerRuntimeIntegration"),
  "I8 peer integration must remain deferred",
);

const statusSrc = readFileSync(join(govDir, "status.ts"), "utf8");
assertCase(
  "status.phase",
  statusSrc.includes("COLLAB-I7"),
  "phase marker must be COLLAB-I7",
);
assertCase(
  "status.complete",
  statusSrc.includes("GOVERNANCE_AUDIT_COMPLETE"),
  "status must be GOVERNANCE_AUDIT_COMPLETE",
);

// Behavioral smoke
const registry = createGovernanceAuditRegistry();
const peer = "data-entity-gov-1";

const fromI6 = recordGovernedAuditEntry(registry, {
  actorId: "actor-editor",
  operation: "opened-collaborative-session",
  targetRef: peer,
  sourcePhase: "COLLAB-I6",
  now: "1970-01-01T00:00:00.000Z",
});
assertCase(
  "ops.audit.i6",
  fromI6.ok,
  fromI6.ok ? "recorded" : fromI6.error,
);

const fromI5 = recordGovernedAuditEntry(registry, {
  actorId: "actor-reviewer",
  operation: "approve-review",
  targetRef: peer,
  sourcePhase: "COLLAB-I5",
  now: "1970-01-01T00:00:01.000Z",
});
assertCase(
  "ops.audit.i5",
  fromI5.ok,
  fromI5.ok ? "recorded" : fromI5.error,
);

const integrity = verifyAuditTrailIntegrity(registry);
assertCase(
  "ops.integrity.ok",
  integrity.ok && integrity.entryCount >= 2,
  integrity.ok
    ? `ok (${integrity.entryCount})`
    : `invalid: ${integrity.invalidEntryIds.join(",")}`,
);

const archived = archiveCollaborationContext(registry, {
  peerIdentityRef: peer,
  archivedByActorId: "actor-owner",
  reason: "review-complete",
  now: "1970-01-01T00:00:02.000Z",
});
assertCase(
  "ops.archive.ok",
  archived.ok && archived.value.lifecycleStage === "Archive",
  archived.ok ? "archived" : archived.error,
);

const dup = archiveCollaborationContext(registry, {
  peerIdentityRef: peer,
  archivedByActorId: "actor-owner",
});
assertCase(
  "ops.archive.dup.denied",
  !dup.ok,
  dup.ok ? "should deny" : dup.error,
);

const afterArchive = verifyAuditTrailIntegrity(registry);
assertCase(
  "ops.integrity.after.archive",
  afterArchive.ok && afterArchive.entryCount >= 3,
  afterArchive.ok ? "still intact" : "broken",
);

const peerRef = asCollabPeerIdentityRef(peer);
assertCase(
  "ops.indexed",
  registry.listAuditEntriesForTarget(peerRef).length >= 3 &&
    registry.listArchivesForPeer(peerRef).length === 1,
  "audit and archive indexed by peer target",
);

assertCase(
  "ops.smoke.complete",
  fromI5.ok && fromI6.ok && integrity.ok && archived.ok && afterArchive.ok,
  "I5/I6 audit → integrity → Archive smoke path",
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
  if (
    !rel.includes("src/collab/governance-audit/") &&
    !rel.includes("src/collab/hardening-controls/")
  ) {
    const leak = GOV_OPS_RE.test(src);
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
  "i0.to.i6.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "infrastructure/status.ts")) &&
    existsSync(join(collabDir, "membership/operations.ts")) &&
    existsSync(join(collabDir, "permissions/evaluate.ts")) &&
    existsSync(join(collabDir, "annotation-discussion/operations.ts")) &&
    existsSync(join(collabDir, "review-management/operations.ts")) &&
    existsSync(join(collabDir, "supporting/operations.ts")),
  "I0–I6 baselines must remain present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(
    `\nvalidate-collab-governance-audit: ${failed.length} failure(s)`,
  );
  process.exit(1);
}

console.log(
  `\nvalidate-collab-governance-audit: ${results.length} checks PASS`,
);

/**
 * COLLAB-I0 — Foundation package readiness gate.
 *
 * Authority: COLLAB-P6 · COLLAB-P9 · COLLAB-P11 · COLLAB-DECISION-001 ·
 * docs/COLLAB/implementation/COLLAB-I0-Foundation.md
 *
 * Checks package layout, barrel, planning records, identity freeze,
 * absence of collaboration runtime / I1+ patterns, and no peer coupling.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");

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

const REQUIRED_DIRS = [
  "src/collab",
  "src/collab/foundation",
  "src/collab/public",
  "src/collab/internal",
  "docs/COLLAB/implementation",
  "docs/COLLAB/official-records",
];

const REQUIRED_FILES = [
  "src/collab/index.ts",
  "src/collab/README.md",
  "src/collab/ARCHITECTURE.md",
  "src/collab/foundation/index.ts",
  "src/collab/foundation/identity.ts",
  "src/collab/public/index.ts",
  "src/collab/internal/index.ts",
  "src/collab/internal/boundary-policy.ts",
  "docs/COLLAB/implementation/README.md",
  "docs/COLLAB/implementation/COLLAB-I0-Foundation.md",
];

const REQUIRED_OFFICIAL_RECORDS = [
  "COLLAB-P0-Vision-and-Scope.md",
  "COLLAB-P1-Domain-Architecture.md",
  "COLLAB-P2-Domain-Definition.md",
  "COLLAB-P3-Component-Inventory.md",
  "COLLAB-P4-Contract-Strategy.md",
  "COLLAB-P5-Lifecycle.md",
  "COLLAB-P6-Master-Implementation-Roadmap.md",
  "COLLAB-P7-Execution-Governance.md",
  "COLLAB-P8-Validation-Strategy.md",
  "COLLAB-P9-Implementation-Strategy.md",
  "COLLAB-P10-Hardening-Strategy.md",
  "COLLAB-P11-Planning-Certification.md",
  "COLLAB-DECISION-001-Series-Plan-Approval-and-I0-Execution-Authorization.md",
];

const PEER_SRC_ROOTS = [
  "src/engine",
  "src/data",
  "src/ai",
  "src/ui",
  "src/plugins",
  "src/performance",
];

/** Tokens that indicate forbidden collaboration runtime beyond I7. */
const FORBIDDEN_SOURCE_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "realtime", re: /\b(WebSocket|CRDT|OperationalTransform|liveMultiplayer)\b/ },
  /** Speculative live-cursor APIs; I6 uses setPresence (async metadata) in supporting/ only. */
  { id: "cursor-runtime", re: /\b(updateCursor|broadcastPresence)\b/ },
  /** Speculative names; I4 uses createAnnotation in annotation-discussion only. */
  { id: "annotation-runtime", re: /\b(postComment|startDiscussion)\b/ },
  /** Speculative; I5 uses startReview/approveReview/requestRevision in review-management only. */
  { id: "review-runtime", re: /\bsubmitRevision\b/ },
];

const PEER_IMPORT_RE =
  /from\s+["']@\/(engine|data|ai|ui|plugins|performance|components|app)(\/|["'])/;

/** I8+ dirs must not exist (DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE). */
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

for (const rel of REQUIRED_DIRS) {
  assertCase(
    `layout.dir.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

for (const rel of REQUIRED_FILES) {
  assertCase(
    `layout.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "planning.charter",
  existsSync(join(repoRoot, "docs/COLLAB/COLLAB-Planning-Charter.md")),
  "COLLAB Planning Charter must exist",
);

for (const name of REQUIRED_OFFICIAL_RECORDS) {
  const rel = `docs/COLLAB/official-records/${name}`;
  assertCase(
    `planning.record.${name}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
assertCase(
  "barrel.exports.foundation",
  /COLLAB_FOUNDATION_STATUS/.test(barrel) &&
    /COLLAB_DOMAIN_MOTTO/.test(barrel) &&
    /COLLAB_OWNERSHIP_PRINCIPLE/.test(barrel),
  "public barrel must export foundation identity symbols",
);
assertCase(
  "barrel.no.runtime.api",
  !/\b(createSharedProject|evaluatePermission|createAnnotation|updatePresence|startReview)\b/.test(
    barrel,
  ),
  "public barrel must not expose collaboration runtime APIs in I0",
);

const identitySrc = existsSync(join(collabDir, "foundation/identity.ts"))
  ? readFileSync(join(collabDir, "foundation/identity.ts"), "utf8")
  : "";
assertCase(
  "identity.collaborative.layer",
  identitySrc.includes("Collaborative Layer"),
  "foundation identity must preserve Collaborative Layer naming",
);
assertCase(
  "identity.motto",
  identitySrc.includes("Teamwork without compromising scientific integrity."),
  "foundation identity must preserve Domain Motto",
);
assertCase(
  "identity.ownership.principle",
  identitySrc.includes("COLLAB owns collaboration metadata"),
  "foundation identity must preserve ownership principle",
);

const tsFiles = collectTsFiles(collabDir);
assertCase(
  "package.ts.count.bounded",
  tsFiles.length <= 140,
  `COLLAB through I10 should remain skeleton-bounded (found ${tsFiles.length} .ts files)`,
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
  /** createAnnotation is I4-authorized only inside annotation-discussion. */
  if (!rel.includes("src/collab/annotation-discussion/")) {
    const leak = /\bcreateAnnotation\b/.test(src);
    assertCase(
      `no.createAnnotation.leak.${rel}`,
      !leak,
      leak ? "createAnnotation must stay inside annotation-discussion" : "clean",
    );
  }
  /** Review ops are I5-authorized only inside review-management. */
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
  /** Supporting ops are I6-authorized only inside supporting/. */
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
  /** Governance ops are I7-authorized only inside governance-audit/ (I9 may reuse). */
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
  const peerSpecs = [
    ...src.matchAll(
      /from\s+["'](@\/(?:engine|data|ai|ui|plugins|performance|components|app)(?:\/[^"']*)?)["']/g,
    ),
  ].map((m) => m[1]);
  if (peerSpecs.length === 0) {
    assertCase(`no.peer.import.${rel}`, true, "clean");
  } else {
    for (const spec of peerSpecs) {
      const allowed =
        rel.includes("src/collab/cross-domain/") &&
        (spec === "@/engine" || spec === "@/data" || spec === "@/ui");
      assertCase(
        `peer.import.policy.${rel}.${spec}`,
        allowed,
        allowed
          ? "I8 public peer barrel allowed in cross-domain"
          : `forbidden peer import ${spec}`,
      );
    }
  }
  if (
    !rel.includes("src/collab/cross-domain/") &&
    !rel.includes("src/collab/hardening-controls/")
  ) {
    const leak =
      /\b(observeEnginePublicSeam|observeDataPublicSeam|observeUxPublicSeam|exposeCollaborationStateForUx|assertAiPeerOnlyBoundary|verifyCrossDomainIntegrationGates)\b/.test(
        src,
      );
    assertCase(
      `no.xd.ops.leak.${rel}`,
      !leak,
      leak ? "cross-domain ops must stay inside cross-domain/" : "clean",
    );
  }
  /** Hardening ops are I9-authorized only inside hardening-controls/. */
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
}

for (const rel of FORBIDDEN_FUTURE_DIRS) {
  assertCase(
    `no.future.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "must not exist yet (DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE)" : "absent",
  );
}

for (const peer of PEER_SRC_ROOTS) {
  assertCase(
    `peer.root.exists.${peer}`,
    existsSync(join(repoRoot, peer)),
    "peer package root must remain present (unmodified by this gate)",
  );
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-collab-foundation: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-collab-foundation: ${results.length} checks PASS`);

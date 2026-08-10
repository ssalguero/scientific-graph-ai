/**
 * COLLAB-I1 — Infrastructure / public contract surface skeleton readiness gate.
 *
 * Authority: COLLAB-P6 I1 · COLLAB-P4 · COLLAB-P3 · COLLAB-P9 ·
 * docs/COLLAB/implementation/COLLAB-I1-Infrastructure.md
 *
 * Checks infrastructure layout, public status exports, P4/P3 skeleton markers,
 * absence of concrete schemas / I2+ runtime, and no peer coupling.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_INFRASTRUCTURE_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import { COLLAB_CONTRACT_PRINCIPLES } from "../src/collab/infrastructure/contract-principles";
import { COLLAB_PEER_SEAM_IDS } from "../src/collab/infrastructure/peer-seams";
import { COLLAB_INVENTORY_COMPONENT_IDS } from "../src/collab/infrastructure/inventory-refs";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const infraDir = join(collabDir, "infrastructure");

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
  "src/collab/infrastructure",
  "docs/COLLAB/implementation",
];

const REQUIRED_FILES = [
  "src/collab/infrastructure/index.ts",
  "src/collab/infrastructure/status.ts",
  "src/collab/infrastructure/contract-principles.ts",
  "src/collab/infrastructure/peer-seams.ts",
  "src/collab/infrastructure/inventory-refs.ts",
  "src/collab/infrastructure/ownership.ts",
  "docs/COLLAB/implementation/COLLAB-I1-Infrastructure.md",
];

/** I4+ dirs remain forbidden (DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE). */
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

for (const rel of REQUIRED_DIRS) {
  assertCase(
    `infra.dir.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

for (const rel of REQUIRED_FILES) {
  assertCase(
    `infra.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "infra.doc",
  existsSync(join(repoRoot, "docs/COLLAB/implementation/COLLAB-I1-Infrastructure.md")),
  "COLLAB-I1 implementation record must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_INFRASTRUCTURE_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}
assertCase(
  "barrel.no.deep.infra",
  !barrel.includes('from "./infrastructure/contract-principles"') &&
    !barrel.includes('from "./infrastructure/peer-seams"'),
  "public barrel must not expose deep infrastructure contract markers",
);
assertCase(
  "barrel.no.runtime.api",
  !/\b(createSharedProject|evaluatePermission|createAnnotation|updatePresence|startReview)\b/.test(
    barrel,
  ),
  "public barrel must not expose collaboration runtime APIs",
);

for (const prefix of COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES) {
  assertCase(
    `policy.forbidden.${prefix}`,
    COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes(prefix as never),
    "boundary policy forbids deep consumer imports",
  );
}
assertCase(
  "policy.forbids.infrastructure",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes("@/collab/infrastructure"),
  "@/collab/infrastructure must be consumer-forbidden",
);

const principlesSrc = existsSync(join(infraDir, "contract-principles.ts"))
  ? readFileSync(join(infraDir, "contract-principles.ts"), "utf8")
  : "";
for (const principle of COLLAB_CONTRACT_PRINCIPLES) {
  assertCase(
    `principles.${principle}`,
    principlesSrc.includes(`"${principle}"`),
    `P4 principle marker ${principle} present`,
  );
}

const seamsSrc = existsSync(join(infraDir, "peer-seams.ts"))
  ? readFileSync(join(infraDir, "peer-seams.ts"), "utf8")
  : "";
for (const seamId of COLLAB_PEER_SEAM_IDS) {
  assertCase(
    `seams.${seamId}`,
    seamsSrc.includes(`"${seamId}"`),
    `P4 peer seam marker ${seamId} present`,
  );
}
assertCase(
  "seams.ai.no.dependency.edge",
  /dependencyEdge:\s*false/.test(seamsSrc) && seamsSrc.includes("collab-ai-peer"),
  "AI peer seam must declare no COLLAB dependency edge",
);

const inventorySrc = existsSync(join(infraDir, "inventory-refs.ts"))
  ? readFileSync(join(infraDir, "inventory-refs.ts"), "utf8")
  : "";
for (const id of COLLAB_INVENTORY_COMPONENT_IDS) {
  assertCase(
    `inventory.${id}`,
    inventorySrc.includes(`"${id}"`),
    `P3 inventory ref ${id} present`,
  );
}

const ownershipSrc = existsSync(join(infraDir, "ownership.ts"))
  ? readFileSync(join(infraDir, "ownership.ts"), "utf8")
  : "";
assertCase(
  "ownership.metadata.collab",
  ownershipSrc.includes('CollaborationMetadata: "COLLAB"'),
  "ownership matrix must assign collaboration metadata to COLLAB",
);
assertCase(
  "ownership.schemas.deferred",
  ownershipSrc.includes("concreteSchemasDeferred: true"),
  "I1 must declare concrete schemas deferred",
);

const statusSrc = existsSync(join(infraDir, "status.ts"))
  ? readFileSync(join(infraDir, "status.ts"), "utf8")
  : "";
assertCase(
  "status.phase",
  statusSrc.includes('"COLLAB-I1"') || statusSrc.includes("'COLLAB-I1'"),
  "infrastructure phase marker must be COLLAB-I1",
);
assertCase(
  "status.complete",
  statusSrc.includes("INFRASTRUCTURE_COMPLETE"),
  "infrastructure status must be INFRASTRUCTURE_COMPLETE",
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
      ? "must not exist in I1 (DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE)"
      : "absent",
  );
}

assertCase(
  "i0.foundation.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "internal/boundary-policy.ts")),
  "I0 foundation baseline must remain present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-collab-infrastructure: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-collab-infrastructure: ${results.length} checks PASS`);

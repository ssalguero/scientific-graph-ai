/**
 * COLLAB-I8 — Cross-Domain Integration readiness gate.
 *
 * Authority: COLLAB-P6 I8 · COLLAB-P1 · COLLAB-P4 · COLLAB-P9 ·
 * docs/COLLAB/implementation/COLLAB-I8-Cross-Domain-Integration.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_CROSS_DOMAIN_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import {
  assertAiPeerOnlyBoundary,
  observeDataPublicSeam,
  observeEnginePublicSeam,
  observeUxPublicSeam,
  exposeCollaborationStateForUx,
  verifyCrossDomainIntegrationGates,
} from "../src/collab/cross-domain";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const xdDir = join(collabDir, "cross-domain");

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
  "src/collab/cross-domain/index.ts",
  "src/collab/cross-domain/status.ts",
  "src/collab/cross-domain/identities.ts",
  "src/collab/cross-domain/gates.ts",
  "src/collab/cross-domain/engine-adapter.ts",
  "src/collab/cross-domain/data-adapter.ts",
  "src/collab/cross-domain/ux-adapter.ts",
  "src/collab/cross-domain/ai-peer.ts",
  "src/collab/cross-domain/verify.ts",
  "docs/COLLAB/implementation/COLLAB-I8-Cross-Domain-Integration.md",
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

const XD_OPS_RE =
  /\b(observeEnginePublicSeam|observeDataPublicSeam|observeUxPublicSeam|exposeCollaborationStateForUx|assertAiPeerOnlyBoundary|verifyCrossDomainIntegrationGates)\b/;

for (const rel of REQUIRED_FILES) {
  assertCase(
    `layout.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "layout.dir.cross-domain",
  existsSync(xdDir),
  "cross-domain package must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_CROSS_DOMAIN_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}
assertCase(
  "barrel.no.ops.leak",
  !XD_OPS_RE.test(barrel),
  "public barrel must not expose cross-domain operations",
);

assertCase(
  "policy.forbids.xd",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes("@/collab/cross-domain"),
  "@/collab/cross-domain must be consumer-forbidden",
);

const identities = readFileSync(join(xdDir, "identities.ts"), "utf8");
assertCase(
  "identity.c1",
  identities.includes('"C1"') || identities.includes("'C1'"),
  "C1 Coordinator identity present",
);
assertCase(
  "identity.c11",
  identities.includes('"C11"') || identities.includes("'C11'"),
  "C11 Metadata Coordination identity present",
);

const aiPeerSrc = readFileSync(join(xdDir, "ai-peer.ts"), "utf8");
assertCase(
  "ai.no.import",
  !/from\s+["']@\/ai/.test(aiPeerSrc),
  "AI peer boundary must not import @/ai",
);

const statusSrc = readFileSync(join(xdDir, "status.ts"), "utf8");
assertCase(
  "status.phase",
  statusSrc.includes("COLLAB-I8"),
  "phase marker must be COLLAB-I8",
);
assertCase(
  "status.complete",
  statusSrc.includes("CROSS_DOMAIN_COMPLETE"),
  "status must be CROSS_DOMAIN_COMPLETE",
);

// Behavioral smoke
const engine = observeEnginePublicSeam();
assertCase(
  "ops.engine.seam",
  engine.missingOperations.length === 0 && engine.neverOwnsOrchestration,
  `available=${engine.availableOperations.length}`,
);

const data = observeDataPublicSeam();
assertCase(
  "ops.data.seam",
  data.publicContractCount > 0 && data.ownsScientificTruth === false,
  `contracts=${data.publicContractCount}`,
);

const ux = observeUxPublicSeam();
assertCase(
  "ops.ux.seam",
  Boolean(ux.tokenContractVersion) && ux.presentationOwnedByUx,
  `token=${ux.tokenContractVersion}`,
);

const state = exposeCollaborationStateForUx();
assertCase(
  "ops.ux.state",
  state.ownsPresentation === false &&
    Boolean(state.foundation) &&
    Boolean(state.governanceAudit),
  "collaboration state exposed without owning presentation",
);

const ai = assertAiPeerOnlyBoundary();
assertCase(
  "ops.ai.peer",
  ai.dependencyEdge === false && ai.collaborativeAiInV1 === false,
  "AI peer-only",
);

const gates = verifyCrossDomainIntegrationGates();
assertCase(
  "ops.gates.ok",
  gates.ok &&
    gates.nonBypass &&
    gates.nonBlocking &&
    gates.aiPeerOnly &&
    gates.engineSeamReady &&
    gates.dataSeamReady &&
    gates.uxSeamReady,
  gates.ok ? "all gates pass" : JSON.stringify(gates),
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

  const peerMatch = src.match(
    /from\s+["'](@\/(?:engine|data|ai|ui|plugins|performance|components|app)(?:\/[^"']*)?)["']/g,
  );
  if (peerMatch) {
    for (const m of peerMatch) {
      const spec = m.match(/["']([^"']+)["']/)?.[1] ?? "";
      const inXd = rel.includes("src/collab/cross-domain/");
      const allowedExact =
        inXd &&
        (spec === "@/engine" || spec === "@/data" || spec === "@/ui");
      assertCase(
        `peer.import.policy.${rel}.${spec}`,
        allowedExact,
        allowedExact
          ? "I8 public peer barrel allowed in cross-domain"
          : `forbidden peer import ${spec} in ${rel}`,
      );
    }
  } else {
    assertCase(`no.peer.import.${rel}`, true, "clean");
  }

  if (
    !rel.includes("src/collab/cross-domain/") &&
    !rel.includes("src/collab/hardening-controls/")
  ) {
    const leak = XD_OPS_RE.test(src);
    assertCase(
      `no.xd.ops.leak.${rel}`,
      !leak,
      leak ? "cross-domain ops must stay inside cross-domain/" : "clean",
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
  "i0.to.i7.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "governance-audit/operations.ts")) &&
    existsSync(join(collabDir, "supporting/operations.ts")),
  "I0–I7 baselines must remain present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-collab-cross-domain: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-collab-cross-domain: ${results.length} checks PASS`);

/**
 * COLLAB-I9 — Hardening readiness gate.
 *
 * Authority: COLLAB-P6 I9 · COLLAB-P8 · COLLAB-P10 ·
 * docs/COLLAB/implementation/COLLAB-I9-Hardening.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_HARDENING_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import {
  resistSharedAccessAbuse,
  verifyHardeningGates,
  verifyPermissionIntegrity,
  verifySharedAccessAbuseResistance,
  verifyActivityTrailIntegrity,
} from "../src/collab/hardening-controls";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const hardDir = join(collabDir, "hardening-controls");

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
  "src/collab/hardening-controls/index.ts",
  "src/collab/hardening-controls/status.ts",
  "src/collab/hardening-controls/principles.ts",
  "src/collab/hardening-controls/permission-integrity.ts",
  "src/collab/hardening-controls/abuse-resistance.ts",
  "src/collab/hardening-controls/trail-integrity.ts",
  "src/collab/hardening-controls/readiness.ts",
  "src/collab/hardening-controls/verify.ts",
  "docs/COLLAB/implementation/COLLAB-I9-Hardening.md",
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
  {
    id: "i10-certification-api",
    re: /\b(certifyCollabDomain|issueDomainCertification|finalizeDomainCertification)\b/,
  },
];

const HARD_OPS_RE =
  /\b(verifyPermissionIntegrity|resistSharedAccessAbuse|verifySharedAccessAbuseResistance|verifyActivityTrailIntegrity|attestHardeningReadiness|verifyHardeningGates)\b/;

for (const rel of REQUIRED_FILES) {
  assertCase(
    `layout.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "layout.dir.hardening-controls",
  existsSync(hardDir),
  "hardening-controls package must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_HARDENING_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}
assertCase(
  "barrel.no.ops.leak",
  !HARD_OPS_RE.test(barrel),
  "public barrel must not expose hardening operations",
);

assertCase(
  "policy.forbids.hardening",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes(
    "@/collab/hardening-controls",
  ),
  "@/collab/hardening-controls must be consumer-forbidden",
);

const statusSrc = readFileSync(join(hardDir, "status.ts"), "utf8");
assertCase(
  "status.phase",
  statusSrc.includes("COLLAB-I9"),
  "phase marker must be COLLAB-I9",
);
assertCase(
  "status.complete",
  statusSrc.includes("HARDENING_COMPLETE"),
  "status must be HARDENING_COMPLETE",
);

const principles = readFileSync(join(hardDir, "principles.ts"), "utf8");
assertCase(
  "deferred.i10",
  principles.includes("DomainCertification") &&
    principles.includes("COLLAB_I9_DEFERRED"),
  "I10 Domain Certification must remain deferred",
);
assertCase(
  "no.matrix.redesign",
  principles.includes("redesignsPermissionMatrix: false"),
  "I9 must not redesign permission matrix",
);

const readinessSrc = readFileSync(join(hardDir, "readiness.ts"), "utf8");
assertCase(
  "readiness.no.cert",
  readinessSrc.includes("domainCertificationAuthorized: false") &&
    readinessSrc.includes("i10Deferred: true"),
  "readiness must not authorize I10 certification",
);

// Behavioral smoke
const perm = verifyPermissionIntegrity();
assertCase(
  "ops.permission.integrity",
  perm.ok && perm.failClosed && perm.viewerCannotEscalate,
  perm.ok ? "ok" : perm.details.join("; "),
);

const abuse = verifySharedAccessAbuseResistance();
assertCase(
  "ops.abuse.resistance",
  abuse.ok &&
    abuse.elevatesToDataOrEngine === false &&
    abuse.containedInCollaborationMetadata,
  abuse.ok ? `blocked=${abuse.escalationsBlocked}` : abuse.details.join("; "),
);

const probe = resistSharedAccessAbuse({
  actorRole: "Viewer",
  claimedRole: "Owner",
  action: "manage-membership",
});
assertCase(
  "ops.abuse.probe",
  probe.blocked,
  probe.reason,
);

const trail = verifyActivityTrailIntegrity();
assertCase(
  "ops.trail.integrity",
  trail.ok && trail.archiveRetainsAccountability && trail.neverModifiesScience,
  trail.ok ? "ok" : trail.details.join("; "),
);

const gates = verifyHardeningGates();
assertCase(
  "ops.gates.ok",
  gates.ok &&
    gates.readiness.domainCertificationAuthorized === false &&
    gates.readiness.i10Deferred === true &&
    gates.crossDomainStillOk,
  gates.ok ? "hardening gates pass; I10 deferred" : "gate failure",
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

  if (!rel.includes("src/collab/hardening-controls/")) {
    const leak = HARD_OPS_RE.test(src);
    assertCase(
      `no.hard.ops.leak.${rel}`,
      !leak,
      leak ? "hardening ops must stay inside hardening-controls/" : "clean",
    );
  }
}

for (const rel of FORBIDDEN_FUTURE_DIRS) {
  assertCase(
    `no.future.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel))
      ? "must not exist (DEFERRED — I10 NOT AUTHORIZED / FUTURE STAGE)"
      : "absent",
  );
}

assertCase(
  "i0.to.i8.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "cross-domain/verify.ts")) &&
    existsSync(join(collabDir, "governance-audit/operations.ts")) &&
    existsSync(join(collabDir, "permissions/evaluate.ts")),
  "I0–I8 baselines must remain present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-collab-hardening: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-collab-hardening: ${results.length} checks PASS`);

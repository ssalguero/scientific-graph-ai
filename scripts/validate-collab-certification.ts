/**
 * COLLAB-I10 — Domain Certification gate.
 *
 * Authority: COLLAB-P6 I10 · CERTIFICATION_FRAMEWORK ·
 * docs/COLLAB/implementation/COLLAB-I10-Domain-Certification.md
 *
 * Principle: Certification verifies. Architecture frozen. Implementation frozen.
 * Evidence-based only. No I11.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_CERTIFICATION_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import {
  COLLAB_CERTIFICATION_FLAGS,
  COLLAB_CERTIFICATION_STATUS,
  COLLAB_DOMAIN_STATUS,
  COLLAB_IMPLEMENTATION_SERIES_CLOSED,
} from "../src/collab/certification/status";
import { COLLAB_HARDENING_STATUS } from "../src/collab/hardening-controls/status";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const certDir = join(collabDir, "certification");

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
  "src/collab/certification/index.ts",
  "src/collab/certification/status.ts",
  "src/collab/certification/CERTIFICATION.md",
  "src/collab/certification/CERTIFICATION_SUMMARY.md",
  "src/collab/certification/DOMAIN_COMPLETION.md",
  "src/collab/certification/EVIDENCE_INDEX.md",
  "src/collab/certification/OWNERSHIP_COMPLIANCE.md",
  "src/collab/certification/CONSOLIDATED_VALIDATION.md",
  "docs/COLLAB/implementation/COLLAB-I10-Domain-Certification.md",
] as const;

const IMPL_EVIDENCE = [
  "docs/COLLAB/implementation/COLLAB-I0-Foundation.md",
  "docs/COLLAB/implementation/COLLAB-I1-Infrastructure.md",
  "docs/COLLAB/implementation/COLLAB-I2-Sharing-Membership.md",
  "docs/COLLAB/implementation/COLLAB-I3-Permissions.md",
  "docs/COLLAB/implementation/COLLAB-I4-Annotation-Discussion.md",
  "docs/COLLAB/implementation/COLLAB-I5-Review-Lifecycle.md",
  "docs/COLLAB/implementation/COLLAB-I6-Supporting.md",
  "docs/COLLAB/implementation/COLLAB-I7-Governance-Audit.md",
  "docs/COLLAB/implementation/COLLAB-I8-Cross-Domain-Integration.md",
  "docs/COLLAB/implementation/COLLAB-I9-Hardening.md",
  "docs/COLLAB/implementation/COLLAB-I10-Domain-Certification.md",
] as const;

const FORBIDDEN_DIRS = [
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
  "src/collab/i11",
] as const;

const FORBIDDEN_SOURCE_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "realtime", re: /\b(WebSocket|CRDT|OperationalTransform|liveMultiplayer)\b/ },
  { id: "cursor-runtime", re: /\b(updateCursor|broadcastPresence)\b/ },
  { id: "speculative-revision", re: /\bsubmitRevision\b/ },
  {
    id: "i11-api",
    re: /\b(collabI11|implementCollabI11|startCollabI11)\b/,
  },
];

for (const rel of REQUIRED_FILES) {
  assertCase(
    `layout.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

for (const rel of IMPL_EVIDENCE) {
  assertCase(
    `evidence.${rel.split("/").pop()}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "layout.dir.certification",
  existsSync(certDir),
  "certification package must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_CERTIFICATION_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}

assertCase(
  "policy.forbids.certification.deep",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes("@/collab/certification"),
  "@/collab/certification must be consumer-forbidden",
);

assertCase(
  "i9.hardening.complete",
  COLLAB_HARDENING_STATUS === "HARDENING_COMPLETE",
  `COLLAB_HARDENING_STATUS=${COLLAB_HARDENING_STATUS}`,
);

assertCase(
  "i10.status.certified",
  COLLAB_CERTIFICATION_STATUS === "PRODUCTION_CERTIFIED",
  `COLLAB_CERTIFICATION_STATUS=${COLLAB_CERTIFICATION_STATUS}`,
);

assertCase(
  "i10.domain.production",
  COLLAB_DOMAIN_STATUS === "PRODUCTION_CERTIFIED",
  `COLLAB_DOMAIN_STATUS=${COLLAB_DOMAIN_STATUS}`,
);

assertCase(
  "i10.series.closed",
  COLLAB_IMPLEMENTATION_SERIES_CLOSED === true,
  "Implementation Series CLOSED",
);

assertCase(
  "i10.flags",
  COLLAB_CERTIFICATION_FLAGS.productionCertified === true &&
    COLLAB_CERTIFICATION_FLAGS.implementationSeriesComplete === true &&
    COLLAB_CERTIFICATION_FLAGS.hardeningCertified === true &&
    COLLAB_CERTIFICATION_FLAGS.crossDomainCertified === true &&
    COLLAB_CERTIFICATION_FLAGS.opsSyncUnlocked === true &&
    COLLAB_CERTIFICATION_FLAGS.realtimeSyncImplemented === false &&
    COLLAB_CERTIFICATION_FLAGS.convergentReplicaRuntimeImplemented === false &&
    COLLAB_CERTIFICATION_FLAGS.i11Exists === false,
  "I10 acceptance flags",
);

const certification = readFileSync(join(certDir, "CERTIFICATION.md"), "utf8");
assertCase(
  "i10.record.production",
  /COLLAB DOMAIN:\s*\nPRODUCTION CERTIFIED|COLLAB DOMAIN — PRODUCTION CERTIFIED/.test(
    certification,
  ),
  "CERTIFICATION.md declares PRODUCTION CERTIFIED",
);
assertCase(
  "i10.record.complete",
  /DOMAIN CERTIFICATION COMPLETE/.test(certification),
  "CERTIFICATION.md declares DOMAIN CERTIFICATION COMPLETE",
);
assertCase(
  "i10.record.version",
  /Version Identity:\s*1\.0\.0/.test(certification),
  "CERTIFICATION.md binds Version Identity 1.0.0",
);
assertCase(
  "i10.record.no.realtime.claim",
  /NOT IMPLEMENTED/.test(certification),
  "CERTIFICATION.md does not claim realtime runtime",
);

const completion = readFileSync(join(certDir, "DOMAIN_COMPLETION.md"), "utf8");
assertCase(
  "i10.completion.closed",
  /CLOSED/.test(completion) && /Implementation Series/.test(completion),
  "DOMAIN_COMPLETION declares series CLOSED",
);
assertCase(
  "i10.completion.no.i11",
  /no I11/i.test(completion),
  "DOMAIN_COMPLETION forbids I11",
);

const readinessSrc = readFileSync(
  join(collabDir, "hardening-controls/readiness.ts"),
  "utf8",
);
assertCase(
  "i9.readiness.distinguishable",
  readinessSrc.includes("domainCertificationAuthorized: false") &&
    readinessSrc.includes("i10Deferred: true"),
  "I9 readiness must remain distinguishable from I10 decision",
);

const implReadme = readFileSync(
  join(repoRoot, "docs/COLLAB/implementation/README.md"),
  "utf8",
);
assertCase(
  "i10.impl.readme.certified",
  /COLLAB-I10.*PRODUCTION CERTIFIED|Domain Certification.*\*\*PRODUCTION CERTIFIED\*\*/i.test(
    implReadme,
  ),
  "implementation README marks I10 PRODUCTION CERTIFIED",
);

const pkg = readFileSync(join(repoRoot, "package.json"), "utf8");
assertCase(
  "i10.script.present",
  /"validate:collab-certification"/.test(pkg),
  "validate:collab-certification script present",
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
}

for (const rel of FORBIDDEN_DIRS) {
  assertCase(
    `no.future.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "must not exist" : "absent",
  );
}

assertCase(
  "i0.to.i9.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "hardening-controls/verify.ts")) &&
    existsSync(join(collabDir, "cross-domain/verify.ts")),
  "I0–I9 baselines must remain present",
);

/** Live consolidation — re-run I0–I9 + PERFORMANCE boundary (no bypass). */
const PRIOR_GATES = [
  "validate:collab-foundation",
  "validate:collab-infrastructure",
  "validate:collab-sharing-membership",
  "validate:collab-permissions",
  "validate:collab-annotation-discussion",
  "validate:collab-review-management",
  "validate:collab-supporting",
  "validate:collab-governance-audit",
  "validate:collab-cross-domain",
  "validate:collab-hardening",
  "validate:performance-boundaries",
] as const;

for (const script of PRIOR_GATES) {
  const run = spawnSync("npm", ["run", script], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: process.env,
  });
  const ok = run.status === 0;
  const tail = (run.stdout || run.stderr || "")
    .split(/\r?\n/)
    .filter((l) => /checks PASS|failure/.test(l))
    .slice(-1)[0];
  assertCase(
    `i10.gate.${script}`,
    ok,
    ok ? tail || "PASS" : (run.stderr || run.stdout || "FAILED").slice(-400),
  );
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-collab-certification: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-collab-certification: ${results.length} checks PASS`);

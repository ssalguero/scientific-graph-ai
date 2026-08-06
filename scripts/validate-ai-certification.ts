/**
 * AI-I10 — Domain Certification package gate.
 *
 * Verifies certification package completeness and official status markers.
 * Certification only — no runtime intelligence checks beyond absence in this package.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AI_ALLOWED_PUBLIC_CERTIFICATION_REEXPORTS,
  AI_ALLOWED_PUBLIC_HARDENING_REEXPORTS,
} from "../src/ai/internal/boundary-policy";
import {
  AI_CERTIFICATION_STATUS,
  AI_DOMAIN_STATUS,
  AI_IMPLEMENTATION_SERIES_CLOSED,
} from "../src/ai/certification/status";
import { AI_CERTIFICATION_READY } from "../src/ai/hardening/status";

const repoRoot = process.cwd();
const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const CERT_DOCS = [
  "src/ai/certification/README.md",
  "src/ai/certification/CERTIFICATION.md",
  "src/ai/certification/CERTIFICATION_SUMMARY.md",
  "src/ai/certification/DOMAIN_COMPLETION.md",
  "src/ai/certification/EVIDENCE_INDEX.md",
  "src/ai/certification/VALIDATION_SUMMARY.md",
  "src/ai/certification/ARCHITECTURE_SUMMARY.md",
  "src/ai/certification/IMPLEMENTATION_SUMMARY.md",
  "src/ai/certification/PLANNING_AUDIT.md",
  "src/ai/certification/IMPLEMENTATION_AUDIT.md",
  "src/ai/certification/ARCHITECTURE_AUDIT.md",
  "src/ai/certification/INVENTORY_AUDIT.md",
  "src/ai/certification/GOVERNANCE_AUDIT.md",
  "src/ai/certification/INTEGRATION_AUDIT.md",
  "src/ai/certification/BOUNDARY_AUDIT.md",
  "src/ai/certification/QUALITY_GATES_AUDIT.md",
  "src/ai/certification/EVIDENCE_REVIEW.md",
  "src/ai/certification/status.ts",
  "src/ai/certification/index.ts",
  "docs/AI/implementation/AI-I10-Domain-Certification.md",
] as const;

for (const rel of CERT_DOCS) {
  assertCase(
    `i10.doc.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "i10.prereq.ready",
  AI_CERTIFICATION_READY === true,
  "AI-I9 AI_CERTIFICATION_READY must be true",
);

assertCase(
  "i10.status.certified",
  AI_CERTIFICATION_STATUS === "CERTIFIED",
  `AI_CERTIFICATION_STATUS=${AI_CERTIFICATION_STATUS}`,
);

assertCase(
  "i10.domain.release",
  AI_DOMAIN_STATUS === "RELEASE_CERTIFIED",
  `AI_DOMAIN_STATUS=${AI_DOMAIN_STATUS}`,
);

assertCase(
  "i10.series.closed",
  AI_IMPLEMENTATION_SERIES_CLOSED === true,
  "Implementation Series CLOSED flag",
);

const certification = readFileSync(
  join(repoRoot, "src/ai/certification/CERTIFICATION.md"),
  "utf8",
);
assertCase(
  "i10.record.release",
  /AI DOMAIN — RELEASE CERTIFIED/.test(certification),
  "CERTIFICATION.md declares RELEASE CERTIFIED",
);
assertCase(
  "i10.record.status",
  /\*\*AI-I10 Status\*\*\s*\|\s*\*\*CERTIFIED\*\*/.test(certification),
  "CERTIFICATION.md records AI-I10 Status CERTIFIED",
);
assertCase(
  "i10.record.no.runtime.claim",
  /NOT IMPLEMENTED/.test(certification),
  "CERTIFICATION.md does not claim runtime intelligence",
);

const summary = readFileSync(
  join(repoRoot, "src/ai/certification/CERTIFICATION_SUMMARY.md"),
  "utf8",
);
assertCase(
  "i10.summary.release",
  /RELEASE CERTIFIED/.test(summary),
  "CERTIFICATION_SUMMARY declares RELEASE CERTIFIED",
);

const completion = readFileSync(
  join(repoRoot, "src/ai/certification/DOMAIN_COMPLETION.md"),
  "utf8",
);
assertCase(
  "i10.completion.closed",
  /Implementation Series CLOSED/.test(completion),
  "DOMAIN_COMPLETION declares series CLOSED",
);

const audits = [
  "PLANNING_AUDIT.md",
  "IMPLEMENTATION_AUDIT.md",
  "ARCHITECTURE_AUDIT.md",
  "INVENTORY_AUDIT.md",
  "GOVERNANCE_AUDIT.md",
  "INTEGRATION_AUDIT.md",
  "BOUNDARY_AUDIT.md",
  "QUALITY_GATES_AUDIT.md",
  "EVIDENCE_REVIEW.md",
] as const;

for (const name of audits) {
  const src = readFileSync(join(repoRoot, "src/ai/certification", name), "utf8");
  assertCase(
    `i10.audit.${name}`,
    /\*\*PASS\*\*/.test(src),
    /\*\*PASS\*\*/.test(src) ? "PASS" : "missing PASS",
  );
}

const publicBarrel = readFileSync(join(repoRoot, "src/ai/index.ts"), "utf8");
assertCase(
  "i10.barrel.domain",
  publicBarrel.includes("AI_DOMAIN_STATUS"),
  "public barrel exports AI_DOMAIN_STATUS",
);
assertCase(
  "i10.barrel.cert.status",
  publicBarrel.includes("AI_CERTIFICATION_STATUS"),
  "public barrel exports AI_CERTIFICATION_STATUS",
);
assertCase(
  "i10.barrel.no.wiring",
  !/composeAi|composeGovernance|composeIntegration|composeExtension/.test(
    publicBarrel,
  ),
  "public barrel must not export compose/wiring",
);

for (const allowed of [
  ...AI_ALLOWED_PUBLIC_HARDENING_REEXPORTS,
  ...AI_ALLOWED_PUBLIC_CERTIFICATION_REEXPORTS,
]) {
  assertCase(
    `i10.barrel.allowed.${allowed}`,
    publicBarrel.includes(allowed),
    `expected allowlisted re-export ${allowed}`,
  );
}

const arch = readFileSync(join(repoRoot, "src/ai/ARCHITECTURE.md"), "utf8");
assertCase(
  "i10.arch.release",
  /RELEASE CERTIFIED/.test(arch),
  "ARCHITECTURE declares RELEASE CERTIFIED",
);
assertCase(
  "i10.arch.points.cert",
  /certification\//.test(arch),
  "ARCHITECTURE points to certification package",
);

const roadmap = readFileSync(join(repoRoot, "docs/roadmaps/ROADMAP.md"), "utf8");
assertCase(
  "i10.roadmap.ai.certified",
  /AI.*RELEASE CERTIFIED|RELEASE CERTIFIED.*AI/i.test(roadmap) ||
    /AI \| ✅.*CERTIFIED/.test(roadmap),
  "ROADMAP reflects AI CERTIFIED",
);

const projectStatus = readFileSync(
  join(repoRoot, "docs/PROJECT_STATUS.md"),
  "utf8",
);
assertCase(
  "i10.project.ai.certified",
  /AI.*RELEASE CERTIFIED|RELEASE CERTIFIED/.test(projectStatus) &&
    /COLLAB/.test(projectStatus),
  "PROJECT_STATUS reflects AI CERTIFIED and next domain",
);

const pkg = readFileSync(join(repoRoot, "package.json"), "utf8");
assertCase(
  "i10.script.present",
  /"validate:ai-certification"/.test(pkg),
  "validate:ai-certification script present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}
if (failed.length > 0) {
  console.error(`\nvalidate-ai-certification: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-ai-certification: ${results.length} checks PASS`);

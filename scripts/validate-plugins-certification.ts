/**
 * PLUGINS-I10 — Production Certification readiness gate.
 *
 * Authority: PLUGINS-P6 I10 · P7–P10 · P11 ·
 * docs/PLUGINS/implementation/PLUGINS-I10-Production-Certification.md
 *
 * Principle: Certification verifies. Architecture frozen. Implementation frozen.
 * Evidence-based only. No ROADMAP / PROJECT_STATUS mutation required.
 *
 * Review checks (mandatory):
 * 1. I0–I9 traceable to P0–P11
 * 2. Ownership boundaries intact
 * 3. No internals on public surface
 * 4. All validators pass (consolidated live)
 * 5. Production-ready without reopening planning
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_CERTIFICATION_REEXPORTS,
  PLUGINS_CERTIFICATION_REQUIRED_DIRS,
  PLUGINS_CERTIFICATION_REQUIRED_FILES,
} from "../src/plugins/internal/boundary-policy";
import {
  PLUGINS_CERTIFICATION_FLAGS,
  PLUGINS_CERTIFICATION_STATUS,
  PLUGINS_DOMAIN_STATUS,
  PLUGINS_IMPLEMENTATION_SERIES_CLOSED,
} from "../src/plugins/certification/status";
import { PLUGINS_INTEGRATION_FLAGS } from "../src/plugins/integration/status";
import { PLUGINS_LIFECYCLE_FLAGS } from "../src/plugins/lifecycle/status";
import { PLUGINS_OBSERVABILITY_FLAGS } from "../src/plugins/observability/status";

const repoRoot = process.cwd();
const pluginsDir = join(repoRoot, "src/plugins");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

for (const rel of PLUGINS_CERTIFICATION_REQUIRED_DIRS) {
  assertCase(
    `i10.dir.${rel}`,
    existsSync(join(pluginsDir, rel)),
    existsSync(join(pluginsDir, rel)) ? "present" : "missing",
  );
}

for (const rel of PLUGINS_CERTIFICATION_REQUIRED_FILES) {
  assertCase(
    `i10.file.${rel}`,
    existsSync(join(pluginsDir, rel)),
    existsSync(join(pluginsDir, rel)) ? "present" : "missing",
  );
}

const IMPL_DOCS = [
  "docs/PLUGINS/implementation/PLUGINS-I0-Foundation.md",
  "docs/PLUGINS/implementation/PLUGINS-I1-Extension-Framework.md",
  "docs/PLUGINS/implementation/PLUGINS-I2-Registry-Infrastructure.md",
  "docs/PLUGINS/implementation/PLUGINS-I3-Discovery-and-Registration.md",
  "docs/PLUGINS/implementation/PLUGINS-I4-Capability-and-Permission.md",
  "docs/PLUGINS/implementation/PLUGINS-I5-Public-Contract-Infrastructure.md",
  "docs/PLUGINS/implementation/PLUGINS-I6-Lifecycle-Engine.md",
  "docs/PLUGINS/implementation/PLUGINS-I7-Validation-and-Compatibility.md",
  "docs/PLUGINS/implementation/PLUGINS-I8-Diagnostics-and-Observability.md",
  "docs/PLUGINS/implementation/PLUGINS-I9-Platform-Integration.md",
  "docs/PLUGINS/implementation/PLUGINS-I10-Production-Certification.md",
] as const;

for (const rel of IMPL_DOCS) {
  assertCase(
    `i10.impl.doc.${rel.split("/").pop()}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "i10.flags",
  PLUGINS_CERTIFICATION_FLAGS.productionCertified === true &&
    PLUGINS_CERTIFICATION_FLAGS.implementationSeriesComplete === true &&
    PLUGINS_CERTIFICATION_FLAGS.planningComplianceVerified === true &&
    PLUGINS_CERTIFICATION_FLAGS.architectureComplianceVerified === true &&
    PLUGINS_CERTIFICATION_FLAGS.ownershipComplianceVerified === true &&
    PLUGINS_CERTIFICATION_FLAGS.executionImplemented === false &&
    PLUGINS_CERTIFICATION_FLAGS.runtimeLoadingImplemented === false,
  "I10 acceptance flags",
);

assertCase(
  "i10.status.certified",
  PLUGINS_CERTIFICATION_STATUS === "PRODUCTION_CERTIFIED",
  `PLUGINS_CERTIFICATION_STATUS=${PLUGINS_CERTIFICATION_STATUS}`,
);

assertCase(
  "i10.domain.release",
  PLUGINS_DOMAIN_STATUS === "RELEASE_CERTIFIED",
  `PLUGINS_DOMAIN_STATUS=${PLUGINS_DOMAIN_STATUS}`,
);

assertCase(
  "i10.series.closed",
  PLUGINS_IMPLEMENTATION_SERIES_CLOSED === true,
  "Implementation Series CLOSED",
);

assertCase(
  "i10.release.integrity.execution.deferred",
  PLUGINS_LIFECYCLE_FLAGS.executionImplemented === false &&
    PLUGINS_INTEGRATION_FLAGS.executionImplemented === false &&
    PLUGINS_INTEGRATION_FLAGS.runtimeLoadingImplemented === false &&
    PLUGINS_OBSERVABILITY_FLAGS.executionImplemented === false &&
    PLUGINS_OBSERVABILITY_FLAGS.runtimeLoadingImplemented === false,
  "execution/runtime remain deferred across subsystems",
);

assertCase(
  "i10.release.integrity.integration",
  PLUGINS_INTEGRATION_FLAGS.peerContractsOnly === true &&
    PLUGINS_INTEGRATION_FLAGS.peerOwnershipPreserved === true &&
    PLUGINS_INTEGRATION_FLAGS.peerInternalAccess === false,
  "integration remains public-contract-only",
);

const certification = readFileSync(
  join(pluginsDir, "certification/CERTIFICATION.md"),
  "utf8",
);
assertCase(
  "i10.record.release",
  /PLUGINS DOMAIN — RELEASE CERTIFIED/.test(certification),
  "CERTIFICATION.md declares RELEASE CERTIFIED",
);
assertCase(
  "i10.record.production",
  /PLUGINS-I10 — PRODUCTION CERTIFIED/.test(certification),
  "CERTIFICATION.md declares PRODUCTION CERTIFIED",
);
assertCase(
  "i10.record.no.execution.claim",
  /NOT IMPLEMENTED/.test(certification),
  "CERTIFICATION.md does not claim execution",
);

const summary = readFileSync(
  join(pluginsDir, "certification/CERTIFICATION_SUMMARY.md"),
  "utf8",
);
assertCase(
  "i10.summary.release",
  /RELEASE CERTIFIED/.test(summary) && /PRODUCTION CERTIFIED/.test(summary),
  "CERTIFICATION_SUMMARY declares RELEASE + PRODUCTION CERTIFIED",
);

const completion = readFileSync(
  join(pluginsDir, "certification/DOMAIN_COMPLETION.md"),
  "utf8",
);
assertCase(
  "i10.completion.closed",
  /Implementation Series CLOSED/.test(completion) &&
    /PLUGINS DOMAIN COMPLETE/.test(completion),
  "DOMAIN_COMPLETION declares series CLOSED",
);

const reports = [
  "CONSOLIDATED_VALIDATION.md",
  "ARCHITECTURE_COMPLIANCE.md",
  "OWNERSHIP_COMPLIANCE.md",
  "DOCUMENTATION_REVIEW.md",
  "PRODUCTION_READINESS.md",
  "EVIDENCE_REVIEW.md",
] as const;

for (const name of reports) {
  const src = readFileSync(join(pluginsDir, "certification", name), "utf8");
  assertCase(
    `i10.report.${name}`,
    /\*\*PASS\*\*/.test(src),
    /\*\*PASS\*\*/.test(src) ? "PASS" : "missing PASS",
  );
}

const barrel = readFileSync(join(pluginsDir, "index.ts"), "utf8");
for (const sym of PLUGINS_ALLOWED_PUBLIC_CERTIFICATION_REEXPORTS) {
  assertCase(
    `i10.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

assertCase(
  "i10.barrel.no.ops.leak",
  !/\b(resolveExtensionPointBinding|composePluginsIntegration|collectDiagnostics|aggregateObservability|certifyCompliance|decideFromPublicContract|evaluateCompatibility)\b/.test(
    barrel,
  ),
  "public barrel must not leak ops",
);

const arch = readFileSync(join(pluginsDir, "ARCHITECTURE.md"), "utf8");
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

const implReadme = readFileSync(
  join(repoRoot, "docs/PLUGINS/implementation/README.md"),
  "utf8",
);
assertCase(
  "i10.impl.readme.complete",
  /PLUGINS-I10.*PRODUCTION CERTIFIED|Production Certification.*\*\*COMPLETE\*\*|Production Certification.*\*\*PASSED\*\*/i.test(
    implReadme,
  ),
  "implementation README marks I10 complete/certified",
);

const pkg = readFileSync(join(repoRoot, "package.json"), "utf8");
assertCase(
  "i10.script.present",
  /"validate:plugins-certification"/.test(pkg),
  "validate:plugins-certification script present",
);

/** Live consolidation — re-run I0–I9 gates (no bypass). */
const PRIOR_GATES = [
  "validate:plugins-foundation",
  "validate:plugins-framework",
  "validate:plugins-registry",
  "validate:plugins-admission",
  "validate:plugins-capability",
  "validate:plugins-contracts",
  "validate:plugins-lifecycle",
  "validate:plugins-validation",
  "validate:plugins-diagnostics",
  "validate:plugins-integration",
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
  console.error(`\nvalidate-plugins-certification: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-certification: ${results.length} checks PASS`);

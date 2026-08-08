/**
 * PLUGINS-I7 — Validation & Compatibility readiness gate.
 *
 * Authority: PLUGINS-P4 · PLUGINS-P5 · PLUGINS-P6 I7 ·
 * docs/PLUGINS/implementation/PLUGINS-I7-Validation-and-Compatibility.md
 *
 * Principle: Compatibility verifies. Validation certifies. Lifecycle decides.
 * Execution remains deferred.
 *
 * Review checks (mandatory):
 * 1. Compatibility consumes only certified public information; never mutates
 * 2. Validation consumes compatibility reports; does not re-evaluate compatibility
 * 3. Lifecycle remains exclusive owner of lifecycle decisions
 * 4. Registry remains exclusive owner of registration state
 * 5. I7 enables no execution / runtime loading / activation
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_VALIDATION_REEXPORTS,
  PLUGINS_COMPATIBILITY_REQUIRED_DIRS,
  PLUGINS_COMPATIBILITY_REQUIRED_FILES,
  PLUGINS_I7_FORBIDDEN_IMPORT_FRAGMENTS,
  PLUGINS_VALIDATION_REQUIRED_DIRS,
  PLUGINS_VALIDATION_REQUIRED_FILES,
} from "../src/plugins/internal/boundary-policy";
import { PLUGINS_VALIDATION_FLAGS } from "../src/plugins/validation/status";
import { composePluginsCompatibility } from "../src/plugins/compatibility/wiring/compose-compatibility";
import { composePluginsValidation } from "../src/plugins/validation/wiring/compose-validation";
import { evaluateCompatibility } from "../src/plugins/compatibility/evaluate";
import { certifyCompliance } from "../src/plugins/validation/certify";
import type { PublicPluginContractView } from "../src/plugins/contracts/views";
import type { LifecyclePluginRecord } from "../src/plugins/lifecycle/descriptors";

const repoRoot = process.cwd();
const pluginsDir = join(repoRoot, "src/plugins");

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

for (const rel of [
  ...PLUGINS_COMPATIBILITY_REQUIRED_DIRS,
  ...PLUGINS_VALIDATION_REQUIRED_DIRS,
]) {
  assertCase(
    `i7.dir.${rel}`,
    existsSync(join(pluginsDir, rel)),
    existsSync(join(pluginsDir, rel)) ? "present" : "missing",
  );
}

for (const rel of [
  ...PLUGINS_COMPATIBILITY_REQUIRED_FILES,
  ...PLUGINS_VALIDATION_REQUIRED_FILES,
]) {
  assertCase(
    `i7.file.${rel}`,
    existsSync(join(pluginsDir, rel)),
    existsSync(join(pluginsDir, rel)) ? "present" : "missing",
  );
}

assertCase(
  "i7.doc",
  existsSync(
    join(
      repoRoot,
      "docs/PLUGINS/implementation/PLUGINS-I7-Validation-and-Compatibility.md",
    ),
  ),
  "PLUGINS-I7 implementation record",
);

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";

for (const sym of PLUGINS_ALLOWED_PUBLIC_VALIDATION_REEXPORTS) {
  assertCase(
    `i7.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

assertCase(
  "i7.barrel.no.ops.leak",
  !/\b(evaluateCompatibility|certifyCompliance|composePluginsCompatibility|composePluginsValidation|decideFromPublicContract|registryStoreAppendEntry)\b/.test(
    barrel,
  ),
  "public barrel must not leak I7/I6 mutation or evaluation APIs",
);

assertCase(
  "i7.flags",
  PLUGINS_VALIDATION_FLAGS.compatibilityImplemented === true &&
    PLUGINS_VALIDATION_FLAGS.validationImplemented === true &&
    PLUGINS_VALIDATION_FLAGS.compatibilityReadOnly === true &&
    PLUGINS_VALIDATION_FLAGS.validationReadOnly === true &&
    PLUGINS_VALIDATION_FLAGS.executionImplemented === false &&
    PLUGINS_VALIDATION_FLAGS.runtimeLoadingImplemented === false,
  "I7 acceptance flags",
);

const compatSnap = composePluginsCompatibility();
assertCase(
  "compatibility.snapshot",
  compatSnap.compatibilityImplemented === true &&
    compatSnap.compatibilityReadOnly === true &&
    compatSnap.mutatesRegistry === false &&
    compatSnap.mutatesLifecycle === false &&
    compatSnap.componentId === "C8_CompatibilityValidator",
  `${compatSnap.phase}/${compatSnap.status}`,
);

const valSnap = composePluginsValidation();
assertCase(
  "validation.snapshot",
  valSnap.validationImplemented === true &&
    valSnap.replacesCompatibility === false &&
    valSnap.reEvaluatesCompatibility === false &&
    valSnap.mutatesRegistry === false &&
    valSnap.mutatesLifecycle === false,
  `${valSnap.phase}/${valSnap.status}`,
);

/** Isolation for compatibility + validation folders. */
for (const folder of ["compatibility", "validation"] as const) {
  for (const file of collectTsFiles(join(pluginsDir, folder))) {
    const src = readFileSync(file, "utf8");
    const rel = relFromRepo(file);
    for (const frag of PLUGINS_I7_FORBIDDEN_IMPORT_FRAGMENTS) {
      assertCase(
        `i7.isolation.${frag.replace(/\//g, ".")}.${rel}`,
        !src.includes(frag),
        `must not reference ${frag}`,
      );
    }
    assertCase(
      `i7.no.execution.${rel}`,
      !/\b(executePlugin|loadPlugin|activatePlugin|import\s*\()\b/.test(src),
      "no execution / load / dynamic import",
    );
  }
}

/** Validation must not call evaluateCompatibility. */
const certifySrc = readFileSync(
  join(pluginsDir, "validation/certify.ts"),
  "utf8",
);
assertCase(
  "validation.consumes.reports.only",
  certifySrc.includes("CompatibilityReport") &&
    !certifySrc.includes("evaluateCompatibility"),
  "certify consumes CompatibilityReport; does not call evaluateCompatibility",
);

assertCase(
  "compatibility.consumes.contracts",
  readFileSync(
    join(pluginsDir, "compatibility/evaluate.ts"),
    "utf8",
  ).includes("PublicPluginContractView"),
  "compatibility evaluates PublicPluginContractView",
);

const contract: PublicPluginContractView = {
  __kind: "PublicPluginContractView",
  __certifiedPublicSurface: true,
  __extensible: true,
  __exposesRegistryInternals: false,
  __exposesFrameworkInternals: false,
  __exposesStore: false,
  __mutable: false,
  __activatesPlugins: false,
  __executesPlugins: false,
  contractId: "plugins.public-plugin-contract.v0",
  category: "CapabilityContracts",
  versionLabel: "v0-infrastructure",
  plugins: [
    {
      __view: "PublicRegisteredPluginView",
      identity: "demo.plugin.i7",
      declaredCapabilityIds: ["cap.i7"],
    },
  ],
  capabilities: [],
  permissions: [],
  metadata: {
    __kind: "PublicContractMetadata",
    contractId: "plugins.public-plugin-contract.v0",
    category: "CapabilityContracts",
    versionLabel: "v0-infrastructure",
    advisoryOnly: true,
    activatesPlugins: false,
    executesPlugins: false,
  },
  diagnostics: [],
};

const compat = evaluateCompatibility(contract);
assertCase(
  "compatibility.operational",
  compat.ok &&
    compat.report.__advisory === true &&
    compat.report.__executionImplied === false &&
    compat.report.findings.some((f) => f.dimension === "DependencyConceptual") &&
    (compat.report.overall === "Compatible" ||
      compat.report.overall === "Indeterminate"),
  `overall=${compat.report.overall}`,
);

const lifecycleRecords: LifecyclePluginRecord[] = [
  {
    __kind: "LifecyclePluginRecord",
    __executionImplied: false,
    identity: "demo.plugin.i7",
    state: "Active",
    activationEligibility: "Eligible",
    activationEligible: true,
    activeMeansExecuting: false,
  },
];

const certified = certifyCompliance({
  compatibilityReport: compat.report,
  contract,
  lifecycleRecords,
});

assertCase(
  "validation.operational",
  certified.ok &&
    certified.report.__reEvaluatedCompatibility === false &&
    certified.report.__executionImplied === false &&
    certified.report.findings.some(
      (f) => f.concern === "CompatibilityReportIntegrity" && f.outcome === "Pass",
    ) &&
    certified.report.findings.some(
      (f) => f.concern === "LifecycleIntegrity" && f.outcome === "Pass",
    ),
  `overall=${certified.report.overall}`,
);

assertCase(
  "still.no.execution",
  compatSnap.executionImplemented === false &&
    valSnap.executionImplemented === false &&
    valSnap.runtimeLoadingImplemented === false,
  "I7 must not enable execution or runtime loading",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-plugins-validation: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-validation: ${results.length} checks PASS`);

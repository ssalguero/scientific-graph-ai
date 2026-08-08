/**
 * PLUGINS-I6 — Lifecycle Engine readiness gate.
 *
 * Authority: PLUGINS-P5 · PLUGINS-P6 I6 ·
 * docs/PLUGINS/implementation/PLUGINS-I6-Lifecycle-Engine.md
 *
 * Principle: Contracts expose. Lifecycle decides. Execution performs (deferred).
 *
 * Review checks (mandatory):
 * 1. Lifecycle consumes only Public Plugin Contracts
 * 2. No Lifecycle access to Registry internals
 * 3. No Capability/Permission evaluator decides activation
 * 4. Lifecycle state ≠ plugin execution
 * 5. Active means lifecycle-eligible, not currently executing
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_LIFECYCLE_REEXPORTS,
  PLUGINS_LIFECYCLE_FORBIDDEN_IMPORT_FRAGMENTS,
  PLUGINS_LIFECYCLE_REQUIRED_DIRS,
  PLUGINS_LIFECYCLE_REQUIRED_FILES,
} from "../src/plugins/internal/boundary-policy";
import { PLUGINS_LIFECYCLE_FLAGS } from "../src/plugins/lifecycle/status";
import { composePluginsLifecycle } from "../src/plugins/lifecycle/wiring/compose-lifecycle";
import {
  decideFromPublicContract,
  lifecycleClearForTests,
  applyLifecycleTransition,
} from "../src/plugins/lifecycle/controller";
import { isAllowedLifecycleTransition } from "../src/plugins/lifecycle/transitions";
import type { PublicPluginContractView } from "../src/plugins/contracts/views";

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

for (const rel of PLUGINS_LIFECYCLE_REQUIRED_DIRS) {
  const full = join(pluginsDir, rel);
  assertCase(
    `lifecycle.dir.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

for (const rel of PLUGINS_LIFECYCLE_REQUIRED_FILES) {
  const full = join(pluginsDir, rel);
  assertCase(
    `lifecycle.file.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

assertCase(
  "lifecycle.doc",
  existsSync(
    join(
      repoRoot,
      "docs/PLUGINS/implementation/PLUGINS-I6-Lifecycle-Engine.md",
    ),
  ),
  "PLUGINS-I6 implementation record",
);

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";

for (const sym of PLUGINS_ALLOWED_PUBLIC_LIFECYCLE_REEXPORTS) {
  assertCase(
    `lifecycle.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

assertCase(
  "lifecycle.barrel.no.ops.leak",
  !/\b(decideFromPublicContract|applyLifecycleTransition|composePluginsLifecycle|evaluateRegisteredCapabilities|evaluatePermissionIntents|registryStoreAppendEntry)\b/.test(
    barrel,
  ),
  "public barrel must not leak lifecycle controller / evaluation / mutation APIs",
);

assertCase(
  "lifecycle.flags",
  PLUGINS_LIFECYCLE_FLAGS.lifecycleImplemented === true &&
    PLUGINS_LIFECYCLE_FLAGS.activationEligibilityImplemented === true &&
    PLUGINS_LIFECYCLE_FLAGS.lifecycleConsumesContractsOnly === true &&
    PLUGINS_LIFECYCLE_FLAGS.executionImplemented === false &&
    PLUGINS_LIFECYCLE_FLAGS.runtimeLoadingImplemented === false &&
    PLUGINS_LIFECYCLE_FLAGS.dynamicLoadingImplemented === false,
  "I6 acceptance flags",
);

const snap = composePluginsLifecycle();
assertCase(
  "lifecycle.snapshot",
  snap.lifecycleImplemented === true &&
    snap.lifecycleConsumesContractsOnly === true &&
    snap.executionImplemented === false &&
    snap.activeMeansExecution === false &&
    snap.identity.ownsActivationEligibility === true &&
    snap.identity.activeMeansExecution === false &&
    snap.componentId === "C5_LifecycleCoordinator" &&
    snap.phase === "PLUGINS-I6",
  `${snap.phase}/${snap.status}`,
);

assertCase(
  "lifecycle.states.p5",
  snap.states.includes("Discovered") &&
    snap.states.includes("Registered") &&
    snap.states.includes("Active") &&
    snap.states.includes("Inactive") &&
    snap.states.includes("Suspended") &&
    snap.states.includes("Invalid") &&
    snap.states.includes("Removed") &&
    !(snap.states as readonly string[]).includes("Eligible"),
  "P5 states held; Eligible is eligibility decision not a state",
);

assertCase(
  "lifecycle.transition.integrity",
  isAllowedLifecycleTransition("Registered", "Active") === true &&
    isAllowedLifecycleTransition("Discovered", "Active") === false &&
    isAllowedLifecycleTransition("Removed", "Active") === false &&
    isAllowedLifecycleTransition("Invalid", "Active") === false,
  "forbidden skip-gate / Removed transitions rejected",
);

/** Review #1–#3: isolation — contracts/views only; no registry/evaluate. */
for (const file of collectTsFiles(join(pluginsDir, "lifecycle"))) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const frag of PLUGINS_LIFECYCLE_FORBIDDEN_IMPORT_FRAGMENTS) {
    assertCase(
      `lifecycle.isolation.${frag.replace(/\//g, ".")}.${rel}`,
      !src.includes(frag),
      `must not import ${frag}`,
    );
  }
  assertCase(
    `lifecycle.no.execution.api.${rel}`,
    !/\b(executePlugin|loadPlugin|activatePlugin|import\s*\()\b/.test(src),
    "no execution / load / dynamic import",
  );
}

const controllerSrc = readFileSync(
  join(pluginsDir, "lifecycle/controller.ts"),
  "utf8",
);
assertCase(
  "lifecycle.consumes.contracts.only",
  /contracts\/views/.test(controllerSrc) &&
    /PublicPluginContractView/.test(controllerSrc),
  "controller must consume PublicPluginContractView",
);

assertCase(
  "lifecycle.no.capability.activation",
  !/evaluateRegisteredCapabilities|evaluateCapabilityQuery|evaluatePermissionIntents/.test(
    controllerSrc,
  ),
  "controller must not invoke capability/permission evaluators",
);

/** Operational: decide from a certified public contract view. */
lifecycleClearForTests();

const eligibleContract: PublicPluginContractView = {
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
      identity: "demo.plugin.life",
      declaredCapabilityIds: ["cap.life"],
    },
  ],
  capabilities: [
    {
      __view: "PublicCapabilityAdvisoryView",
      __advisory: true,
      capabilityId: "cap.life",
      pluginIdentity: "demo.plugin.life",
      availability: "Declared",
      declared: true,
    },
  ],
  permissions: [
    {
      __view: "PublicPermissionAdvisoryView",
      __advisory: true,
      permissionId: "perm.life",
      capabilityId: "cap.life",
      pluginIdentity: "demo.plugin.life",
      status: "Granted",
      capabilityDeclared: true,
    },
  ],
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

const decided = decideFromPublicContract(eligibleContract);
assertCase(
  "lifecycle.operational.eligible",
  decided.ok &&
    decided.decisions[0]?.activationEligibility === "Eligible" &&
    decided.decisions[0]?.toState === "Active" &&
    decided.decisions[0]?.__executionDeferred === true &&
    decided.state.records[0]?.activeMeansExecuting === false &&
    decided.state.records[0]?.__executionImplied === false,
  `state=${decided.state.records[0]?.state} eligibility=${decided.decisions[0]?.activationEligibility}`,
);

/** Review #4–#5: Active ≠ execution. */
assertCase(
  "lifecycle.active.not.execution",
  decided.state.records[0]?.state === "Active" &&
    decided.state.__executionImplemented === false &&
    snap.executionImplemented === false &&
    snap.activeMeansExecution === false,
  "Active is conceptual lifecycle state only",
);

const ineligibleContract: PublicPluginContractView = {
  ...eligibleContract,
  plugins: [
    {
      __view: "PublicRegisteredPluginView",
      identity: "demo.plugin.blocked",
      declaredCapabilityIds: [],
    },
  ],
  capabilities: [
    {
      __view: "PublicCapabilityAdvisoryView",
      __advisory: true,
      capabilityId: "cap.missing",
      pluginIdentity: "demo.plugin.blocked",
      availability: "Undeclared",
      declared: false,
    },
  ],
  permissions: [
    {
      __view: "PublicPermissionAdvisoryView",
      __advisory: true,
      permissionId: "perm.blocked",
      capabilityId: "cap.missing",
      pluginIdentity: "demo.plugin.blocked",
      status: "Denied",
      capabilityDeclared: false,
    },
  ],
};

const blocked = decideFromPublicContract(ineligibleContract);
assertCase(
  "lifecycle.operational.ineligible",
  blocked.decisions.some(
    (d) =>
      d.identity === "demo.plugin.blocked" &&
      d.activationEligibility === "Ineligible",
  ),
  "denied advisories → ineligible",
);

const suspend = applyLifecycleTransition("demo.plugin.life", "Suspended");
assertCase(
  "lifecycle.transition.applied",
  suspend.ok === true && suspend.ok && suspend.record.state === "Suspended",
  suspend.ok ? "Suspended" : suspend.error,
);

const skip = applyLifecycleTransition("demo.plugin.life", "Discovered");
assertCase(
  "lifecycle.transition.rejected",
  skip.ok === false,
  skip.ok ? "unexpected" : skip.error,
);

lifecycleClearForTests();

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-plugins-lifecycle: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-lifecycle: ${results.length} checks PASS`);

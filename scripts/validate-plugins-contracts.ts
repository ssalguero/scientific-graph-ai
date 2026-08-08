/**
 * PLUGINS-I5 — Public Contract Infrastructure readiness gate.
 *
 * Authority: PLUGINS-P4 · PLUGINS-P6 I5 ·
 * docs/PLUGINS/implementation/PLUGINS-I5-Public-Contract-Infrastructure.md
 *
 * Principle: Capabilities evaluate. Contracts expose. Lifecycle consumes.
 *
 * Review checks (mandatory):
 * 1. No Registry/Framework/Store types exported through Public Contract views
 * 2. Public exposure only via adapters / public views
 * 3. No public contract mutates internal state
 * 4. Surface matches P4 Public Plugin Contract strategy
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_CONTRACT_REEXPORTS,
  PLUGINS_CONTRACTS_REQUIRED_DIRS,
  PLUGINS_CONTRACTS_REQUIRED_FILES,
  PLUGINS_FORBIDDEN_PUBLIC_CONTRACT_TYPE_NAMES,
} from "../src/plugins/internal/boundary-policy";
import {
  PLUGINS_CONTRACTS_FLAGS,
} from "../src/plugins/contracts/status";
import { composePluginsPublicContracts } from "../src/plugins/contracts/wiring/compose-contracts";
import { adaptToPublicPluginContract } from "../src/plugins/contracts/adapter";
import { createPluginRegistryRegistrationService } from "../src/plugins/registry/registration-service";
import { createPluginRegistryReadView } from "../src/plugins/registry/read-view";
import { registryStoreClearForTests } from "../src/plugins/registry/store";
import { evaluateRegisteredCapabilities } from "../src/plugins/capabilities/evaluate";
import { evaluatePermissionIntents } from "../src/plugins/permissions/evaluate";
import { asCapabilityId, asPluginIdentity } from "../src/plugins/types";

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

for (const rel of PLUGINS_CONTRACTS_REQUIRED_DIRS) {
  const full = join(pluginsDir, rel);
  assertCase(
    `contracts.dir.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

for (const rel of PLUGINS_CONTRACTS_REQUIRED_FILES) {
  const full = join(pluginsDir, rel);
  assertCase(
    `contracts.file.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

assertCase(
  "contracts.doc",
  existsSync(
    join(
      repoRoot,
      "docs/PLUGINS/implementation/PLUGINS-I5-Public-Contract-Infrastructure.md",
    ),
  ),
  "PLUGINS-I5 implementation record",
);

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";

for (const sym of PLUGINS_ALLOWED_PUBLIC_CONTRACT_REEXPORTS) {
  assertCase(
    `contracts.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

assertCase(
  "contracts.barrel.no.ops.leak",
  !/\b(adaptToPublicPluginContract|composePluginsPublicContracts|projectRegistryReadView|evaluateRegisteredCapabilities|evaluatePermissionIntents|registryStoreAppendEntry|registerEntry)\b/.test(
    barrel,
  ),
  "public barrel must not leak adapters/compose/evaluation/mutation APIs",
);

assertCase(
  "contracts.flags",
  PLUGINS_CONTRACTS_FLAGS.publicContractsImplemented === true &&
    PLUGINS_CONTRACTS_FLAGS.publicContractsExposeOnlyCertifiedSurface ===
      true &&
    PLUGINS_CONTRACTS_FLAGS.registryInternalsExposed === false &&
    PLUGINS_CONTRACTS_FLAGS.activationImplemented === false &&
    PLUGINS_CONTRACTS_FLAGS.lifecycleImplemented === false &&
    PLUGINS_CONTRACTS_FLAGS.pluginExecutionImplemented === false,
  "I5 acceptance flags",
);

const snap = composePluginsPublicContracts();
assertCase(
  "contracts.snapshot",
  snap.publicContractsImplemented === true &&
    snap.registryInternalsExposed === false &&
    snap.evaluatesCapabilities === false &&
    snap.evaluatesPermissions === false &&
    snap.mutatesRegistry === false &&
    snap.v1SelectionDeferred === true &&
    snap.phase === "PLUGINS-I5",
  `${snap.phase}/${snap.status}`,
);

/** Review #1 + #2: views must not reference forbidden internal type names. */
const viewsSrc = readFileSync(join(pluginsDir, "contracts/views.ts"), "utf8");
for (const name of PLUGINS_FORBIDDEN_PUBLIC_CONTRACT_TYPE_NAMES) {
  assertCase(
    `contracts.views.no.internal.type.${name}`,
    !viewsSrc.includes(name),
    `Public views must not mention ${name}`,
  );
}

const indexSrc = readFileSync(join(pluginsDir, "contracts/index.ts"), "utf8");
assertCase(
  "contracts.barrel.no.registry.reexport",
  !/from ["'].*registry\/(store|registration-service|state)/.test(indexSrc),
  "contracts barrel must not re-export registry store/service/state",
);
assertCase(
  "contracts.barrel.no.framework.wiring",
  !/framework\/wiring/.test(indexSrc),
  "contracts barrel must not re-export framework wiring",
);
assertCase(
  "contracts.barrel.no.evaluate",
  !/capabilities\/evaluate|permissions\/evaluate/.test(indexSrc),
  "contracts barrel must not re-export evaluation engines",
);

/** Review #3: contracts sources must not mutate registry / activate. */
const FORBIDDEN = [
  { id: "store", re: /registry\/store/ },
  { id: "append", re: /registryStoreAppendEntry/ },
  { id: "registerEntry", re: /\.registerEntry\s*\(/ },
  { id: "registrationService", re: /createPluginRegistryRegistrationService/ },
  { id: "evaluateCaps", re: /evaluateRegisteredCapabilities|evaluateCapabilityQuery/ },
  { id: "evaluatePerms", re: /evaluatePermissionIntents/ },
  { id: "activate", re: /\bactivatePlugin\b/ },
  { id: "load", re: /\bloadPlugin\b/ },
  { id: "dynamicImport", re: /\bimport\s*\(/ },
  { id: "lifecycle", re: /lifecycle\// },
];

for (const file of collectTsFiles(join(pluginsDir, "contracts"))) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  const isAdapter = /adapter\.ts$/.test(rel);
  for (const { id, re } of FORBIDDEN) {
    // Adapter may import read-view and advisory descriptor types only — not evaluate/store.
    if (isAdapter && (id === "evaluateCaps" || id === "evaluatePerms")) {
      // still forbidden
    }
    assertCase(
      `contracts.isolation.${id}.${rel}`,
      !re.test(src),
      hitDetail(!re.test(src), id, rel),
    );
  }
}

function hitDetail(pass: boolean, id: string, rel: string): string {
  return pass ? "clean" : `forbidden ${id} in ${rel}`;
}

/** Review #4: P4 category taxonomy present; V1 deferred. */
assertCase(
  "contracts.p4.categories",
  snap.categories.includes("CapabilityContracts") &&
    snap.categories.includes("RegistrationContracts") &&
    snap.categories.includes("FutureSdkContracts"),
  "P4 category taxonomy prepared",
);

/** Operational: adapter projects without leaking internals. */
registryStoreClearForTests();
const identity = asPluginIdentity("demo.plugin.contract");
const capId = asCapabilityId("cap.public");
const service = createPluginRegistryRegistrationService();
const reg = service.registerEntry({
  identity: identity!,
  declaredCapabilityIds: [capId!],
});
assertCase("setup.registered", reg.ok === true, reg.ok ? "ok" : reg.error);

const readView = createPluginRegistryReadView();
const caps = evaluateRegisteredCapabilities(readView.getState());
const perms = evaluatePermissionIntents(readView.getState(), [
  {
    permissionId: "perm.public",
    capabilityId: "cap.public",
    pluginIdentity: "demo.plugin.contract",
  },
]);

const view = adaptToPublicPluginContract(
  readView,
  caps.records,
  perms.records,
);

assertCase(
  "contracts.operational.view",
  view.__certifiedPublicSurface === true &&
    view.__exposesRegistryInternals === false &&
    view.__exposesStore === false &&
    view.__mutable === false &&
    view.__activatesPlugins === false &&
    view.plugins.length === 1 &&
    view.capabilities.length === 1 &&
    view.capabilities[0]?.__advisory === true &&
    view.permissions.length === 1 &&
    view.permissions[0]?.__advisory === true &&
    view.metadata.advisoryOnly === true,
  `plugins=${view.plugins.length} caps=${view.capabilities.length}`,
);

assertCase(
  "contracts.no.internal.leak.in.view",
  !JSON.stringify(view).includes("__ssot") &&
    !JSON.stringify(view).includes("PluginRegistryState") &&
    !JSON.stringify(view).includes("registeredAtOrdinal"),
  "serialized public view must not leak registry internals",
);

assertCase(
  "still.no.activation",
  snap.activationImplemented === false &&
    snap.lifecycleImplemented === false &&
    snap.pluginExecutionImplemented === false,
  "I5 must not enable activation/lifecycle/execution",
);

/** Adapter is the only contracts file allowed to import read-view. */
for (const file of collectTsFiles(join(pluginsDir, "contracts"))) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  if (/adapter\.ts$/.test(rel)) {
    assertCase(
      `contracts.adapter.uses.read.view.${rel}`,
      /registry\/read-view/.test(src),
      "adapter must consume Registry Read View",
    );
    continue;
  }
  assertCase(
    `contracts.non.adapter.no.read.view.${rel}`,
    !/registry\/read-view/.test(src),
    "only adapter may import Registry Read View",
  );
}

registryStoreClearForTests();

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-plugins-contracts: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-contracts: ${results.length} checks PASS`);

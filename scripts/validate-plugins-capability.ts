/**
 * PLUGINS-I4 — Capability & Permission System readiness gate.
 *
 * Authority: PLUGINS-P3 C6/C7 · PLUGINS-P6 I4 ·
 * docs/PLUGINS/implementation/PLUGINS-I4-Capability-and-Permission.md
 *
 * Principle: Capabilities evaluate. Registration admits. Registry stores.
 * Lifecycle governs execution (unimplemented until I6).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_CAPABILITY_REEXPORTS,
  PLUGINS_CAPABILITIES_REQUIRED_DIRS,
  PLUGINS_CAPABILITIES_REQUIRED_FILES,
  PLUGINS_PERMISSIONS_REQUIRED_DIRS,
  PLUGINS_PERMISSIONS_REQUIRED_FILES,
  PLUGINS_REGISTRY_I4_REQUIRED_FILES,
} from "../src/plugins/internal/boundary-policy";
import { PLUGINS_CAPABILITY_FLAGS } from "../src/plugins/capability";
import { composePluginsCapabilities } from "../src/plugins/capabilities/wiring/compose-capabilities";
import { composePluginsPermissions } from "../src/plugins/permissions/wiring/compose-permissions";
import { evaluateRegisteredCapabilities, evaluateCapabilityQuery } from "../src/plugins/capabilities/evaluate";
import { evaluatePermissionIntents } from "../src/plugins/permissions/evaluate";
import { createPluginRegistryRegistrationService } from "../src/plugins/registry/registration-service";
import { createPluginRegistryReadView } from "../src/plugins/registry/read-view";
import { registryStoreClearForTests } from "../src/plugins/registry/store";
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

for (const rel of [
  ...PLUGINS_CAPABILITIES_REQUIRED_DIRS,
  ...PLUGINS_PERMISSIONS_REQUIRED_DIRS,
]) {
  const full = join(pluginsDir, rel);
  assertCase(
    `capability.dir.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

for (const rel of [
  ...PLUGINS_CAPABILITIES_REQUIRED_FILES,
  ...PLUGINS_PERMISSIONS_REQUIRED_FILES,
  ...PLUGINS_REGISTRY_I4_REQUIRED_FILES,
]) {
  const full = join(pluginsDir, rel);
  assertCase(
    `capability.file.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

assertCase(
  "capability.doc",
  existsSync(
    join(
      repoRoot,
      "docs/PLUGINS/implementation/PLUGINS-I4-Capability-and-Permission.md",
    ),
  ),
  "PLUGINS-I4 implementation record",
);

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";

for (const sym of PLUGINS_ALLOWED_PUBLIC_CAPABILITY_REEXPORTS) {
  assertCase(
    `capability.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

assertCase(
  "capability.barrel.no.ops.leak",
  !/\b(evaluateRegisteredCapabilities|evaluateCapabilityQuery|evaluatePermissionIntents|composePluginsCapabilities|composePluginsPermissions|registryStoreAppendEntry|registerEntry)\b/.test(
    barrel,
  ),
  "public barrel must not leak capability/permission/registry mutation APIs",
);

assertCase(
  "capability.flags",
  PLUGINS_CAPABILITY_FLAGS.capabilitiesImplemented === true &&
    PLUGINS_CAPABILITY_FLAGS.permissionsImplemented === true &&
    PLUGINS_CAPABILITY_FLAGS.capabilitiesReadOnly === true &&
    PLUGINS_CAPABILITY_FLAGS.permissionsReadOnly === true &&
    PLUGINS_CAPABILITY_FLAGS.registryMutationOnlyViaRegistry === true &&
    PLUGINS_CAPABILITY_FLAGS.activationImplemented === false &&
    PLUGINS_CAPABILITY_FLAGS.lifecycleImplemented === false &&
    PLUGINS_CAPABILITY_FLAGS.pluginExecutionImplemented === false,
  "I4 acceptance flags",
);

const capSnap = composePluginsCapabilities();
assertCase(
  "capabilities.snapshot",
  capSnap.capabilitiesImplemented === true &&
    capSnap.capabilitiesReadOnly === true &&
    capSnap.mutatesRegistry === false &&
    capSnap.activationImplemented === false &&
    capSnap.lifecycleImplemented === false &&
    capSnap.componentId === "C6_CapabilityManager",
  `${capSnap.phase}/${capSnap.status}`,
);

const permSnap = composePluginsPermissions();
assertCase(
  "permissions.snapshot",
  permSnap.permissionsImplemented === true &&
    permSnap.permissionsReadOnly === true &&
    permSnap.mutatesRegistry === false &&
    permSnap.activationImplemented === false &&
    permSnap.componentId === "C7_PermissionManager",
  `${permSnap.phase}/${permSnap.status}`,
);

registryStoreClearForTests();
const service = createPluginRegistryRegistrationService();
const identity = asPluginIdentity("demo.plugin.cap");
const capId = asCapabilityId("cap.read");
assertCase(
  "setup.brands",
  identity != null && capId != null,
  "brand helpers",
);

const reg = service.registerEntry({
  identity: identity!,
  version: undefined,
  declaredCapabilityIds: [capId!],
});
assertCase("setup.registered", reg.ok === true, reg.ok ? "ok" : reg.error);

const readView = createPluginRegistryReadView();
assertCase(
  "registry.read.view",
  readView.__mutable === false &&
    readView.__evaluatesCapabilities === false &&
    readView.__evaluatesPermissions === false &&
    readView.getState().entryCount === 1,
  "read-only view over registry",
);

const state = readView.getState();
const declared = evaluateRegisteredCapabilities(state);
assertCase(
  "capabilities.operational.declared",
  declared.ok &&
    declared.records.length === 1 &&
    declared.records[0]?.availability === "Declared" &&
    declared.records[0]?.__advisory === true,
  `records=${declared.records.length}`,
);

const missing = evaluateCapabilityQuery(state, "cap.unknown");
assertCase(
  "capabilities.never.inferred",
  missing.records[0]?.availability === "Undeclared" &&
    missing.records[0]?.declared === false,
  "undeclared capability is not inferred",
);

const granted = evaluatePermissionIntents(state, [
  {
    permissionId: "perm.read",
    capabilityId: "cap.read",
    pluginIdentity: "demo.plugin.cap",
  },
]);
assertCase(
  "permissions.operational.granted",
  granted.records[0]?.status === "Granted" &&
    granted.records[0]?.__advisory === true,
  granted.records[0]?.status ?? "none",
);

const denied = evaluatePermissionIntents(state, [
  {
    permissionId: "perm.write",
    capabilityId: "cap.write",
    pluginIdentity: "demo.plugin.cap",
  },
]);
assertCase(
  "permissions.least.privilege",
  denied.records[0]?.status === "Denied" &&
    denied.state.deniedCount === 1,
  denied.records[0]?.status ?? "none",
);

assertCase(
  "still.no.activation",
  capSnap.activationImplemented === false &&
    capSnap.lifecycleImplemented === false &&
    capSnap.pluginExecutionImplemented === false &&
    permSnap.pluginExecutionImplemented === false,
  "I4 must not enable activation/lifecycle/execution",
);

const FORBIDDEN_MUTATION = [
  /registry\/store/,
  /registryStoreAppendEntry/,
  /\.registerEntry\s*\(/,
  /createPluginRegistryRegistrationService/,
];

for (const folder of ["capabilities", "permissions"] as const) {
  for (const file of collectTsFiles(join(pluginsDir, folder))) {
    const src = readFileSync(file, "utf8");
    const rel = relFromRepo(file);
    for (const re of FORBIDDEN_MUTATION) {
      assertCase(
        `readonly.no.mutation.${re.source}.${rel}`,
        !re.test(src),
        "must not mutate registry / use registration service",
      );
    }
    assertCase(
      `readonly.no.lifecycle.${rel}`,
      !/lifecycle\//.test(src) && !/\bactivatePlugin\b/.test(src),
      "no lifecycle coupling / activation",
    );
    assertCase(
      `readonly.no.load.${rel}`,
      !/\b(loadPlugin|import\s*\()\b/.test(src),
      "no loading / dynamic import",
    );
  }
}

assertCase(
  "capabilities.reads.state.type",
  readFileSync(join(pluginsDir, "capabilities/evaluate.ts"), "utf8").includes(
    "PluginRegistryState",
  ),
  "capabilities consume PluginRegistryState",
);

assertCase(
  "permissions.reads.state.type",
  readFileSync(join(pluginsDir, "permissions/evaluate.ts"), "utf8").includes(
    "PluginRegistryState",
  ),
  "permissions consume PluginRegistryState",
);

registryStoreClearForTests();

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-plugins-capability: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-capability: ${results.length} checks PASS`);

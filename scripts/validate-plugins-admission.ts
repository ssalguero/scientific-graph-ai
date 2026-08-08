/**
 * PLUGINS-I3 — Discovery & Registration readiness gate.
 *
 * Authority: PLUGINS-P3 C3/C4 · PLUGINS-P6 I3 ·
 * docs/PLUGINS/implementation/PLUGINS-I3-Discovery-and-Registration.md
 *
 * Principle: Discovery discovers. Registration requests. Registry owns.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_ADMISSION_REEXPORTS,
  PLUGINS_DISCOVERY_REQUIRED_DIRS,
  PLUGINS_DISCOVERY_REQUIRED_FILES,
  PLUGINS_REGISTRATION_REQUIRED_DIRS,
  PLUGINS_REGISTRATION_REQUIRED_FILES,
  PLUGINS_REGISTRY_I3_REQUIRED_FILES,
} from "../src/plugins/internal/boundary-policy";
import { PLUGINS_ADMISSION_FLAGS } from "../src/plugins/admission";
import { composePluginsDiscovery } from "../src/plugins/discovery/wiring/compose-discovery";
import { composePluginsRegistration } from "../src/plugins/registration/wiring/compose-registration";
import { composePluginsRegistryInfrastructure } from "../src/plugins/registry/wiring/compose-registry";
import { registryStoreClearForTests } from "../src/plugins/registry/store";
import { discoverPluginCandidates } from "../src/plugins/discovery/discover";
import { requestPluginRegistration } from "../src/plugins/registration/register";
import { createPluginRegistryRegistrationService } from "../src/plugins/registry/registration-service";

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
  ...PLUGINS_DISCOVERY_REQUIRED_DIRS,
  ...PLUGINS_REGISTRATION_REQUIRED_DIRS,
]) {
  const full = join(pluginsDir, rel);
  assertCase(
    `admission.dir.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

for (const rel of [
  ...PLUGINS_DISCOVERY_REQUIRED_FILES,
  ...PLUGINS_REGISTRATION_REQUIRED_FILES,
  ...PLUGINS_REGISTRY_I3_REQUIRED_FILES,
]) {
  const full = join(pluginsDir, rel);
  assertCase(
    `admission.file.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

assertCase(
  "admission.doc",
  existsSync(
    join(
      repoRoot,
      "docs/PLUGINS/implementation/PLUGINS-I3-Discovery-and-Registration.md",
    ),
  ),
  "PLUGINS-I3 implementation record",
);

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";

for (const sym of PLUGINS_ALLOWED_PUBLIC_ADMISSION_REEXPORTS) {
  assertCase(
    `admission.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

assertCase(
  "admission.barrel.no.ops.leak",
  !/\b(discoverPluginCandidates|requestPluginRegistration|composePluginsDiscovery|composePluginsRegistration|createPluginRegistryRegistrationService|registryStoreAppendEntry)\b/.test(
    barrel,
  ),
  "public barrel must not leak discovery/registration/registry mutation APIs",
);

assertCase(
  "admission.flags",
  PLUGINS_ADMISSION_FLAGS.discoveryImplemented === true &&
    PLUGINS_ADMISSION_FLAGS.registrationImplemented === true &&
    PLUGINS_ADMISSION_FLAGS.registryMutationOnlyViaRegistry === true &&
    PLUGINS_ADMISSION_FLAGS.pluginLoadingImplemented === false &&
    PLUGINS_ADMISSION_FLAGS.activationImplemented === false &&
    PLUGINS_ADMISSION_FLAGS.lifecycleImplemented === false &&
    PLUGINS_ADMISSION_FLAGS.capabilitiesImplemented === false,
  "I3 acceptance flags",
);

const discoverySnap = composePluginsDiscovery();
assertCase(
  "discovery.snapshot",
  discoverySnap.discoveryImplemented === true &&
    discoverySnap.mutatesRegistryDirectly === false &&
    discoverySnap.activationImplemented === false &&
    discoverySnap.pluginLoadingImplemented === false &&
    discoverySnap.componentId === "C3_DiscoveryService",
  `${discoverySnap.phase}/${discoverySnap.status}`,
);

const registrationSnap = composePluginsRegistration();
assertCase(
  "registration.snapshot",
  registrationSnap.registrationImplemented === true &&
    registrationSnap.ownsRegistryState === false &&
    registrationSnap.registryMutationOnlyViaRegistry === true &&
    registrationSnap.activationImplemented === false &&
    registrationSnap.componentId === "C4_RegistrationService",
  `${registrationSnap.phase}/${registrationSnap.status}`,
);

registryStoreClearForTests();
const registryBefore = composePluginsRegistryInfrastructure();
assertCase(
  "registry.empty.before",
  registryBefore.state.entryCount === 0,
  "store cleared for operational test",
);

const discovered = discoverPluginCandidates([
  {
    identity: "demo.plugin.alpha",
    version: "0.1.0",
    declaredCapabilityIds: ["cap.read"],
  },
  { identity: "  ", version: "1.0.0" },
  {
    identity: "demo.plugin.alpha",
    version: "0.2.0",
  },
]);

assertCase(
  "discovery.operational",
  discovered.ok === true &&
    discovered.descriptors.length === 1 &&
    discovered.state.diagnostics.length >= 2 &&
    discovered.descriptors[0]?.__inert === true &&
    discovered.descriptors[0]?.__activatable === false &&
    discovered.descriptors[0]?.__executable === false,
  `accepted=${discovered.descriptors.length} diagnostics=${discovered.state.diagnostics.length}`,
);

const service = createPluginRegistryRegistrationService();
const reg = requestPluginRegistration(discovered.descriptors[0]!, service);
assertCase(
  "registration.operational",
  reg.ok === true && reg.entry.identity === "demo.plugin.alpha",
  reg.ok ? `registered ${reg.entry.identity}` : reg.error,
);

const registryAfter = composePluginsRegistryInfrastructure();
assertCase(
  "registry.contains.registered",
  registryAfter.state.entryCount === 1 &&
    registryAfter.state.entries[0]?.identity === "demo.plugin.alpha",
  `entryCount=${registryAfter.state.entryCount}`,
);

const dup = requestPluginRegistration(discovered.descriptors[0]!, service);
assertCase(
  "registration.duplicate.rejected",
  dup.ok === false,
  dup.ok ? "unexpected accept" : dup.error,
);

assertCase(
  "still.no.activation",
  registryAfter.activationImplemented === false &&
    registryAfter.pluginLoadingImplemented === false &&
    registryAfter.lifecycleImplemented === false &&
    registryAfter.capabilitiesImplemented === false &&
    registryAfter.runtimeBehavior === false,
  "I3 must not enable activation/loading/lifecycle/capabilities",
);

/** Discovery must never import registry store / mutation helpers. */
const discoveryFiles = collectTsFiles(join(pluginsDir, "discovery"));
for (const file of discoveryFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  assertCase(
    `discovery.isolation.no.store.${rel}`,
    !/registry\/store/.test(src) && !/registryStoreAppendEntry/.test(src),
    "Discovery must not touch registry store",
  );
  assertCase(
    `discovery.isolation.no.registerEntry.${rel}`,
    !/\.registerEntry\s*\(/.test(src) &&
      !/createPluginRegistryRegistrationService/.test(src),
    "Discovery must not call Registry registration service",
  );
  assertCase(
    `discovery.no.load.activate.${rel}`,
    !/\b(loadPlugin|activatePlugin|import\s*\()\b/.test(src),
    "Discovery must not load/activate/dynamic-import",
  );
}

/** Registration may use registration-service only — not store directly. */
const registrationFiles = collectTsFiles(join(pluginsDir, "registration"));
for (const file of registrationFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  assertCase(
    `registration.isolation.no.store.${rel}`,
    !/registry\/store/.test(src) && !/registryStoreAppendEntry/.test(src),
    "Registration must not bypass Registry service via store",
  );
  assertCase(
    `registration.no.load.activate.${rel}`,
    !/\b(loadPlugin|activatePlugin|import\s*\()\b/.test(src),
    "Registration must not load/activate/dynamic-import",
  );
}

assertCase(
  "registration.uses.service",
  readFileSync(
    join(pluginsDir, "registration/register.ts"),
    "utf8",
  ).includes("registryService.registerEntry"),
  "Registration must request via registryService.registerEntry",
);

registryStoreClearForTests();

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-plugins-admission: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-admission: ${results.length} checks PASS`);

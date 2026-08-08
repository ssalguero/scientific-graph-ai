/**
 * PLUGINS-I2 — Registry Infrastructure readiness gate.
 *
 * Authority: PLUGINS-P3 C2 · PLUGINS-P6 I2 · docs/PLUGINS/implementation/PLUGINS-I2-Registry-Infrastructure.md
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_REGISTRY_REEXPORTS,
  PLUGINS_REGISTRY_REQUIRED_DIRS,
  PLUGINS_REGISTRY_REQUIRED_FILES,
} from "../src/plugins/internal/boundary-policy";
import { composePluginsRegistryInfrastructure } from "../src/plugins/registry/wiring/compose-registry";
import { PLUGINS_REGISTRY_FACETS } from "../src/plugins/registry/ownership";

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

for (const rel of PLUGINS_REGISTRY_REQUIRED_DIRS) {
  const full = join(pluginsDir, rel);
  assertCase(
    `registry.dir.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

for (const rel of PLUGINS_REGISTRY_REQUIRED_FILES) {
  const full = join(pluginsDir, rel);
  assertCase(
    `registry.file.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

assertCase(
  "registry.doc",
  existsSync(
    join(
      repoRoot,
      "docs/PLUGINS/implementation/PLUGINS-I2-Registry-Infrastructure.md",
    ),
  ),
  "PLUGINS-I2 implementation record",
);

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";
assertCase(
  "registry.barrel.status",
  /PLUGINS_REGISTRY_PHASE/.test(barrel) &&
    /PLUGINS_REGISTRY_STATUS/.test(barrel),
  "public barrel must export registry status markers",
);
assertCase(
  "registry.barrel.no.compose.leak",
  !/composePluginsRegistryInfrastructure/.test(barrel),
  "public barrel must not export composePluginsRegistryInfrastructure",
);
assertCase(
  "registry.barrel.no.ops",
  !/\b(discoverPlugins|registerPlugin|loadPlugin|activatePlugin)\b/.test(
    barrel,
  ),
  "public barrel must not expose discover/register/load/activate",
);

for (const sym of PLUGINS_ALLOWED_PUBLIC_REGISTRY_REEXPORTS) {
  assertCase(
    `registry.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

const snapshot = composePluginsRegistryInfrastructure();
assertCase(
  "registry.snapshot.phase",
  snapshot.phase === "PLUGINS-I2" &&
    snapshot.status === "REGISTRY_INFRASTRUCTURE_COMPLETE",
  `${snapshot.phase}/${snapshot.status}`,
);
assertCase(
  "registry.snapshot.component",
  snapshot.componentId === "C2_PluginRegistry",
  snapshot.componentId,
);
assertCase(
  "registry.snapshot.ssot",
  snapshot.ownership.pluginRegistrySsot === true &&
    snapshot.state.__ssot === "C2_PluginRegistry",
  "C2 must be registry SSOT",
);
assertCase(
  "registry.snapshot.empty",
  snapshot.state.entryCount === 0 && snapshot.state.entries.length === 0,
  "I2 registry state must remain empty",
);
assertCase(
  "registry.snapshot.acceptance",
  snapshot.discoveryImplemented === false &&
    snapshot.registrationImplemented === false &&
    snapshot.pluginLoadingImplemented === false &&
    snapshot.activationImplemented === false &&
    snapshot.executableRegistryOperations === false &&
    snapshot.runtimeBehavior === false &&
    snapshot.lifecycleImplemented === false &&
    snapshot.capabilitiesImplemented === false,
  "Registry must not discover/load/activate/execute; Registration subsystem is separate",
);
assertCase(
  "registry.snapshot.mutation.boundary",
  snapshot.registrationServiceImplemented === true &&
    snapshot.registryMutationOnlyViaRegistry === true &&
    snapshot.descriptorRegistrableViaService === true &&
    snapshot.registrationService.__ownsRegistryState === true &&
    snapshot.registrationService.__activatesPlugins === false &&
    snapshot.registrationService.__loadsPlugins === false,
  "Registry mutation only via Registration Service; no activate/load",
);
assertCase(
  "registry.i3.files",
  existsSync(join(pluginsDir, "registry/store.ts")) &&
    existsSync(join(pluginsDir, "registry/registration-service.ts")),
  "I3 registry mutation path files present",
);
assertCase(
  "registry.snapshot.not.public.surface",
  snapshot.identity.isPublicExtensibilitySurface === false &&
    snapshot.ownership.isPublicExtensibilitySurface === false,
  "registry must not be a public extensibility surface",
);
assertCase(
  "registry.snapshot.no.ep.ownership",
  snapshot.ownership.ownsExtensionPoints === false &&
    snapshot.identity.ownsExtensionPoints === false,
  "registry must not own extension points",
);

for (const facet of PLUGINS_REGISTRY_FACETS) {
  assertCase(
    `registry.facet.${facet.id}`,
    true,
    `${facet.id} steward=${facet.steward}`,
  );
}

const FORBIDDEN: { id: string; re: RegExp }[] = [
  { id: "discoverPlugins", re: /\bdiscoverPlugins\s*\(/ },
  { id: "registerPlugin", re: /\bregisterPlugin\s*\(/ },
  { id: "loadPlugin", re: /\bloadPlugin\s*\(/ },
  { id: "activatePlugin", re: /\bactivatePlugin\s*\(/ },
  { id: "dynamic-import", re: /\bimport\s*\(\s*[^)]+\s*\)/ },
  { id: "readdir-scan", re: /\breaddirSync\s*\(/ },
];

const registryDir = join(pluginsDir, "registry");
for (const file of collectTsFiles(registryDir)) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    const hit = re.test(src);
    assertCase(
      `registry.no.${id}.${rel}`,
      !hit,
      hit ? `forbidden ${id} in ${rel}` : "clean",
    );
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-plugins-registry: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-registry: ${results.length} checks PASS`);

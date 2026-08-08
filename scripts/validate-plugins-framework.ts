/**
 * PLUGINS-I1 — Extension Framework readiness gate.
 *
 * Authority: PLUGINS-P3 C1 · PLUGINS-P6 I1 · docs/PLUGINS/implementation/PLUGINS-I1-Extension-Framework.md
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_FRAMEWORK_REEXPORTS,
  PLUGINS_FRAMEWORK_REQUIRED_DIRS,
  PLUGINS_FRAMEWORK_REQUIRED_FILES,
} from "../src/plugins/internal/boundary-policy";
import { composePluginsExtensionFramework } from "../src/plugins/framework/wiring/compose-framework";
import { PLUGINS_FRAMEWORK_SERVICE_BOUNDARIES } from "../src/plugins/framework/service-boundaries";

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

for (const rel of PLUGINS_FRAMEWORK_REQUIRED_DIRS) {
  const full = join(pluginsDir, rel);
  assertCase(
    `framework.dir.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

for (const rel of PLUGINS_FRAMEWORK_REQUIRED_FILES) {
  const full = join(pluginsDir, rel);
  assertCase(
    `framework.file.${rel}`,
    existsSync(full),
    existsSync(full) ? "present" : "missing",
  );
}

assertCase(
  "framework.doc",
  existsSync(
    join(repoRoot, "docs/PLUGINS/implementation/PLUGINS-I1-Extension-Framework.md"),
  ),
  "PLUGINS-I1 implementation record",
);

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";
assertCase(
  "framework.barrel.status",
  /PLUGINS_FRAMEWORK_PHASE/.test(barrel) &&
    /PLUGINS_FRAMEWORK_STATUS/.test(barrel),
  "public barrel must export framework status markers",
);
assertCase(
  "framework.barrel.no.compose.leak",
  !/composePluginsExtensionFramework/.test(barrel),
  "public barrel must not export composePluginsExtensionFramework",
);
assertCase(
  "framework.barrel.no.runtime.api",
  !/\b(loadPlugin|registerPlugin|discoverPlugins|activatePlugin)\b/.test(barrel),
  "public barrel must not expose load/register/discover/activate APIs",
);

for (const sym of PLUGINS_ALLOWED_PUBLIC_FRAMEWORK_REEXPORTS) {
  assertCase(
    `framework.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

const snapshot = composePluginsExtensionFramework();
assertCase(
  "framework.snapshot.phase",
  snapshot.phase === "PLUGINS-I1" && snapshot.status === "FRAMEWORK_COMPLETE",
  `${snapshot.phase}/${snapshot.status}`,
);
assertCase(
  "framework.snapshot.component",
  snapshot.componentId === "C1_ExtensionFramework",
  snapshot.componentId,
);
assertCase(
  "framework.snapshot.no.ep.ownership",
  snapshot.ownership.ownsExtensionPoints === false &&
    snapshot.identity.ownsExtensionPoints === false,
  "framework must not own extension points",
);
assertCase(
  "framework.snapshot.acceptance.no.registry",
  snapshot.registryImplemented === false &&
    snapshot.discoveryImplemented === false &&
    snapshot.registrationImplemented === false,
  "I1 must not implement registry/discovery/registration",
);
assertCase(
  "framework.snapshot.acceptance.no.runtime",
  snapshot.runtimeBehavior === false &&
    snapshot.pluginLoadingImplemented === false &&
    snapshot.lifecycleExecutionImplemented === false,
  "I1 must not implement loading/lifecycle/runtime",
);
assertCase(
  "framework.snapshot.descriptor.inert",
  snapshot.extensionDescriptorExecutable === false &&
    snapshot.extensionDescriptorRegistrable === false,
  "extension descriptors must be non-executable and non-registrable in I1",
);

for (const boundary of PLUGINS_FRAMEWORK_SERVICE_BOUNDARIES) {
  assertCase(
    `framework.boundary.deferred.${boundary.id}`,
    boundary.implementedInFramework === false,
    `${boundary.id} deferred to ${boundary.phase}`,
  );
}

const FORBIDDEN: { id: string; re: RegExp }[] = [
  { id: "loadPlugin", re: /\bloadPlugin\s*\(/ },
  { id: "registerPlugin", re: /\bregisterPlugin\s*\(/ },
  { id: "discoverPlugins", re: /\bdiscoverPlugins\s*\(/ },
  { id: "activatePlugin", re: /\bactivatePlugin\s*\(/ },
  { id: "dynamic-import", re: /\bimport\s*\(\s*[^)]+\s*\)/ },
];

const frameworkDir = join(pluginsDir, "framework");
for (const file of collectTsFiles(frameworkDir)) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    const hit = re.test(src);
    assertCase(
      `framework.no.${id}.${rel}`,
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
  console.error(`\nvalidate-plugins-framework: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-framework: ${results.length} checks PASS`);

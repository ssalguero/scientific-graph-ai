/**
 * D52.3 — Dock registration / registry structural gate.
 * Contracts and exports only — no behavioral string-sniffing.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const dockingDir = join(repoRoot, "src/components/docking");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (file: string): string => {
  const full = join(dockingDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const extractTypeBody = (source: string, typeName: string): string => {
  const re = new RegExp(
    `export\\s+type\\s+${typeName}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`
  );
  return source.match(re)?.[1] ?? "";
};

const typesSource = read("types.ts");
const registrySource = read("DockRegistry.ts");
const registrationPath = join(dockingDir, "dockRegistration.ts");
const registrationSource = read("dockRegistration.ts");

assertCase(
  "dock.registration.moduleExists",
  existsSync(registrationPath) && registrationSource.length > 0,
  "dockRegistration.ts"
);

const registrationBody = extractTypeBody(typesSource, "DockRegistrationApi");
assertCase(
  "dock.registration.apiShape",
  /register\s*\(/.test(registrationBody) &&
    /unregister\s*\(/.test(registrationBody) &&
    !/\bget\s*\(/.test(registrationBody) &&
    !/\blist\s*\(/.test(registrationBody) &&
    !/\bhas\s*\(/.test(registrationBody),
  "DockRegistrationApi = register + unregister only"
);

const queryBody = extractTypeBody(typesSource, "DockRegistryQuery");
assertCase(
  "dock.registry.queryShape",
  /get\s*\(/.test(queryBody) &&
    /list\s*\(/.test(queryBody) &&
    /has\s*\(/.test(queryBody) &&
    !/\bregister\s*\(/.test(queryBody) &&
    !/\bunregister\s*\(/.test(queryBody),
  "DockRegistryQuery = get + list + has only"
);

assertCase(
  "dock.registry.seedFrozen",
  /export const DOCK_REGISTRY\s*=\s*Object\.freeze\s*\(/.test(registrySource),
  "DOCK_REGISTRY = Object.freeze(...)"
);

const seedMatch = registrySource.match(
  /export const DOCK_REGISTRY\s*=\s*Object\.freeze\s*\(\s*\{([\s\S]*?)\}\s*\)\s*;/
);
const seedBody = seedMatch?.[1] ?? "";
const seedTopKeys = [...seedBody.matchAll(/^  (\w+)\s*:/gm)].map((m) => m[1]);
assertCase(
  "dock.registry.seedInspectorOnly",
  seedTopKeys.length === 1 && seedTopKeys[0] === "inspector",
  `seed top-level keys=[${seedTopKeys.join(", ")}]`
);

assertCase(
  "dock.registration.separation",
  /export\s+type\s+DockRegistrationApi\s*=/.test(typesSource) &&
    /export\s+type\s+DockRegistryQuery\s*=/.test(typesSource) &&
    registrationBody.length > 0 &&
    queryBody.length > 0 &&
    registrationBody !== queryBody,
  "distinct RegistrationApi vs RegistryQuery types"
);

assertCase(
  "dock.registration.factoryExport",
  /export\s+function\s+createDockRegistrationApi\s*\(/.test(
    registrationSource
  ),
  "createDockRegistrationApi present"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "dock-registration",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — dock-registration"
    : `\nFAIL — dock-registration (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);

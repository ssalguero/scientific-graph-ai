/**
 * D66.8 — Session Persistence · API Freeze gate.
 * Authority: D66.0 Architecture Freeze · D66.1 API Freeze.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const persistenceDir = join(repoRoot, "src/components/session/persistence");
const sessionBarrelPath = join(repoRoot, "src/components/session/index.ts");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readPersistence = (file: string): string => {
  const full = join(persistenceDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const REQUIRED_PERSISTENCE_FILES = [
  "SessionPersistenceTypes.ts",
  "SessionSerializer.ts",
  "SessionDeserializer.ts",
  "SessionStorageAdapter.ts",
  "SessionPersistenceBridge.ts",
  "index.ts",
] as const;

for (const file of REQUIRED_PERSISTENCE_FILES) {
  const exists = existsSync(join(persistenceDir, file));
  assertCase(
    `d66.api.persistence.file.${file}`,
    exists,
    exists ? "exists" : "missing"
  );
}

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const types = readPersistence("SessionPersistenceTypes.ts");
const typesCode = stripComments(types);
const serializer = readPersistence("SessionSerializer.ts");
const deserializer = readPersistence("SessionDeserializer.ts");
const adapter = readPersistence("SessionStorageAdapter.ts");
const bridge = readPersistence("SessionPersistenceBridge.ts");
const barrel = readPersistence("index.ts");
const sessionBarrel = existsSync(sessionBarrelPath)
  ? readFileSync(sessionBarrelPath, "utf8")
  : "";

/* —— Core Freeze surface —— */

assertCase(
  "d66.api.SessionPersistenceRecord",
  /export interface SessionPersistenceRecord\b/.test(types) &&
    /definition\s*:\s*SessionDefinition/.test(types) &&
    /state\s*:\s*SessionState/.test(types),
  "SessionPersistenceRecord = definition + state"
);

assertCase(
  "d66.api.SessionPersistenceRecord.noExtraFields",
  !/\bversion\s*:/.test(typesCode) &&
    !/\bsnapshot\s*:/.test(typesCode) &&
    !/\bchecksum\s*:/.test(typesCode) &&
    !/\bautosave\s*:/.test(typesCode) &&
    !/\brestore\s*:/.test(typesCode),
  "Record Freeze — no version/snapshot/checksum/autosave/restore fields"
);

assertCase(
  "d66.api.SessionStorageAdapter",
  /export interface SessionStorageAdapter\b/.test(types) &&
    /\bsave\s*\(/.test(types) &&
    /\bload\s*\(/.test(types) &&
    /\bclear\s*\(/.test(types),
  "SessionStorageAdapter interface with save/load/clear"
);

assertCase(
  "d66.api.SessionStorageAdapter.onlySaveLoadClear",
  !/\bdelete\s*\(/.test(typesCode) &&
    !/\bupdate\s*\(/.test(typesCode) &&
    !/\bmerge\s*\(/.test(typesCode) &&
    !/\bexists\s*\(/.test(typesCode) &&
    !/\bcount\s*\(/.test(typesCode) &&
    !/\bload\s*\(\s*id\b/.test(typesCode),
  "Adapter API Freeze — no delete/update/merge/exists/count/load(id)"
);

assertCase(
  "d66.api.SessionPersistenceBridge",
  /export interface SessionPersistenceBridge\b/.test(types) &&
    /\bpersistSession\s*\(/.test(types) &&
    /\bpersistRegistry\s*\(/.test(types),
  "SessionPersistenceBridge interface with persistSession/persistRegistry"
);

assertCase(
  "d66.api.SessionPersistenceBridge.onlyPersist",
  !/\brestore\s*\(/.test(typesCode) &&
    !/\bautosave\s*\(/.test(typesCode) &&
    !/\bsnapshot\s*\(/.test(typesCode) &&
    !/\bhistory\s*\(/.test(typesCode) &&
    !/\bsync\s*\(/.test(typesCode),
  "Bridge API Freeze — no restore/autosave/snapshot/history/sync"
);

assertCase(
  "d66.api.serializeSession",
  /export const serializeSession\b/.test(serializer) ||
    /export function serializeSession\s*\(/.test(serializer),
  "serializeSession exported"
);

assertCase(
  "d66.api.serializeRegistry",
  /export function serializeRegistry\s*\(/.test(serializer) ||
    /export const serializeRegistry\b/.test(serializer),
  "serializeRegistry exported"
);

assertCase(
  "d66.api.deserializeSession",
  /export const deserializeSession\b/.test(deserializer) ||
    /export function deserializeSession\s*\(/.test(deserializer),
  "deserializeSession exported"
);

assertCase(
  "d66.api.deserializeRegistry",
  /export const deserializeRegistry\b/.test(deserializer) ||
    /export function deserializeRegistry\s*\(/.test(deserializer),
  "deserializeRegistry exported"
);

assertCase(
  "d66.api.createSessionStorageAdapter",
  /export function createSessionStorageAdapter\s*\(/.test(adapter),
  "createSessionStorageAdapter factory"
);

assertCase(
  "d66.api.createSessionPersistenceBridge",
  /export function createSessionPersistenceBridge\s*\(/.test(bridge),
  "createSessionPersistenceBridge factory"
);

/* —— Implementation surfaces match Freeze —— */

assertCase(
  "d66.api.adapterImpl.saveLoadClear",
  /\basync save\s*\(/.test(adapter) &&
    /\basync load\s*\(/.test(adapter) &&
    /\basync clear\s*\(/.test(adapter),
  "Adapter impl exposes save/load/clear"
);

assertCase(
  "d66.api.bridgeImpl.persistOnly",
  /\bpersistSession\s*\(/.test(bridge) &&
    /\bpersistRegistry\s*\(/.test(bridge) &&
    !/\brestore\s*\(/.test(bridge) &&
    !/\bautosave\s*\(/.test(bridge),
  "Bridge impl exposes only persistSession/persistRegistry"
);

/* —— Public barrel allowlist —— */

const REQUIRED_BARREL_EXPORTS = [
  "SessionPersistenceRecord",
  "SessionStorageAdapter",
  "SessionPersistenceBridge",
  "createSessionStorageAdapter",
  "createSessionPersistenceBridge",
  "serializeSession",
  "serializeRegistry",
  "deserializeSession",
  "deserializeRegistry",
] as const;

const missingExports = REQUIRED_BARREL_EXPORTS.filter(
  (name) => !new RegExp(`\\b${name}\\b`).test(barrel)
);

assertCase(
  "d66.api.persistenceBarrelExports",
  missingExports.length === 0,
  missingExports.length
    ? `missing: ${missingExports.join(",")}`
    : "persistence/index.ts exports Freeze surface"
);

const ALLOWED_BARREL_SYMBOLS = new Set<string>([
  ...REQUIRED_BARREL_EXPORTS,
  "SerializeSession",
  "SerializeRegistry",
  "DeserializeSession",
  "DeserializeRegistry",
]);

const exportedSymbols = new Set<string>();
for (const line of barrel.split("\n")) {
  if (!/^\s*export\s/.test(line)) {
    continue;
  }
  const typeBlock = line.match(/export\s+type\s*\{([^}]+)\}/);
  if (typeBlock) {
    for (const part of typeBlock[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name) {
        exportedSymbols.add(name);
      }
    }
    continue;
  }
  const valueBlock = line.match(/export\s*\{([^}]+)\}/);
  if (valueBlock) {
    for (const part of valueBlock[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name) {
        exportedSymbols.add(name);
      }
    }
    continue;
  }
  const named =
    line.match(/export\s+(?:async\s+)?function\s+(\w+)/) ||
    line.match(/export\s+const\s+(\w+)/) ||
    line.match(/export\s+type\s+(\w+)/) ||
    line.match(/export\s+interface\s+(\w+)/);
  if (named) {
    exportedSymbols.add(named[1]);
  }
}

const unexpected = [...exportedSymbols].filter(
  (name) => !ALLOWED_BARREL_SYMBOLS.has(name)
);

assertCase(
  "d66.api.noUnexpectedBarrelExports",
  unexpected.length === 0,
  unexpected.length
    ? `unexpected: ${unexpected.join(",")}`
    : "persistence barrel exports match allowlist"
);

assertCase(
  "d66.api.sessionBarrel.noPersistenceReexport",
  !/\bSessionPersistenceRecord\b/.test(sessionBarrel) &&
    !/\bcreateSessionStorageAdapter\b/.test(sessionBarrel) &&
    !/\bcreateSessionPersistenceBridge\b/.test(sessionBarrel) &&
    !/from\s+["']\.\/persistence/.test(sessionBarrel),
  "session/index.ts does not re-export persistence"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "session-persistence",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — session-persistence"
    : `\nFAIL — session-persistence (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);

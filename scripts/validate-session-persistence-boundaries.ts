/**
 * D66.8 — Session Persistence · boundaries / isolation gate.
 * Authority: D66.0 Hard Rules · HR-adapter-sole-io · HR-bridge-idb-agnostic ·
 * HR-context-no-persistence · HR-deserialize-no-register · HR-persistence-import-isolation.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const persistenceDir = join(repoRoot, "src/components/session/persistence");
const sessionDir = join(repoRoot, "src/components/session");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const readFile = (full: string): string =>
  existsSync(full) ? readFileSync(full, "utf8") : "";

const listTs = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
    : [];

assertCase(
  "d66.bound.persistenceDirExists",
  existsSync(persistenceDir),
  existsSync(persistenceDir) ? "persistence/ exists" : "persistence/ missing"
);

const persistenceFiles = listTs(persistenceDir);
const persistenceSources = persistenceFiles.map((file) => ({
  file,
  raw: readFile(join(persistenceDir, file)),
  code: stripComments(readFile(join(persistenceDir, file))),
}));

const byFile = (name: string) =>
  persistenceSources.find((s) => s.file === name) ?? {
    file: name,
    raw: "",
    code: "",
  };

const types = byFile("SessionPersistenceTypes.ts");
const serializer = byFile("SessionSerializer.ts");
const deserializer = byFile("SessionDeserializer.ts");
const adapter = byFile("SessionStorageAdapter.ts");
const bridge = byFile("SessionPersistenceBridge.ts");
const barrel = byFile("index.ts");

const contextRaw = readFile(join(sessionDir, "SessionContext.tsx"));
const contextCode = stripComments(contextRaw);
const registryRaw = readFile(join(sessionDir, "SessionRegistry.ts"));
const registryCode = stripComments(registryRaw);
const providerRaw = readFile(join(sessionDir, "SessionProvider.tsx"));
const providerCode = stripComments(providerRaw);

/* —— IndexedDB sole owner = Adapter —— */

const idbFiles = persistenceSources.filter(
  (s) =>
    /\bindexedDB\b/i.test(s.code) ||
    /\bIDBFactory\b/.test(s.code) ||
    /\bIDBDatabase\b/.test(s.code) ||
    /\bIDBObjectStore\b/.test(s.code)
);

assertCase(
  "d66.bound.indexedDb.onlyAdapter",
  idbFiles.length === 1 && idbFiles[0]?.file === "SessionStorageAdapter.ts",
  idbFiles.length === 0
    ? "IndexedDB missing from Adapter"
    : idbFiles.length === 1 && idbFiles[0]?.file === "SessionStorageAdapter.ts"
      ? "IndexedDB only in SessionStorageAdapter.ts"
      : `IndexedDB in: ${idbFiles.map((f) => f.file).join(",")}`
);

assertCase(
  "d66.bound.types.noIndexedDb",
  !/\bindexedDB\b/i.test(types.code) && !/\bIDBDatabase\b/.test(types.code),
  "SessionPersistenceTypes — no IndexedDB"
);

assertCase(
  "d66.bound.serializer.noIndexedDb",
  !/\bindexedDB\b/i.test(serializer.code),
  "Serializer — no IndexedDB"
);

assertCase(
  "d66.bound.deserializer.noIndexedDb",
  !/\bindexedDB\b/i.test(deserializer.code),
  "Deserializer — no IndexedDB"
);

assertCase(
  "d66.bound.bridge.noIndexedDb",
  !/\bindexedDB\b/i.test(bridge.code) &&
    !/\bIDBDatabase\b/.test(bridge.code) &&
    !/\bobjectStore\b/i.test(bridge.code) &&
    !/\bkeyPath\b/.test(bridge.code) &&
    !/ScientificGraphAI/.test(bridge.code),
  "Bridge — agnostic of IndexedDB / store / keyPath / DB name"
);

assertCase(
  "d66.bound.barrel.noIndexedDb",
  !/\bindexedDB\b/i.test(barrel.code),
  "persistence barrel — no IndexedDB"
);

/* —— No React in pure persistence modules —— */

const noReact = (raw: string, code: string) =>
  !/\bfrom\s+["']react["']/.test(raw) &&
  !/\bfrom\s+["']react\//.test(raw) &&
  !/\bReactNode\b/.test(code) &&
  !/\bJSX\b/.test(code) &&
  !/\buse(State|Effect|Ref|Memo|Callback|Context)\s*\(/.test(code);

assertCase(
  "d66.bound.serializer.noReact",
  noReact(serializer.raw, serializer.code),
  "Serializer — no React"
);

assertCase(
  "d66.bound.deserializer.noReact",
  noReact(deserializer.raw, deserializer.code),
  "Deserializer — no React"
);

assertCase(
  "d66.bound.bridge.noReact",
  noReact(bridge.raw, bridge.code),
  "Bridge — no React"
);

assertCase(
  "d66.bound.adapter.noReact",
  noReact(adapter.raw, adapter.code),
  "Adapter — no React"
);

assertCase(
  "d66.bound.types.noReact",
  noReact(types.raw, types.code),
  "Types — no React"
);

/* —— Import isolation —— */

const allPersistenceRaw = persistenceSources.map((s) => s.raw).join("\n");
const BANNED_IMPORT_SEGMENTS = [
  "windows/",
  "layout/",
  "toolbar/",
  "content/",
  "tabs/",
  "series/",
] as const;

const bannedHits = BANNED_IMPORT_SEGMENTS.filter((seg) => {
  const escaped = seg.replace("/", "\\/");
  return new RegExp(
    `from\\s+["'][^"']*${escaped}[^"']*["']`
  ).test(allPersistenceRaw);
});

assertCase(
  "d66.bound.importIsolation",
  bannedHits.length === 0,
  bannedHits.length
    ? `banned imports: ${bannedHits.join(",")}`
    : "persistence/* — no windows/layout/toolbar/content/tabs/series imports"
);

/* —— Context / Registry / Provider boundaries —— */

assertCase(
  "d66.bound.context.noPersistence",
  !/\bSessionPersistence\b/.test(contextCode) &&
    !/\bpersistSession\b/.test(contextCode) &&
    !/\bpersistRegistry\b/.test(contextCode) &&
    !/\bSessionStorageAdapter\b/.test(contextCode) &&
    !/\bcreateSessionStorageAdapter\b/.test(contextCode) &&
    !/\bcreateSessionPersistenceBridge\b/.test(contextCode) &&
    !/from\s+["'][^"']*persistence[^"']*["']/.test(contextRaw),
  "SessionContext does not expose Persistence"
);

assertCase(
  "d66.bound.registry.noPersistence",
  !/\bindexedDB\b/i.test(registryCode) &&
    !/\bSessionPersistence\b/.test(registryCode) &&
    !/\bpersistSession\b/.test(registryCode) &&
    !/\bcreateSessionStorageAdapter\b/.test(registryCode) &&
    !/from\s+["'][^"']*persistence[^"']*["']/.test(registryRaw),
  "SessionRegistry does not know Persistence"
);

assertCase(
  "d66.bound.provider.barrelOnlyPersistence",
  /from\s+["']@\/components\/session\/persistence["']/.test(providerRaw) &&
    !/from\s+["']@\/components\/session\/persistence\//.test(providerRaw),
  "SessionProvider imports persistence barrel only"
);

assertCase(
  "d66.bound.provider.noAutoPersistIo",
  !/\.persistSession\s*\(/.test(providerCode) &&
    !/\.persistRegistry\s*\(/.test(providerCode) &&
    !/\.save\s*\(/.test(providerCode) &&
    !/\.load\s*\(/.test(providerCode) &&
    !/\.clear\s*\(/.test(providerCode),
  "SessionProvider — wiring only (no persist/save/load/clear calls)"
);

/* —— Deserializer no register —— */

assertCase(
  "d66.bound.deserializer.noRegister",
  !/\b\.register\s*\(/.test(deserializer.code) &&
    !/\bregister\s*\(/.test(deserializer.code) &&
    !/from\s+["'][^"']*SessionRegistry[^"']*["']/.test(deserializer.raw) &&
    !/from\s+["']\.\/SessionRegistry["']/.test(deserializer.raw) &&
    !/from\s+["']\.\.\/SessionRegistry["']/.test(deserializer.raw),
  "deserializeRegistry — no register / no SessionRegistry import"
);

assertCase(
  "d66.bound.bridge.noLoadClear",
  !/\.load\s*\(/.test(bridge.code) && !/\.clear\s*\(/.test(bridge.code),
  "Bridge — write-only (no adapter.load / adapter.clear)"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "session-persistence-boundaries",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — session-persistence-boundaries"
    : `\nFAIL — session-persistence-boundaries (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);

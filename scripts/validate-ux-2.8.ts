/**
 * UX-2.8 — Panel Persistence Foundation gate.
 * localStorage UX persistence via persistence/; Provider wiring only.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const panelsDir = join(workspaceDir, "panels");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const packagePath = join(repoRoot, "package.json");
const packageLockPath = join(repoRoot, "package-lock.json");

const PERSISTENCE_FILES = [
  "PanelStorage.ts",
  "PanelSerializer.ts",
  "PanelDeserializer.ts",
  "PanelPersistence.ts",
  "index.ts",
] as const;

const FROZEN_UI_FILES = [
  "WorkspaceContent.tsx",
  "WorkspaceBodyLayout.tsx",
  "Panel.tsx",
  "LeftPanel.tsx",
  "RightPanel.tsx",
  "BottomPanel.tsx",
  "content/ExplorerContent.tsx",
  "content/InspectorContent.tsx",
  "content/ConsoleContent.tsx",
] as const;

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const collectTsSources = (dir: string): string[] => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectTsSources(full));
      continue;
    }
    if (/\.(tsx?|mts|cts)$/.test(name)) {
      out.push(read(full));
    }
  }
  return out;
};

const persistencePresent = existsSync(persistenceDir)
  ? readdirSync(persistenceDir).filter((name) => !name.startsWith("."))
  : [];
const persistenceSet = new Set(persistencePresent);

const storageSource = read(join(persistenceDir, "PanelStorage.ts"));
const serializerSource = read(join(persistenceDir, "PanelSerializer.ts"));
const deserializerSource = read(join(persistenceDir, "PanelDeserializer.ts"));
const persistenceSource = read(join(persistenceDir, "PanelPersistence.ts"));
const barrelSource = read(join(persistenceDir, "index.ts"));
const providerSource = read(join(stateDir, "PanelProvider.tsx"));
const panelStateSource = read(join(stateDir, "PanelState.ts"));
const allPersistenceSources = collectTsSources(persistenceDir).join("\n");
const allPanelsSources = collectTsSources(panelsDir).join("\n");
const pkg = read(packagePath);

/* -------------------------------------------------------------------------- */
/* A. Files                                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux28.persistence.dir.exists",
  existsSync(persistenceDir) && statSync(persistenceDir).isDirectory(),
  persistenceDir
);

for (const file of PERSISTENCE_FILES) {
  assertCase(
    `ux28.file.${file}`,
    persistenceSet.has(file),
    join(persistenceDir, file)
  );
}

/* -------------------------------------------------------------------------- */
/* B. Barrel + frozen API                                                     */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux28.barrel.exports",
  /serialize/.test(barrelSource) &&
    /deserialize/.test(barrelSource) &&
    /toJSON/.test(barrelSource) &&
    /fromJSON/.test(barrelSource) &&
    /\bload\b/.test(barrelSource) &&
    /\bsave\b/.test(barrelSource) &&
    /PANEL_STORAGE_KEY/.test(barrelSource),
  "persistence/index.ts exports frozen API"
);

assertCase(
  "ux28.api.serialize",
  /export\s+function\s+serialize\b/.test(serializerSource),
  "serialize() exists"
);

assertCase(
  "ux28.api.deserialize",
  /export\s+function\s+deserialize\b/.test(deserializerSource),
  "deserialize() exists"
);

assertCase(
  "ux28.api.toJSON",
  /export\s+function\s+toJSON\b/.test(serializerSource),
  "toJSON() exists"
);

assertCase(
  "ux28.api.fromJSON",
  /export\s+function\s+fromJSON\b/.test(deserializerSource),
  "fromJSON() exists"
);

/* -------------------------------------------------------------------------- */
/* C. Persistence wiring                                                      */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux28.persistence.save.toJSON",
  /toJSON\s*\(/.test(persistenceSource) &&
    /save\s*\(/.test(persistenceSource) &&
    /PanelStorage/.test(persistenceSource),
  "save() → toJSON() → PanelStorage"
);

assertCase(
  "ux28.persistence.load.fromJSON",
  /fromJSON\s*\(/.test(persistenceSource) &&
    /load\s*\(/.test(persistenceSource) &&
    /PanelStorage/.test(persistenceSource),
  "load() → PanelStorage → fromJSON()"
);

assertCase(
  "ux28.persistence.noDirectSerialize",
  !/\bserialize\s*\(/.test(persistenceSource) &&
    !/\bparse\s*\(/.test(persistenceSource) &&
    !/\bvalidate\s*\(/.test(persistenceSource) &&
    !/\btoPanelState\s*\(/.test(persistenceSource),
  "PanelPersistence stays thin (toJSON/fromJSON only)"
);

/* -------------------------------------------------------------------------- */
/* D. Storage key + SSR guard                                                 */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux28.storage.key",
  /scientific-graph-ai\.panels/.test(storageSource) &&
    /PANEL_STORAGE_KEY/.test(storageSource),
  "storage key scientific-graph-ai.panels"
);

assertCase(
  "ux28.storage.ssrGuard",
  /typeof\s+window\s*===\s*["']undefined["']/.test(storageSource) ||
    /typeof\s+window\s*!==\s*["']undefined["']/.test(storageSource),
  "typeof window SSR guard"
);

assertCase(
  "ux28.storage.tryCatch",
  /try\s*\{/.test(storageSource) && /catch\s*(\(|\{)/.test(storageSource),
  "storage try/catch"
);

assertCase(
  "ux28.storage.noJsonLogic",
  !/\bJSON\.(parse|stringify)\b/.test(storageSource),
  "PanelStorage has no JSON logic"
);

/* -------------------------------------------------------------------------- */
/* E. Schema version + dual clamp                                             */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux28.version.one",
  (/version:\s*1/.test(serializerSource) ||
    /version\s*===\s*1/.test(deserializerSource)) &&
    /version\s*!==\s*1|version\s*===\s*1|version:\s*1/.test(
      allPersistenceSources
    ),
  "version === 1"
);

assertCase(
  "ux28.dualClamp.serialize",
  /Math\.max\s*\(\s*PANEL_MIN_SIZE/.test(serializerSource) ||
    (/Math\.max\s*\(\s*180\s*,/.test(serializerSource) &&
      /PANEL_MIN_SIZE/.test(serializerSource)),
  "serialize clamps with PANEL_MIN_SIZE"
);

assertCase(
  "ux28.dualClamp.toPanelState",
  (/function\s+toPanelState|export\s+function\s+toPanelState/.test(
    deserializerSource
  ) &&
    /Math\.max\s*\(\s*PANEL_MIN_SIZE/.test(deserializerSource)) ||
    /Math\.max\s*\(\s*180\s*,/.test(deserializerSource),
  "toPanelState clamps with PANEL_MIN_SIZE"
);

assertCase(
  "ux28.visible.alwaysTrue",
  /visible:\s*true/.test(serializerSource),
  "visible always serialized as true"
);

assertCase(
  "ux28.panelState.unchangedFlat",
  /leftCollapsed:\s*boolean/.test(panelStateSource) &&
    /leftWidth:\s*number/.test(panelStateSource) &&
    !/\bvisible\b/.test(panelStateSource) &&
    !/\bactivePanel\b/.test(panelStateSource),
  "PanelState remains flat UX-2.7 shape"
);

/* -------------------------------------------------------------------------- */
/* F. Provider wiring                                                         */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux28.provider.importsPersistence",
  /from\s+["'][^"']*persistence[^"']*["']/.test(providerSource),
  "PanelProvider imports persistence"
);

assertCase(
  "ux28.provider.hydration",
  /\bhydrated\b/.test(providerSource) && /\buseEffect\b/.test(providerSource),
  "hydration guard + useEffect"
);

assertCase(
  "ux28.provider.loadSave",
  /\bload\s*\(/.test(providerSource) && /\bsave\s*\(/.test(providerSource),
  "Provider calls load() / save()"
);

assertCase(
  "ux28.provider.noDirectLocalStorage",
  !/\blocalStorage\b/.test(providerSource) &&
    !/\bindexedDB\b/i.test(providerSource),
  "Provider has no direct localStorage/indexedDB"
);

assertCase(
  "ux28.provider.noDebounce",
  !/\bdebounce\b/i.test(providerSource) &&
    !/\bsetTimeout\b/.test(providerSource) &&
    !/\bdirty\b/i.test(providerSource),
  "no debounce / dirty / scheduler in Provider"
);

/* -------------------------------------------------------------------------- */
/* G. No IndexedDB / no new deps / frozen UI                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux28.no.indexedDB",
  !/\bwindow\.indexedDB\b/.test(allPanelsSources) &&
    !/\bindexedDB\.open\b/.test(allPanelsSources) &&
    !/\bIDBDatabase\b/.test(allPanelsSources) &&
    !/\bIDBObjectStore\b/.test(allPanelsSources),
  "no IndexedDB APIs under panels/"
);

assertCase(
  "ux28.noNewDependencies",
  !/"dependencies"\s*:\s*\{[^}]*"idb"/.test(pkg) &&
    !/"dependencies"\s*:\s*\{[^}]*"localforage"/.test(pkg) &&
    !/"dependencies"\s*:\s*\{[^}]*"dexie"/.test(pkg),
  "no new persistence libraries in package.json"
);

for (const rel of FROZEN_UI_FILES) {
  const path =
    rel === "WorkspaceContent.tsx"
      ? join(workspaceDir, rel)
      : join(panelsDir, rel);
  const source = read(path);
  assertCase(
    `ux28.frozen.${rel.replace(/[\\/]/g, ".")}`,
    existsSync(path) && !/persistence/i.test(source),
    `${rel} does not import persistence`
  );
}

const stateExceptProvider = [
  read(join(stateDir, "PanelState.ts")),
  read(join(stateDir, "PanelContext.tsx")),
  read(join(stateDir, "usePanelState.ts")),
  read(join(stateDir, "index.ts")),
].join("\n");

assertCase(
  "ux28.provider.onlyIntegrationPoint",
  !/from\s+["'][^"']*persistence[^"']*["']/.test(stateExceptProvider) &&
    /from\s+["'][^"']*persistence[^"']*["']/.test(providerSource),
  "PanelProvider is sole persistence integration in state/"
);

assertCase(
  "ux28.package.script",
  /"validate:ux-2\.8"\s*:/.test(pkg),
  "validate:ux-2.8 in package.json"
);

/* package-lock unchanged requirement soft-check: file exists */
assertCase(
  "ux28.packageLock.exists",
  existsSync(packageLockPath),
  "package-lock.json present (no new install expected)"
);

/* -------------------------------------------------------------------------- */
/* H. Delegates                                                               */
/* -------------------------------------------------------------------------- */

const runNpm = (script: string): { ok: boolean; detail: string } => {
  const r = spawnSync("npm", ["run", script], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`.trim();
  return {
    ok: r.status === 0,
    detail: r.status === 0 ? "PASS" : out.slice(-800),
  };
};

/** UX-2.11 — Parent suites set UX_SKIP_DELEGATES=1 to avoid nested npm/tsc fan-out. */
const skipDelegates = process.env.UX_SKIP_DELEGATES === "1";

if (!skipDelegates) {
  const ux27 = runNpm("validate:ux-2.7");
  assertCase("ux28.delegate.ux-2.7", ux27.ok, ux27.detail);

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux28.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-800)
  );
} else {
  assertCase("ux28.delegate.skipped", true, "UX_SKIP_DELEGATES=1 (leaf)");
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.8-panel-persistence",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.8-panel-persistence"
    : `\nFAIL — ux-2.8-panel-persistence (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);

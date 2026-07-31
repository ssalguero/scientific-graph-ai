/**
 * UX-3.9 — Theme Runtime Observers Foundation gate.
 *
 * Blocks (10):
 * Layout — interface · registry · notifier
 * Behavior — notifyOnChangeOnly
 * Purity — noReact · apiFreeze · noCycles
 * Gates — buildOk · typecheckOk
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  RuntimeNotifier,
  RuntimeObserverRegistry,
  type RuntimeObserver,
} from "../src/ui/theme/runtime/observer";

type BlockId =
  | "observerLayout"
  | "observerInterface"
  | "registrySet"
  | "notifierFingerprint"
  | "notifyOnChangeOnly"
  | "noReact"
  | "apiFreeze"
  | "noCycles"
  | "buildOk"
  | "typecheckOk";

type CaseResult = { block: BlockId; id: string; pass: boolean; detail: string };

const results: CaseResult[] = [];

function assertCase(
  block: BlockId,
  id: string,
  pass: boolean,
  detail: string,
): void {
  results.push({ block, id, pass, detail });
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const OBSERVER_DIR = "src/ui/theme/runtime/observer";
const DEVTOOLS_DIR = "src/ui/theme/runtime/devtools";
const CONTEXT_DIR = "src/ui/theme/runtime/context";

const REQUIRED_FILES = [
  "RuntimeObserver.ts",
  "RuntimeObserverRegistry.ts",
  "RuntimeNotifier.ts",
  "index.ts",
] as const;

function readObserverSources(): string {
  return REQUIRED_FILES.map((f) => read(`${OBSERVER_DIR}/${f}`)).join("\n");
}

function collectImports(src: string): string[] {
  return [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]!);
}

/* -------------------------------------------------------------------------- */
/* 1. observerLayout                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "observerLayout";

  assertCase(
    block,
    "layout.dir.exists",
    existsSync(join(repoRoot, OBSERVER_DIR)),
    OBSERVER_DIR,
  );

  for (const file of REQUIRED_FILES) {
    const rel = `${OBSERVER_DIR}/${file}`;
    assertCase(block, `layout.file.${file}`, existsSync(join(repoRoot, rel)), rel);
  }

  const privateBarrel = read(`${OBSERVER_DIR}/index.ts`);
  assertCase(
    block,
    "layout.privateReexports",
    /\bRuntimeObserver\b/.test(privateBarrel) &&
      /\bRuntimeObserverRegistry\b/.test(privateBarrel) &&
      /\bRuntimeNotifier\b/.test(privateBarrel),
    "private observer barrel reexports directory",
  );

  assertCase(
    block,
    "layout.privacyComment",
    /Not re-exported/.test(privateBarrel),
    "private barrel documents non-export privacy",
  );

  const registrySrc = read(`${OBSERVER_DIR}/RuntimeObserverRegistry.ts`);
  const notifierSrc = read(`${OBSERVER_DIR}/RuntimeNotifier.ts`);
  assertCase(
    block,
    "layout.registryFrozen",
    /export const RuntimeObserverRegistry\s*=\s*Object\.freeze\s*\(/.test(
      registrySrc,
    ),
    "RuntimeObserverRegistry uses Object.freeze",
  );
  assertCase(
    block,
    "layout.notifierFrozen",
    /export const RuntimeNotifier\s*=\s*Object\.freeze\s*\(/.test(notifierSrc),
    "RuntimeNotifier uses Object.freeze",
  );
}

/* -------------------------------------------------------------------------- */
/* 2. observerInterface                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "observerInterface";
  const src = stripComments(read(`${OBSERVER_DIR}/RuntimeObserver.ts`));

  assertCase(
    block,
    "interface.exists",
    /export\s+interface\s+RuntimeObserver\s*\{/.test(src),
    "RuntimeObserver interface exported",
  );

  assertCase(
    block,
    "interface.onRuntimeChanged",
    /onRuntimeChanged\s*\(\s*\)\s*:\s*void/.test(src),
    "onRuntimeChanged(): void present",
  );

  const body = src.match(
    /export\s+interface\s+RuntimeObserver\s*\{([^}]*)\}/,
  )?.[1];
  const members = (body ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  assertCase(
    block,
    "interface.onlyMember",
    members.length === 1 && /onRuntimeChanged/.test(members[0] ?? ""),
    `members=${members.join("|") || "(none)"}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 3. registrySet                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registrySet";
  const src = stripComments(read(`${OBSERVER_DIR}/RuntimeObserverRegistry.ts`));

  assertCase(
    block,
    "registry.usesSet",
    /new\s+Set\s*<\s*RuntimeObserver\s*>/.test(src) ||
      /Set\s*<\s*RuntimeObserver\s*>/.test(src),
    "Registry uses Set<RuntimeObserver>",
  );

  assertCase(
    block,
    "registry.api",
    /\bregister\b/.test(src) &&
      /\bunregister\b/.test(src) &&
      /\bnotify\b/.test(src) &&
      /\bsize\b/.test(src),
    "register/unregister/notify/size present",
  );

  assertCase(
    block,
    "registry.tryCatch",
    /try\s*\{[\s\S]*onRuntimeChanged[\s\S]*\}\s*catch/.test(src),
    "notify wraps onRuntimeChanged in try/catch",
  );

  const before = RuntimeObserverRegistry.size();
  const observer: RuntimeObserver = { onRuntimeChanged() {} };
  RuntimeObserverRegistry.register(observer);
  assertCase(
    block,
    "registry.registerSize",
    RuntimeObserverRegistry.size() === before + 1,
    `size after register=${RuntimeObserverRegistry.size()}`,
  );
  RuntimeObserverRegistry.unregister(observer);
  assertCase(
    block,
    "registry.unregisterSize",
    RuntimeObserverRegistry.size() === before,
    `size after unregister=${RuntimeObserverRegistry.size()}`,
  );

  assertCase(
    block,
    "registry.frozen",
    Object.isFrozen(RuntimeObserverRegistry),
    "RuntimeObserverRegistry is frozen",
  );
}

/* -------------------------------------------------------------------------- */
/* 4. notifierFingerprint                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "notifierFingerprint";
  const src = stripComments(read(`${OBSERVER_DIR}/RuntimeNotifier.ts`));

  assertCase(
    block,
    "notifier.compare",
    /previousFingerprint\s*===\s*nextFingerprint/.test(src) ||
      /nextFingerprint\s*===\s*previousFingerprint/.test(src),
    "Notifier compares fingerprints with ===",
  );

  assertCase(
    block,
    "notifier.callsNotify",
    /RuntimeObserverRegistry\.notify\s*\(/.test(src),
    "Notifier calls RuntimeObserverRegistry.notify()",
  );

  assertCase(
    block,
    "notifier.noRuntimeStore",
    !/\bThemeRuntime\b/.test(src) && !/\bRuntimeSnapshot\b/.test(src),
    "Notifier stores neither Runtime nor Snapshot",
  );

  assertCase(
    block,
    "notifier.noCache",
    !/\bWeakMap\b/.test(src) &&
      !/\bnew\s+Map\b/.test(src) &&
      !/\bnew\s+Set\b/.test(src) &&
      !/\buseRef\b/.test(src),
    "Notifier has no WeakMap/Map/Set/ref cache",
  );

  assertCase(
    block,
    "notifier.frozen",
    Object.isFrozen(RuntimeNotifier),
    "RuntimeNotifier is frozen",
  );

  assertCase(
    block,
    "notifier.api",
    typeof RuntimeNotifier.notifyIfChanged === "function",
    "notifyIfChanged is a function",
  );
}

/* -------------------------------------------------------------------------- */
/* 5. notifyOnChangeOnly                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "notifyOnChangeOnly";

  let calls = 0;
  const observer: RuntimeObserver = {
    onRuntimeChanged() {
      calls++;
    },
  };

  RuntimeObserverRegistry.register(observer);

  RuntimeNotifier.notifyIfChanged("A", "A");
  assertCase(block, "behavior.sameFp", calls === 0, `calls=${calls} after A→A`);

  RuntimeNotifier.notifyIfChanged("A", "B");
  assertCase(
    block,
    "behavior.firstChange",
    calls === 1,
    `calls=${calls} after A→B`,
  );

  RuntimeNotifier.notifyIfChanged("B", "C");
  assertCase(
    block,
    "behavior.secondChange",
    calls === 2,
    `calls=${calls} after B→C`,
  );

  RuntimeObserverRegistry.unregister(observer);

  let firstCalls = 0;
  const firstObserver: RuntimeObserver = {
    onRuntimeChanged() {
      firstCalls++;
    },
  };
  RuntimeObserverRegistry.register(firstObserver);
  RuntimeNotifier.notifyIfChanged(undefined, "X");
  assertCase(
    block,
    "behavior.firstRender",
    firstCalls === 1,
    `calls=${firstCalls} after undefined→X`,
  );
  RuntimeObserverRegistry.unregister(firstObserver);

  let goodCalls = 0;
  let badCalls = 0;
  const bad: RuntimeObserver = {
    onRuntimeChanged() {
      badCalls++;
      throw new Error("broken");
    },
  };
  const good: RuntimeObserver = {
    onRuntimeChanged() {
      goodCalls++;
    },
  };
  RuntimeObserverRegistry.register(bad);
  RuntimeObserverRegistry.register(good);
  RuntimeNotifier.notifyIfChanged("X", "Y");
  assertCase(
    block,
    "behavior.errorTolerant",
    badCalls === 1 && goodCalls === 1,
    `bad=${badCalls} good=${goodCalls}`,
  );
  RuntimeObserverRegistry.unregister(bad);
  RuntimeObserverRegistry.unregister(good);
}

/* -------------------------------------------------------------------------- */
/* 6. noReact                                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReact";
  const code = stripComments(readObserverSources());

  assertCase(
    block,
    "react.noImport",
    !/\bfrom\s+["']react["']/.test(code) &&
      !/\bfrom\s+["']react\//.test(code) &&
      !/\brequire\s*\(\s*["']react["']/.test(code) &&
      !/\bReact\b/.test(code),
    "observer/ has no React imports / React identifier",
  );

  assertCase(
    block,
    "react.noHooks",
    !/\buseMemo\b/.test(code) &&
      !/\buseRef\b/.test(code) &&
      !/\buseEffect\b/.test(code) &&
      !/\buseState\b/.test(code),
    "observer/ bans useMemo/useRef/useEffect/useState",
  );

  assertCase(
    block,
    "react.noContext",
    !/\bContext\b/.test(code) &&
      !/\bcreateContext\b/.test(code) &&
      !/\buseContext\b/.test(code),
    "observer/ bans Context",
  );

  assertCase(
    block,
    "react.noEventEmitter",
    !/\bEventEmitter\b/.test(code),
    "observer/ bans EventEmitter",
  );

  const observerFiles = readdirSync(join(repoRoot, OBSERVER_DIR));
  assertCase(
    block,
    "react.noJsx",
    observerFiles.every((f) => !f.endsWith(".tsx")) &&
      !/\bReact\.createElement\b/.test(code) &&
      !/\bjsx\b/i.test(code),
    "observer/ has no tsx / JSX runtime",
  );

  assertCase(
    block,
    "react.noDomTimers",
    !/\bdocument\b/.test(code) &&
      !/\bwindow\b/.test(code) &&
      !/\bsetTimeout\b/.test(code) &&
      !/\bsetInterval\b/.test(code),
    "observer/ bans DOM / timers",
  );
}

/* -------------------------------------------------------------------------- */
/* 7. apiFreeze                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  const forbidden = [
    "RuntimeObserver",
    "RuntimeObserverRegistry",
    "RuntimeNotifier",
    "observer",
    "RuntimeSnapshot",
    "SnapshotCompareResult",
    "SnapshotBuilder",
    "SnapshotComparator",
    "compareSnapshots",
    "RuntimeInspector",
    "devtools",
  ];

  const barrels: Array<[string, string]> = [
    ["src/ui/index.ts", "ui"],
    ["src/ui/theme/index.ts", "theme"],
    ["src/ui/theme/runtime/index.ts", "runtime"],
    ["src/ui/theme/hooks/index.ts", "hooks"],
    ["src/ui/providers/index.ts", "providers"],
  ];

  for (const [rel, id] of barrels) {
    const code = stripComments(read(rel));
    const hit = forbidden.find((sym) => new RegExp(`\\b${sym}\\b`).test(code));
    assertCase(
      block,
      `freeze.${id}.clean`,
      hit === undefined,
      hit ? `${rel} leaks ${hit}` : `${rel} has no UX-3.8/3.9 exports`,
    );
  }

  const runtimeBarrel = stripComments(read("src/ui/theme/runtime/index.ts"));
  assertCase(
    block,
    "freeze.runtimeNoObserver",
    !/\bobserver\b/.test(runtimeBarrel) &&
      !/\bdevtools\b/.test(runtimeBarrel) &&
      !/\bcontext\b/.test(runtimeBarrel) &&
      !/\bselectors\b/.test(runtimeBarrel),
    "theme/runtime/index.ts excludes observer/devtools/context/selectors",
  );

  const providerSrc = stripComments(read("src/ui/providers/theme-provider.tsx"));
  assertCase(
    block,
    "freeze.providerImportsNotifier",
    /from\s+["'][^"']*runtime\/observer["']/.test(providerSrc) &&
      /\bRuntimeNotifier\b/.test(providerSrc),
    "ThemeProvider imports RuntimeNotifier from runtime/observer",
  );

  assertCase(
    block,
    "freeze.providerImportsSnapshotBuilder",
    /from\s+["'][^"']*runtime\/devtools["']/.test(providerSrc) &&
      /\bSnapshotBuilder\b/.test(providerSrc),
    "ThemeProvider imports SnapshotBuilder from runtime/devtools",
  );

  assertCase(
    block,
    "freeze.providerNotFromRuntimeIndex",
    !/from\s+["'][^"']*theme\/runtime["']/.test(providerSrc) &&
      !/from\s+["'][^"']*theme\/runtime\/index["']/.test(providerSrc),
    "ThemeProvider does not import SnapshotBuilder from runtime/index",
  );

  assertCase(
    block,
    "freeze.providerIdentityGate",
    /stabilizedRuntime\s*!==\s*previousRuntime/.test(providerSrc) &&
      /SnapshotBuilder\.build/.test(providerSrc) &&
      /previousFingerprintRef/.test(providerSrc),
    "ThemeProvider gates SnapshotBuilder behind identity change",
  );

  const providersBarrel = stripComments(read("src/ui/providers/index.ts"));
  assertCase(
    block,
    "freeze.providersBarrelNoObserver",
    !/\bRuntimeObserver\b/.test(providersBarrel) &&
      !/\bRuntimeNotifier\b/.test(providersBarrel) &&
      !/\bRuntimeObserverRegistry\b/.test(providersBarrel),
    "providers/index exports nothing observer-related",
  );
}

/* -------------------------------------------------------------------------- */
/* 8. noCycles                                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noCycles";

  const observerImports = REQUIRED_FILES.flatMap((f) =>
    collectImports(stripComments(read(`${OBSERVER_DIR}/${f}`))),
  );

  const bannedFromObserver = [
    /providers/,
    /context/,
    /devtools/,
    /selectors/,
    /theme-provider/,
  ];

  const observerHit = observerImports.find((spec) =>
    bannedFromObserver.some((re) => re.test(spec)),
  );
  assertCase(
    block,
    "cycles.observerClean",
    observerHit === undefined,
    observerHit
      ? `observer imports banned path: ${observerHit}`
      : "observer/ imports none of providers/context/devtools/selectors",
  );

  const devtoolsFiles = readdirSync(join(repoRoot, DEVTOOLS_DIR)).filter((f) =>
    f.endsWith(".ts"),
  );
  const devtoolsImports = devtoolsFiles.flatMap((f) =>
    collectImports(stripComments(read(`${DEVTOOLS_DIR}/${f}`))),
  );
  const devtoolsHit = devtoolsImports.find((spec) => /observer/.test(spec));
  assertCase(
    block,
    "cycles.devtoolsNoObserver",
    devtoolsHit === undefined,
    devtoolsHit
      ? `devtools imports observer: ${devtoolsHit}`
      : "devtools/ does not import observer",
  );

  const contextFiles = readdirSync(join(repoRoot, CONTEXT_DIR)).filter(
    (f) => f.endsWith(".ts") || f.endsWith(".tsx"),
  );
  const contextImports = contextFiles.flatMap((f) =>
    collectImports(stripComments(read(`${CONTEXT_DIR}/${f}`))),
  );
  const contextHit = contextImports.find((spec) => /observer/.test(spec));
  assertCase(
    block,
    "cycles.contextNoObserver",
    contextHit === undefined,
    contextHit
      ? `context imports observer: ${contextHit}`
      : "context/ does not import observer",
  );
}

/* -------------------------------------------------------------------------- */
/* 9. buildOk                                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "buildOk";
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const buildRun = spawnSync(npmCmd, ["run", "build"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  const pass = buildRun.status === 0;
  assertCase(
    block,
    "build.next",
    pass,
    pass
      ? "npm run build PASS"
      : `build failed: ${(buildRun.stderr || buildRun.stdout || "").slice(0, 500)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 10. typecheckOk                                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "typecheckOk";
  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  const pass = tsc.status === 0;
  assertCase(
    block,
    "tsc.noEmit",
    pass,
    pass
      ? "npx tsc --noEmit PASS"
      : `tsc failed: ${(tsc.stderr || tsc.stdout || "").slice(0, 500)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: BlockId[] = [
  "observerLayout",
  "observerInterface",
  "registrySet",
  "notifierFingerprint",
  "notifyOnChangeOnly",
  "noReact",
  "apiFreeze",
  "noCycles",
  "buildOk",
  "typecheckOk",
];

let passCount = 0;
for (const block of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => !r.pass);
  const ok = failed.length === 0;
  if (ok) passCount += 1;
  const pad = ".".repeat(Math.max(1, 28 - block.length));
  console.log(`${block} ${pad} ${ok ? "PASS" : "FAIL"}`);
  for (const f of failed) {
    console.log(`  FAIL ${f.id}: ${f.detail}`);
  }
}

const allPass = passCount === BLOCKS.length;
console.log("validate:ux-3.9");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
